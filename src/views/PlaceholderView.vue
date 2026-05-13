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
