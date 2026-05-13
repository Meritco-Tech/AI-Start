<script setup>
  import { computed, nextTick, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ElMessage } from "element-plus";
  import { ChatDotRound } from "@element-plus/icons-vue";
  import AnalystSelectPanel from "../components/AnalystSelectPanel.vue";
  import ChatPanel from "../components/ChatPanel.vue";
  import DockNav from "../components/DockNav.vue";
  import ReportPanel from "../components/ReportPanel.vue";
  import TopBar from "../components/TopBar.vue";
  import WorkspaceSidebar from "../components/WorkspaceSidebar.vue";
  import { analystCategories } from "../config/analystCategories";
  import { initialMessages, topicHistoryMessages } from "../config/chatData";
  import { dockItems } from "../config/dockItems";
  import { progressSteps, reportParagraphs } from "../config/reportData";
  import {
    initialAnalystTasks,
    initialSearches,
    initialTopics,
  } from "../config/workspaceData";

  const route = useRoute();
  const router = useRouter();

  const activeDock = computed(() => route.meta.dockKey || "home");
  const pageMode = ref("chat");
  const selectedTopic = ref("糖尿病");
  const selectedSearch = ref("糖尿病政策解读");
  const selectedAnalyst = ref("吉利汽车技术路线图分析");
  const globalSearch = ref("");
  const promptText = ref("吉利汽车技术路线图分析?");
  const chatCollapsed = ref(false);
  const isThinking = ref(false);
  const reportVisible = ref(true);
  const reportCleared = ref(false);
  const activeViewedMessageId = ref(null);
  const currentViewedMessage = ref(null);
  const chatPanelRef = ref(null);
  const pendingNewTopic = ref(false);

  const activeAnalystCategory = ref(analystCategories[0].key);

  const topics = ref(initialTopics.map((item) => ({ ...item })));
  const searches = ref([...initialSearches]);
  const analystTasks = ref(initialAnalystTasks.map((item) => ({ ...item })));

  const messages = ref(
    (topicHistoryMessages[selectedTopic.value] || initialMessages).map(
      (item) => ({
        ...item,
      })
    )
  );
  const initialViewedMessage =
    messages.value[messages.value.length - 1] || null;
  currentViewedMessage.value = initialViewedMessage;
  activeViewedMessageId.value = initialViewedMessage?.id || null;

  const setMessagesAndViewLatest = async (nextMessages) => {
    messages.value = nextMessages.map((item) => ({ ...item }));
    const latestMessage = messages.value[messages.value.length - 1] || null;
    currentViewedMessage.value = latestMessage;
    activeViewedMessageId.value = latestMessage?.id || null;
    await nextTick();
    chatPanelRef.value?.scrollToBottom();
  };

  const filteredTopics = computed(() => {
    const keyword = globalSearch.value.trim().toLowerCase();
    if (!keyword) return topics.value;
    return topics.value.filter((item) =>
      item.name.toLowerCase().includes(keyword)
    );
  });

  const filteredSearches = computed(() => {
    const keyword = globalSearch.value.trim().toLowerCase();
    if (!keyword) return searches.value;
    return searches.value.filter((item) =>
      item.toLowerCase().includes(keyword)
    );
  });

  const filteredAnalystTasks = computed(() => {
    const keyword = globalSearch.value.trim().toLowerCase();
    if (!keyword) return analystTasks.value;
    return analystTasks.value.filter((item) =>
      item.title.toLowerCase().includes(keyword)
    );
  });

  const starredTasks = computed(() =>
    analystTasks.value.filter((item) => item.starred)
  );

  const activeAnalystModules = computed(
    () =>
      analystCategories.find(
        (category) => category.key === activeAnalystCategory.value
      )?.modules || []
  );

  const currentReportTitle = computed(
    () =>
      currentViewedMessage.value?.action ||
      selectedAnalyst.value ||
      "吉利汽车技术路线图分析"
  );

  const currentSummary = computed(() => {
    if (currentViewedMessage.value?.content)
      return currentViewedMessage.value.content;
    if (selectedAnalyst.value.includes("SHEIN"))
      return "围绕品牌出海、供应链响应、流量获取与合规风险进行结构化分析。";
    if (selectedAnalyst.value.includes("V6"))
      return "围绕发动机核心部件、动力链路、知识节点与关系网络构建分析框架。";
    return "战略框架：吉利通过2024年《台州宣言》启动全面整合，从12品牌5智驾团队精简为4品牌1智驾公司，架构推进技术协同。";
  });

  const selectDock = (key) => {
    const target = dockItems.find((item) => item.key === key);
    if (!target) return;
    router.push(target.path);
  };

  const selectTopic = async (name) => {
    pendingNewTopic.value = false;
    selectedTopic.value = name;
    topics.value = topics.value.map((item) => ({
      ...item,
      active: item.name === name,
    }));
    pageMode.value = "chat";
    reportCleared.value = false;
    reportVisible.value = true;
    chatCollapsed.value = false;
    isThinking.value = false;
    promptText.value = `${name}?`;
    await setMessagesAndViewLatest(topicHistoryMessages[name] || []);
  };

  const selectSearch = (name) => {
    pendingNewTopic.value = false;
    selectedSearch.value = name;
    globalSearch.value = name;
    pageMode.value = "chat";
    reportVisible.value = true;
  };

  const selectAnalyst = (task) => {
    selectedAnalyst.value = task.title;
    pageMode.value = "chat";
    currentViewedMessage.value = null;
    activeViewedMessageId.value = null;
    promptText.value = pendingNewTopic.value ? "" : `${task.title}?`;
    reportVisible.value = true;
  };

  const selectAnalystCategory = (key) => {
    activeAnalystCategory.value = key;
  };

  const selectAnalystModule = (module) => {
    selectedAnalyst.value = module.title;
    promptText.value = pendingNewTopic.value ? "" : `${module.title}?`;
    messages.value = [];
    currentViewedMessage.value = null;
    activeViewedMessageId.value = null;
    reportVisible.value = false;
    reportCleared.value = true;
    chatCollapsed.value = false;
    isThinking.value = false;
    pageMode.value = "chat";
  };

  const toggleStar = (task) => {
    task.starred = !task.starred;
    ElMessage.success(task.starred ? "已加星标" : "已取消星标");
  };

  const addNewTopic = () => {
    pendingNewTopic.value = true;
    pageMode.value = "analyst-select";
    reportVisible.value = false;
    currentViewedMessage.value = null;
    activeViewedMessageId.value = null;
    messages.value = [];
    promptText.value = "";
    chatCollapsed.value = false;
  };

  const createTopicFromQuestion = (question) => {
    const name = question.replace(/？|\?/g, "");
    if (topics.value.some((item) => item.name === name)) {
      selectedTopic.value = name;
    } else {
      topics.value.push({ name, active: false });
      selectedTopic.value = name;
    }
    topics.value = topics.value.map((item) => ({
      ...item,
      active: item.name === name,
    }));
    pendingNewTopic.value = false;
  };

  const sendPrompt = async (text = promptText.value) => {
    const query = text.trim();
    if (!query) {
      ElMessage.warning("请输入要分析的问题");
      return;
    }
    promptText.value = query;
    if (pendingNewTopic.value) {
      createTopicFromQuestion(query);
    }
    reportCleared.value = false;
    reportVisible.value = true;
    isThinking.value = true;
    const userMessage = {
      id: Date.now(),
      status: "AI正在不断思考",
      title: "AI推荐答案:",
      content: `正在围绕「${query.replace(
        /？|\?/g,
        ""
      )}」进行多维度研究，已开始并行检索关键技术方向、产业背景与风险因素。`,
      action: query.replace(/？|\?/g, ""),
      thinking: true,
    };
    messages.value.push(userMessage);
    await nextTick();
    chatPanelRef.value?.scrollToBottom();
    window.setTimeout(() => {
      userMessage.status = "AI分析师分析完毕";
      userMessage.thinking = false;
      userMessage.content = `已完成「${query.replace(
        /？|\?/g,
        ""
      )}」的初步分析，可继续查看报告详情或补充竞品对比分析。`;
      isThinking.value = false;
    }, 1200);
  };

  const openQuickQuestion = (question) => {
    promptText.value = `${question}?`;
    sendPrompt(promptText.value);
  };

  const viewMessage = (message) => {
    currentViewedMessage.value = message;
    activeViewedMessageId.value = message.id;
    reportCleared.value = false;
    reportVisible.value = true;
  };

  const copyReportLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      ElMessage.success("文件链接已复制");
    } catch {
      ElMessage.warning("复制失败，请手动复制浏览器地址");
    }
  };

  const shareReport = () => {
    ElMessage.success("已打开分享");
  };

  const exitWorkspace = () => {
    ElMessage.info("已退出当前空间");
  };

  const toggleReport = () => {
    reportVisible.value = !reportVisible.value;
  };
</script>

<template>
  <main class="page-shell">
    <section class="home-layout">
      <DockNav
        :items="dockItems"
        :active-dock="activeDock"
        @create-topic="addNewTopic"
        @select-dock="selectDock"
        @exit="exitWorkspace"
      />

      <WorkspaceSidebar
        :starred-tasks="starredTasks"
        :filtered-topics="filteredTopics"
        :filtered-analyst-tasks="filteredAnalystTasks"
        :filtered-searches="filteredSearches"
        :selected-topic="selectedTopic"
        :selected-analyst="selectedAnalyst"
        :selected-search="selectedSearch"
        @create-topic="addNewTopic"
        @select-topic="selectTopic"
        @select-analyst="selectAnalyst"
        @select-search="selectSearch"
        @toggle-star="toggleStar"
      />

      <section class="main-area">
        <AnalystSelectPanel
          v-if="pageMode === 'analyst-select'"
          :categories="analystCategories"
          :active-category="activeAnalystCategory"
          :active-modules="activeAnalystModules"
          @select-category="selectAnalystCategory"
          @select-module="selectAnalystModule"
        />

        <div v-else class="content-grid" :class="{ collapsed: chatCollapsed }">
          <ReportPanel
            v-if="!reportCleared"
            :report-visible="reportVisible"
            :current-report-title="currentReportTitle"
            :current-summary="currentSummary"
            :progress-steps="progressSteps"
            :report-paragraphs="reportParagraphs"
            @toggle-report="toggleReport"
          >
            <TopBar @copy="copyReportLink" @share="shareReport" />
          </ReportPanel>

          <section v-else class="report-panel"></section>

          <ChatPanel
            v-if="!chatCollapsed"
            ref="chatPanelRef"
            v-model:prompt-text="promptText"
            :messages="messages"
            :is-thinking="isThinking"
            :active-viewed-message-id="activeViewedMessageId"
            @send="sendPrompt"
            @quick-question="openQuickQuestion"
            @view-message="viewMessage"
            @collapse="chatCollapsed = true"
            @create-topic="addNewTopic"
          />

          <el-button
            v-else
            class="expand-chat"
            :icon="ChatDotRound"
            @click="chatCollapsed = false"
          >
            展开对话
          </el-button>
        </div>
      </section>
    </section>
  </main>
</template>
