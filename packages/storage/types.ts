export type StorageBucketNamesConfig = {
	/**
	 * Bucket used for user and organization avatar uploads.
	 */
	avatars: string;
};

export type StorageConfig = {
	/**
	 * Logical storage bucket names used throughout the application.
	 */
	bucketNames: StorageBucketNamesConfig;
};

export type CreateBucketHandler = (
	name: string,
	options?: {
		public?: boolean;
	},
) => Promise<void>;

export type GetSignedUploadUrlHandler = (
	path: string,
	options: {
		bucket: keyof StorageBucketNamesConfig;
	},
) => Promise<string>;

export type GetSignedUrlHandler = (
	path: string,
	options: {
		bucket: keyof StorageBucketNamesConfig;
		expiresIn?: number;
	},
) => Promise<string>;

export type DeleteFileHandler = (
	path: string,
	options: {
		bucket: keyof StorageBucketNamesConfig;
	},
) => Promise<void>;
