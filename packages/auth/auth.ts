import { passkey } from "@better-auth/passkey";
import {
	db,
	deleteOrganizationById,
	getCredentialAccountByUserId,
	getMembershipsByUserIdWithOrganizationMembers,
	getOrganizationById,
	getUserByEmail,
	getUserById,
} from "@repo/database";
import { config as i18nConfig, type Locale } from "@repo/i18n";
import { logger } from "@repo/logs";
import { sendEmail } from "@repo/mail";
import { createWelcomeNotification } from "@repo/notifications";
import { deleteFile, isStoragePath } from "@repo/storage";
import { getBaseUrl, getTrustedOrigins } from "@repo/utils";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { admin, magicLink, openAPI, organization, twoFactor } from "better-auth/plugins";
import { parseCookie as parseCookies } from "cookie";

import { config } from "./config";
import { invitationOnlyPlugin } from "./plugins/invitation-only";

const getLocaleFromRequest = (request?: Request): Locale => {
	const cookies = parseCookies(request?.headers.get("cookie") ?? "");
	return (cookies[i18nConfig.localeCookieName] ?? i18nConfig.defaultLocale) as Locale;
};

const appUrl = getBaseUrl(process.env.NUXT_PUBLIC_SAAS_URL);

// Explicit allowlist of trusted origins, shared with the API package. Never use
// a wildcard here: Better Auth also validates callback/redirect URLs against
// this list, so a wildcard turns flows like magic-link `callbackURL` into an
// open redirect.
const trustedOrigins = getTrustedOrigins();

const deleteAccountPasswordRequiredMessage = "Enter your password to delete your account.";
const deleteAccountOrganizationOwnershipMessage =
	"Transfer ownership or delete organizations you solely own before deleting your account.";

const deleteStoredAvatar = async (path: string | null | undefined) => {
	if (isStoragePath(path)) {
		await deleteFile(path, {
			bucket: "avatars",
		});
	}
};

const cleanupDeletedUser = async (user: { id: string }) => {
	const memberships = await getMembershipsByUserIdWithOrganizationMembers(user.id);

	const organizationsNeedingOwnershipTransfer = memberships.filter((membership) => {
		if (membership.role !== "owner") {
			return false;
		}

		const otherMembers = membership.organization.members.filter(
			(member) => member.userId !== user.id,
		);
		const hasAnotherOwner = otherMembers.some((member) => member.role === "owner");

		return otherMembers.length > 0 && !hasAnotherOwner;
	});

	if (organizationsNeedingOwnershipTransfer.length > 0) {
		throw new APIError("BAD_REQUEST", {
			message: deleteAccountOrganizationOwnershipMessage,
		});
	}

	const singleMemberOrganizations = memberships
		.map((membership) => membership.organization)
		.filter(
			(organization) =>
				organization.members.length === 1 && organization.members[0]?.userId === user.id,
		);

	for (const organization of singleMemberOrganizations) {
		await deleteOrganizationById(organization.id);
	}
};

const logBetterAuthMessage = (level: string, message: string, ...args: unknown[]) => {
	if (level === "error" && message.includes("User not found")) {
		return;
	}

	switch (level) {
		case "debug":
			logger.debug(message, ...args);
			break;
		case "info":
			logger.info(message, ...args);
			break;
		case "warn":
			logger.warn(message, ...args);
			break;
		default:
			logger.error(message, ...args);
			break;
	}
};

const getApiErrorStatus = (error: unknown) => {
	if (!error || typeof error !== "object") {
		return null;
	}

	if ("statusCode" in error && typeof error.statusCode === "number") {
		return error.statusCode;
	}

	if ("status" in error && typeof error.status === "number") {
		return error.status;
	}

	return null;
};

export const auth = betterAuth({
	baseURL: appUrl,
	trustedOrigins,
	logger: {
		level: "error",
		log: logBetterAuthMessage,
	},
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
	advanced: {
		database: {
			generateId: false,
		},
	},
	session: {
		expiresIn: config.sessionCookieMaxAge,
		freshAge: 0,
	},
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path === "/delete-user") {
				const password = ctx.body?.password;
				const token = ctx.body?.token;

				if (typeof token === "string" && token.length > 0) {
					return;
				}

				const session = await getSessionFromCtx(ctx, {
					disableCookieCache: true,
				});

				if (!session?.user?.id) {
					return;
				}

				const credentialAccount = await getCredentialAccountByUserId(session.user.id);

				if (credentialAccount && (typeof password !== "string" || password.length === 0)) {
					throw new APIError("BAD_REQUEST", {
						message: deleteAccountPasswordRequiredMessage,
					});
				}
			} else if (ctx.path.startsWith("/organization/delete")) {
				const { organizationId } = ctx.body;

				if (organizationId) {
					const imagePath = (await getOrganizationById(organizationId))?.logo;
					await deleteStoredAvatar(imagePath);
				}
			}
		}),
	},
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					const user = await getUserById(session.userId);
					if (user?.lastActiveOrganizationId) {
						return {
							data: {
								...session,
								activeOrganizationId: user.lastActiveOrganizationId,
							},
						};
					}
				},
			},
		},
		user: {
			create: {
				after: async (createdUser) => {
					if (!createdUser?.id) {
						return;
					}
					try {
						await createWelcomeNotification(createdUser.id);
					} catch (error) {
						logger.error(error, {
							ctx: "createWelcomeNotification",
							userId: createdUser.id,
						});
					}
				},
			},
		},
	},
	user: {
		additionalFields: {
			onboardingComplete: {
				type: "boolean",
				required: false,
			},
			locale: {
				type: "string",
				required: false,
			},
			lastActiveOrganizationId: {
				type: "string",
				required: false,
			},
		},
		deleteUser: {
			enabled: true,
			beforeDelete: cleanupDeletedUser,
		},
		changeEmail: {
			enabled: true,
			sendChangeEmailConfirmation: async ({ user: { email, name }, url }, request) => {
				const locale = getLocaleFromRequest(request);
				await sendEmail({
					to: email,
					templateId: "emailVerification",
					context: {
						url,
						name,
					},
					locale,
				});
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		// If signup is disabled, the only way to sign up is via an invitation. So in this case we can auto sign in the user, as the email is already verified by the invitation.
		// If signup is enabled, we can't auto sign in the user, as the email is not verified yet.
		autoSignIn: !config.enableSignup,
		requireEmailVerification: config.enableSignup,
		sendResetPassword: async ({ user, url }, request) => {
			const locale = getLocaleFromRequest(request);
			await sendEmail({
				to: user.email,
				templateId: "forgotPassword",
				context: {
					url,
					name: user.name,
				},
				locale,
			});
		},
		minPasswordLength: 8,
	},
	emailVerification: {
		sendOnSignUp: config.enableSignup,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user: { email, name }, url }, request) => {
			const locale = getLocaleFromRequest(request);
			await sendEmail({
				to: email,
				templateId: "emailVerification",
				context: {
					url,
					name,
				},
				locale,
			});
		},
	},
	plugins: [
		admin(),
		passkey(),
		magicLink({
			disableSignUp: false,
			sendMagicLink: async ({ email, url }, ctx) => {
				const request = ctx?.request as Request;

				const locale = getLocaleFromRequest(request);
				await sendEmail({
					to: email,
					templateId: "magicLink",
					context: {
						url,
					},
					locale,
				});
			},
		}),
		organization({
			sendInvitationEmail: async ({ email, id, organization }, request) => {
				const locale = getLocaleFromRequest(request);
				const existingUser = await getUserByEmail(email);

				const url = new URL(
					existingUser ? "/login" : "/signup",
					getBaseUrl(process.env.NUXT_PUBLIC_SAAS_URL),
				);

				url.searchParams.set("invitationId", id);
				url.searchParams.set("email", email);
				url.searchParams.set("organizationId", organization.id);
				url.searchParams.set("organizationName", organization.name);

				if (organization.logo) {
					url.searchParams.set("organizationLogo", organization.logo);
				}

				await sendEmail({
					to: email,
					templateId: "organizationInvitation",
					locale,
					context: {
						organizationName: organization.name,
						url: url.toString(),
					},
				});
			},
		}),
		openAPI(),
		invitationOnlyPlugin(),
		twoFactor(),
	],
	onAPIError: {
		onError(error, ctx) {
			const status = getApiErrorStatus(error);
			if (status !== null && status < 500) {
				return;
			}

			logger.error(error, { ctx });
		},
	},
});

export type Session = typeof auth.$Infer.Session;

export type ActiveOrganization = NonNullable<
	Awaited<ReturnType<typeof auth.api.getFullOrganization>>
>;

export type Organization = typeof auth.$Infer.Organization;

export type OrganizationMemberRole = ActiveOrganization["members"][number]["role"];

export type OrganizationInvitationStatus = typeof auth.$Infer.Invitation.status;

export type OrganizationMetadata = Record<string, unknown> | undefined;
