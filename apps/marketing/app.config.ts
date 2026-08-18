export default defineAppConfig({
	ui: {
		button: {
			slots: {
				base: "flex gap-1.5 items-center justify-center font-medium enabled:cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-bg)] disabled:pointer-events-none disabled:opacity-50",
			},
			variants: {
				variant: {
					primary: "bg-primary text-inverted hover:bg-primary/80",
					secondary: "bg-secondary text-highlighted hover:bg-secondary/80",
					outline:
						"border border-highlighted/10 bg-transparent text-highlighted hover:bg-highlighted/10",
					ghost: "text-highlighted hover:bg-inverted/10 hover:text-highlighted",
					destructive: "bg-error text-inverted hover:bg-error/80",
					link: "text-primary underline-offset-4 hover:underline",
				},
				size: {
					sm: "h-6 min-w-6 rounded-full px-3 text-xs",
					md: "h-9 min-w-9 rounded-full px-4 text-sm",
					lg: "h-12 min-w-12 rounded-full px-6 text-base",
					icon: "size-8 min-w-8 rounded-full [&>svg]:m-0 [&>svg]:opacity-100",
				},
			},
			default: {
				variant: "secondary",
				size: "md",
			},
		},
		input: {
			slots: {
				base: "placeholder:text-dimmed border-default rounded-xl",
				root: "w-full",
				leading: "ps-3.5",
				trailing: "pe-3.5",
			},
			variants: {
				size: {
					sm: {
						base: "h-6 px-3 text-xs",
						leading: "ps-3",
						trailing: "pe-3",
					},
					md: {
						base: "h-8 px-4 text-sm",
						leading: "ps-3.5",
						trailing: "pe-3.5",
					},
					lg: {
						base: "h-10 px-5 text-base",
						leading: "ps-4",
						trailing: "pe-4",
					},
				},
			},
			compoundVariants: [
				{
					leading: true,
					size: "sm",
					class: "ps-8",
				},
				{
					leading: true,
					size: "md",
					class: "ps-10",
				},
				{
					leading: true,
					size: "lg",
					class: "ps-11",
				},
				{
					trailing: true,
					size: "sm",
					class: "pe-8",
				},
				{
					trailing: true,
					size: "md",
					class: "pe-10",
				},
				{
					trailing: true,
					size: "lg",
					class: "pe-11",
				},
			],
		},
		textarea: {
			slots: {
				base: "placeholder:text-dimmed border-default rounded-xl",
				root: "w-full",
			},
		},
		select: {
			slots: {
				base: "placeholder:text-dimmed border-default rounded-xl",
				root: "w-full",
			},
			variants: {},
		},
		card: {
			slots: {
				root: "rounded-xl shadow-none bg-default",
			},
			variants: {
				variant: {
					solid: {
						root: "bg-default border text-highlighted",
					},
					outline: {
						root: "bg-default",
					},
				},
			},
		},
		tabs: {
			variants: {
				variant: {
					link: {
						list: "!border-b-2",
						indicator: "h-0.5! -bottom-0.5! bg-touch",
						trigger: "font-medium aria-selected:text-touch",
					},
				},
			},
		},
		switch: {
			slots: {
				base: "data-[state=checked]:bg-touch",
			},
		},
		alert: {
			slots: {
				root: "rounded-xl",
			},
			defaultVariants: {
				variant: "subtle",
			},
		},
		pageHeader: {
			slots: {
				title:
					"text-highlighted text-3xl! md:text-4xl! font-medium tracking-tight leading-[1.12]! text-pretty",
				description: "mt-5! text-base lg:text-lg leading-relaxed text-muted",
				root: "pb-0! border-b-0! text-left",
			},
		},
	},
});
