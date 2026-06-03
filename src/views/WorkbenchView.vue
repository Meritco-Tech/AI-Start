<script setup>
  import { computed, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ElMessage } from "element-plus";
  import {
    ChatDotRound,
    DocumentChecked,
    Operation,
    Position,
  } from "@element-plus/icons-vue";
  import {
    connectWorkbenchDatabase,
    getWorkbenchTableSchema,
    listWorkbenchTables,
  } from "../api/workbenchDatabase";
  import {
    connectWorkbenchWecom,
    listWorkbenchWecomFiles,
  } from "../api/workbenchWecom";
  import DockNav from "../components/DockNav.vue";
  import { dockItems } from "../config/dockItems";
  import {
    defaultWorkbenchConnection,
    workbenchWecomConnection,
  } from "../config/workbenchConnections";

  const route = useRoute();
  const router = useRouter();

  const activeDock = computed(() => route.meta.dockKey || "workbench");
  const promptText = ref("");
  const activeResultView = ref("dataset");
  const activeDatasetTableId = ref("customer_profile");
  const databaseConnection = defaultWorkbenchConnection;
  const databaseStatus = ref("待连接");
  const isDatabaseConnecting = ref(false);
  const databaseConnectionSummary = ref(null);
  const wecomConnection = workbenchWecomConnection;
  const wecomStatus = ref("待连接");
  const isWecomConnecting = ref(false);
  const wecomConnectionSummary = ref(null);
  const activeResultSource = ref("database");
  const wecomResultMessage = ref("");
  const wecomDialogVisible = ref(false);
  const wecomSpaceIdInput = ref(
    "s.1970325054029777.6159637364iS",
  );
  const wecomFatherIdInput = ref(
    "s.1970325054029777.6159637364iS",
  );
  const wecomRequestBody = ref(null);

  const staticDataSources = [
    {
      id: "crm",
      name: "客户经营数据",
      type: "CRM",
      status: "已连接",
    },
    {
      id: "finance",
      name: "财务指标库",
      type: "BI",
      status: "待校验",
    },
    {
      id: "market",
      name: "市场研究资料",
      type: "Docs",
      status: "可用",
    },
  ];

  const dataSources = computed(() => [
    {
      id: databaseConnection.id,
      name: databaseConnection.name,
      description: `${databaseConnection.connection.host}:${databaseConnection.connection.port}`,
      type: "MySQL",
      status: isDatabaseConnecting.value ? "连接中" : databaseStatus.value,
      isDatabase: true,
    },
    {
      id: wecomConnection.id,
      name: wecomConnection.name,
      description: wecomConnection.description,
      type: "WeCom",
      status: isWecomConnecting.value ? "连接中" : wecomStatus.value,
      isWecom: true,
    },
    ...staticDataSources,
  ]);

  const tasks = [
    {
      id: "task-1",
      title: "竞品机会扫描",
      stage: "进行中",
      owner: "策略分析",
    },
    {
      id: "task-2",
      title: "客户分层复核",
      stage: "待启动",
      owner: "增长分析",
    },
    {
      id: "task-3",
      title: "经营周报生成",
      stage: "已完成",
      owner: "运营分析",
    },
  ];

  const chatMessages = [
    {
      id: "assistant-1",
      role: "assistant",
      content:
        "工作台已就绪。你可以在这里围绕左侧数据源和任务进行连续分析，后续会接入真实任务编排与数据读取能力。",
    },
    {
      id: "user-1",
      role: "user",
      content: "帮我基于客户经营数据检查本周风险。",
    },
    {
      id: "assistant-2",
      role: "assistant",
      content:
        "收到。正式逻辑接入后，我会先确认可用数据源，再生成任务计划、调用分析流程，并把结果沉淀到任务列表中。",
    },
  ];

  const fallbackDatabaseTables = [
    {
      id: "customer_profile",
      name: "customer_profile",
      label: "客户主档",
      rows: "1.28M",
      fields: 18,
      updatedAt: "10 分钟前",
      columns: [
        { name: "customer_id", type: "varchar(32)", key: "PK" },
        { name: "industry_code", type: "varchar(12)", key: "IDX" },
        { name: "region_id", type: "varchar(16)", key: "FK" },
        { name: "lifecycle_stage", type: "varchar(24)", key: "" },
      ],
    },
    {
      id: "transaction_order",
      name: "transaction_order",
      label: "交易订单",
      rows: "8.42M",
      fields: 26,
      updatedAt: "3 分钟前",
      columns: [
        { name: "order_id", type: "varchar(40)", key: "PK" },
        { name: "customer_id", type: "varchar(32)", key: "FK" },
        { name: "order_amount", type: "decimal(18,2)", key: "" },
        { name: "paid_at", type: "datetime", key: "IDX" },
      ],
    },
    {
      id: "order_item",
      name: "order_item",
      label: "订单明细",
      rows: "23.6M",
      fields: 14,
      updatedAt: "3 分钟前",
      columns: [
        { name: "item_id", type: "varchar(40)", key: "PK" },
        { name: "order_id", type: "varchar(40)", key: "FK" },
        { name: "product_id", type: "varchar(32)", key: "FK" },
        { name: "quantity", type: "int", key: "" },
      ],
    },
    {
      id: "product_catalog",
      name: "product_catalog",
      label: "产品目录",
      rows: "42.8K",
      fields: 21,
      updatedAt: "1 小时前",
      columns: [
        { name: "product_id", type: "varchar(32)", key: "PK" },
        { name: "category_id", type: "varchar(24)", key: "IDX" },
        { name: "gross_margin", type: "decimal(8,4)", key: "" },
        { name: "status", type: "varchar(16)", key: "" },
      ],
    },
    {
      id: "campaign_touchpoint",
      name: "campaign_touchpoint",
      label: "触达记录",
      rows: "3.91M",
      fields: 16,
      updatedAt: "15 分钟前",
      columns: [
        { name: "touchpoint_id", type: "varchar(40)", key: "PK" },
        { name: "customer_id", type: "varchar(32)", key: "FK" },
        { name: "campaign_id", type: "varchar(32)", key: "IDX" },
        { name: "channel", type: "varchar(20)", key: "" },
      ],
    },
    {
      id: "risk_event",
      name: "risk_event",
      label: "风险事件",
      rows: "186K",
      fields: 19,
      updatedAt: "刚刚",
      columns: [
        { name: "risk_id", type: "varchar(40)", key: "PK" },
        { name: "customer_id", type: "varchar(32)", key: "FK" },
        { name: "risk_level", type: "varchar(12)", key: "IDX" },
        { name: "detected_at", type: "datetime", key: "IDX" },
      ],
    },
    {
      id: "analysis_task",
      name: "analysis_task",
      label: "分析任务",
      rows: "12.4K",
      fields: 12,
      updatedAt: "刚刚",
      columns: [
        { name: "task_id", type: "varchar(40)", key: "PK" },
        { name: "risk_id", type: "varchar(40)", key: "FK" },
        { name: "owner_role", type: "varchar(24)", key: "" },
        { name: "task_status", type: "varchar(16)", key: "IDX" },
      ],
    },
    {
      id: "region_dimension",
      name: "region_dimension",
      label: "区域维表",
      rows: "3.2K",
      fields: 9,
      updatedAt: "2 小时前",
      columns: [
        { name: "region_id", type: "varchar(16)", key: "PK" },
        { name: "parent_region_id", type: "varchar(16)", key: "FK" },
        { name: "region_name", type: "varchar(64)", key: "" },
        { name: "region_level", type: "tinyint", key: "" },
      ],
    },
    {
      id: "industry_dimension",
      name: "industry_dimension",
      label: "行业维表",
      rows: "1.1K",
      fields: 8,
      updatedAt: "2 小时前",
      columns: [
        { name: "industry_code", type: "varchar(12)", key: "PK" },
        { name: "industry_name", type: "varchar(64)", key: "" },
        { name: "parent_code", type: "varchar(12)", key: "FK" },
        { name: "risk_weight", type: "decimal(8,4)", key: "" },
      ],
    },
    {
      id: "campaign_master",
      name: "campaign_master",
      label: "活动主表",
      rows: "9.8K",
      fields: 15,
      updatedAt: "25 分钟前",
      columns: [
        { name: "campaign_id", type: "varchar(32)", key: "PK" },
        { name: "campaign_type", type: "varchar(20)", key: "IDX" },
        { name: "budget_amount", type: "decimal(18,2)", key: "" },
        { name: "started_at", type: "datetime", key: "IDX" },
      ],
    },
    {
      id: "employee_owner",
      name: "employee_owner",
      label: "负责人表",
      rows: "18.6K",
      fields: 11,
      updatedAt: "1 小时前",
      columns: [
        { name: "owner_id", type: "varchar(32)", key: "PK" },
        { name: "owner_role", type: "varchar(24)", key: "IDX" },
        { name: "region_id", type: "varchar(16)", key: "FK" },
        { name: "status", type: "varchar(16)", key: "" },
      ],
    },
  ];

  const databaseTables = ref(fallbackDatabaseTables);
  const wecomFiles = ref([]);

  const erNodes = [
    {
      id: "customer",
      name: "客户",
      table: "customer_profile",
      meta: "PK customer_id",
      x: 16,
      y: 40,
    },
    {
      id: "industry",
      name: "行业",
      table: "industry_dimension",
      meta: "PK industry_code",
      x: 16,
      y: 15,
    },
    {
      id: "region",
      name: "区域",
      table: "region_dimension",
      meta: "PK region_id",
      x: 16,
      y: 67,
    },
    {
      id: "order",
      name: "订单",
      table: "transaction_order",
      meta: "FK customer_id",
      x: 38,
      y: 28,
    },
    {
      id: "item",
      name: "订单明细",
      table: "order_item",
      meta: "FK order_id",
      x: 58,
      y: 20,
    },
    {
      id: "product",
      name: "产品",
      table: "product_catalog",
      meta: "PK product_id",
      x: 78,
      y: 20,
    },
    {
      id: "campaign",
      name: "活动",
      table: "campaign_master",
      meta: "PK campaign_id",
      x: 38,
      y: 76,
    },
    {
      id: "touchpoint",
      name: "触达记录",
      table: "campaign_touchpoint",
      meta: "FK customer_id",
      x: 58,
      y: 76,
    },
    {
      id: "risk",
      name: "风险事件",
      table: "risk_event",
      meta: "FK customer_id",
      x: 78,
      y: 76,
    },
    {
      id: "task",
      name: "任务",
      table: "analysis_task",
      meta: "FK risk_id",
      x: 92,
      y: 54,
    },
    {
      id: "owner",
      name: "负责人",
      table: "employee_owner",
      meta: "PK owner_id",
      x: 92,
      y: 87,
    },
  ];

  const erEdges = [
    { id: "industry-customer", x1: 16, y1: 22, x2: 16, y2: 32, label: "1:N", labelX: 20, labelY: 28 },
    { id: "region-customer", x1: 16, y1: 60, x2: 16, y2: 48, label: "1:N", labelX: 20, labelY: 55 },
    { id: "customer-order", x1: 24, y1: 38, x2: 31, y2: 29, label: "1:N", labelX: 28, labelY: 33 },
    { id: "order-item", x1: 45, y1: 27, x2: 51, y2: 22, label: "1:N", labelX: 49, labelY: 22 },
    { id: "item-product", x1: 65, y1: 20, x2: 71, y2: 20, label: "N:1", labelX: 69, labelY: 15 },
    { id: "campaign-touch", x1: 45, y1: 76, x2: 51, y2: 76, label: "1:N", labelX: 49, labelY: 71 },
    { id: "customer-touch", x1: 24, y1: 47, x2: 51, y2: 74, label: "1:N", labelX: 39, labelY: 59 },
    { id: "customer-risk", x1: 24, y1: 47, x2: 71, y2: 74, label: "1:N", labelX: 51, labelY: 56 },
    { id: "touch-risk", x1: 65, y1: 76, x2: 71, y2: 76, label: "关联", labelX: 69, labelY: 81 },
    { id: "order-risk", x1: 45, y1: 32, x2: 72, y2: 70, label: "规则", labelX: 60, labelY: 49 },
    { id: "risk-task", x1: 84, y1: 72, x2: 88, y2: 60, label: "1:N", labelX: 88, labelY: 67 },
    { id: "task-owner", x1: 92, y1: 62, x2: 92, y2: 80, label: "N:1", labelX: 96, labelY: 72 },
    { id: "region-owner", x1: 24, y1: 68, x2: 86, y2: 86, label: "管辖", labelX: 55, labelY: 83 },
    { id: "product-risk", x1: 78, y1: 27, x2: 78, y2: 68, label: "监控", labelX: 82, labelY: 48 },
  ];

  const resultItems = computed(() =>
    activeResultSource.value === "wecom" ? wecomFiles.value : databaseTables.value,
  );

  const activeDatasetTable = computed(
    () =>
      resultItems.value.find((table) => table.id === activeDatasetTableId.value) ||
      resultItems.value[0] ||
      {
        id: "empty",
        name: "暂无数据",
        label: "暂无数据",
        updatedAt: "-",
        columns: [],
      },
  );

  const resultOverview = computed(() => {
    if (activeResultSource.value === "wecom") {
      const documents = wecomFiles.value.filter((file) => file.type === "document").length;
      const spreadsheets = wecomFiles.value.filter(
        (file) => file.type === "spreadsheet",
      ).length;
      return [
        { value: wecomFiles.value.length, label: "文件" },
        { value: documents, label: "文档" },
        { value: spreadsheets, label: "表格" },
      ];
    }
    return [
      { value: databaseTables.value.length, label: "数据表" },
      { value: "37.5M", label: "记录量" },
      { value: "135", label: "字段" },
    ];
  });

  const summaryItems = computed(() => {
    if (activeResultSource.value === "wecom") {
      return [
        "已加载企业微信中的在线文档与表格，后续分析可引用这些协作文档作为业务上下文。",
        "文档类资料适合沉淀策略、手册和报告，表格类资料适合承载经营指标与任务跟踪。",
        wecomRequestBody.value
          ? `请求消息体：${JSON.stringify(wecomRequestBody.value)}`
          : "点击腾讯企业微信后输入 spaceid 和 fatherid，再查看请求消息体。",
        wecomResultMessage.value ||
          "当前未配置企业微信正式凭证时使用本地演示数据；配置凭证后可替换为真实 API 同步。",
      ];
    }
    return [
      "本次结果包含 11 张核心业务表，覆盖客户、交易、产品、触达、风险、任务与维度信息。",
      "交易链路和风险链路已通过 customer_id、order_id、risk_id 建立主关系。",
      "后续执行可优先读取风险事件表，并回溯客户、订单、触达记录形成分析证据。",
    ];
  });

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

  const showPreviewMessage = () => {
    ElMessage.info("工作台暂为界面预览，后续接入任务执行逻辑");
  };

  const formatTableRows = (value) => {
    const numberValue = Number(value || 0);
    if (numberValue >= 1000000) return `${(numberValue / 1000000).toFixed(1)}M`;
    if (numberValue >= 1000) return `${(numberValue / 1000).toFixed(1)}K`;
    return `${numberValue}`;
  };

  const formatUpdatedAt = (value) => {
    if (!value) return "未知";
    return String(value).slice(0, 19).replace("T", " ");
  };

  const mapApiTable = (table) => ({
    id: table.id,
    name: table.name,
    schema: table.schema,
    label: table.name,
    rows: formatTableRows(table.rows),
    fields: table.fields,
    updatedAt: formatUpdatedAt(table.updatedAt),
    columns: table.columns || [],
    isRemote: true,
  });

  const mapWecomFile = (file) => ({
    id: file.id,
    name: file.name,
    label: file.label,
    type: file.type,
    rows: file.size,
    fields: file.status,
    updatedAt: file.updatedAt,
    owner: file.owner,
    columns: file.columns || [],
    metaText: `${file.size} · ${file.status}`,
  });

  const applyTableSchema = (schema) => {
    databaseTables.value = databaseTables.value.map((table) =>
      table.id === schema.id
        ? {
            ...table,
            columns: schema.columns.map((column) => ({
              name: column.name,
              type: column.type,
              key: column.key,
            })),
            foreignKeys: schema.foreignKeys,
          }
        : table,
    );
  };

  const loadTableSchema = async (table) => {
    if (activeResultSource.value !== "database") return;
    if (!table?.isRemote || table.columns?.length) return;
    const schema = await getWorkbenchTableSchema(databaseConnection.id, table);
    applyTableSchema(schema);
  };

  const selectDatasetTable = async (table) => {
    activeDatasetTableId.value = table.id;
    activeResultView.value = "dataset";
    try {
      await loadTableSchema(table);
    } catch (error) {
      ElMessage.warning(`表结构读取失败：${error.message}`);
    }
  };

  const connectDatabase = async () => {
    if (isDatabaseConnecting.value) return;
    isDatabaseConnecting.value = true;
    databaseStatus.value = "连接中";
    try {
      const summary = await connectWorkbenchDatabase(databaseConnection.id);
      databaseConnectionSummary.value = summary;
      const tableResponse = await listWorkbenchTables(
        databaseConnection.id,
        databaseConnection.executionPolicy.maxLimit,
      );
      const nextTables = tableResponse.tables.map(mapApiTable);
      if (nextTables.length) {
        databaseTables.value = nextTables;
        activeDatasetTableId.value = nextTables[0].id;
        await loadTableSchema(nextTables[0]);
      }
      databaseStatus.value = "已连接";
      activeResultSource.value = "database";
      activeResultView.value = "dataset";
      ElMessage.success("数据库连接成功，已加载真实表清单");
    } catch (error) {
      databaseStatus.value = "连接失败";
      ElMessage.error(`数据库连接失败：${error.message}`);
    } finally {
      isDatabaseConnecting.value = false;
    }
  };

  const openWecomDialog = () => {
    wecomDialogVisible.value = true;
  };

  const connectWecom = async () => {
    if (isWecomConnecting.value) return;
    const spaceId = wecomSpaceIdInput.value.trim();
    const fatherId = wecomFatherIdInput.value.trim() || spaceId;
    if (!spaceId || !fatherId) {
      ElMessage.warning("请先输入 spaceid 和 fatherid");
      return;
    }
    isWecomConnecting.value = true;
    wecomStatus.value = "连接中";
    try {
      const summary = await connectWorkbenchWecom(wecomConnection.id);
      wecomConnectionSummary.value = summary;
      if (summary.tokenStatus === "failed") {
        wecomStatus.value = "连接失败";
        ElMessage.error(`企业微信应用连接失败：${summary.message}`);
        return;
      }
      const fileResponse = await listWorkbenchWecomFiles(
        wecomConnection.id,
        spaceId,
        fatherId,
      );
      const nextFiles = fileResponse.files.map(mapWecomFile);
      wecomFiles.value = nextFiles;
      wecomResultMessage.value = fileResponse.message;
      wecomRequestBody.value =
        fileResponse.requestBody || {
          spaceid: spaceId,
          fatherid: fatherId,
          sort_type: 1,
          start: 0,
          limit: 100,
        };
      if (nextFiles.length) {
        activeDatasetTableId.value = nextFiles[0].id;
      }
      activeResultSource.value = "wecom";
      activeResultView.value = "dataset";
      wecomDialogVisible.value = false;
      wecomStatus.value = summary.tokenStatus === "connected" ? "已连接" : "已加载";
      const suffix =
        fileResponse.mode === "api-connected"
          ? ""
          : fileResponse.mode === "api-connected-with-demo-fallback"
            ? "（真实应用已连接，文件列表使用演示数据）"
            : "（演示数据）";
      if (fileResponse.mode === "api-connected-with-demo-fallback") {
        ElMessage.warning(`企业微信应用已连接，但文件列表不可用：${fileResponse.message}`);
      } else {
        ElMessage.success(`企业微信文档与表格加载成功${suffix}`);
      }
    } catch (error) {
      wecomStatus.value = "连接失败";
      ElMessage.error(`企业微信连接失败：${error.message}`);
    } finally {
      isWecomConnecting.value = false;
    }
  };

  const handleDataSourceClick = (source) => {
    if (source.isDatabase) {
      connectDatabase();
      return;
    }
    if (source.isWecom) {
      openWecomDialog();
    }
  };

  const getStatusTone = (value) => {
    if (["已连接", "已加载", "可用", "已完成"].includes(value)) return "success";
    if (["进行中", "连接中"].includes(value)) return "running";
    if (["待连接", "待校验", "待启动"].includes(value)) return "pending";
    if (["连接失败"].includes(value)) return "error";
    return "neutral";
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

      <section class="workbench-page">
        <aside class="workbench-panel">
          <section class="panel-section">
            <div class="panel-heading">
              <div>
                <span>数据源列表</span>
              </div>
              <el-tag class="panel-count" effect="plain" size="small">
                {{ dataSources.length }}
              </el-tag>
            </div>

            <div class="item-list">
              <article
                v-for="source in dataSources"
                :key="source.id"
                class="list-row source-row"
                :class="{ clickable: source.isDatabase || source.isWecom }"
                @click="handleDataSourceClick(source)"
              >
                <div class="row-main">
                  <div class="row-title">
                    <strong>{{ source.name }}</strong>
                  </div>
                  <span v-if="source.description">{{ source.description }}</span>
                </div>
                <b :class="`tone-${getStatusTone(source.status)}`">{{
                  source.status
                }}</b>
              </article>
            </div>
          </section>

          <section class="panel-section">
            <div class="panel-heading">
              <div>
                <span>任务列表</span>
              </div>
              <el-tag class="panel-count" effect="plain" size="small">
                {{ tasks.length }}
              </el-tag>
            </div>

            <div class="item-list">
              <article v-for="task in tasks" :key="task.id" class="list-row task-row">
                <div class="row-main">
                  <div class="row-title">
                    <strong>{{ task.title }}</strong>
                  </div>
                </div>
                <b :class="`tone-${getStatusTone(task.stage)}`">{{
                  task.stage
                }}</b>
              </article>
            </div>
          </section>
        </aside>

        <section class="workbench-main">
          <section class="result-page">
            <header class="chat-header result-header">
              <div>
                <h1>执行结果</h1>
                <p>查看任务产出的数据、关系和摘要</p>
              </div>
            </header>

            <div class="result-body">
              <section class="result-section dataset-section">
                <div class="result-section-heading">
                  <h2>结果数据集</h2>
                  <div class="result-controls">
                    <div class="result-tabs" aria-label="结果数据集视图切换">
                      <button
                        :class="{ active: activeResultView === 'dataset' }"
                        @click="activeResultView = 'dataset'"
                      >
                        数据集
                      </button>
                      <button
                        :class="{ active: activeResultView === 'er' }"
                        @click="activeResultView = 'er'"
                      >
                        ER 图
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="activeResultView === 'dataset'" class="dataset-browser">
                  <div class="dataset-overview">
                    <div>
                      <strong>{{ resultOverview[0].value }}</strong>
                      <span>{{ resultOverview[0].label }}</span>
                    </div>
                    <div>
                      <strong>{{ resultOverview[1].value }}</strong>
                      <span>{{ resultOverview[1].label }}</span>
                    </div>
                    <div>
                      <strong>{{ resultOverview[2].value }}</strong>
                      <span>{{ resultOverview[2].label }}</span>
                    </div>
                  </div>

                  <div class="table-explorer">
                    <div class="table-list">
                      <button
                        v-for="table in resultItems"
                        :key="table.id"
                        class="table-card"
                        :class="{ active: activeDatasetTableId === table.id }"
                        @click="selectDatasetTable(table)"
                      >
                        <span>{{ table.label }}</span>
                        <strong>{{ table.name }}</strong>
                        <small>{{
                          table.metaText || `${table.rows} 行 · ${table.fields} 字段`
                        }}</small>
                      </button>
                    </div>

                    <div class="schema-preview">
                      <header class="schema-header">
                        <div>
                          <span>{{ activeDatasetTable.label }}</span>
                          <strong>{{ activeDatasetTable.name }}</strong>
                        </div>
                        <small>{{ activeDatasetTable.updatedAt }}</small>
                      </header>

                      <div class="schema-table">
                        <div class="schema-row schema-head">
                          <span>字段</span>
                          <span>类型</span>
                          <span>键</span>
                        </div>
                        <div
                          v-for="column in activeDatasetTable.columns"
                          :key="column.name"
                          class="schema-row"
                        >
                          <span>{{ column.name }}</span>
                          <span>{{ column.type }}</span>
                          <b>{{ column.key || "-" }}</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="er-canvas">
                  <svg
                    class="er-edges"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <g v-for="edge in erEdges" :key="edge.id">
                      <line
                        :x1="edge.x1"
                        :y1="edge.y1"
                        :x2="edge.x2"
                        :y2="edge.y2"
                      />
                    </g>
                  </svg>
                  <span
                    v-for="edge in erEdges"
                    :key="`${edge.id}-label`"
                    class="er-edge-label"
                    :style="{ left: `${edge.labelX}%`, top: `${edge.labelY}%` }"
                  >
                    {{ edge.label }}
                  </span>
                  <article
                    v-for="node in erNodes"
                    :key="node.id"
                    class="er-node"
                    :style="{ left: `${node.x}%`, top: `${node.y}%` }"
                  >
                    <strong>{{ node.name }}</strong>
                    <em>{{ node.table }}</em>
                    <span>{{ node.meta }}</span>
                  </article>
                </div>
              </section>

              <section class="result-section summary-section">
                <div class="result-section-heading">
                  <h2>执行摘要</h2>
                </div>
                <ul class="summary-list">
                  <li v-for="item in summaryItems" :key="item">{{ item }}</li>
                </ul>
              </section>
            </div>
          </section>

          <section class="chat-page">
            <header class="chat-header">
              <div>
                <h1>工作台</h1>
                <p>围绕数据源与任务进行交互式分析</p>
              </div>
              <div class="chat-header-actions">
                <button class="status-chip action-chip" @click="showPreviewMessage">
                  <el-icon><DocumentChecked /></el-icon>
                  <span>保存为任务</span>
                </button>
              </div>
            </header>

            <div class="chat-body">
              <article
                v-for="message in chatMessages"
                :key="message.id"
                class="chat-message"
                :class="message.role"
              >
                <div class="message-bubble">
                  <span v-if="message.role === 'assistant'" class="assistant-mark">
                    <el-icon><ChatDotRound /></el-icon>
                  </span>
                  <p>{{ message.content }}</p>
                </div>
              </article>
            </div>

            <div class="composer">
              <div class="composer-input-wrap">
                <el-input
                  v-model="promptText"
                  class="composer-input"
                  type="textarea"
                  resize="none"
                  :autosize="false"
                  placeholder="请输入工作台分析问题"
                />
                <button class="skills-button" @click="showPreviewMessage">
                  <el-icon><Operation /></el-icon>
                  <span>Skills</span>
                </button>
              </div>
              <el-button
                class="send-button"
                :icon="Position"
                @click="showPreviewMessage"
              />
            </div>
          </section>
        </section>
      </section>
    </section>

    <div v-if="wecomDialogVisible" class="wecom-dialog-mask">
      <section class="wecom-dialog" aria-label="企业微信连接参数">
        <header>
          <h2>腾讯企业微信</h2>
          <button type="button" @click="wecomDialogVisible = false">关闭</button>
        </header>
        <label>
          <span>spaceid</span>
          <input v-model="wecomSpaceIdInput" autocomplete="off" />
        </label>
        <label>
          <span>fatherid</span>
          <input v-model="wecomFatherIdInput" autocomplete="off" />
        </label>
        <pre class="request-preview">{{
          JSON.stringify(
            {
              spaceid: wecomSpaceIdInput,
              fatherid: wecomFatherIdInput || wecomSpaceIdInput,
              sort_type: 1,
              start: 0,
              limit: 100,
            },
            null,
            2,
          )
        }}</pre>
        <footer>
          <button type="button" @click="wecomDialogVisible = false">取消</button>
          <button type="button" class="primary" @click="connectWecom">
            确认连接
          </button>
        </footer>
      </section>
    </div>
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
    min-width: 0;
    overflow: hidden;
    background: #ffffff;
  }

  .workbench-page {
    display: grid;
    grid-template-columns: minmax(220px, 0.95fr) minmax(0, 6fr);
    gap: 0;
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 28px 32px 28px 28px;
    background: #ffffff;
  }

  .workbench-panel,
  .workbench-main,
  .chat-page,
  .result-page {
    min-height: 0;
    background: #ffffff;
  }

  .workbench-panel {
    display: flex;
    flex-direction: column;
    padding: 10px 24px 10px 0;
    border-right: 1px solid rgba(62, 38, 118, 0.12);
  }

  .panel-section {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
  }

  .panel-section + .panel-section {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid rgba(62, 38, 118, 0.08);
  }

  .panel-heading,
  .chat-header,
  .chat-header-actions,
  .status-chip,
  .list-row {
    display: flex;
    align-items: center;
  }

  .panel-heading,
  .chat-header {
    justify-content: space-between;
  }

  .panel-heading {
    margin-bottom: 10px;
    color: #151515;
  }

  .panel-heading div {
    min-width: 0;
  }

  .panel-heading span {
    display: block;
  }

  .panel-heading span {
    font-size: 15px;
    line-height: 21px;
    font-weight: 600;
  }

  .panel-count.el-tag {
    flex: none;
    height: 20px;
    padding: 0 6px;
    font-size: 11px;
    line-height: 18px;
    font-weight: 400;
  }

  .item-list {
    min-height: 0;
    overflow-y: auto;
    padding-right: 2px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .item-list::-webkit-scrollbar {
    display: none;
  }

  .list-row {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    min-height: 42px;
    padding: 8px 2px;
    border-bottom: 1px solid rgba(62, 38, 118, 0.08);
  }

  .list-row:last-child {
    border-bottom: 0;
  }

  .list-row:hover {
    background: rgba(255, 255, 255, 0.68);
  }

  .list-row.clickable {
    cursor: pointer;
  }

  .row-main {
    min-width: 0;
  }

  .row-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  }

  .row-title strong,
  .row-main span,
  .row-main small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-title strong {
    color: #111111;
    font-size: 13px;
    line-height: 19px;
    font-weight: 400;
  }

  .row-main span {
    margin-top: 1px;
    color: rgba(0, 0, 0, 0.38);
    font-size: 11px;
    line-height: 15px;
    font-weight: 400;
  }

  .list-row b {
    align-self: center;
    color: rgba(0, 0, 0, 0.48);
    font-size: 12px;
    line-height: 17px;
    font-weight: 400;
  }

  .list-row b.tone-success {
    color: #1f7a4f;
  }

  .list-row b.tone-running {
    color: #4b2887;
  }

  .list-row b.tone-pending {
    color: #9a6711;
  }

  .list-row b.tone-error {
    color: #c24134;
  }


  .workbench-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0;
    min-width: 0;
    overflow: hidden;
    padding-left: 24px;
  }

  .chat-page,
  .result-page {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden;
  }

  .result-page {
    order: 2;
    grid-template-rows: auto minmax(0, 1fr);
    padding-left: 24px;
  }

  .chat-page {
    order: 1;
    padding-right: 24px;
    border-right: 1px solid rgba(62, 38, 118, 0.12);
  }

  .chat-header {
    min-height: 82px;
    padding: 22px 28px 18px;
    border-bottom: 1px solid rgba(62, 38, 118, 0.08);
  }

  .chat-page .chat-header {
    gap: 10px;
    min-height: 76px;
    padding: 18px 16px 14px;
  }

  .chat-header h1 {
    margin: 0 0 4px;
    color: #111111;
    font-size: 22px;
    line-height: 30px;
    font-weight: 600;
  }

  .chat-page .chat-header h1 {
    font-size: 20px;
    line-height: 28px;
  }

  .chat-header p {
    margin: 0;
    color: rgba(0, 0, 0, 0.45);
    font-size: 13px;
    line-height: 19px;
  }

  .chat-page .chat-header p {
    font-size: 12px;
    line-height: 18px;
  }

  .chat-header-actions {
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .status-chip {
    gap: 7px;
    min-height: 34px;
    padding: 0 10px;
    border: 1px solid #e6dff5;
    border-radius: 10px;
    background: #fafafa;
    color: rgba(0, 0, 0, 0.58);
    font-size: 12px;
    line-height: 18px;
    white-space: nowrap;
  }

  .chat-page .action-chip {
    gap: 5px;
    min-height: 28px;
    padding: 0 8px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 17px;
  }

  button.status-chip {
    font: inherit;
    cursor: pointer;
  }

  .action-chip:hover {
    border-color: rgba(62, 38, 118, 0.28);
    background: #ffffff;
    color: #4b2887;
  }

  .status-chip .el-icon {
    color: #4b2887;
  }

  .chat-body {
    overflow-y: auto;
    padding: 28px;
    background: linear-gradient(180deg, #ffffff 0%, #fdfcff 100%);
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .chat-page .chat-body {
    padding: 20px 16px;
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
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr);
    gap: 8px;
    border: 1px solid rgba(62, 38, 118, 0.09);
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(61, 39, 114, 0.05);
  }

  .chat-message.user .message-bubble {
    background: #4a2788;
    color: #ffffff;
  }

  .message-bubble p {
    margin: 0;
  }

  .assistant-mark {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: #ebe5f8;
    color: #4b2887;
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

  .chat-page .composer {
    gap: 8px;
    margin: 0 16px 20px;
    padding: 10px;
    border-radius: 12px;
  }

  .composer:hover {
    border-color: rgba(62, 38, 118, 0.3);
    background: #ffffff;
    box-shadow: 0 4px 24px rgba(88, 53, 132, 0.16);
  }

  .composer-input-wrap {
    position: relative;
    min-width: 0;
  }

  .skills-button {
    position: absolute;
    left: 0;
    bottom: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 8px;
    border: 1px solid #e6dff5;
    border-radius: 8px;
    background: #ffffff;
    color: #4b2887;
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;
  }

  .skills-button:hover {
    border-color: rgba(62, 38, 118, 0.28);
    background: #f8f5ff;
  }

  .send-button.el-button {
    width: 34px;
    height: 34px;
    min-height: 34px;
    border-radius: 8px;
  }

  .send-button.el-button,
  .send-button.el-button:hover,
  .send-button.el-button:focus {
    border-color: #4a2788;
    background: #4a2788;
    color: #ffffff;
  }

  .composer-input :deep(.el-textarea__inner) {
    min-height: 74px !important;
    max-height: 104px;
    padding: 7px 2px 34px;
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

  .result-header {
    padding-right: 0;
  }

  .result-body {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    min-height: 0;
    overflow: hidden;
    padding: 28px 0 24px 28px;
    background: linear-gradient(180deg, #ffffff 0%, #fdfcff 100%);
  }

  .result-section {
    min-width: 0;
  }

  .dataset-section {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-height: 0;
    overflow: hidden;
  }

  .result-section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 14px;
  }

  .result-section-heading h2 {
    margin: 0;
    color: #111111;
    font-size: 15px;
    line-height: 22px;
    font-weight: 600;
  }

  .result-controls {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .result-tabs {
    display: inline-flex;
    gap: 4px;
    padding: 3px;
    border: 1px solid #e6dff5;
    border-radius: 10px;
    background: #ffffff;
  }

  .result-tabs button {
    min-width: 54px;
    height: 26px;
    padding: 0 9px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: rgba(0, 0, 0, 0.58);
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;
  }

  .result-tabs button.active {
    background: #ebe5f8;
    color: #4b2887;
  }

  .dataset-browser {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 14px;
    min-height: 0;
    overflow: hidden;
  }

  .dataset-overview {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .dataset-overview div {
    display: grid;
    gap: 3px;
    padding: 10px 12px;
    border: 1px solid rgba(62, 38, 118, 0.1);
    border-radius: 10px;
    background: #ffffff;
  }

  .dataset-overview strong {
    color: #111111;
    font-size: 18px;
    line-height: 24px;
    font-weight: 600;
  }

  .dataset-overview span {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    line-height: 17px;
  }

  .table-explorer {
    display: grid;
    grid-template-columns: minmax(180px, 0.95fr) minmax(0, 1.45fr);
    gap: 14px;
    min-height: 0;
    overflow: hidden;
  }

  .table-list {
    display: grid;
    align-content: start;
    gap: 8px;
    min-height: 0;
    overflow-y: auto;
    padding-right: 2px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .table-list::-webkit-scrollbar {
    display: none;
  }

  .table-card {
    display: grid;
    gap: 2px;
    width: 100%;
    min-width: 0;
    padding: 10px 11px;
    border: 1px solid rgba(62, 38, 118, 0.08);
    border-radius: 10px;
    background: #ffffff;
    text-align: left;
    cursor: pointer;
  }

  .table-card.active {
    border-color: #d8cbed;
    background: #fbf9ff;
  }

  .table-card span,
  .table-card strong,
  .table-card small,
  .schema-header span,
  .schema-header strong,
  .schema-header small,
  .schema-row span,
  .schema-row b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .table-card span {
    color: #111111;
    font-size: 13px;
    line-height: 19px;
  }

  .table-card strong {
    color: rgba(0, 0, 0, 0.52);
    font-size: 12px;
    line-height: 17px;
    font-weight: 400;
  }

  .table-card small {
    color: rgba(0, 0, 0, 0.38);
    font-size: 11px;
    line-height: 16px;
  }

  .schema-preview {
    min-width: 0;
    overflow: hidden;
    border: 1px solid rgba(62, 38, 118, 0.1);
    border-radius: 12px;
    background: #ffffff;
  }

  .schema-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 58px;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(62, 38, 118, 0.08);
    background: #fafafa;
  }

  .schema-header div {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .schema-header span {
    color: rgba(0, 0, 0, 0.48);
    font-size: 12px;
    line-height: 17px;
  }

  .schema-header strong {
    color: #111111;
    font-size: 14px;
    line-height: 20px;
    font-weight: 600;
  }

  .schema-header small {
    color: #4b2887;
    font-size: 12px;
    line-height: 17px;
  }

  .schema-table {
    display: grid;
  }

  .schema-row {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) 42px;
    gap: 10px;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    border-bottom: 1px solid rgba(62, 38, 118, 0.07);
    color: rgba(0, 0, 0, 0.72);
    font-size: 12px;
    line-height: 18px;
  }

  .schema-row:last-child {
    border-bottom: 0;
  }

  .schema-head {
    min-height: 34px;
    color: rgba(0, 0, 0, 0.42);
    font-size: 11px;
  }

  .schema-row b {
    display: grid;
    place-items: center;
    min-width: 28px;
    height: 20px;
    border-radius: 6px;
    background: #f4f0fb;
    color: #4b2887;
    font-size: 11px;
    line-height: 16px;
    font-weight: 500;
  }

  .er-canvas {
    position: relative;
    min-height: 430px;
    overflow: hidden;
    padding: 18px;
    border: 1px solid rgba(62, 38, 118, 0.1);
    border-radius: 12px;
    background:
      linear-gradient(rgba(74, 39, 136, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(74, 39, 136, 0.04) 1px, transparent 1px),
      #ffffff;
    background-size: 28px 28px;
  }

  .er-edges {
    position: absolute;
    inset: 12px;
    width: calc(100% - 24px);
    height: calc(100% - 24px);
    pointer-events: none;
  }

  .er-edges line {
    stroke: rgba(74, 39, 136, 0.3);
    stroke-width: 0.34;
    vector-effect: non-scaling-stroke;
  }

  .er-edge-label {
    position: absolute;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 18px;
    padding: 0 6px;
    border: 1px solid #e6dff5;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.94);
    color: #4b2887;
    font-size: 11px;
    line-height: 16px;
    font-weight: 400;
    white-space: nowrap;
    box-shadow: 0 3px 10px rgba(61, 39, 114, 0.06);
    transform: translate(-50%, -50%);
  }

  .er-node {
    position: absolute;
    z-index: 1;
    display: grid;
    gap: 3px;
    width: 108px;
    min-width: 0;
    padding: 9px 10px;
    border: 1px solid #e6dff5;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(61, 39, 114, 0.07);
    transform: translate(-50%, -50%);
  }

  .er-node strong {
    color: #111111;
    font-size: 12px;
    line-height: 17px;
    font-weight: 600;
  }

  .er-node em {
    overflow: hidden;
    color: #4b2887;
    font-size: 10px;
    font-style: normal;
    line-height: 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .er-node span {
    overflow: hidden;
    color: rgba(0, 0, 0, 0.45);
    font-size: 10px;
    line-height: 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .summary-section {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(62, 38, 118, 0.08);
  }

  .summary-list {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .summary-list li {
    position: relative;
    padding-left: 16px;
    color: rgba(0, 0, 0, 0.68);
    font-size: 13px;
    line-height: 21px;
  }

  .summary-list li::before {
    position: absolute;
    left: 0;
    top: 9px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #c8b8ec;
    content: "";
  }

  .wecom-dialog-mask {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: grid;
    place-items: center;
    padding: 24px;
    background: rgba(16, 13, 26, 0.28);
  }

  .wecom-dialog {
    display: grid;
    gap: 14px;
    width: min(460px, 100%);
    padding: 20px;
    border: 1px solid rgba(62, 38, 118, 0.12);
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 20px 50px rgba(48, 32, 86, 0.18);
  }

  .wecom-dialog header,
  .wecom-dialog footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .wecom-dialog h2 {
    margin: 0;
    color: #111111;
    font-size: 18px;
    line-height: 26px;
    font-weight: 600;
  }

  .wecom-dialog label {
    display: grid;
    gap: 6px;
    color: rgba(0, 0, 0, 0.58);
    font-size: 12px;
    line-height: 18px;
  }

  .wecom-dialog input {
    width: 100%;
    height: 36px;
    padding: 0 10px;
    border: 1px solid #e6dff5;
    border-radius: 8px;
    background: #ffffff;
    color: #111111;
    font-size: 13px;
    line-height: 20px;
    outline: none;
  }

  .wecom-dialog input:focus {
    border-color: rgba(74, 39, 136, 0.42);
    box-shadow: 0 0 0 3px rgba(74, 39, 136, 0.08);
  }

  .request-preview {
    margin: 0;
    max-height: 160px;
    overflow: auto;
    padding: 12px;
    border-radius: 10px;
    background: #f8f5ff;
    color: rgba(0, 0, 0, 0.72);
    font-size: 12px;
    line-height: 18px;
    white-space: pre-wrap;
  }

  .wecom-dialog button {
    height: 32px;
    padding: 0 12px;
    border: 1px solid #e6dff5;
    border-radius: 8px;
    background: #ffffff;
    color: rgba(0, 0, 0, 0.62);
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;
  }

  .wecom-dialog button.primary {
    border-color: #4a2788;
    background: #4a2788;
    color: #ffffff;
  }

  @media (max-width: 1440px) {
    .workbench-page {
      padding: 24px 24px 24px 20px;
    }

    .workbench-panel {
      padding-right: 18px;
    }

    .workbench-main {
      padding-left: 18px;
    }

    .result-page {
      padding-left: 18px;
    }

    .chat-page {
      padding-right: 18px;
    }

    .chat-header,
    .chat-body {
      padding-right: 22px;
      padding-left: 22px;
    }

    .result-body {
      padding-left: 22px;
    }

    .composer {
      margin-right: 22px;
      margin-left: 22px;
    }
  }
</style>
