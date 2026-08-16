<script setup lang="ts">
	const CHANGELOG_ENTRY_KEYS = [
		"clientPortals",
		"planClarity",
		"quietWeek",
		"workspaceSwitching",
		"invites",
		"launch",
	] as const;

	const CHANGE_ITEM_KEYS = ["item1", "item2", "item3"] as const;

	const CHANGE_KINDS = ["added", "improved", "fixed"] as const;

	type ChangeKind = (typeof CHANGE_KINDS)[number];

	function isChangeKind(value: string): value is ChangeKind {
		return CHANGE_KINDS.some((kind) => kind === value);
	}

	const { t, locale } = useTranslations();

	const entries = computed(() =>
		CHANGELOG_ENTRY_KEYS.map((entryKey, entryIndex) => {
			const version = t(`changelog.entries.${entryKey}.version`);
			return {
				key: entryKey,
				version,
				isLatest: entryIndex === 0,
				date: new Intl.DateTimeFormat(locale.value, { dateStyle: "medium" }).format(
					new Date(`${t(`changelog.entries.${entryKey}.date`)}T12:00:00`),
				),
				title: t(`changelog.entries.${entryKey}.title`),
				summary: t(`changelog.entries.${entryKey}.summary`),
				changes: CHANGE_ITEM_KEYS.map((changeKey) => {
					const kindValue = t(`changelog.entries.${entryKey}.changes.${changeKey}.kind`);
					const kind = isChangeKind(kindValue) ? kindValue : "improved";
					return {
						key: `${entryKey}-${changeKey}`,
						kind,
						text: t(`changelog.entries.${entryKey}.changes.${changeKey}.text`),
					};
				}),
			};
		}),
	);
</script>

<template>
	<section id="changelog">
		<div class="flex w-full flex-col">
			<article
				v-for="entry in entries"
				:key="entry.key"
				class="gap-8 md:grid-cols-[11rem_minmax(0,1fr)] pb-16 last:pb-0 relative grid grid-cols-1"
			>
				<div class="md:pt-1.5">
					<p class="font-medium text-sm text-highlighted/45 whitespace-nowrap">
						{{ entry.date }}
					</p>
					<p v-if="entry.version" class="mt-1 font-medium text-xs tracking-wide text-touch">
						{{ entry.version }}
					</p>
				</div>

				<div class="md:border-l md:pl-10 md:border-default/60 relative">
					<span
						class="size-1.5 top-2.5 md:block absolute -left-[3px] hidden rounded-[1.5px] bg-touch"
						aria-hidden="true"
					/>

					<div>
						<span
							v-if="entry.isLatest"
							class="px-2 py-0.5 font-semibold tracking-wide text-xs rounded-full bg-touch text-touch-foreground"
						>
							{{ t("changelog.latest") }}
						</span>
						<h2
							:class="
								cn(
									'font-medium text-2xl lg:text-[1.75rem] tracking-tight text-highlighted text-pretty',
									entry.isLatest && 'mt-3',
								)
							"
						>
							{{ entry.title }}
						</h2>
					</div>

					<p class="mt-4 text-base leading-relaxed text-highlighted/70 text-pretty">
						{{ entry.summary }}
					</p>

					<ul class="mt-6 space-y-4">
						<li v-for="change in entry.changes" :key="change.key">
							<p class="font-medium text-xs tracking-wide text-touch">
								{{ t(`changelog.kinds.${change.kind}`) }}
							</p>
							<p class="mt-1 text-sm leading-relaxed text-highlighted/60">
								{{ change.text }}
							</p>
						</li>
					</ul>
				</div>
			</article>
		</div>
	</section>
</template>
