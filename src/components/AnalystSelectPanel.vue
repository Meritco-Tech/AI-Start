<script setup>
  defineProps({
    title: {
      type: String,
      default: "新建新话题",
    },
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
      <span>{{ title }}</span>
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
        <span class="analyst-module-icon">
          <svg class="analyst-module-icon-svg" aria-hidden="true">
            <use :xlink:href="module.icon || '#icon-default'"></use>
          </svg>
        </span>
        <span class="analyst-module-content">
          <strong>{{ module.title }}</strong>
          <em>{{ module.description }}</em>
        </span>
      </button>
    </section>
  </section>
</template>

<style scoped>
  .analyst-select-page {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 58px 32px 64px;
    background: #ffffff;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .analyst-select-page::-webkit-scrollbar {
    display: none;
  }

  .analyst-select-title {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 30px;
    color: #262626;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
  }

  .analyst-select-title .el-icon {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border: 1px solid rgba(0, 0, 0, 0.18);
    border-radius: 6px;
    color: rgba(0, 0, 0, 0.75);
    font-size: 12px;
  }

  .analyst-tabs {
    display: flex;
    align-items: center;
    gap: 60px;
    height: 42px;
    margin-top: 4px;
    border-bottom: 1px solid #e8e8e8;
  }

  .analyst-tab {
    position: relative;
    height: 42px;
    padding: 0;
    color: #333333;
    font-size: 14px;
    line-height: 42px;
    cursor: pointer;
  }

  .analyst-tab.active {
    color: #3d1e85;
  }

  .analyst-tab.active::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 3px;
    border-radius: 3px;
    background: #3d1e85;
  }

  .analyst-module-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 18px 22px;
    max-width: 1580px;
    margin-top: 22px;
  }

  .analyst-module-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-height: 90px;
    padding: 20px 18px;
    border: 1px solid #eeeeee;
    border-radius: 8px;
    background: rgba(240, 240, 240, 0.25);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  .analyst-module-card:hover,
  .analyst-module-card:focus {
    /* border-color: rgba(12, 111, 149, 0.32); */
    background: rgba(61, 30, 133, 0.06);
    box-shadow: 0 8px 22px rgba(12, 111, 149, 0.14);
    transform: translateY(-1px);
  }

  .analyst-module-icon {
    display: grid;
    flex: 0 0 22px;
    place-items: center;
    width: 22px;
    height: 22px;
    color: #8b5cf6;
    font-size: 13px;
  }

  .analyst-module-icon-svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
    overflow: hidden;
  }

  .analyst-module-content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 9px;
    text-align: left;
  }

  .analyst-module-content strong {
    color: #222222;
    font-size: 14px;
    line-height: 20px;
    font-weight: 600;
  }

  .analyst-module-content em {
    color: rgba(0, 0, 0, 0.42);
    font-size: 12px;
    line-height: 17px;
    font-style: normal;
  }

  @media (max-width: 1440px) {
    .analyst-tabs {
      gap: 46px;
    }

    .analyst-module-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
