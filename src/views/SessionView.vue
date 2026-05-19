<script setup>
  import { computed, nextTick, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ElMessage } from "element-plus";
  import {
    Delete,
    Document,
    Position,
    UploadFilled,
  } from "@element-plus/icons-vue";
  import DockNav from "../components/DockNav.vue";
  import { DEFAULT_USER_ID } from "../api/http";
  import {
    DEEPSEEK_MODELS,
    DEEPSEEK_REASONING_EFFORTS,
    createDeepSeekChatCompletion,
    getDeepSeekReasoningText,
    getDeepSeekReplyText,
  } from "../api/deepseek";
  import {
    createSession,
    uploadWorkspaceFiles,
  } from "../api/eidos";
  import { searchWeb } from "../api/search";
  import { dockItems } from "../config/dockItems";

  const route = useRoute();
  const router = useRouter();

  const activeDock = computed(() => route.meta.dockKey || "sessions");
  const files = ref([]);
  const instructionFiles = ref([]);
  const instructionLogics = ref([]);
  const selectedInstructionLogicId = ref(null);
  const messages = ref([
    {
      id: "welcome",
      role: "assistant",
      content: "你好，我可以结合左侧上传的文件，帮你做摘要、问答和分析。",
    },
  ]);
  const promptText = ref("");
  const selectedModel = ref(DEEPSEEK_MODELS[0].value);
  const isThinkingModeEnabled = ref(false);
  const isSmartSearchEnabled = ref(false);
  const isMultiAgentEnabled = ref(false);
  const selectedReasoningEffort = ref(DEEPSEEK_REASONING_EFFORTS[0].value);
  const currentSessionId = ref(null);
  const isUploading = ref(false);
  const isSearching = ref(false);
  const isThinking = ref(false);
  const isInstructionLogicPickerOpen = ref(false);
  const activeInstructionLogicIndex = ref(0);
  const chatBodyRef = ref(null);
  const logicPickerRef = ref(null);
  const MAX_LOCAL_FILE_CHARS = 12000;
  const MAX_SINGLE_LOCAL_FILE_CHARS = 6000;
  const AGENT_STATUS_LABELS = {
    pending: "等待中",
    running: "进行中",
    done: "已完成",
    error: "失败",
  };

  const showInstructionLogicPicker = computed(
    () => isInstructionLogicPickerOpen.value && instructionLogics.value.length > 0
  );

  const activeInstructionLogic = computed(
    () => instructionLogics.value[activeInstructionLogicIndex.value] || null
  );

  const selectedInstructionLogic = computed(() =>
    instructionLogics.value.find(
      (logic) => logic.id === selectedInstructionLogicId.value
    )
  );

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

  const scrollToBottom = async () => {
    await nextTick();
    chatBodyRef.value?.scrollTo({
      top: chatBodyRef.value.scrollHeight,
      behavior: "smooth",
    });
  };

  const scrollActiveInstructionLogicIntoView = async () => {
    await nextTick();
    logicPickerRef.value
      ?.querySelector(".logic-option.keyboard-active")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const setActiveInstructionLogicIndex = async (nextIndex) => {
    const total = instructionLogics.value.length;
    if (!total) return;
    activeInstructionLogicIndex.value = (nextIndex + total) % total;
    await scrollActiveInstructionLogicIntoView();
  };

  const normalizeTitle = (value) =>
    String(value || "会话").replace(/？|\?/g, "");

  const ensureSession = async (title = "文件会话") => {
    if (currentSessionId.value) return currentSessionId.value;
    const session = await createSession(
      { title: normalizeTitle(title) },
      DEFAULT_USER_ID
    );
    currentSessionId.value = session.id;
    return session.id;
  };

  const buildDeepSeekMessages = (query, options) => {
    const localFileText = files.value.length
      ? `本地文件名称：${files.value.map((file) => file.name).join("、")}。`
      : "未上传本地文件。";
    const instructionFileText = instructionFiles.value.length
      ? `指令集文件名称：${instructionFiles.value
          .map((file) => file.name)
          .join("、")}。`
      : "未上传指令集文件。";
    const contextText = [
      localFileText,
      instructionFileText,
      "本地文件只是可选参考，不是完成分析的前提。",
      files.value.some((file) => file.content)
        ? "用户 Prompt 中包含本地文件正文时，请优先参考这些文件内容回答；如果文件内容与问题无关，可结合模型自身知识补充。"
        : "当前没有可解析的本地文件正文时，请使用模型自身知识回答，不要声称已读取文件内容。",
      "当用户问题和已选择的分析逻辑足以回答时，请直接基于问题和分析逻辑进行分析，不要要求必须提供本地文件。",
      "只有当用户明确要求分析某个文件内容且当前消息没有提供文件正文时，才说明无法读取文件正文。",
      options.smartSearchEnabled
        ? "智能搜索已开启。如果用户 Prompt 中包含联网搜索结果，请综合搜索结果和模型知识回答，并在必要时说明搜索结果来源。"
        : "智能搜索已关闭。请仅使用模型自身知识、用户问题、分析逻辑和当前对话上下文回答，不要声称进行了联网搜索。",
      options.multiAgentEnabled
        ? "多 Agent 模式已开启。请服从当前 Agent 的角色分工，只完成被分配的计划、子任务分析或总结工作。"
        : "多 Agent 模式已关闭。请作为单一助手直接回答用户问题。",
    ].join("");
    const previousMessages = messages.value
      .filter((message) => message.id !== "welcome" && message.content)
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));
    return [
      {
        role: "system",
        content: `你是 Enterprise EIDOS 的企业决策会话助手。请用中文回答，保持结构清晰、可执行。${contextText}无论是否开启思考模式，都必须给出最终答案，不要只返回推理过程。`,
      },
      ...previousMessages,
      { role: "user", content: query },
    ];
  };

  const parseInstructionLogics = (fileId, fileName, text) => {
    const source = String(text || "");
    const markerPattern = /\[ ([\u4e00-\u9fa5][\u4e00-\u9fa5\s，。、；：！？（）《》“”‘’—-]*) \]/g;
    const matches = [...source.matchAll(markerPattern)];
    if (!matches.length) return [];
    return matches.map((match, index) => {
      const title = match[1].trim();
      const contentStart = match.index + match[0].length;
      const contentEnd =
        index + 1 < matches.length ? matches[index + 1].index : source.length;
      const content = source.slice(contentStart, contentEnd).trim();
      return {
        id: `${fileId}-logic-${index}`,
        fileId,
        fileName,
        title,
        content: content || title,
      };
    });
  };

  const isLikelyTextFile = (file) => {
    const textExtensions =
      /\.(txt|md|markdown|csv|tsv|json|jsonl|log|xml|yaml|yml|sql|js|jsx|ts|tsx|vue|html|css|scss|less|py|java|go|rs|rb|php|sh|zsh|bat|ini|toml|env)$/i;
    return file.type.startsWith("text/") || textExtensions.test(file.name);
  };

  const readLocalReferenceFile = async (fileMeta, rawFile) => {
    fileMeta.content = "";
    fileMeta.contentStatus = "未读取正文";

    if (!isLikelyTextFile(rawFile)) {
      fileMeta.contentStatus = "暂不支持正文解析";
      fileMeta.status = "本地已选择 · 暂不支持正文解析";
      return;
    }

    try {
      const text = (await rawFile.text()).trim();
      if (!text) {
        fileMeta.contentStatus = "空文件";
        fileMeta.status = "本地已选择 · 空文件";
        return;
      }
      fileMeta.content =
        text.length > MAX_SINGLE_LOCAL_FILE_CHARS
          ? text.slice(0, MAX_SINGLE_LOCAL_FILE_CHARS)
          : text;
      fileMeta.isContentTruncated = text.length > MAX_SINGLE_LOCAL_FILE_CHARS;
      fileMeta.contentStatus = fileMeta.isContentTruncated
        ? "已读取正文 · 已截断"
        : "已读取正文";
      fileMeta.status = fileMeta.contentStatus;
    } catch (error) {
      fileMeta.contentStatus = "正文读取失败";
      fileMeta.status = "本地已选择 · 正文读取失败";
      ElMessage.warning(`本地文件正文读取失败：${error.message}`);
    }
  };

  const readInstructionFile = async (fileMeta, rawFile) => {
    try {
      const text = await rawFile.text();
      const parsedLogics = parseInstructionLogics(
        fileMeta.id,
        fileMeta.name,
        text
      );
      instructionLogics.value = [
        ...parsedLogics,
        ...instructionLogics.value.filter(
          (logic) => logic.fileId !== fileMeta.id
        ),
      ];
      fileMeta.logicCount = parsedLogics.length;
      fileMeta.status = parsedLogics.length
        ? `已解析 ${parsedLogics.length} 段逻辑`
        : "未解析到逻辑";
      if (!parsedLogics.length) {
        ElMessage.warning("未在指令集文件中解析到 [ 中文 ] 标识");
      }
    } catch (error) {
      fileMeta.status = "解析失败";
      ElMessage.warning(`指令集文件解析失败：${error.message}`);
    }
  };

  const addFiles = async (uploadFile, targetType) => {
    const rawFile = uploadFile.raw;
    if (!rawFile) return;
    const targetList = targetType === "instruction" ? instructionFiles : files;
    const localFile = {
      id: `${rawFile.name}-${rawFile.lastModified}-${Date.now()}`,
      name: rawFile.name,
      size: rawFile.size,
      status: targetType === "instruction" ? "指令集待上传" : "本地待上传",
      type: targetType,
      raw: rawFile,
    };
    targetList.value.unshift(localFile);
    if (targetType === "instruction") {
      await readInstructionFile(localFile, rawFile);
    } else {
      await readLocalReferenceFile(localFile, rawFile);
    }
    isUploading.value = true;
    try {
      const sessionId = await ensureSession("文件会话");
      await uploadWorkspaceFiles(sessionId, [rawFile], "permanent");
      localFile.status =
        targetType === "instruction" && localFile.logicCount
          ? `已上传 · 已解析 ${localFile.logicCount} 段逻辑`
          : targetType === "instruction"
          ? "已上传"
          : `已上传 · ${localFile.contentStatus}`;
      ElMessage.success("文件上传成功");
    } catch (error) {
      localFile.status =
        targetType === "instruction" && localFile.logicCount
          ? `本地已选择 · 已解析 ${localFile.logicCount} 段逻辑`
          : targetType === "instruction"
          ? "指令集已选择"
          : `本地已选择 · ${localFile.contentStatus}`;
      ElMessage.warning(`文件已加入列表，上传接口暂不可用：${error.message}`);
    } finally {
      isUploading.value = false;
    }
  };

  const addLocalFiles = (uploadFile) => addFiles(uploadFile, "local");

  const addInstructionFiles = (uploadFile) =>
    addFiles(uploadFile, "instruction");

  const removeFile = (fileId, targetType) => {
    const targetList = targetType === "instruction" ? instructionFiles : files;
    targetList.value = targetList.value.filter((file) => file.id !== fileId);
    if (targetType === "instruction") {
      instructionLogics.value = instructionLogics.value.filter(
        (logic) => logic.fileId !== fileId
      );
      if (
        selectedInstructionLogicId.value &&
        !instructionLogics.value.some(
          (logic) => logic.id === selectedInstructionLogicId.value
        )
      ) {
        selectedInstructionLogicId.value = null;
      }
    }
  };

  const replaceInstructionMention = (title) => {
    const mentionText = `@${title} `;
    if (/@[^@\n]*$/.test(promptText.value)) {
      promptText.value = promptText.value.replace(
        /@[^@\n]*$/,
        mentionText
      );
      return;
    }
    promptText.value = `${promptText.value.trimEnd()} ${mentionText}`.trimStart();
  };

  const selectInstructionLogic = (logic) => {
    selectedInstructionLogicId.value = logic.id;
    replaceInstructionMention(logic.title);
    isInstructionLogicPickerOpen.value = false;
  };

  const selectActiveInstructionLogic = () => {
    if (!activeInstructionLogic.value) return;
    selectInstructionLogic(activeInstructionLogic.value);
  };

  const handlePromptInput = (value) => {
    promptText.value = value;
    const shouldOpenPicker = /@[\u4e00-\u9fa5\w-]*$/.test(value);
    isInstructionLogicPickerOpen.value = shouldOpenPicker;
    if (shouldOpenPicker) setActiveInstructionLogicIndex(0);
    if (
      selectedInstructionLogic.value &&
      !value.includes(`@${selectedInstructionLogic.value.title}`)
    ) {
      selectedInstructionLogicId.value = null;
    }
  };

  const handlePromptKeydown = async (event) => {
    if (showInstructionLogicPicker.value) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        await setActiveInstructionLogicIndex(
          activeInstructionLogicIndex.value + 1
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        await setActiveInstructionLogicIndex(
          activeInstructionLogicIndex.value - 1
        );
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        selectActiveInstructionLogic();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        isInstructionLogicPickerOpen.value = false;
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendPrompt();
    }
  };

  const normalizeQuestionText = (value) => {
    let text = String(value || "");
    if (selectedInstructionLogic.value) {
      text = text.replace(`@${selectedInstructionLogic.value.title}`, "");
    }
    return text.replace(/@[^@\n]*/g, "").replace(/\s{2,}/g, " ").trim();
  };

  const buildPromptWithInstructionLogics = (query) => {
    const logic = selectedInstructionLogic.value;
    if (!logic) return query;
    const logicText = `### 分析逻辑：${logic.title}\n来源：${logic.fileName}\n${logic.content}`;
    return `${query}\n\n---\n\n请同时遵循以下分析逻辑：\n\n${logicText}`;
  };

  const buildPromptWithLocalFiles = (query) => {
    if (!files.value.length) return query;

    let remainingChars = MAX_LOCAL_FILE_CHARS;
    const readableSections = [];

    files.value
      .filter((file) => file.content)
      .forEach((file) => {
        if (remainingChars <= 0) return;
        const content = file.content.slice(0, remainingChars);
        remainingChars -= content.length;
        readableSections.push(
          [
            `### 本地文件：${file.name}`,
            `大小：${formatFileSize(file.size)}`,
            file.isContentTruncated ? "说明：文件正文较长，以下内容已截断。" : "",
            "```text",
            content,
            "```",
          ]
            .filter(Boolean)
            .join("\n")
        );
      });

    const unreadableFiles = files.value.filter((file) => !file.content);
    const unreadableText = unreadableFiles.length
      ? [
          "以下本地文件已上传，但当前前端未能解析出可提交给模型的正文：",
          unreadableFiles
            .map((file) => `- ${file.name}（${file.contentStatus || file.status}）`)
            .join("\n"),
        ].join("\n")
      : "";

    if (!readableSections.length) {
      return [
        query,
        "---",
        "### 本地文件参考",
        unreadableText || "当前没有可解析的本地文件正文，请基于模型自身知识回答。",
      ].join("\n\n");
    }

    return [
      query,
      "---",
      "### 本地文件参考",
      "请优先参考以下本地文件内容回答；如果文件内容不足以回答，请结合模型自身知识并说明依据。",
      readableSections.join("\n\n"),
      unreadableText,
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const buildSmartSearchPrompt = (searchContext) => {
    if (!searchContext?.enabled) return "";
    if (searchContext.error) {
      return [
        "### 智能搜索",
        `搜索查询：${searchContext.query}`,
        `搜索状态：失败（${searchContext.error}）。`,
        "请说明联网搜索暂不可用，并基于模型自身知识继续回答。",
      ].join("\n");
    }
    if (!searchContext.results.length) {
      return [
        "### 智能搜索",
        `搜索查询：${searchContext.query}`,
        searchContext.source ? `搜索来源：${searchContext.source}` : "",
        "搜索状态：未返回可用结果。",
        "请基于模型自身知识继续回答，并避免编造搜索来源。",
      ]
        .filter(Boolean)
        .join("\n");
    }
    const resultText = searchContext.results
      .map((result, index) =>
        [
          `[${index + 1}] ${result.title}`,
          result.snippet,
          result.url ? `来源：${result.url}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n\n");
    return [
      "### 智能搜索结果",
      `搜索查询：${searchContext.query}`,
      searchContext.source ? `搜索来源：${searchContext.source}` : "",
      "请结合以下联网搜索结果回答，并注意来源信息可能需要核验。",
      resultText,
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const buildPromptWithSmartSearch = (prompt, searchContext) => {
    const searchPrompt = buildSmartSearchPrompt(searchContext);
    if (!searchPrompt) return prompt;
    return `${prompt}\n\n---\n\n${searchPrompt}`;
  };

  const runSmartSearch = async (query) => {
    if (!isSmartSearchEnabled.value) {
      return { enabled: false, query, results: [] };
    }
    isSearching.value = true;
    try {
      const searchQuery = query.slice(0, 180);
      const result = await searchWeb(searchQuery);
      return { enabled: true, ...result };
    } catch (error) {
      return {
        enabled: true,
        query,
        results: [],
        error: error.message || "搜索失败",
      };
    } finally {
      isSearching.value = false;
    }
  };

  const buildDeepSeekPayload = (deepSeekMessages, options) => {
    const payload = {
      model: options.model,
      messages: deepSeekMessages,
      stream: options.stream,
      thinking: {
        type: options.thinkingEnabled ? "enabled" : "disabled",
      },
    };

    if (options.thinkingEnabled) {
      payload.reasoning_effort = options.reasoningEffort;
    } else {
      payload.temperature = 0.2;
    }

    return payload;
  };

  const createAgentMessage = (role, content) => ({
    role,
    content,
  });

  const callDeepSeekAgent = async (systemPrompt, userPrompt, options) => {
    const response = await createDeepSeekChatCompletion(
      buildDeepSeekPayload(
        [
          createAgentMessage("system", systemPrompt),
          createAgentMessage("user", userPrompt),
        ],
        options
      )
    );
    const reasoningText = getDeepSeekReasoningText(response);
    const replyText = getDeepSeekReplyText(response);
    return {
      reasoningText,
      replyText: replyText || reasoningText || "该 Agent 未返回可用内容。",
    };
  };

  const patchAssistantMessage = async (messageId, patch) => {
    const messageIndex = messages.value.findIndex(
      (message) => message.id === messageId
    );
    if (messageIndex === -1) return;
    messages.value.splice(messageIndex, 1, {
      ...messages.value[messageIndex],
      ...patch,
    });
    await scrollToBottom();
  };

  const getAgentWorkflow = (messageId) => {
    const message = messages.value.find((item) => item.id === messageId);
    return (message?.agentWorkflow || []).map((step) => ({ ...step }));
  };

  const addAgentStep = async (messageId, step) => {
    await patchAssistantMessage(messageId, {
      agentWorkflow: [...getAgentWorkflow(messageId), step],
    });
  };

  const updateAgentStep = async (messageId, stepId, patch) => {
    const nextWorkflow = getAgentWorkflow(messageId).map((step) =>
      step.id === stepId ? { ...step, ...patch } : step
    );
    await patchAssistantMessage(messageId, {
      agentWorkflow: nextWorkflow,
    });
  };

  const runAgentWithProgress = async ({
    messageId,
    stepId,
    detail,
    systemPrompt,
    userPrompt,
    options,
  }) => {
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      const elapsedSeconds = Math.max(
        1,
        Math.round((Date.now() - startedAt) / 1000)
      );
      void updateAgentStep(messageId, stepId, {
        status: "running",
        detail: `${detail} · 已运行 ${elapsedSeconds} 秒`,
      });
    }, 2000);

    try {
      return await callDeepSeekAgent(systemPrompt, userPrompt, options);
    } finally {
      window.clearInterval(progressTimer);
    }
  };

  const extractJsonObject = (text) => {
    const source = String(text || "").trim();
    const fencedJson = source.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
    const candidate = fencedJson || source;
    const startIndex = candidate.indexOf("{");
    const endIndex = candidate.lastIndexOf("}");
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return null;
    }
    try {
      return JSON.parse(candidate.slice(startIndex, endIndex + 1));
    } catch {
      return null;
    }
  };

  const normalizeAgentTasks = (planText, fallbackQuestion) => {
    const parsedPlan = extractJsonObject(planText);
    const parsedTasks = Array.isArray(parsedPlan?.tasks) ? parsedPlan.tasks : [];
    const tasks = parsedTasks
      .map((task, index) => ({
        id: `task-${index + 1}`,
        title: String(task.title || `分析子任务 ${index + 1}`).trim(),
        goal: String(task.goal || task.description || task.title || "").trim(),
      }))
      .filter((task) => task.title)
      .slice(0, 5);

    if (tasks.length) return tasks;

    return [
      {
        id: "task-1",
        title: "核心问题分析",
        goal: fallbackQuestion,
      },
    ];
  };

  const buildAgentSummary = (agentResults) =>
    agentResults
      .map(
        (result, index) =>
          `### 子任务 ${index + 1}：${result.title}\n状态：${
            result.error ? "失败" : "完成"
          }\n${result.content}`
      )
      .join("\n\n");

  const runMultiAgentWorkflow = async (
    submittedPrompt,
    deepSeekOptions,
    assistantMessageId
  ) => {
    await patchAssistantMessage(assistantMessageId, {
      agentWorkflow: [],
    });
    await addAgentStep(assistantMessageId, {
      id: "plan",
      name: "计划 Agent",
      role: "协调器",
      status: "running",
      detail: "正在拆解分析计划",
      output: "",
    });

    const planSystemPrompt =
      "你是 Enterprise EIDOS 的多 Agent 协调器。请先建立分析计划，只输出 JSON，不要输出 Markdown。JSON 格式必须为：{\"tasks\":[{\"title\":\"子任务名称\",\"goal\":\"子任务目标\"}]}。请控制在 2 到 5 个相互独立、可并行分析的子任务。";
    const planResult = await runAgentWithProgress({
      messageId: assistantMessageId,
      stepId: "plan",
      detail: "正在拆解分析计划",
      systemPrompt: planSystemPrompt,
      userPrompt: `请为以下用户问题建立多 Agent 分析计划：\n\n${submittedPrompt}`,
      options: deepSeekOptions,
    });
    const tasks = normalizeAgentTasks(planResult.replyText, submittedPrompt);
    await updateAgentStep(assistantMessageId, "plan", {
      status: "done",
      detail: `已生成 ${tasks.length} 个子任务`,
      output: planResult.replyText,
    });

    const agentResults = await Promise.all(
      tasks.map(async (task, index) => {
        await addAgentStep(assistantMessageId, {
          id: task.id,
          name: `子任务 Agent ${index + 1}`,
          role: task.title,
          status: "running",
          detail: task.goal || "正在分析",
          output: "",
        });
        try {
          const taskSystemPrompt = [
            "你是 Enterprise EIDOS 的子任务分析 Agent。",
            "请只围绕分配给你的子任务进行深入分析，不要总结其他 Agent 的工作。",
            "输出需要结构清晰、可执行，并说明关键依据。",
          ].join("");
          const taskResult = await runAgentWithProgress({
            messageId: assistantMessageId,
            stepId: task.id,
            detail: task.goal || "正在分析",
            systemPrompt: taskSystemPrompt,
            userPrompt: [
              `完整用户 Prompt：\n${submittedPrompt}`,
              `你的子任务：${task.title}`,
              `子任务目标：${task.goal || task.title}`,
            ].join("\n\n---\n\n"),
            options: deepSeekOptions,
          });
          await updateAgentStep(assistantMessageId, task.id, {
            status: "done",
            detail: "分析完成",
            output: taskResult.replyText,
          });
          return {
            ...task,
            content: taskResult.replyText,
          };
        } catch (error) {
          const errorText = `子任务失败：${error.message}`;
          await updateAgentStep(assistantMessageId, task.id, {
            status: "error",
            detail: errorText,
            output: errorText,
          });
          return {
            ...task,
            content: errorText,
            error,
          };
        }
      })
    );

    await addAgentStep(assistantMessageId, {
      id: "summary",
      name: "总结 Agent",
      role: "综合汇总",
      status: "running",
      detail: "正在汇总所有 Agent 结果",
      output: "",
    });

    const summarySystemPrompt = [
      "你是 Enterprise EIDOS 的总结 Agent。",
      "请基于计划 Agent 的任务拆解和所有子任务 Agent 的结果，给出最终答案。",
      "不要只罗列子任务结果，要形成综合判断、关键结论、行动建议和必要风险提示。",
    ].join("");
    const summaryResult = await runAgentWithProgress({
      messageId: assistantMessageId,
      stepId: "summary",
      detail: "正在汇总所有 Agent 结果",
      systemPrompt: summarySystemPrompt,
      userPrompt: [
        `完整用户 Prompt：\n${submittedPrompt}`,
        `计划 Agent 输出：\n${planResult.replyText}`,
        `子任务 Agent 输出：\n${buildAgentSummary(agentResults)}`,
      ].join("\n\n---\n\n"),
      options: deepSeekOptions,
    });
    await updateAgentStep(assistantMessageId, "summary", {
      status: "done",
      detail: "总结完成",
      output: summaryResult.replyText,
    });
    await patchAssistantMessage(assistantMessageId, {
      reasoningContent: "",
      content: summaryResult.replyText,
    });
  };

  const formatFileSize = (size) => {
    if (!size) return "0 KB";
    if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  const getAgentStatusLabel = (status) =>
    AGENT_STATUS_LABELS[status] || "未知";

  const getCompletedAgentCount = (message) =>
    message.agentWorkflow?.filter((step) => step.status === "done").length || 0;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderInlineMarkdown = (value) =>
    escapeHtml(value)
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  const renderMarkdown = (content) => {
    const lines = String(content ?? "").split("\n");
    const blocks = [];
    let listItems = [];
    let inCodeBlock = false;
    let codeLines = [];

    const flushList = () => {
      if (!listItems.length) return;
      blocks.push(
        `<ul>${listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`
      );
      listItems = [];
    };

    lines.forEach((line) => {
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
          codeLines = [];
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushList();
        const level = heading[1].length + 2;
        blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
        return;
      }

      const listItem = line.match(/^\s*[-*]\s+(.+)$/);
      if (listItem) {
        listItems.push(renderInlineMarkdown(listItem[1]));
        return;
      }

      const quote = line.match(/^\s*>\s+(.+)$/);
      if (quote) {
        flushList();
        blocks.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
        return;
      }

      if (!line.trim()) {
        flushList();
        return;
      }

      flushList();
      blocks.push(`<p>${renderInlineMarkdown(line)}</p>`);
    });

    if (inCodeBlock) {
      blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    }
    flushList();
    return blocks.join("");
  };

  const sendPrompt = async () => {
    const query = normalizeQuestionText(promptText.value);
    if (!query) {
      ElMessage.warning("请输入你的问题");
      return;
    }
    const deepSeekOptions = {
      model: selectedModel.value,
      thinkingEnabled: isThinkingModeEnabled.value,
      smartSearchEnabled: isSmartSearchEnabled.value,
      multiAgentEnabled: isMultiAgentEnabled.value,
      reasoningEffort: selectedReasoningEffort.value,
      stream: false,
    };
    const activeLogic = selectedInstructionLogic.value;
    promptText.value = "";
    isThinking.value = true;
    const searchContext = await runSmartSearch(query);
    const promptWithFiles = buildPromptWithLocalFiles(query);
    const promptWithLogics = buildPromptWithInstructionLogics(promptWithFiles);
    const submittedPrompt = buildPromptWithSmartSearch(
      promptWithLogics,
      searchContext
    );
    const deepSeekMessages = buildDeepSeekMessages(
      submittedPrompt,
      deepSeekOptions
    );
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: submittedPrompt,
    };
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      reasoningContent: "",
      thinking: true,
      agentWorkflow: isMultiAgentEnabled.value ? [] : null,
    };
    messages.value.push(userMessage, assistantMessage);
    await scrollToBottom();
    try {
      if (isMultiAgentEnabled.value) {
        await runMultiAgentWorkflow(
          submittedPrompt,
          deepSeekOptions,
          assistantMessage.id
        );
      } else {
        const response = await createDeepSeekChatCompletion(
          buildDeepSeekPayload(deepSeekMessages, deepSeekOptions)
        );
        await patchAssistantMessage(assistantMessage.id, {
          reasoningContent: getDeepSeekReasoningText(response),
          content: getDeepSeekReplyText(response),
        });
      }
      selectedInstructionLogicId.value = null;
    } catch (error) {
      await patchAssistantMessage(assistantMessage.id, {
        content: `发送失败：${error.message}`,
      });
      ElMessage.error("发送失败");
    } finally {
      await patchAssistantMessage(assistantMessage.id, {
        thinking: false,
      });
      isThinking.value = false;
      await scrollToBottom();
    }
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

      <section class="session-page">
        <aside class="file-panel">
          <section class="file-section">
            <div class="panel-heading">
              <span>本地文件</span>
              <el-tag effect="plain" size="small">{{ files.length }}</el-tag>
            </div>

            <el-upload
              class="upload-box"
              drag
              multiple
              :auto-upload="false"
              :show-file-list="false"
              :on-change="addLocalFiles"
            >
              <el-icon><UploadFilled /></el-icon>
              <p>拖拽文件到这里</p>
              <span>或点击选择本地文件</span>
            </el-upload>

            <div class="file-list">
              <div v-if="!files.length" class="empty-files">
                <el-icon><Document /></el-icon>
                <p>暂无本地文件</p>
              </div>
              <template v-else>
                <article
                  v-for="file in files"
                  :key="file.id"
                  class="file-item"
                >
                  <el-icon><Document /></el-icon>
                  <div>
                    <strong>{{ file.name }}</strong>
                    <span
                      >{{ formatFileSize(file.size) }} ·
                      {{ file.status }}</span
                    >
                  </div>
                  <el-button
                    class="remove-file"
                    :icon="Delete"
                    text
                    circle
                    @click="removeFile(file.id, 'local')"
                  />
                </article>
              </template>
            </div>
          </section>

          <section class="file-section instruction-section">
            <div class="panel-heading">
              <span>指令集文件</span>
              <el-tag effect="plain" size="small">{{
                instructionFiles.length
              }}</el-tag>
            </div>

            <el-upload
              class="upload-box"
              drag
              multiple
              :auto-upload="false"
              :show-file-list="false"
              :on-change="addInstructionFiles"
            >
              <el-icon><UploadFilled /></el-icon>
              <p>拖拽文件到这里</p>
              <span>或点击选择指令集文件</span>
            </el-upload>

            <div class="file-list">
              <div v-if="!instructionFiles.length" class="empty-files">
                <el-icon><Document /></el-icon>
                <p>暂无指令集文件</p>
              </div>
              <template v-else>
                <article
                  v-for="file in instructionFiles"
                  :key="file.id"
                  class="file-item"
                >
                  <el-icon><Document /></el-icon>
                  <div>
                    <strong>{{ file.name }}</strong>
                    <span
                      >{{ formatFileSize(file.size) }} ·
                      {{ file.status }}</span
                    >
                  </div>
                  <el-button
                    class="remove-file"
                    :icon="Delete"
                    text
                    circle
                    @click="removeFile(file.id, 'instruction')"
                  />
                </article>
              </template>
            </div>
          </section>
        </aside>

        <section class="chat-page">
          <header class="chat-header">
            <div>
              <h1>会话</h1>
              <p>围绕上传文件和当前问题进行连续问答</p>
            </div>
            <div class="chat-header-actions">
              <div class="model-switch">
                <button
                  v-for="model in DEEPSEEK_MODELS"
                  :key="model.value"
                  :class="{ active: selectedModel === model.value }"
                  @click="selectedModel = model.value"
                >
                  {{ model.label }}
                </button>
              </div>
              <div class="thinking-control">
                <span>思考模式</span>
                <el-switch v-model="isThinkingModeEnabled" size="small" />
              </div>
              <div class="thinking-control">
                <span>智能搜索</span>
                <el-switch v-model="isSmartSearchEnabled" size="small" />
              </div>
              <div class="thinking-control">
                <span>多 Agent</span>
                <el-switch v-model="isMultiAgentEnabled" size="small" />
              </div>
              <div
                class="reasoning-switch"
                :class="{ disabled: !isThinkingModeEnabled }"
              >
                <span>推理强度</span>
                <button
                  v-for="effort in DEEPSEEK_REASONING_EFFORTS"
                  :key="effort.value"
                  :class="{ active: selectedReasoningEffort === effort.value }"
                  :disabled="!isThinkingModeEnabled"
                  @click="selectedReasoningEffort = effort.value"
                >
                  {{ effort.label }}
                </button>
              </div>
              <el-tag v-if="isSearching" effect="plain">搜索中</el-tag>
              <el-tag v-if="isUploading" effect="plain">上传中</el-tag>
            </div>
          </header>

          <div ref="chatBodyRef" class="chat-body">
            <article
              v-for="message in messages"
              :key="message.id"
              class="chat-message"
              :class="message.role"
            >
              <div class="message-bubble">
                <span v-if="message.thinking" class="thinking-dot"></span>
                <span
                  v-if="
                    message.thinking &&
                    !message.content &&
                    !message.reasoningContent &&
                    !message.agentWorkflow?.length
                  "
                  >正在思考</span
                >
                <div
                  v-else-if="message.role === 'assistant'"
                  class="markdown-body"
                >
                  <section
                    v-if="message.agentWorkflow?.length"
                    class="agent-workflow"
                  >
                    <div class="agent-workflow-header">
                      <h4>多 Agent 进度</h4>
                      <span>{{ getCompletedAgentCount(message) }}/{{
                        message.agentWorkflow.length
                      }}</span>
                    </div>
                    <article
                      v-for="step in message.agentWorkflow"
                      :key="step.id"
                      class="agent-step"
                      :class="`status-${step.status}`"
                    >
                      <div class="agent-step-main">
                        <div>
                          <strong>{{ step.name }}</strong>
                          <span>{{ step.role }}</span>
                        </div>
                        <em>{{ getAgentStatusLabel(step.status) }}</em>
                      </div>
                      <p>{{ step.detail }}</p>
                      <details v-if="step.output" class="agent-output">
                        <summary>查看输出</summary>
                        <div v-html="renderMarkdown(step.output)"></div>
                      </details>
                    </article>
                  </section>
                  <section
                    v-if="message.reasoningContent"
                    class="reasoning-panel"
                  >
                    <h4>思考过程</h4>
                    <div v-html="renderMarkdown(message.reasoningContent)"></div>
                  </section>
                  <section
                    v-if="!message.thinking || message.content"
                    class="answer-panel"
                  >
                    <h4>最终答案</h4>
                    <div
                      v-if="message.content"
                      v-html="renderMarkdown(message.content)"
                    ></div>
                    <p v-else class="empty-answer">
                      DeepSeek 本次未返回最终答案。
                    </p>
                  </section>
                </div>
                <div v-else class="prompt-body">
                  <span class="prompt-label">完整 Prompt</span>
                  <pre>{{ message.content }}</pre>
                </div>
              </div>
            </article>
          </div>

          <div class="composer">
            <div
              v-if="showInstructionLogicPicker"
              ref="logicPickerRef"
              class="logic-picker"
            >
              <div class="logic-picker-header">
                <span>选择分析逻辑</span>
                <em>{{ instructionLogics.length }} 项</em>
              </div>
              <button
                v-for="logic in instructionLogics"
                :key="logic.id"
                class="logic-option"
                :class="{
                  active: selectedInstructionLogicId === logic.id,
                  'keyboard-active': activeInstructionLogic?.id === logic.id,
                }"
                @click="selectInstructionLogic(logic)"
              >
                <strong>{{ logic.title }}</strong>
                <span>{{ logic.fileName }}</span>
              </button>
            </div>

            <el-input
              :model-value="promptText"
              class="composer-input"
              type="textarea"
              resize="none"
              :autosize="false"
              placeholder="请输入你的问题"
              @update:model-value="handlePromptInput"
              @keydown="handlePromptKeydown"
            />
            <el-button
              class="send-button"
              :icon="Position"
              :loading="isThinking"
              @click="sendPrompt"
            />
          </div>
        </section>
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

  .session-page {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) minmax(0, 3fr);
    gap: 24px;
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 28px 32px 28px 28px;
    background: #ffffff;
  }

  .file-panel,
  .chat-page {
    min-height: 0;
    border: 1px solid rgba(62, 38, 118, 0.12);
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 12px 32px rgba(61, 39, 114, 0.06);
  }

  .file-panel {
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: linear-gradient(180deg, #ffffff 0%, #fbf9ff 100%);
  }

  .panel-heading,
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .file-section {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
  }

  .file-section + .file-section {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid rgba(62, 38, 118, 0.08);
  }

  .panel-heading {
    margin-bottom: 18px;
    color: #151515;
    font-size: 16px;
    font-weight: 600;
  }

  .upload-box {
    margin-bottom: 18px;
  }

  .upload-box :deep(.el-upload-dragger) {
    padding: 24px 16px;
    border: 1px dashed #d8cdea;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.72);
  }

  .upload-box :deep(.el-upload-dragger:hover) {
    border-color: #6f3fd3;
    background: #ffffff;
  }

  .upload-box .el-icon {
    color: #6f3fd3;
    font-size: 30px;
  }

  .upload-box p {
    margin: 8px 0 4px;
    color: rgba(0, 0, 0, 0.76);
    font-size: 14px;
    line-height: 20px;
  }

  .upload-box span {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
  }

  .file-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: 2px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .file-list::-webkit-scrollbar {
    display: none;
  }

  .empty-files {
    display: grid;
    place-items: center;
    height: 180px;
    color: rgba(0, 0, 0, 0.38);
    font-size: 13px;
  }

  .empty-files .el-icon {
    margin-bottom: 8px;
    font-size: 26px;
  }

  .empty-files p {
    margin: 0;
  }

  .file-item {
    position: relative;
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr) 28px;
    align-items: center;
    gap: 10px;
    min-height: 62px;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid rgba(62, 38, 118, 0.08);
    border-radius: 10px;
    background: #ffffff;
  }

  .file-item > .el-icon {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 7px;
    background: #ebe5f8;
    color: #4b2887;
  }

  .file-item strong,
  .file-item span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-item strong {
    color: #111111;
    font-size: 13px;
    line-height: 19px;
    font-weight: 600;
  }

  .file-item span {
    margin-top: 2px;
    color: rgba(0, 0, 0, 0.42);
    font-size: 12px;
    line-height: 17px;
  }

  .remove-file.el-button {
    color: rgba(0, 0, 0, 0.42);
  }

  .remove-file.el-button:hover {
    color: #4a2788;
  }

  .chat-page {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden;
  }

  .chat-header {
    min-height: 82px;
    padding: 22px 28px 18px;
    border-bottom: 1px solid rgba(62, 38, 118, 0.08);
  }

  .chat-header h1 {
    margin: 0 0 4px;
    color: #111111;
    font-size: 22px;
    line-height: 30px;
    font-weight: 600;
  }

  .chat-header p {
    margin: 0;
    color: rgba(0, 0, 0, 0.45);
    font-size: 13px;
    line-height: 19px;
  }

  .chat-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .model-switch,
  .reasoning-switch {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px;
    border: 1px solid #e6dff5;
    border-radius: 10px;
    background: #fafafa;
  }

  .thinking-control {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 10px;
    border: 1px solid #e6dff5;
    border-radius: 10px;
    background: #fafafa;
  }

  .thinking-control span,
  .reasoning-switch span {
    color: rgba(0, 0, 0, 0.58);
    font-size: 12px;
    line-height: 18px;
    white-space: nowrap;
  }

  .model-switch button,
  .reasoning-switch button {
    min-width: 136px;
    height: 30px;
    padding: 0 12px;
    border-radius: 7px;
    color: rgba(0, 0, 0, 0.62);
    font-size: 12px;
    line-height: 30px;
    cursor: pointer;
  }

  .reasoning-switch button {
    min-width: 44px;
  }

  .model-switch button.active,
  .reasoning-switch button.active {
    background: #ebe5f8;
    color: #4b2887;
    font-weight: 600;
  }

  .model-switch button:hover,
  .model-switch button:focus,
  .reasoning-switch button:hover,
  .reasoning-switch button:focus {
    color: #4b2887;
  }

  .reasoning-switch.disabled {
    opacity: 0.58;
  }

  .reasoning-switch button:disabled {
    cursor: not-allowed;
  }

  .chat-body {
    overflow-y: auto;
    padding: 28px;
    background: linear-gradient(180deg, #ffffff 0%, #fdfcff 100%);
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .chat-body::-webkit-scrollbar {
    display: none;
  }

  .chat-message {
    display: flex;
    margin-bottom: 18px;
  }

  .chat-message.user {
    justify-content: flex-end;
  }

  .chat-message.assistant {
    justify-content: flex-start;
  }

  .message-bubble {
    max-width: min(720px, 72%);
    padding: 12px 14px;
    border-radius: 12px;
    color: rgba(0, 0, 0, 0.78);
    font-size: 14px;
    line-height: 23px;
    white-space: pre-wrap;
  }

  .chat-message.assistant .message-bubble {
    border: 1px solid rgba(62, 38, 118, 0.09);
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(61, 39, 114, 0.05);
  }

  .chat-message.user .message-bubble {
    background: #4a2788;
    color: #ffffff;
  }

  .prompt-body {
    display: grid;
    gap: 8px;
  }

  .prompt-label {
    width: fit-content;
    padding: 2px 7px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.16);
    color: rgba(255, 255, 255, 0.78);
    font-size: 12px;
    line-height: 17px;
    font-weight: 600;
  }

  .prompt-body pre {
    overflow-x: auto;
    margin: 0;
    color: inherit;
    font-family: inherit;
    font-size: 14px;
    line-height: 23px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .markdown-body {
    color: inherit;
  }

  .markdown-body :deep(p),
  .markdown-body :deep(ul),
  .markdown-body :deep(blockquote),
  .markdown-body :deep(pre) {
    margin: 0 0 10px;
  }

  .markdown-body :deep(p:last-child),
  .markdown-body :deep(ul:last-child),
  .markdown-body :deep(blockquote:last-child),
  .markdown-body :deep(pre:last-child) {
    margin-bottom: 0;
  }

  .markdown-body :deep(h3),
  .markdown-body :deep(h4),
  .markdown-body :deep(h5) {
    margin: 12px 0 8px;
    color: #111111;
    font-weight: 600;
    line-height: 1.45;
  }

  .markdown-body :deep(h3:first-child),
  .markdown-body :deep(h4:first-child),
  .markdown-body :deep(h5:first-child) {
    margin-top: 0;
  }

  .markdown-body :deep(h3) {
    font-size: 17px;
  }

  .markdown-body :deep(h4) {
    font-size: 15px;
  }

  .markdown-body :deep(h5) {
    font-size: 14px;
  }

  .markdown-body :deep(ul) {
    padding-left: 20px;
  }

  .markdown-body :deep(li) {
    margin-bottom: 4px;
  }

  .markdown-body :deep(blockquote) {
    padding: 8px 12px;
    border-left: 3px solid #d8cdea;
    border-radius: 0 8px 8px 0;
    background: #fbf9ff;
    color: rgba(0, 0, 0, 0.62);
  }

  .markdown-body :deep(code) {
    padding: 2px 5px;
    border-radius: 5px;
    background: #f3effa;
    color: #4a2788;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono", monospace;
    font-size: 12px;
  }

  .markdown-body :deep(pre) {
    overflow-x: auto;
    padding: 12px;
    border-radius: 10px;
    background: #262333;
    color: #f8f6ff;
    white-space: pre;
  }

  .markdown-body :deep(pre code) {
    padding: 0;
    background: transparent;
    color: inherit;
  }

  .markdown-body :deep(a) {
    color: #6f3fd3;
    text-decoration: none;
  }

  .markdown-body :deep(a:hover),
  .markdown-body :deep(a:focus) {
    text-decoration: underline;
  }

  .reasoning-panel,
  .answer-panel,
  .agent-workflow {
    margin-bottom: 12px;
    padding: 10px 12px;
    border: 1px solid #e6dff5;
    border-radius: 10px;
    background: #fbf9ff;
    color: rgba(0, 0, 0, 0.62);
  }

  .agent-workflow {
    display: grid;
    gap: 8px;
    background: #ffffff;
  }

  .agent-workflow-header,
  .agent-step-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .agent-workflow-header h4 {
    margin: 0;
    color: #4b2887;
    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
  }

  .agent-workflow-header span {
    color: rgba(0, 0, 0, 0.42);
    font-size: 12px;
    line-height: 17px;
  }

  .agent-step {
    padding: 9px 10px;
    border: 1px solid rgba(62, 38, 118, 0.08);
    border-radius: 9px;
    background: #fbf9ff;
  }

  .agent-step.status-running {
    border-color: rgba(111, 63, 211, 0.28);
    background: #f7f2ff;
  }

  .agent-step.status-done {
    border-color: rgba(39, 139, 91, 0.18);
    background: #f7fbf8;
  }

  .agent-step.status-error {
    border-color: rgba(184, 55, 55, 0.22);
    background: #fff8f8;
  }

  .agent-step-main strong,
  .agent-step-main span {
    display: block;
  }

  .agent-step-main strong {
    color: #111111;
    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
  }

  .agent-step-main span {
    margin-top: 1px;
    color: rgba(0, 0, 0, 0.46);
    font-size: 12px;
    line-height: 17px;
  }

  .agent-step-main em {
    flex: 0 0 auto;
    padding: 2px 7px;
    border-radius: 999px;
    background: #ebe5f8;
    color: #4b2887;
    font-size: 12px;
    line-height: 17px;
    font-style: normal;
    font-weight: 600;
  }

  .agent-step.status-done .agent-step-main em {
    background: #e8f6ee;
    color: #1b7a45;
  }

  .agent-step.status-error .agent-step-main em {
    background: #fdecec;
    color: #a13b3b;
  }

  .agent-step p {
    margin: 6px 0 0;
    color: rgba(0, 0, 0, 0.58);
    font-size: 12px;
    line-height: 18px;
  }

  .agent-output {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(62, 38, 118, 0.08);
  }

  .agent-output summary {
    color: #4b2887;
    font-size: 12px;
    line-height: 17px;
    cursor: pointer;
  }

  .agent-output > div {
    margin-top: 8px;
  }

  .answer-panel {
    background: #ffffff;
    color: rgba(0, 0, 0, 0.78);
  }

  .reasoning-panel h4,
  .answer-panel h4 {
    margin: 0 0 8px;
    color: #4b2887;
    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
  }

  .empty-answer {
    margin: 0;
    color: rgba(0, 0, 0, 0.42);
  }

  .thinking-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 8px;
    border-radius: 50%;
    background: #6f3fd3;
    vertical-align: middle;
  }

  .composer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 36px;
    gap: 12px;
    align-items: end;
    margin: 0 28px 24px;
    padding: 14px;
    border: 1px solid #e6dff5;
    border-radius: 14px;
    background: #fafafa;
    box-shadow: 0 4px 16px rgba(88, 53, 132, 0.1);
  }

  .composer:hover {
    border-color: rgba(62, 38, 118, 0.3);
    background: #ffffff;
    box-shadow: 0 4px 24px rgba(88, 53, 132, 0.16);
  }

  .logic-picker {
    grid-column: 1 / -1;
  }

  .logic-picker {
    max-height: 168px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid rgba(62, 38, 118, 0.1);
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 8px 24px rgba(61, 39, 114, 0.08);
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .logic-picker::-webkit-scrollbar {
    display: none;
  }

  .logic-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .logic-picker-header span {
    color: #151515;
    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
  }

  .logic-picker-header em {
    color: rgba(0, 0, 0, 0.38);
    font-size: 12px;
    line-height: 17px;
    font-style: normal;
  }

  .logic-option {
    display: grid;
    width: 100%;
    min-height: 42px;
    padding: 7px 9px;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
  }

  .logic-option + .logic-option {
    margin-top: 4px;
  }

  .logic-option:hover,
  .logic-option:focus,
  .logic-option.keyboard-active,
  .logic-option.active {
    background: #f3effa;
  }

  .logic-option strong,
  .logic-option span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logic-option strong {
    color: rgba(0, 0, 0, 0.78);
    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
  }

  .logic-option span {
    margin-top: 2px;
    color: rgba(0, 0, 0, 0.42);
    font-size: 12px;
    line-height: 16px;
  }

  .logic-option.active strong {
    color: #4b2887;
  }

  .logic-option.keyboard-active {
    outline: 1px solid rgba(75, 40, 135, 0.32);
  }

  .send-button.el-button {
    width: 34px;
    height: 34px;
    min-height: 34px;
    border-radius: 8px;
  }

  .send-button.el-button {
    border-color: #4a2788;
    background: #4a2788;
    color: #ffffff;
  }

  .send-button.el-button:hover,
  .send-button.el-button:focus {
    border-color: #4a2788;
    background: #4a2788;
    color: #ffffff;
  }

  .composer-input :deep(.el-textarea__inner) {
    min-height: 38px !important;
    max-height: 104px;
    padding: 7px 2px;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: #000000;
    font-size: 14px;
    line-height: 22px;
    resize: none;
  }

  .composer-input :deep(.el-textarea__inner:focus) {
    box-shadow: none;
  }

  @media (max-width: 1440px) {
    .session-page {
      gap: 18px;
      padding: 24px 24px 24px 20px;
    }

    .chat-header,
    .chat-body {
      padding-right: 22px;
      padding-left: 22px;
    }

    .composer {
      margin-right: 22px;
      margin-left: 22px;
    }
  }
</style>
