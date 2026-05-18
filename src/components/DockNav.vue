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

<style scoped>
  .dock-nav {
    position: relative;
    z-index: 3;
    display: flex;
    flex: 0 0 74px;
    flex-direction: column;
    align-items: center;
    height: calc(100% - 30px);
    margin: 15px 0 15px 15px;
    padding-top: 24px;
    padding-bottom: 15px;
    background: rgba(61, 39, 114, 0.07);
    border-right: 0;
    border-radius: 16px;
  }

  .create-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin-bottom: 42px;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #ffffff;
    cursor: pointer;
  }

  .create-button img {
    display: block;
    width: 36px;
    height: 36px;
  }

  .create-button:hover,
  .create-button:focus {
    background: transparent;
  }

  .dock-menu {
    display: flex;
    flex-direction: column;
    gap: 23px;
    width: 100%;
    align-items: center;
  }

  .dock-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    width: 48px;
    padding: 0;
    color: #151515;
    font-size: 12px;
    cursor: pointer;
  }

  .dock-item .el-icon {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 7px;
    font-size: 17px;
  }

  .dock-item.active .el-icon {
    background: #ebe5f8;
    color: #4b2887;
  }

  .dock-item em {
    font-style: normal;
    line-height: 17px;
  }

  .dock-bottom {
    position: absolute;
    right: 0;
    bottom: 14px;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .avatar-wrap {
    position: relative;
    width: 30px;
    height: 30px;
    border-radius: 7px;
    background: #ffffff;
  }

  .avatar-wrap img {
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 7px;
  }

  .avatar-wrap span {
    position: absolute;
    right: -1px;
    bottom: 1px;
    width: 10px;
    height: 10px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: #21c284;
  }

  .logout-button.el-button {
    position: relative;
    width: 30px;
    height: 30px;
    min-height: 30px;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: 7px;
    background: #ffffff;
    color: rgba(0, 0, 0, 0.72);
    font-size: 13px;
    box-shadow: 0 2px 6px rgba(61, 39, 114, 0.08);
  }

  .logout-button.el-button:hover,
  .logout-button.el-button:focus {
    border-color: rgba(255, 255, 255, 0.92);
    background: #ffffff;
    color: #4a2788;
    box-shadow: 0 3px 8px rgba(74, 39, 136, 0.12);
  }

  .logout-button :deep(.el-icon) {
    margin-right: 0;
    color: rgba(0, 0, 0, 0.64);
    font-size: 13px;
  }

  .logout-button:hover :deep(.el-icon),
  .logout-button:focus :deep(.el-icon) {
    color: #4a2788;
  }

  @media (max-width: 1440px) {
    .dock-nav {
      flex-basis: 74px;
    }
  }
</style>
