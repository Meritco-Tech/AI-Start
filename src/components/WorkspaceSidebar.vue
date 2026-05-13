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
        v-for="topic in filteredTopics"
        :key="topic.name"
        class="sidebar-link"
        :class="{ active: selectedTopic === topic.name }"
        @click="$emit('select-topic', topic.name)"
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
        >
          {{ task.title }}
        </button>
      </div>
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
