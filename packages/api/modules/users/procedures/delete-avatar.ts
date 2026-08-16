import { updateUser } from "@repo/database";
import { deleteFile, isStoragePath } from "@repo/storage";

import { protectedProcedure } from "../../../orpc/procedures";

export const deleteAvatar = protectedProcedure
	.route({
		method: "DELETE",
		path: "/users/avatar",
		tags: ["Users"],
		summary: "Delete avatar",
		description: "Delete the current user's uploaded avatar and clear it from their profile",
	})
	.handler(async ({ context: { user } }) => {
		if (isStoragePath(user.image)) {
			await deleteFile(user.image, {
				bucket: "avatars",
			});
		}

		await updateUser({
			id: user.id,
			image: null,
		});

		return { success: true };
	});
