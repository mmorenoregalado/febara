<script setup lang="ts">
	const { public: config } = useRuntimeConfig();
</script>

<template>
	<footer class="py-4 text-sm text-muted text-center">
		<div class="container">
			<span> &copy; {{ new Date().getFullYear() }} {{ config.appName }} </span>
		</div>
	</footer>
</template>
