<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ElMessage } from "element-plus";
  import { ChatDotRound } from "@element-plus/icons-vue";
  import AnalystSelectPanel from "../components/AnalystSelectPanel.vue";
  import ChatPanel from "../components/ChatPanel.vue";
  import DockNav from "../components/DockNav.vue";
  import ReportPanel from "../components/ReportPanel.vue";
  import TopBar from "../components/TopBar.vue";
  import WorkspaceSidebar from "../components/WorkspaceSidebar.vue";
  import {
    analystAgentCategories,
    analystCategories,
  } from "../config/analystCategories";
  import { topicHistoryMessages } from "../config/chatData";
  import { DEFAULT_USER_ID } from "../api/http";
  import {
    createChatJob,
    createChatStream,
    createSession,
    getHistory,
    getSessions,
  } from "../api/eidos";
  import { dockItems } from "../config/dockItems";
  import {
    initialAnalystTasks,
    initialSearches,
    initialTopics,
  } from "../config/workspaceData";

  const route = useRoute();
  const router = useRouter();

  const activeDock = computed(() => route.meta.dockKey || "home");
  const pageMode = ref("chat");
  const selectedTopic = ref("");
  const selectedSearch = ref("");
  const selectedAnalyst = ref("");
  const globalSearch = ref("");
  const promptText = ref("");
  const chatCollapsed = ref(false);
  const isThinking = ref(false);
  const reportCleared = ref(false);
  const activeViewedMessageId = ref(null);
  const currentViewedMessage = ref(null);
  const chatPanelRef = ref(null);
  const pendingNewTopic = ref(false);
  const pendingNewAnalyst = ref(false);
  const selectPanelMode = ref("topic");
  const sessions = ref([]);
  const currentSessionId = ref(null);
  let activeEventSource = null;

  const activeAnalystCategory = ref(analystCategories[0].key);

  const topics = ref(initialTopics.map((item) => ({ ...item })));
  const searches = ref([...initialSearches]);
  const analystTasks = ref(initialAnalystTasks.map((item) => ({ ...item })));

  const messages = ref([]);
  const initialViewedMessage =
    messages.value[messages.value.length - 1] || null;
  currentViewedMessage.value = initialViewedMessage;
  activeViewedMessageId.value = initialViewedMessage?.id || null;

  const getLatestAssistantMessage = () =>
    [...messages.value].reverse().find((item) => item.role === "assistant") ||
    null;

  const setActiveViewedMessage = (message) => {
    currentViewedMessage.value = message;
    activeViewedMessageId.value = message?.id || null;
  };

  const normalizeMessage = (message) => ({
    ...message,
    role: message.role || "assistant",
  });

  const setMessagesAndViewLatest = async (nextMessages) => {
    messages.value = nextMessages.map(normalizeMessage);
    setActiveViewedMessage(getLatestAssistantMessage());
    await nextTick();
    chatPanelRef.value?.scrollToBottom();
  };

  const normalizeTitle = (value) =>
    String(value || "新建会话").replace(/？|\?/g, "");

  const mapSessionToTopic = (session) => ({
    name: normalizeTitle(session.title),
    active: session.id === currentSessionId.value,
    sessionId: session.id,
  });

  const syncTopicsBySessions = (nextSessions) => {
    sessions.value = nextSessions;
    if (!nextSessions.length) return;
    topics.value = nextSessions.map(mapSessionToTopic);
  };

  const getMessageStatusText = (status) =>
    status === "running"
      ? "AI正在不断思考"
      : status === "error"
      ? "AI分析师分析失败"
      : status === "stopped"
      ? "AI分析已停止"
      : "AI分析师分析完毕";

  const mapHistoryToMessages = (historyMessages) => {
    let latestUserText = "";
    return historyMessages.reduce((items, item) => {
      if (item.role !== "user" && item.role !== "assistant") return items;
      const content = item.content || item.meta?.text || "";
      if (item.role === "user") latestUserText = content;
      items.push({
        id: item.id,
        role: item.role,
        status: getMessageStatusText(item.status),
        title: "AI推荐答案:",
        content,
        action: normalizeTitle(
          item.role === "assistant"
            ? latestUserText || selectedTopic.value
            : content
        ),
        thinking: item.role === "assistant" && item.status === "running",
        raw: item,
      });
      return items;
    }, []);
  };

  const closeActiveStream = () => {
    activeEventSource?.close();
    activeEventSource = null;
  };

  const loadSessionHistory = async (sessionId) => {
    const history = await getHistory(sessionId, DEFAULT_USER_ID);
    await setMessagesAndViewLatest(mapHistoryToMessages(history));
  };

  const ensureSession = async (title = selectedTopic.value) => {
    if (currentSessionId.value) return currentSessionId.value;
    const session = await createSession(
      { title: normalizeTitle(title) },
      DEFAULT_USER_ID
    );
    currentSessionId.value = session.id;
    syncTopicsBySessions([
      session,
      ...sessions.value.filter((item) => item.id !== session.id),
    ]);
    selectedTopic.value = normalizeTitle(session.title);
    return session.id;
  };

  const initializeSessions = async () => {
    try {
      const sessionList = await getSessions(DEFAULT_USER_ID);
      if (sessionList.length) {
        currentSessionId.value = sessionList[0].id;
        selectedTopic.value = normalizeTitle(sessionList[0].title);
        syncTopicsBySessions(sessionList);
        await loadSessionHistory(sessionList[0].id);
        return;
      }
      const session = await createSession(
        { title: selectedTopic.value },
        DEFAULT_USER_ID
      );
      currentSessionId.value = session.id;
      syncTopicsBySessions([session]);
      await setMessagesAndViewLatest([]);
    } catch (error) {
      ElMessage.warning(`${error.message}`);
    }
  };

  const parseStreamData = (event) => {
    try {
      return JSON.parse(event.data);
    } catch {
      return {};
    }
  };

  const appendStreamText = async (message, text) => {
    if (!text) return;
    message.content = `${message.content || ""}${text}`;
    currentViewedMessage.value = message;
    await nextTick();
    chatPanelRef.value?.scrollToBottom();
  };

  const finishStreamMessage = async (message, sessionId, payload = {}) => {
    message.status =
      payload.status === "error" ? "AI分析师分析失败" : "AI分析师分析完毕";
    message.thinking = false;
    if (payload.text) message.content = payload.text;
    isThinking.value = false;
    closeActiveStream();
    try {
      await loadSessionHistory(sessionId);
    } catch {
      currentViewedMessage.value = message;
      activeViewedMessageId.value = message.id;
    }
  };

  const listenChatStream = (jobId, sessionId, message) => {
    closeActiveStream();
    activeEventSource = createChatStream(jobId, sessionId, DEFAULT_USER_ID);
    activeEventSource.addEventListener("assistant_delta", (event) => {
      appendStreamText(message, parseStreamData(event).text);
    });
    activeEventSource.addEventListener("assistant_end", (event) => {
      appendStreamText(message, parseStreamData(event).text);
    });
    activeEventSource.addEventListener("progress", (event) => {
      const payload = parseStreamData(event);
      if (payload.text) message.status = payload.text;
    });
    activeEventSource.addEventListener("tool_hint", (event) => {
      const payload = parseStreamData(event);
      if (payload.text) message.status = payload.text;
    });
    activeEventSource.addEventListener("done", (event) => {
      finishStreamMessage(message, sessionId, parseStreamData(event));
    });
    activeEventSource.addEventListener("error", (event) => {
      const payload = event.data ? parseStreamData(event) : {};
      if (payload.message) message.content = payload.message;
      finishStreamMessage(message, sessionId, { status: "error" });
    });
    activeEventSource.onerror = () => {
      if (!message.thinking) return;
      finishStreamMessage(message, sessionId, { status: "error" });
    };
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

  const currentSelectCategories = computed(() =>
    selectPanelMode.value === "analyst"
      ? analystAgentCategories
      : analystCategories
  );

  const currentSelectTitle = computed(() =>
    selectPanelMode.value === "analyst" ? "新建分析师" : "新建新话题"
  );

  const activeAnalystModules = computed(
    () =>
      currentSelectCategories.value.find(
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

  const reportPanelKey = computed(
    () =>
      currentViewedMessage.value?.id || selectedAnalyst.value || "empty-report"
  );

  const selectDock = (key) => {
    const target = dockItems.find((item) => item.key === key);
    if (!target) return;
    router.push(target.path);
  };

  const selectTopic = async (topic) => {
    const nextTopic = typeof topic === "string" ? { name: topic } : topic;
    pendingNewTopic.value = false;
    pendingNewAnalyst.value = false;
    selectedTopic.value = nextTopic.name;
    if (nextTopic.sessionId) currentSessionId.value = nextTopic.sessionId;
    topics.value = topics.value.map((item) => ({
      ...item,
      active: item.sessionId
        ? item.sessionId === nextTopic.sessionId
        : item.name === nextTopic.name,
    }));
    pageMode.value = "chat";
    reportCleared.value = false;
    chatCollapsed.value = false;
    isThinking.value = false;
    if (nextTopic.sessionId) {
      try {
        await loadSessionHistory(nextTopic.sessionId);
        return;
      } catch (error) {
        ElMessage.warning(`获取会话历史失败：${error.message}`);
      }
    }
    await setMessagesAndViewLatest(topicHistoryMessages[nextTopic.name] || []);
  };

  const selectSearch = (name) => {
    pendingNewTopic.value = false;
    pendingNewAnalyst.value = false;
    selectedSearch.value = name;
    globalSearch.value = name;
    pageMode.value = "chat";
  };

  const selectAnalyst = (task) => {
    pendingNewAnalyst.value = false;
    selectedAnalyst.value = task.title;
    pageMode.value = "chat";
    currentViewedMessage.value = null;
    activeViewedMessageId.value = null;
    promptText.value = pendingNewTopic.value ? "" : `${task.title}?`;
  };

  const selectAnalystCategory = (key) => {
    activeAnalystCategory.value = key;
  };

  const selectAnalystModule = (module) => {
    selectedAnalyst.value = module.title;
    pendingNewAnalyst.value = selectPanelMode.value === "analyst";
    promptText.value =
      pendingNewTopic.value || pendingNewAnalyst.value
        ? ""
        : `${module.title}?`;
    messages.value = [];
    currentViewedMessage.value = null;
    activeViewedMessageId.value = null;
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
    pendingNewAnalyst.value = false;
    selectPanelMode.value = "topic";
    activeAnalystCategory.value = analystCategories[0].key;
    pageMode.value = "analyst-select";
    currentViewedMessage.value = null;
    activeViewedMessageId.value = null;
    messages.value = [];
    promptText.value = "";
    chatCollapsed.value = false;
  };

  const addNewAnalyst = () => {
    pendingNewTopic.value = false;
    pendingNewAnalyst.value = false;
    selectPanelMode.value = "analyst";
    activeAnalystCategory.value = analystAgentCategories[0].key;
    pageMode.value = "analyst-select";
    currentViewedMessage.value = null;
    activeViewedMessageId.value = null;
    messages.value = [];
    promptText.value = "";
    chatCollapsed.value = false;
  };

  const createTopicFromQuestion = async (question) => {
    const name = normalizeTitle(question);
    const session = await createSession({ title: name }, DEFAULT_USER_ID);
    currentSessionId.value = session.id;
    sessions.value = [
      session,
      ...sessions.value.filter((item) => item.id !== session.id),
    ];
    topics.value.push({ name, active: false, sessionId: session.id });
    selectedTopic.value = name;
    topics.value = topics.value.map((item) => ({
      ...item,
      active: item.sessionId === session.id,
    }));
    pendingNewTopic.value = false;
  };

  const createAnalystFromQuestion = (question) => {
    const title = question.replace(/？|\?/g, "");
    if (!analystTasks.value.some((item) => item.title === title)) {
      analystTasks.value.push({ title, starred: false });
    }
    selectedAnalyst.value = title;
    pendingNewAnalyst.value = false;
  };

  const sendPrompt = async (text = promptText.value) => {
    const query = text.trim();
    if (!query) {
      ElMessage.warning("请输入要分析的问题");
      return;
    }
    promptText.value = query;
    try {
      if (pendingNewTopic.value) {
        await createTopicFromQuestion(query);
      }
      if (pendingNewAnalyst.value) {
        createAnalystFromQuestion(query);
      }
      const sessionId = await ensureSession(query);
      reportCleared.value = false;
      isThinking.value = true;
      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        action: normalizeTitle(query),
      };
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        status: "AI正在不断思考",
        title: "AI推荐答案:",
        content: "",
        action: normalizeTitle(query),
        thinking: true,
      };
      messages.value.push(userMessage, assistantMessage);
      setActiveViewedMessage(assistantMessage);
      await nextTick();
      chatPanelRef.value?.scrollToBottom();
      const job = await createChatJob(
        {
          session_id: sessionId,
          message: query,
          context: {
            active_skill: selectedAnalyst.value,
            center_view: "chat",
          },
          composer_prefs: {},
          turn_context: {},
        },
        DEFAULT_USER_ID
      );
      assistantMessage.id = job.assistant_message_id || assistantMessage.id;
      if (job.title) assistantMessage.action = job.title;
      activeViewedMessageId.value = assistantMessage.id;
      listenChatStream(job.job_id, sessionId, assistantMessage);
    } catch (error) {
      isThinking.value = false;
      ElMessage.error(`发送失败：${error.message}`);
    }
  };

  const openQuickQuestion = (question) => {
    promptText.value = `${question}?`;
    sendPrompt(promptText.value);
  };

  const viewMessage = (message) => {
    currentViewedMessage.value = message;
    activeViewedMessageId.value = message.id;
    reportCleared.value = false;
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

  onMounted(() => {
    initializeSessions();
  });

  onBeforeUnmount(() => {
    closeActiveStream();
  });
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
        :selected-topic-id="currentSessionId"
        :selected-analyst="selectedAnalyst"
        :selected-search="selectedSearch"
        @create-topic="addNewTopic"
        @create-analyst="addNewAnalyst"
        @select-topic="selectTopic"
        @select-analyst="selectAnalyst"
        @select-search="selectSearch"
        @toggle-star="toggleStar"
      />

      <section class="main-area">
        <AnalystSelectPanel
          v-if="pageMode === 'analyst-select'"
          :title="currentSelectTitle"
          :categories="currentSelectCategories"
          :active-category="activeAnalystCategory"
          :active-modules="activeAnalystModules"
          @select-category="selectAnalystCategory"
          @select-module="selectAnalystModule"
        />

        <div v-else class="content-grid" :class="{ collapsed: chatCollapsed }">
          <ReportPanel
            v-if="!reportCleared"
            :key="reportPanelKey"
            :current-report-title="currentReportTitle"
            :current-summary="currentSummary"
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

  .main-area {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    background: #ffffff;
  }

  .content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 438px;
    column-gap: 68px;
    width: 100%;
    height: 100%;
    padding: 35px 28px 0 32px;
  }

  .content-grid.collapsed {
    grid-template-columns: minmax(0, 1fr) 150px;
  }

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

  .expand-chat.el-button {
    align-self: start;
    height: 40px;
    margin-top: 0;
    border-color: #6a44a0;
    color: #4a2788;
  }

  @media (max-width: 1440px) {
    .content-grid {
      grid-template-columns: minmax(0, 1fr) 360px;
      column-gap: 36px;
      padding-left: 20px;
    }
  }
</style>
