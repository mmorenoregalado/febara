import type { InferRouterOutputs, RouterClient } from "@orpc/server";

import { adminRouter } from "../modules/admin/router";
import { aiRouter } from "../modules/ai/router";
import { collectionRouter } from "../modules/collection/router";
import { notificationsRouter } from "../modules/notifications/router";
import { organizationsRouter } from "../modules/organizations/router";
import { pokemonRouter } from "../modules/pokemon/router";
import { usersRouter } from "../modules/users/router";
import { publicProcedure } from "./procedures";

export const router = publicProcedure.router({
	admin: adminRouter,
	organizations: organizationsRouter,
	users: usersRouter,
	ai: aiRouter,
	notifications: notificationsRouter,
	pokemon: pokemonRouter,
	collection: collectionRouter,
});

export type ApiRouterClient = RouterClient<typeof router>;

/** Inferred oRPC outputs for the API router (use for typing procedure results in apps). */
export type ApiRouterOutputs = InferRouterOutputs<typeof router>;
