import { createLogoUploadUrl } from "./procedures/create-logo-upload-url";
import { deleteLogo } from "./procedures/delete-logo";
import { generateOrganizationSlug } from "./procedures/generate-organization-slug";

export const organizationsRouter = {
	generateSlug: generateOrganizationSlug,
	createLogoUploadUrl,
	deleteLogo,
};
