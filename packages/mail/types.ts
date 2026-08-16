export type ProviderSendEmailParams = {
	to: string;
	from?: string;
	cc?: string[];
	bcc?: string[];
	replyTo?: string;
	subject: string;
	text: string;
	html?: string;
};

export type SendEmailHandler = (params: ProviderSendEmailParams) => Promise<void>;

export type MailProvider = {
	send: SendEmailHandler;
};
