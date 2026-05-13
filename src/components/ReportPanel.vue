<script setup>
  import { DataAnalysis } from "@element-plus/icons-vue";

  defineProps({
    reportVisible: {
      type: Boolean,
      required: true,
    },
    currentReportTitle: {
      type: String,
      required: true,
    },
    currentSummary: {
      type: String,
      required: true,
    },
    progressSteps: {
      type: Array,
      required: true,
    },
    reportParagraphs: {
      type: Array,
      required: true,
    },
  });

  defineEmits(["toggle-report"]);
</script>

<template>
  <article class="report-panel">
    <slot></slot>

    <div class="date-divider">
      <span></span>
      <em>今天</em>
      <span></span>
    </div>

    <section class="answer-intro">
      <h1>
        <el-icon><DataAnalysis /></el-icon> AI分析员提供答案详情
      </h1>
      <p>现在启动多维度研究--并行搜索{{ currentReportTitle }}的核心方向。</p>
      <ul>
        <li v-for="step in progressSteps" :key="step">{{ step }}</li>
      </ul>
      <p class="finished">
        耗时120S报告已完成：<strong>{{ currentReportTitle }}</strong>
      </p>
    </section>

    <section class="summary-card" @click="$emit('toggle-report')">
      <div class="doc-icon">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div>
        <h2>{{ currentSummary }}</h2>
        <p>
          现在启动多维度研究--并行搜索{{ currentReportTitle }}的核心技术方向。
        </p>
      </div>
      <el-tag size="small" type="info">{{
        reportVisible ? "收起" : "展开"
      }}</el-tag>
    </section>

    <template v-if="reportVisible">
      <section class="report-text">
        <p v-for="item in reportParagraphs" :key="item.title">
          <strong>{{ item.title }}</strong
          >{{ item.content }}
        </p>
        <p>如需对某个技术领域深挖或补充竞品对比分析，请告诉我。</p>
      </section>

      <section class="chart-card">
        <div class="chart-left">
          <h3>数据总结趋势</h3>
          <div class="chart-grid">
            <svg viewBox="0 0 430 150" role="img" aria-label="趋势折线图">
              <line x1="0" y1="30" x2="430" y2="30" />
              <line x1="0" y1="65" x2="430" y2="65" />
              <line x1="0" y1="100" x2="430" y2="100" />
              <line x1="0" y1="135" x2="430" y2="135" />
              <polyline
                points="0,58 40,88 78,96 116,76 155,56 193,53 233,60 272,76 312,87 350,88 390,78 430,45"
              />
              <g>
                <circle cx="0" cy="58" r="4" />
                <circle cx="40" cy="88" r="4" />
                <circle cx="78" cy="96" r="4" />
                <circle cx="116" cy="76" r="4" />
                <circle cx="155" cy="56" r="4" />
                <circle cx="193" cy="53" r="4" />
                <circle cx="233" cy="60" r="4" />
                <circle cx="272" cy="76" r="4" />
                <circle cx="312" cy="87" r="4" />
                <circle cx="350" cy="88" r="4" />
                <circle cx="390" cy="78" r="4" />
                <circle cx="430" cy="45" r="4" />
              </g>
            </svg>
          </div>
        </div>
        <div class="chart-notes">
          <h3>
            现在启动多维度研究--并行搜索{{ currentReportTitle }}的核心技术方向。
          </h3>
          <p v-for="step in progressSteps" :key="step">{{ step }}</p>
        </div>
      </section>

      <section class="report-text bottom-text">
        <p
          v-for="item in reportParagraphs.slice(0, 3)"
          :key="`bottom-${item.title}`"
        >
          <strong>{{ item.title }}</strong
          >{{ item.content }}
        </p>
      </section>
    </template>
  </article>
</template>
