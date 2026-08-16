export type MailTemplateDefinition = {
	file: string;
	subject: string;
};

export const mailTemplates = {
	magicLink: {
		file: "emails/MagicLink.html",
		subject: "Login to PokeDex Manager",
	},
	forgotPassword: {
		file: "emails/ForgotPassword.html",
		subject: "Reset your password",
	},
	organizationInvitation: {
		file: "emails/OrganizationInvitation.html",
		subject: "You have been invited to join a team",
	},
	emailVerification: {
		file: "emails/EmailVerification.html",
		subject: "Verify your email",
	},
	notification: {
		file: "emails/Notification.html",
		subject: "New notification",
	},
} as const satisfies Record<string, MailTemplateDefinition>;
