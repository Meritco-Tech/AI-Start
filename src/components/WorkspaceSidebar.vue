<script setup>
  import {
    Collection,
    DataAnalysis,
    MoreFilled,
    Plus,
    Search,
    StarFilled,
  } from "@element-plus/icons-vue";

  defineProps({
    starredTasks: {
      type: Array,
      required: true,
    },
    filteredTopics: {
      type: Array,
      required: true,
    },
    filteredAnalystTasks: {
      type: Array,
      required: true,
    },
    filteredSearches: {
      type: Array,
      required: true,
    },
    selectedTopic: {
      type: String,
      required: true,
    },
    selectedTopicId: {
      type: [Number, String],
      default: null,
    },
    selectedAnalyst: {
      type: String,
      required: true,
    },
    selectedSearch: {
      type: String,
      required: true,
    },
  });

  defineEmits([
    "create-topic",
    "create-analyst",
    "select-topic",
    "select-analyst",
    "select-search",
    "toggle-star",
  ]);
</script>

<template>
  <aside class="workspace-sidebar">
    <header class="brand-row">
      <strong>久谦咨询</strong>
      <el-icon><MoreFilled /></el-icon>
    </header>

    <section class="sidebar-block starred">
      <div class="sidebar-title">
        <el-icon><StarFilled /></el-icon>
        <b>已加星标</b>
      </div>
      <template v-if="starredTasks.length">
        <button
          v-for="task in starredTasks"
          :key="task.title"
          class="sidebar-link"
          @click="$emit('select-analyst', task)"
        >
          {{ task.title }}
        </button>
      </template>
      <p v-else>将主要的内容拖放到此处</p>
    </section>

    <section class="sidebar-block topic-block">
      <div class="sidebar-title topic-title">
        <span class="section-icon topic-icon"
          ><el-icon><Collection /></el-icon
        ></span>
        <b>话题</b>
      </div>
      <button
        v-for="(topic, index) in filteredTopics"
        :key="topic.sessionId || `${topic.name}-${index}`"
        class="sidebar-link"
        :class="{
          active: topic.sessionId
            ? selectedTopicId === topic.sessionId
            : selectedTopic === topic.name,
        }"
        @click="$emit('select-topic', topic)"
      >
        {{ topic.name }}
      </button>
      <button class="new-topic-link" @click="$emit('create-topic')">
        新建新话题
      </button>
    </section>

    <section class="sidebar-block analyst-block">
      <div class="sidebar-title analyst-title">
        <span class="section-icon analyst-icon"
          ><el-icon><DataAnalysis /></el-icon
        ></span>
        <b>AI分析师</b>
      </div>
      <div
        v-for="task in filteredAnalystTasks"
        :key="task.title"
        class="analyst-row"
      >
        <button
          class="sidebar-link"
          :class="{ active: selectedAnalyst === task.title }"
          @click="$emit('select-analyst', task)"
        >
          {{ task.title }}
        </button>
      </div>
      <button class="new-topic-link" @click="$emit('create-analyst')">
        新建分析师
      </button>
    </section>

    <section class="sidebar-block search-block">
      <div class="sidebar-title">
        <el-icon><Search /></el-icon>
        <b>搜索</b>
      </div>
      <button
        v-for="item in filteredSearches"
        :key="item"
        class="sidebar-link"
        :class="{ active: selectedSearch === item }"
        @click="$emit('select-search', item)"
      >
        {{ item }}
      </button>
    </section>
  </aside>
</template>

<style scoped>
  .workspace-sidebar {
    position: relative;
    z-index: 2;
    flex: 0 0 286px;
    height: 100%;
    overflow-y: auto;
    padding: 33px 30px 40px 25px;
    background: #ffffff;
    border-right: 1px solid #f2f2f2;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .workspace-sidebar::-webkit-scrollbar {
    display: none;
  }

  .brand-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 30px;
  }

  .brand-row strong {
    font-size: 17px;
    line-height: 24px;
    font-weight: 600;
  }

  .brand-row .el-icon {
    margin-top: 2px;
    color: #222222;
    font-size: 16px;
  }

  .sidebar-block {
    margin-top: 24px;
  }

  .sidebar-block.starred {
    margin-top: 0;
  }

  .analyst-block {
    margin-top: 26px;
  }

  .search-block {
    margin-top: 25px;
  }

  .sidebar-title {
    display: flex;
    align-items: center;
    gap: 11px;
    height: 20px;
    font-size: 14px;
    line-height: 20px;
  }

  .sidebar-title .el-icon {
    width: 14px;
    color: #151515;
  }

  .sidebar-title b {
    font-weight: 500;
  }

  .section-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: #151515;
  }

  .section-icon .el-icon {
    width: 16px;
    height: 16px;
    font-size: 15px;
  }

  .topic-title {
    position: relative;
    padding-right: 28px;
  }

  .topic-icon {
    color: #121212;
  }

  .analyst-icon {
    color: #3f247b;
  }

  .analyst-icon .el-icon {
    font-size: 16px;
  }

  .sidebar-block p,
  .sidebar-link {
    display: block;
    width: calc(100% - 25px);
    margin: 8px 0 0 25px;
    padding: 0;
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    line-height: 17px;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }

  .sidebar-link {
    color: #333333;
  }

  .new-topic-link {
    display: block;
    width: calc(100% - 25px);
    margin: 8px 0 0 25px;
    padding: 0;
    color: rgba(0, 0, 0, 0.38);
    font-size: 12px;
    line-height: 17px;
    text-align: left;
    cursor: pointer;
  }

  .new-topic-link:hover {
    color: #4a2788;
  }

  .sidebar-link.active {
    color: #333333;
    font-weight: 400;
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .analyst-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .analyst-row .sidebar-link {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1440px) {
    .workspace-sidebar {
      flex-basis: 286px;
    }
  }
</style>
