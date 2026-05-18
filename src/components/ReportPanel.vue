<script setup>
  import { computed } from "vue";
  import { DataAnalysis } from "@element-plus/icons-vue";

  const props = defineProps({
    currentReportTitle: {
      type: String,
      required: true,
    },
    currentSummary: {
      type: String,
      required: true,
    },
  });

  const reportParagraphs = computed(() =>
    String(props.currentSummary || "")
      .split(/\n+/)
      .map((content) => content.trim())
      .filter(Boolean)
      .map((content, index) => ({
        title: index === 0 ? `${props.currentReportTitle}：` : "",
        content,
      }))
  );

  const reportContents = computed(() =>
    reportParagraphs.value.map((item) => item.content).filter(Boolean)
  );
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
      <p v-if="reportContents[0]">{{ reportContents[0] }}</p>
      <ul>
        <li v-for="content in reportContents.slice(1, 4)" :key="content">
          {{ content }}
        </li>
      </ul>
      <p v-if="reportContents[4]" class="finished">
        {{ reportContents[4] }}
      </p>
    </section>

    <section class="report-text">
      <p
        v-for="item in reportParagraphs"
        :key="`${item.title}-${item.content}`"
      >
        <strong v-if="item.title">{{ item.title }}</strong
        >{{ item.content }}
      </p>
      <p>如需对某个技术领域深挖或补充竞品对比分析，请告诉我。</p>
    </section>

    <section class="report-text bottom-text">
      <p
        v-for="item in reportParagraphs.slice(0, 3)"
        :key="`bottom-${item.title}-${item.content}`"
      >
        <strong v-if="item.title">{{ item.title }}</strong
        >{{ item.content }}
      </p>
    </section>
  </article>
</template>

<style scoped>
  .report-panel {
    position: relative;
    height: 100%;
    overflow-y: auto;
    padding: 30px 0 52px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .report-panel::-webkit-scrollbar {
    display: none;
  }

  .report-panel > section {
    animation: report-section-fade 0.34s ease both;
  }

  .report-panel > section:nth-of-type(2) {
    animation-delay: 0.04s;
  }

  .report-panel > section:nth-of-type(3) {
    animation-delay: 0.08s;
  }

  .report-panel > section:nth-of-type(4) {
    animation-delay: 0.12s;
  }

  .report-panel > section:nth-of-type(5) {
    animation-delay: 0.16s;
  }

  @keyframes report-section-fade {
    from {
      opacity: 0;
      filter: blur(10px);
      transform: translateY(36px);
    }

    to {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0);
    }
  }

  .date-divider {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 25px;
    margin: 0 0 20px;
    color: rgba(0, 0, 0, 0.3);
    font-size: 14px;
  }

  .date-divider span {
    height: 1px;
    background: #ececec;
  }

  .date-divider em {
    font-style: normal;
  }

  .answer-intro {
    padding-left: 4px;
  }

  .answer-intro h1 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px;
    color: #3e2676;
    font-size: 16px;
    line-height: 22px;
    font-weight: 600;
  }

  .answer-intro p,
  .answer-intro li {
    margin: 0 0 8px;
    color: #000000;
    font-size: 14px;
    line-height: 20px;
  }

  .answer-intro ul {
    margin: 0 0 8px;
    padding-left: 20px;
    list-style: none;
  }

  .answer-intro li {
    position: relative;
    color: rgba(0, 0, 0, 0.35);
  }

  .answer-intro li::before {
    content: "";
    position: absolute;
    top: 6px;
    left: -16px;
    width: 7px;
    height: 7px;
    border: 1px solid #dedede;
    border-radius: 50%;
  }

  .answer-intro .finished {
    color: #000000;
  }

  .answer-intro strong {
    color: #0b527b;
    font-weight: 400;
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: 28px;
    min-height: 94px;
    margin-top: 18px;
    padding: 14px 31px 14px 39px;
    border: 1px solid #d8d8d8;
    border-radius: 8px;
    background: #ffffff;
  }

  .summary-card > div:nth-child(2) {
    flex: 1;
    min-width: 0;
  }

  .doc-icon {
    display: flex;
    flex: 0 0 70px;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    width: 70px;
    height: 64px;
    padding: 15px 12px;
    border-radius: 5px;
    background: linear-gradient(135deg, #d4a9ff, #ac7bff);
  }

  .doc-icon span {
    height: 5px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.56);
  }

  .summary-card h2 {
    margin: 0 0 6px;
    color: #000000;
    font-size: 13px;
    line-height: 18px;
    font-weight: 400;
  }

  .summary-card p {
    margin: 0;
    color: rgba(0, 0, 0, 0.36);
    font-size: 12px;
    line-height: 17px;
  }

  .report-text {
    margin-top: 23px;
    color: rgba(0, 0, 0, 0.8);
    font-size: 14px;
    line-height: 28px;
  }

  .report-text p {
    margin: 0;
  }

  .report-text strong {
    color: #000000;
    font-weight: 400;
  }

  .bottom-text {
    margin-top: 23px;
  }
</style>
