import { createAvatarUploadUrl } from "./procedures/create-avatar-upload-url";
import { deleteAvatar } from "./procedures/delete-avatar";

export const usersRouter = {
	avatarUploadUrl: createAvatarUploadUrl,
	deleteAvatar,
};
