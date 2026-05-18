<script setup>
  import { computed } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ElMessage } from "element-plus";
  import DockNav from "../components/DockNav.vue";
  import { dockItems } from "../config/dockItems";

  const route = useRoute();
  const router = useRouter();

  const activeDock = computed(() => route.meta.dockKey || "home");
  const title = computed(() => route.meta.title || "模块");
  const description = computed(() => route.meta.description || "当前模块待接入。 ");

  const selectDock = (key) => {
    const target = dockItems.find((item) => item.key === key);
    if (!target) return;
    router.push(target.path);
  };

  const createTopic = () => {
    router.push("/home");
  };

  const exitWorkspace = () => {
    ElMessage.info("已退出当前空间");
  };
</script>

<template>
  <main class="page-shell">
    <section class="home-layout">
      <DockNav
        :items="dockItems"
        :active-dock="activeDock"
        @create-topic="createTopic"
        @select-dock="selectDock"
        @exit="exitWorkspace"
      />

      <section class="placeholder-page">
        <div class="placeholder-card">
          <el-tag type="info" effect="plain">{{ title }}</el-tag>
          <h1>{{ title }}模块</h1>
          <p>{{ description }}</p>
          <el-button type="primary" @click="router.push('/home')">
            返回主页
          </el-button>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
  .page-shell {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #ffffff;
  }

  .home-layout {
    display: flex;
    width: 100%;
    height: 100%;
    min-width: 1280px;
    overflow: hidden;
    background: #ffffff;
  }

  .placeholder-page {
    flex: 1;
    display: grid;
    place-items: center;
    min-width: 0;
    height: 100%;
    padding: 32px;
    background: #ffffff;
  }

  .placeholder-card {
    width: min(560px, 100%);
    padding: 42px 44px;
    border: 1px solid #eeeeee;
    border-radius: 18px;
    background: linear-gradient(180deg, #ffffff 0%, #fbf9ff 100%);
    box-shadow: 0 18px 48px rgba(61, 39, 114, 0.08);
  }

  .placeholder-card h1 {
    margin: 18px 0 12px;
    color: #262626;
    font-size: 28px;
    line-height: 38px;
    font-weight: 600;
  }

  .placeholder-card p {
    margin: 0 0 28px;
    color: rgba(0, 0, 0, 0.58);
    font-size: 15px;
    line-height: 26px;
  }
</style>
