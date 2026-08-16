<script setup lang="ts">
	import type { InputHTMLAttributes } from "vue";

	/** @see https://github.com/vuejs/core/issues/8286#issuecomment-1545659320 */
	type HTMLAttributes = {} & InputHTMLAttributes;

	const props = defineProps<{
		modelValue?: string;
		showGenerateButton?: boolean;
		showPasswordCriteria?: boolean;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [value: string];
	}>();

	defineOptions({
		inheritAttrs: false,
	});

	const { t } = useTranslations();
	const showPassword = ref(false);

	const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?~`";

	function generateValidPassword(): string {
		const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const lowercase = "abcdefghijklmnopqrstuvwxyz";
		const numbers = "0123456789";

		let password = "";
		password += uppercase[Math.floor(Math.random() * uppercase.length)];
		password += lowercase[Math.floor(Math.random() * lowercase.length)];
		password += numbers[Math.floor(Math.random() * numbers.length)];
		password += SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)];

		const allChars = uppercase + lowercase + numbers + SPECIAL_CHARS;
		for (let i = password.length; i < 12; i++) {
			password += allChars[Math.floor(Math.random() * allChars.length)];
		}

		return password
			.split("")
			.sort(() => Math.random() - 0.5)
			.join("");
	}

	function generateRandomPassword() {
		const password = generateValidPassword();
		emit("update:modelValue", password);
		showPassword.value = true;
	}

	const passwordCriteria = [
		{
			labelKey: "minLength",
			check: (password: string) => password.length >= 8,
		},
		{
			labelKey: "upperAndLowercase",
			check: (password: string) => /[A-Z]/.test(password) && /[a-z]/.test(password),
		},
		{
			labelKey: "number",
			check: (password: string) => /[0-9]/.test(password),
		},
		{
			labelKey: "specialCharacter",
			check: (password: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password),
		},
	];

	const password = computed(() => props.modelValue ?? "");
</script>

<template>
	<div>
		<div class="relative">
			<UInput
				v-bind="$attrs"
				:value="modelValue"
				@update:modelValue="emit('update:modelValue', String($event))"
				:type="showPassword ? 'text' : 'password'"
				:ui="{
					base: showGenerateButton ? 'pr-20' : 'pr-10',
				}"
				class="w-full"
			/>

			<div class="inset-y-0 right-0 pr-2 absolute flex items-center">
				<button
					v-if="showGenerateButton"
					type="button"
					@click="generateRandomPassword"
					class="p-2 text-primary hover:text-primary/80 focus-visible:ring-primary rounded-md flex cursor-pointer items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
				>
					<UIcon name="i-lucide-refresh-cw" class="size-4" />
				</button>

				<button
					type="button"
					@click="showPassword = !showPassword"
					class="p-2 text-primary hover:text-primary/80 focus-visible:ring-primary rounded-md flex cursor-pointer items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
				>
					<UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4" />
				</button>
			</div>
		</div>

		<div v-if="showPasswordCriteria" class="mt-2 gap-x-3 gap-y-1 flex flex-wrap">
			<div
				v-for="(criterion, index) in passwordCriteria"
				:key="index"
				class="gap-1 flex items-center"
			>
				<UIcon
					:name="criterion.check(password) ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
					:class="[
						'size-3.5 shrink-0',
						criterion.check(password) ? 'text-[var(--ui-success)]' : 'text-dimmed',
					]"
				/>
				<span
					:class="[
						'text-xs',
						criterion.check(password) ? 'text-[var(--ui-success)]' : 'text-dimmed font-light',
					]"
				>
					{{ t(`common.passwordCriteria.${criterion.labelKey}` as never) }}
				</span>
			</div>
		</div>
	</div>
</template>
