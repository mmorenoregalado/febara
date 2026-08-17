<script lang="ts" setup>
	const { t } = useTranslations();

	const { state, previewUrl, result, error, isIdentifying, selectImage, identify, reset } =
		usePokemonCardIdentifier();
</script>

<template>
	<div class="gap-4 flex flex-col">
		<template v-if="state === 'idle' || state === 'image-selected'">
			<PokemonCardUpload :disabled="isIdentifying" @select="selectImage" />

			<div v-if="state === 'image-selected' && previewUrl" class="gap-3 flex flex-col items-center">
				<img
					:src="previewUrl"
					alt=""
					class="max-h-80 rounded-md border-default max-w-full border object-contain"
				/>
				<div class="gap-2 flex">
					<UButton
						variant="soft"
						color="neutral"
						:label="t('pokemon.identify.upload.cta')"
						:disabled="isIdentifying"
						@click="reset"
					/>
					<UButton
						icon="i-lucide-sparkles"
						:label="t('pokemon.identify.actions.identify')"
						:loading="isIdentifying"
						:disabled="isIdentifying"
						@click="identify"
					/>
				</div>
			</div>
		</template>

		<div v-else-if="state === 'identifying'" class="gap-3 py-10 flex flex-col items-center">
			<USkeleton class="h-40 w-40 rounded-md" />
			<p class="text-muted">{{ t("pokemon.identify.actions.identifying") }}</p>
		</div>

		<PokemonIdentificationResult
			v-else-if="state === 'identified' || state === 'error'"
			:result="result"
			:error-key="error"
			@retry="reset"
		/>
	</div>
</template>
