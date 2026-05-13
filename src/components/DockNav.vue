<script setup>
  import { SwitchButton } from "@element-plus/icons-vue";

  defineProps({
    items: {
      type: Array,
      required: true,
    },
    activeDock: {
      type: String,
      required: true,
    },
  });

  defineEmits(["create-topic", "select-dock", "exit"]);
</script>

<template>
  <aside class="dock-nav">
    <button class="create-button">
      <img src="/figma/image/mp2mq9a2-bbrjibm.svg" alt="新建" />
    </button>
    <nav class="dock-menu">
      <button
        v-for="item in items"
        :key="item.key"
        class="dock-item"
        :class="{ active: activeDock === item.key }"
        @click="$emit('select-dock', item.key)"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <em>{{ item.label }}</em>
      </button>
    </nav>
    <div class="dock-bottom">
      <div class="avatar-wrap">
        <img src="/figma/image/mp1bqplk-vf6engs.png" alt="用户头像" />
        <span></span>
      </div>
      <el-button
        class="logout-button"
        :icon="SwitchButton"
        circle
        @click="$emit('exit')"
      />
    </div>
  </aside>
</template>
