<script setup>
  import { TrendCharts } from "@element-plus/icons-vue";

  defineProps({
    categories: {
      type: Array,
      required: true,
    },
    activeCategory: {
      type: String,
      required: true,
    },
    activeModules: {
      type: Array,
      required: true,
    },
  });

  defineEmits(["select-category", "select-module"]);
</script>

<template>
  <section class="analyst-select-page">
    <header class="analyst-select-title">
      <el-icon><TrendCharts /></el-icon>
      <span>选择你的 AI 分析师</span>
    </header>

    <nav class="analyst-tabs" aria-label="AI 分析师分类">
      <button
        v-for="category in categories"
        :key="category.key"
        class="analyst-tab"
        :class="{ active: activeCategory === category.key }"
        @click="$emit('select-category', category.key)"
      >
        {{ category.label }}
      </button>
    </nav>

    <section class="analyst-module-grid">
      <button
        v-for="module in activeModules"
        :key="`${activeCategory}-${module.title}-${module.description}`"
        class="analyst-module-card"
        @click="$emit('select-module', module)"
      >
        <span class="analyst-module-icon" :style="{ background: module.color }">
          <el-icon><TrendCharts /></el-icon>
        </span>
        <span class="analyst-module-content">
          <strong>{{ module.title }}</strong>
          <em>{{ module.description }}</em>
        </span>
      </button>
    </section>
  </section>
</template>
