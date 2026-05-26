<script setup lang="ts">
defineProps<{
  compact?: boolean
  hero?: boolean
}>()
</script>

<template>
  <span
    class="karaithy-wordmark"
    :class="{
      'karaithy-wordmark--compact': compact,
      'karaithy-wordmark--hero': hero
    }"
    aria-label="Karaithy Wiki"
  >
    Kar<span class="karaithy-wordmark__ai">ai</span>thy<span class="karaithy-wordmark__suffix"> Wiki</span>
  </span>
</template>
