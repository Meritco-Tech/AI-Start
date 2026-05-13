<script setup>
  defineEmits(["copy", "share"]);
</script>

<template>
  <header class="topbar">
    <div class="top-actions">
      <button class="top-icon-button" @click="$emit('copy')">
        <img src="/figma/image/mp2muh9z-2pcjshr.svg" alt="复制" />
      </button>
      <button class="top-icon-button" @click="$emit('share')">
        <img src="/figma/image/mp2mukr9-rto2nex.svg" alt="分享" />
      </button>
    </div>
  </header>
</template>
