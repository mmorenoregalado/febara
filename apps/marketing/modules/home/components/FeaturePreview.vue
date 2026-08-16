<script setup lang="ts">
	const { variant } = defineProps<{
		variant: "teams" | "security";
	}>();
</script>

<template>
	<div
		class="shadow-olive-950/25 dark:shadow-black/65 rounded-2xl border-default/70 bg-elevated w-full overflow-hidden border shadow-[0_16px_48px_-28px]"
	>
		<div class="gap-1.5 px-3 py-2.5 border-default/60 flex items-center border-b">
			<span class="size-2 bg-highlighted/15 rounded-full" />
			<span class="size-2 bg-highlighted/10 rounded-full" />
			<span class="size-2 bg-highlighted/10 rounded-full" />
		</div>

		<div v-if="variant === 'teams'" class="gap-6 p-4 sm:grid-cols-[7.5rem_1fr] grid grid-cols-1">
			<div class="gap-2 sm:flex hidden flex-col">
				<div class="h-2 w-16 bg-highlighted/15 rounded-full" />
				<div class="h-2 w-12 bg-highlighted/8 rounded-full" />
				<div class="h-2 w-14 bg-highlighted/8 rounded-full" />
				<div class="mt-3 h-2 w-10 bg-highlighted/8 rounded-full" />
			</div>
			<div class="gap-1 flex flex-col">
				<div
					v-for="(portrait, index) in dummyTeamPortraits"
					:key="portrait"
					:class="cn('gap-3 px-3 py-2.5 rounded-lg flex items-center', index === 0 && 'bg-touch/6')"
				>
					<img :src="portrait" alt="" class="size-7 shrink-0 rounded-full object-cover" />
					<div class="min-w-0 flex-1">
						<div class="h-2 w-24 bg-highlighted/20 rounded-full" />
						<div class="mt-1.5 h-1.5 w-16 bg-highlighted/10 rounded-full" />
					</div>
					<span class="font-medium tracking-wide text-xs text-highlighted/40">
						{{ index === 0 ? "Owner" : index === 1 ? "Admin" : "Member" }}
					</span>
				</div>
			</div>
		</div>

		<div v-else class="gap-1 p-4 flex flex-col">
			<div class="gap-3 px-3 py-3 rounded-lg flex items-center justify-between">
				<div class="gap-3 flex items-center">
					<span
						class="size-7 rounded-md border-default/70 bg-muted/50 text-highlighted/45 inline-flex items-center justify-center border"
					>
						<UIcon name="i-lucide-fingerprint" class="size-3.5" />
					</span>
					<div>
						<div class="h-2 w-14 bg-highlighted/20 rounded-full" />
						<div class="mt-2 h-1.5 w-24 bg-highlighted/10 rounded-full" />
					</div>
				</div>
				<div class="h-2 w-10 bg-highlighted/15 rounded-full" />
			</div>
			<div
				class="gap-3 px-3 py-3 rounded-lg flex items-center justify-between bg-touch/6 ring-1 ring-touch/15"
			>
				<div class="gap-3 flex items-center">
					<span
						class="size-7 rounded-md inline-flex items-center justify-center border border-touch/20 bg-touch/8 text-touch"
					>
						<UIcon name="i-lucide-lock-keyhole" class="size-3.5" />
					</span>
					<div>
						<div class="h-2 w-12 bg-highlighted/25 rounded-full" />
						<div class="mt-2 h-1.5 w-28 bg-highlighted/10 rounded-full" />
					</div>
				</div>
				<div class="h-2 w-12 bg-highlighted/20 rounded-full" />
			</div>
			<div class="gap-3 px-3 py-3 rounded-lg flex items-center justify-between">
				<div class="gap-3 flex items-center">
					<span
						class="size-7 rounded-md border-default/70 bg-muted/50 text-highlighted/45 inline-flex items-center justify-center border"
					>
						<UIcon name="i-lucide-mail" class="size-3.5" />
					</span>
					<div>
						<div class="h-2 w-20 bg-highlighted/20 rounded-full" />
						<div class="mt-2 h-1.5 w-20 bg-highlighted/10 rounded-full" />
					</div>
				</div>
				<div class="h-2 w-16 bg-highlighted/15 rounded-full" />
			</div>
		</div>
	</div>
</template>
