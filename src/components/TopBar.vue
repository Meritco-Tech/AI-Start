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

<style scoped>
  .topbar {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 4;
    display: flex;
    align-items: center;
    height: 24px;
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .top-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
  }

  .top-icon-button img {
    display: block;
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  .top-icon-button:hover,
  .top-icon-button:focus {
    background: rgba(61, 39, 114, 0.06);
  }

  @media (max-width: 1440px) {
    .topbar {
      right: 0;
    }
  }
</style>
