<script setup>
  import { computed, onMounted, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ElMessage } from "element-plus";
  import {
    Coin,
    DataAnalysis,
    Grid,
    PriceTag,
    Shop,
    TrendCharts,
    Warning,
  } from "@element-plus/icons-vue";
  import DockNav from "../components/DockNav.vue";
  import { dockItems } from "../config/dockItems";
  import {
    getWallaceReportCatalog,
    getWallaceReportOverview,
  } from "../api/wallaceReports";

  const route = useRoute();
  const router = useRouter();

  const catalog = ref(null);
  const overview = ref(null);
  const isLoading = ref(false);
  const selectedMonth = ref("");
  const selectedZone = ref("");
  const activeReportTab = ref("overview");

  const activeDock = computed(() => route.meta.dockKey || "wallaceReports");
  const months = computed(() => catalog.value?.months || []);
  const zones = computed(() => catalog.value?.zones || []);

  const kpis = computed(() => overview.value?.kpis || {});
  const zoneProfit = computed(() => overview.value?.zoneProfit || []);
  const monthlyTrend = computed(() => overview.value?.monthlyTrend || []);
  const riskSignals = computed(() => overview.value?.riskSignals || []);
  const zoneHealth = computed(() => overview.value?.zoneHealth || []);
  const comboMargins = computed(() => overview.value?.comboMargins || []);
  const operatingChannels = computed(() => overview.value?.operatingChannels || []);
  const customerStructure = computed(() => overview.value?.customerStructure || []);
  const costMargins = computed(() => overview.value?.costMargins || []);
  const headTailGap = computed(() => overview.value?.headTailGap || []);
  const quadrantAnalysis = computed(() => overview.value?.quadrantAnalysis || {});
  const overallQuadrants = computed(
    () => quadrantAnalysis.value.overallQuadrants || [],
  );
  const positiveDrivers = computed(
    () => quadrantAnalysis.value.positiveDrivers || [],
  );
  const negativeDrivers = computed(
    () => quadrantAnalysis.value.negativeDrivers || [],
  );
  const highIncomeGap = computed(() => quadrantAnalysis.value.highIncomeGap || []);
  const comboChannelSummary = computed(
    () => quadrantAnalysis.value.comboChannelSummary || [],
  );
  const topComboStructures = computed(
    () => quadrantAnalysis.value.topComboStructures || [],
  );
  const provinceQuadrants = computed(
    () => quadrantAnalysis.value.provinceQuadrants || [],
  );
  const regionalHealth = computed(
    () => quadrantAnalysis.value.regionalHealth || [],
  );
  const topBottomGap = computed(
    () => quadrantAnalysis.value.topBottomGap || [],
  );
  const regionalComboMargin = computed(
    () => quadrantAnalysis.value.regionalComboMargin || [],
  );
  const recommendations = computed(
    () => quadrantAnalysis.value.recommendations || [],
  );
  const quadrantMatrixOrder = [
    "低收入高利润",
    "高收入高利润",
    "低收入低利润",
    "高收入低利润",
  ];
  const provinceQuadrantMatrix = computed(() => {
    const groups = new Map();
    provinceQuadrants.value.forEach((item) => {
      if (!groups.has(item.quadrant)) groups.set(item.quadrant, []);
      groups.get(item.quadrant).push(item);
    });
    return quadrantMatrixOrder.map((quadrant) => ({
      quadrant,
      provinces: (groups.get(quadrant) || []).map((item) => {
        const items = groups.get(quadrant) || [];
        const minRevenue = Math.min(...items.map((row) => row.revenueWan));
        const maxRevenue = Math.max(...items.map((row) => row.revenueWan));
        const minProfit = Math.min(...items.map((row) => row.profitRate));
        const maxProfit = Math.max(...items.map((row) => row.profitRate));
        const revenueSpan = maxRevenue - minRevenue || 1;
        const profitSpan = maxProfit - minProfit || 1;
        return {
          ...item,
          x: 12 + ((item.revenueWan - minRevenue) / revenueSpan) * 76,
          y: 12 + ((item.profitRate - minProfit) / profitSpan) * 76,
        };
      }),
    }));
  });
  const comboChannelGroups = computed(() => {
    const groups = new Map();
    comboChannelSummary.value.forEach((item) => {
      if (!groups.has(item.quadrant)) groups.set(item.quadrant, []);
      groups.get(item.quadrant).push(item);
    });
    return [...groups.entries()].map(([quadrant, channels]) => ({
      quadrant,
      channels,
    }));
  });
  const channelItems = computed(() =>
    Object.values(overview.value?.channelMix || {}).map((item) => ({
      ...item,
      profitRate: item.revenue ? item.profit / item.revenue : 0,
    })),
  );
  const isZoneFocused = computed(() => Boolean(selectedZone.value));
  const currentZoneName = computed(() =>
    selectedZone.value ? formatRegionName(selectedZone.value) : "全部区域",
  );
  const overviewTitle = computed(() =>
    isZoneFocused.value ? `${currentZoneName.value}经营画像` : "经营指标与健康度总览",
  );
  const focusedZoneProfit = computed(() => zoneProfit.value[0] || {});
  const focusedRiskSignal = computed(() => riskSignals.value[0] || {});
  const focusedZoneHealth = computed(() => zoneHealth.value[0] || {});
  const focusedComboMargin = computed(() => comboMargins.value[0] || {});
  const focusedCustomerStructure = computed(() => customerStructure.value[0] || {});
  const focusedCostMargin = computed(() => costMargins.value[0] || {});
  const focusedHeadTailGap = computed(() => headTailGap.value[0] || {});
  const focusedTopChannel = computed(
    () =>
      [...channelItems.value].sort(
        (left, right) => (right.revenue || 0) - (left.revenue || 0),
      )[0] || {},
  );
  const focusedTrendStart = computed(() => monthlyTrend.value[0] || {});
  const focusedTrendEnd = computed(() => monthlyTrend.value.at(-1) || {});
  const focusedTrendLift = computed(() => {
    const startRevenue = Number(focusedTrendStart.value.revenue || 0);
    const endRevenue = Number(focusedTrendEnd.value.revenue || 0);
    if (!startRevenue) return 0;
    return (endRevenue - startRevenue) / startRevenue;
  });
  const focusedCustomerNewOrderRate = computed(() =>
    Math.min(Math.max(Number(focusedCustomerStructure.value.newOrderRate || 0), 0), 1),
  );
  const focusedCustomerReturningOrderRate = computed(() =>
    Math.max(1 - focusedCustomerNewOrderRate.value, 0),
  );
  const focusedCustomerMemberOrderRate = computed(() =>
    Math.min(Math.max(Number(focusedCustomerStructure.value.memberOrderRate || 0), 0), 1),
  );
  const customerProfileBars = computed(() => [
    {
      label: "新客订单",
      value: focusedCustomerNewOrderRate.value,
      meta: `${formatNumber(focusedCustomerStructure.value.newOrders)} 单`,
      tone: "warm",
    },
    {
      label: "老客订单",
      value: focusedCustomerReturningOrderRate.value,
      meta: `${formatNumber(focusedCustomerStructure.value.returningOrders)} 单`,
      tone: "green",
    },
    {
      label: "会员订单",
      value: focusedCustomerMemberOrderRate.value,
      meta: `收入 ${formatMoney(focusedCustomerStructure.value.memberRevenue)}`,
      tone: "primary",
    },
  ]);
  const customerDonutStyle = computed(() => {
    const newPercent = focusedCustomerNewOrderRate.value * 100;
    const memberPercent = Math.min(newPercent + focusedCustomerMemberOrderRate.value * 100, 100);
    return {
      background: `conic-gradient(#d7b75f 0 ${newPercent}%, #5b3da7 ${newPercent}% ${memberPercent}%, #7aa08f ${memberPercent}% 100%)`,
    };
  });
  const marginRadarMetrics = computed(() => [
    {
      label: "堂食",
      value: Number(focusedCostMargin.value.dineinMargin || 0),
      angle: -90,
      tone: "primary",
    },
    {
      label: "外卖",
      value: Number(focusedCostMargin.value.deliveryMargin || 0),
      angle: 30,
      tone: "warm",
    },
    {
      label: "团购",
      value: Number(focusedCostMargin.value.groupMargin || 0),
      angle: 150,
      tone: "green",
    },
  ]);
  const marginRadarPoints = computed(() =>
    marginRadarMetrics.value
      .map((item) => {
        const score = Math.min(Math.max(item.value / 0.75, 0.08), 1);
        const radius = 58 * score;
        const angle = (item.angle * Math.PI) / 180;
        return `${(90 + Math.cos(angle) * radius).toFixed(1)},${(82 + Math.sin(angle) * radius).toFixed(1)}`;
      })
      .join(" "),
  );
  const marginRadarDots = computed(() =>
    marginRadarPoints.value.split(" ").map((point, index) => {
      const [x, y] = point.split(",");
      return {
        key: marginRadarMetrics.value[index]?.label || point,
        x,
        y,
      };
    }),
  );
  const focusedMaterialCostRate = computed(() =>
    Math.min(Math.max(Number(focusedCostMargin.value.materialCostRate || 0), 0), 1),
  );
  const headTailMaxProfit = computed(() =>
    Math.max(
      Math.abs(Number(focusedHeadTailGap.value.top20Profit || 0)),
      Math.abs(Number(focusedHeadTailGap.value.bottom20Profit || 0)),
      1,
    ),
  );
  const customerStructureMatrix = computed(() =>
    customerStructure.value.map((item) => {
      const newOrders = Number(item.newOrders || 0);
      const returningOrders = Number(item.returningOrders || 0);
      const memberOrders = Number(item.memberOrders || 0);
      const displayedTotal = Math.max(newOrders + returningOrders + memberOrders, 1);
      return {
        ...item,
        newShare: newOrders / displayedTotal,
        returningShare: returningOrders / displayedTotal,
        memberShare: memberOrders / displayedTotal,
      };
    }),
  );
  const costMarginHeatRows = computed(() => {
    const materialRankByZone = new Map(
      [...costMargins.value]
        .sort(
          (left, right) =>
            Number(right.materialCostRate || 0) - Number(left.materialCostRate || 0),
        )
        .slice(0, 3)
        .map((item, index) => [item.zone, index + 1]),
    );

    return costMargins.value.map((item) => ({
      ...item,
      materialRank: materialRankByZone.get(item.zone) || null,
      cells: [
        {
          key: "material",
          label: "食材",
          value: item.materialCostRate,
          tone: "cost",
        },
        {
          key: "dinein",
          label: "堂食",
          value: item.dineinMargin,
          tone: "margin",
        },
        {
          key: "delivery",
          label: "外卖",
          value: item.deliveryMargin,
          tone: "margin",
        },
        {
          key: "group",
          label: "团购",
          value: item.groupMargin,
          tone: "margin",
        },
      ],
    }));
  });
  const headTailRangeRows = computed(() =>
    headTailGap.value.map((item) => ({
      ...item,
      gapShare: Math.min(Number(item.profitGap || 0) / maxHeadTailGap.value, 1),
    })),
  );

  const maxZoneProfit = computed(() =>
    Math.max(...zoneProfit.value.map((item) => item.profit), 1),
  );
  const maxChannelRevenue = computed(() =>
    Math.max(...channelItems.value.map((item) => item.revenue), 1),
  );
  const maxRisk = computed(() =>
    Math.max(...riskSignals.value.map((item) => item.lowPriceRate), 0.01),
  );
  const maxZoneHealth = computed(() =>
    Math.max(...zoneHealth.value.map((item) => item.belowNationalRatio), 0.01),
  );
  const maxCombo = computed(() =>
    Math.max(...comboMargins.value.map((item) => item.passRate), 0.01),
  );
  const maxOperatingRevenue = computed(() =>
    Math.max(...operatingChannels.value.map((item) => item.revenue), 1),
  );
  const maxCustomerRate = computed(() =>
    Math.max(
      ...customerStructure.value.flatMap((item) => [
        item.newOrderRate || 0,
        item.memberRevRate || 0,
      ]),
      0.01,
    ),
  );
  const maxMaterialCostRate = computed(() =>
    Math.max(...costMargins.value.map((item) => item.materialCostRate), 0.01),
  );
  const maxHeadTailGap = computed(() =>
    Math.max(...headTailGap.value.map((item) => item.profitGap), 1),
  );
  const maxQuadrantRevenue = computed(() =>
    Math.max(...overallQuadrants.value.map((item) => item.revenueWan), 1),
  );
  const maxDriverCorrelation = computed(() =>
    Math.max(
      ...[...positiveDrivers.value, ...negativeDrivers.value].map((item) =>
        Math.abs(item.spearman),
      ),
      0.01,
    ),
  );
  const maxComboChannelRevenue = computed(() =>
    Math.max(...comboChannelSummary.value.map((item) => item.revenueWan), 1),
  );
  const maxTopComboRevenue = computed(() =>
    Math.max(...topComboStructures.value.map((item) => item.revenueWan), 1),
  );
  const maxProvinceRevenue = computed(() =>
    Math.max(...provinceQuadrants.value.map((item) => item.revenueWan), 1),
  );
  const maxRegionalGap = computed(() =>
    Math.max(...topBottomGap.value.map((item) => item.gapWan), 1),
  );
  const regionalDiagnosticCards = computed(() => {
    const rows = new Map();
    regionalHealth.value.forEach((item) => {
      rows.set(item.province, {
        province: item.province,
        avgProfitRate: item.avgProfitRate,
        belowNationalRatio: item.belowNationalRatio,
      });
    });
    topBottomGap.value.forEach((item) => {
      rows.set(item.province, {
        ...(rows.get(item.province) || { province: item.province }),
        gapWan: item.gapWan,
        top20ProfitWan: item.top20ProfitWan,
      });
    });
    regionalComboMargin.value.forEach((item) => {
      rows.set(item.province, {
        ...(rows.get(item.province) || { province: item.province }),
        passRate: item.passRate,
        marginErosion: item.marginErosion,
      });
    });
    return [...rows.values()].sort(
      (left, right) =>
        (right.belowNationalRatio || 0) - (left.belowNationalRatio || 0),
    );
  });
  const maxRegionalBelowRatio = computed(() =>
    Math.max(...regionalHealth.value.map((item) => item.belowNationalRatio), 0.01),
  );
  const maxRegionalComboPassRate = computed(() =>
    Math.max(...regionalComboMargin.value.map((item) => item.passRate), 0.01),
  );
  const maxRegionalMarginErosion = computed(() =>
    Math.max(
      ...regionalComboMargin.value.map((item) => Math.abs(item.marginErosion)),
      0.01,
    ),
  );
  const trendChart = computed(() => {
    const width = 320;
    const height = 132;
    const padding = 18;
    const rows = monthlyTrend.value;
    if (!rows.length) {
      return { width, height, points: "", rows: [] };
    }

    const minRevenue = Math.min(...rows.map((item) => item.revenue));
    const maxRevenue = Math.max(...rows.map((item) => item.revenue));
    const span = maxRevenue - minRevenue || 1;
    const points = rows
      .map((item, index) => {
        const x =
          rows.length === 1
            ? width / 2
            : padding + (index / (rows.length - 1)) * (width - padding * 2);
        const y =
          height -
          padding -
          ((item.revenue - minRevenue) / span) * (height - padding * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    return { width, height, points, rows };
  });

  const formatMoney = (value) => {
    const number = Number(value || 0);
    if (Math.abs(number) >= 100000000) return `${(number / 100000000).toFixed(2)}亿`;
    if (Math.abs(number) >= 10000) return `${(number / 10000).toFixed(1)}万`;
    return number.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
  };

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 });

  const formatPercent = (value) =>
    `${(Number(value || 0) * 100).toFixed(1)}%`;

  const formatRegionName = (value) => String(value || "").replace(/区域$/, "");

  const getHealthTone = (value) => {
    const number = Number(value || 0);
    if (number >= 0.5) return "high";
    if (number >= 0.25) return "medium";
    return "low";
  };

  const getHeatCellStyle = (value, tone) => {
    const number = Math.min(Math.max(Number(value || 0), 0), 1);
    const opacity = 0.18 + number * 0.58;
    if (tone === "cost") {
      return {
        backgroundColor: `rgba(216, 199, 137, ${opacity.toFixed(2)})`,
        color: "rgba(64, 49, 17, 0.86)",
      };
    }
    return {
      backgroundColor: `rgba(91, 61, 167, ${opacity.toFixed(2)})`,
      color: number >= 0.48 ? "#fff" : "rgba(22, 18, 37, 0.82)",
    };
  };

  const formatMetricValue = (item, value) => {
    if (item.format === "percent") return formatPercent(value);
    if (item.format === "price") return Number(value || 0).toFixed(2);
    return Number(value || 0).toFixed(2);
  };

  const formatSignedMetricValue = (item, value) => {
    const number = Number(value || 0);
    const prefix = number > 0 ? "+" : "";
    return `${prefix}${formatMetricValue(item, number)}`;
  };

  const selectDock = (dockKey) => {
    const item = dockItems.find((dockItem) => dockItem.key === dockKey);
    if (item) router.push(item.path);
  };

  const selectOverviewZone = (zone) => {
    if (!zone) return;
    selectedZone.value = zone;
    activeReportTab.value = "overview";
  };

  const loadOverview = async () => {
    isLoading.value = true;
    try {
      overview.value = await getWallaceReportOverview({
        month: selectedMonth.value,
        zone: selectedZone.value,
      });
    } catch (error) {
      ElMessage.error(error.message || "华莱士报表数据加载失败");
    } finally {
      isLoading.value = false;
    }
  };

  const loadCatalog = async () => {
    isLoading.value = true;
    try {
      catalog.value = await getWallaceReportCatalog();
      selectedMonth.value = catalog.value.months.at(-1) || "";
      await loadOverview();
    } catch (error) {
      ElMessage.error(error.message || "华莱士报表目录加载失败");
    } finally {
      isLoading.value = false;
    }
  };

  watch([selectedMonth, selectedZone], () => {
    if (catalog.value) loadOverview();
  });

  onMounted(loadCatalog);
</script>

<template>
  <div class="wallace-page">
    <DockNav
      :items="dockItems"
      :active-dock="activeDock"
      @select-dock="selectDock"
    />

    <main class="report-shell" v-loading="isLoading">
      <header class="report-header">
        <div>
          <h1>华莱士经营报表</h1>
          <p>{{ catalog?.dataDir || "/Users/wentaoding/Downloads/database" }}</p>
        </div>
      </header>

      <nav class="report-tabs" aria-label="报表模块">
        <label
          class="report-tab-option"
          :class="{ active: activeReportTab === 'overview' }"
        >
          <input v-model="activeReportTab" type="radio" value="overview" />
          <span>总览区域</span>
        </label>
        <label
          class="report-tab-option"
          :class="{ active: activeReportTab === 'quadrant' }"
        >
          <input v-model="activeReportTab" type="radio" value="quadrant" />
          <span>门店四象限经营分析</span>
        </label>
      </nav>

      <Transition name="report-tab" mode="out-in">
        <section
          v-if="activeReportTab === 'overview'"
          key="overview"
          class="overview-section report-view-panel"
          :class="{ 'is-zone-focused': isZoneFocused }"
        >
          <div class="section-heading overview-heading motion-row" style="--row-delay: 20ms">
            <div>
              <h2>{{ overviewTitle }}</h2>
            </div>
            <div class="overview-tools">
              <div class="filters">
                <el-select v-model="selectedMonth" placeholder="月份" size="large">
                  <el-option
                    v-for="month in months"
                    :key="month"
                    :label="month"
                    :value="month"
                  />
                </el-select>
                <el-select v-model="selectedZone" placeholder="全部" clearable size="large">
                  <el-option
                    v-for="zone in zones"
                    :key="zone"
                    :label="formatRegionName(zone)"
                    :value="zone"
                  />
                </el-select>
              </div>
            </div>
          </div>

        <section class="kpi-grid motion-row" style="--row-delay: 105ms">
          <article class="kpi-cell">
            <el-icon><Coin /></el-icon>
            <div class="kpi-copy">
              <span>总营收</span>
              <strong>{{ formatMoney(kpis.totalRevenue) }}</strong>
            </div>
          </article>
          <article class="kpi-cell">
            <el-icon><TrendCharts /></el-icon>
            <div class="kpi-copy">
              <span>总毛利额</span>
              <strong>{{ formatMoney(kpis.totalProfit) }}</strong>
            </div>
          </article>
          <article class="kpi-cell">
            <el-icon><DataAnalysis /></el-icon>
            <div class="kpi-copy">
              <span>总毛利率</span>
              <strong>{{ formatPercent(kpis.profitRate) }}</strong>
            </div>
          </article>
          <article class="kpi-cell">
            <el-icon><Shop /></el-icon>
            <div class="kpi-copy">
              <span>覆盖门店</span>
              <strong>{{ formatNumber(kpis.storeCount) }}</strong>
            </div>
          </article>
          <article class="kpi-cell">
            <el-icon><Warning /></el-icon>
            <div class="kpi-copy">
              <span>异常低价率</span>
              <strong>{{ formatPercent(kpis.lowPriceRate) }}</strong>
            </div>
          </article>
        </section>

        <template v-if="isZoneFocused">
          <section class="zone-focus-grid motion-row" style="--row-delay: 190ms">
            <article class="panel zone-focus-card">
              <div class="panel-title">
                <h2>核心经营表现</h2>
                <span>{{ currentZoneName }}</span>
              </div>
              <div class="zone-hero-metric">
                <span>区域毛利率</span>
                <strong>{{ formatPercent(focusedZoneProfit.profitRate ?? kpis.profitRate) }}</strong>
                <em>覆盖 {{ formatNumber(focusedZoneProfit.storeCount ?? kpis.storeCount) }} 家门店</em>
              </div>
              <dl class="zone-metric-list">
                <div>
                  <dt>区域营收</dt>
                  <dd>{{ formatMoney(focusedZoneProfit.revenue ?? kpis.totalRevenue) }}</dd>
                </div>
                <div>
                  <dt>区域毛利额</dt>
                  <dd>{{ formatMoney(focusedZoneProfit.profit ?? kpis.totalProfit) }}</dd>
                </div>
                <div>
                  <dt>主导渠道</dt>
                  <dd>{{ focusedTopChannel.label || "暂无数据" }}</dd>
                </div>
              </dl>
            </article>

            <article class="panel zone-focus-card">
              <div class="panel-title">
                <h2>风险健康画像</h2>
                <span>{{ focusedZoneHealth.pattern || "健康度" }}</span>
              </div>
              <div class="zone-risk-stack">
                <div class="zone-risk-item danger">
                  <div class="zone-risk-row">
                    <span>异常低价率</span>
                    <strong>{{ formatPercent(focusedRiskSignal.lowPriceRate ?? kpis.lowPriceRate) }}</strong>
                  </div>
                  <div class="bar-track danger">
                    <i :style="{ width: `${Math.max(Number((focusedRiskSignal.lowPriceRate ?? kpis.lowPriceRate) || 0) * 100, 4)}%` }" />
                  </div>
                </div>
                <div class="zone-risk-item">
                  <div class="zone-risk-row">
                    <span>退款率</span>
                    <strong>{{ formatPercent(focusedRiskSignal.refundRate ?? kpis.refundRate) }}</strong>
                  </div>
                  <div class="bar-track">
                    <i :style="{ width: `${Math.max(Number((focusedRiskSignal.refundRate ?? kpis.refundRate) || 0) * 100, 4)}%` }" />
                  </div>
                </div>
                <div class="zone-risk-item">
                  <div class="zone-risk-row">
                    <span>低于全国均值门店占比</span>
                    <strong>{{ formatPercent(focusedZoneHealth.belowNationalRatio) }}</strong>
                  </div>
                  <div class="bar-track">
                    <i :style="{ width: `${Math.max(Number(focusedZoneHealth.belowNationalRatio || 0) * 100, 4)}%` }" />
                  </div>
                </div>
              </div>
              <p class="zone-note">
                将单一区域视角聚焦在风险水平和健康度，不再展示区域间横向排名。
              </p>
            </article>

            <article class="panel zone-focus-card">
              <div class="panel-title">
                <h2>套餐与定价质量</h2>
                <span>实际 vs 理论</span>
              </div>
              <div class="zone-pass-meter">
                <strong>{{ formatPercent(focusedComboMargin.passRate) }}</strong>
                <span>套餐毛利达标率</span>
                <div class="bar-track green">
                  <i :style="{ width: `${Math.max(Number(focusedComboMargin.passRate || 0) * 100, 4)}%` }" />
                </div>
              </div>
              <dl class="zone-metric-list compact-list">
                <div>
                  <dt>实际毛利率</dt>
                  <dd>{{ formatPercent(focusedComboMargin.actualMargin) }}</dd>
                </div>
                <div>
                  <dt>理论毛利率</dt>
                  <dd>{{ formatPercent(focusedComboMargin.theoreticalMargin) }}</dd>
                </div>
                <div>
                  <dt>毛利侵蚀</dt>
                  <dd>{{ formatPercent(focusedComboMargin.marginErosion) }}</dd>
                </div>
              </dl>
            </article>
          </section>

        </template>

        <template v-else>
          <section class="report-grid main-grid motion-row" style="--row-delay: 190ms">
            <article class="panel">
              <div class="panel-title">
                <h2>区域利润率</h2>
                <span>{{ zoneProfit.length }} 个区域</span>
              </div>
              <div class="bar-list">
                <button
                  v-for="item in zoneProfit"
                  :key="item.zone"
                  type="button"
                  class="bar-row interactive-row"
                  @click="selectOverviewZone(item.zone)"
                >
                  <div class="row-label">
                    <strong>{{ formatRegionName(item.zone) }}</strong>
                    <span>{{ formatPercent(item.profitRate) }}</span>
                  </div>
                  <div class="bar-track">
                    <i :style="{ width: `${Math.max((item.profit / maxZoneProfit) * 100, 4)}%` }" />
                  </div>
                  <em>{{ formatMoney(item.profit) }}</em>
                </button>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <h2>渠道收入结构</h2>
                <span>{{ selectedMonth || "全部月份" }}</span>
              </div>
              <div class="channel-list">
                <div v-for="item in channelItems" :key="item.label" class="channel-row">
                  <div class="channel-icon">
                    <el-icon><Grid /></el-icon>
                  </div>
                  <div class="channel-body">
                    <div class="row-label">
                      <strong>{{ item.label }}</strong>
                      <span>{{ formatMoney(item.revenue) }}</span>
                    </div>
                    <div class="bar-track warm">
                      <i :style="{ width: `${Math.max((item.revenue / maxChannelRevenue) * 100, 4)}%` }" />
                    </div>
                    <small>毛利率 {{ formatPercent(item.profitRate) }}</small>
                  </div>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <h2>月度趋势</h2>
                <span>2026 年内 · 营收 / 毛利率</span>
              </div>
              <div class="trend-chart">
                <svg
                  :viewBox="`0 0 ${trendChart.width} ${trendChart.height}`"
                  role="img"
                  aria-label="2026年月度营收趋势"
                >
                  <polyline class="trend-line-shadow" :points="trendChart.points" />
                  <polyline class="trend-line" :points="trendChart.points" />
                  <circle
                    v-for="point in trendChart.points.split(' ').filter(Boolean)"
                    :key="point"
                    :cx="point.split(',')[0]"
                    :cy="point.split(',')[1]"
                    r="3.8"
                  />
                </svg>
                <div class="trend-axis">
                  <span v-for="item in monthlyTrend" :key="item.month">{{ item.month.slice(4) }}月</span>
                </div>
                <div class="trend-summary">
                  <div v-for="item in monthlyTrend" :key="`${item.month}-summary`">
                    <span>{{ item.month }}</span>
                    <strong>{{ formatMoney(item.revenue) }}</strong>
                    <em>{{ formatPercent(item.profitRate) }}</em>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section class="report-grid detail-grid motion-row" style="--row-delay: 295ms">
            <article class="panel">
              <div class="panel-title">
                <h2>异常低价风险</h2>
                <span>{{ formatPercent(kpis.refundRate) }} 退款率</span>
              </div>
              <div class="bar-list compact">
                <button
                  v-for="item in riskSignals"
                  :key="item.zone"
                  type="button"
                  class="bar-row interactive-row"
                  @click="selectOverviewZone(item.zone)"
                >
                  <div class="row-label">
                    <strong>{{ formatRegionName(item.zone) }}</strong>
                    <span>{{ formatPercent(item.lowPriceRate) }}</span>
                  </div>
                  <div class="bar-track danger">
                    <i :style="{ width: `${Math.max((item.lowPriceRate / maxRisk) * 100, 4)}%` }" />
                  </div>
                </button>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <h2>区域健康度</h2>
                <span>低于全国均值占比</span>
              </div>
              <div class="health-map">
                <button
                  v-for="item in zoneHealth"
                  :key="`${item.month}-${item.zone}`"
                  type="button"
                  class="health-map-row interactive-row"
                  :class="getHealthTone(item.belowNationalRatio)"
                  @click="selectOverviewZone(item.zone)"
                >
                  <strong>{{ formatRegionName(item.zone) }}</strong>
                  <div class="health-map-body">
                    <span>
                      <b>{{ item.pattern }}</b>
                      <em>{{ formatPercent(item.belowNationalRatio) }}</em>
                    </span>
                    <div class="health-scale">
                      <i :style="{ width: `${Math.max((item.belowNationalRatio / maxZoneHealth) * 100, 4)}%` }" />
                    </div>
                  </div>
                </button>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <h2>套餐毛利达标</h2>
                <span>实际 vs 理论</span>
              </div>
              <div class="bar-list compact">
                <button
                  v-for="item in comboMargins"
                  :key="`${item.month}-${item.zone}`"
                  type="button"
                  class="bar-row interactive-row"
                  @click="selectOverviewZone(item.zone)"
                >
                  <div class="row-label">
                    <strong>{{ formatRegionName(item.zone) }}</strong>
                    <span>{{ formatPercent(item.passRate) }}</span>
                  </div>
                  <div class="bar-track green">
                    <i :style="{ width: `${Math.max((item.passRate / maxCombo) * 100, 4)}%` }" />
                  </div>
                </button>
              </div>
            </article>
          </section>
        </template>

        <section
          class="report-grid overview-diagnostic-grid motion-row-group"
          :class="[
            { 'zone-focused-analysis-grid': isZoneFocused },
            isZoneFocused ? 'zone-analysis-motion' : 'overview-diagnostic-motion',
          ]"
        >
          <article v-if="isZoneFocused" class="panel">
            <div class="panel-title">
              <h2>渠道收入结构</h2>
              <span>{{ selectedMonth || "全部月份" }}</span>
            </div>
            <div class="channel-list">
              <div v-for="item in channelItems" :key="item.label" class="channel-row">
                <div class="channel-icon">
                  <el-icon><Grid /></el-icon>
                </div>
                <div class="channel-body">
                  <div class="row-label">
                    <strong>{{ item.label }}</strong>
                    <span>{{ formatMoney(item.revenue) }}</span>
                  </div>
                  <div class="bar-track warm">
                    <i :style="{ width: `${Math.max((item.revenue / maxChannelRevenue) * 100, 4)}%` }" />
                  </div>
                  <small>毛利率 {{ formatPercent(item.profitRate) }}</small>
                </div>
              </div>
            </div>
          </article>

          <article v-if="isZoneFocused" class="panel">
            <div class="panel-title">
              <h2>月度走势</h2>
              <span>
                环比观察 {{ formatPercent(focusedTrendLift) }}
              </span>
            </div>
            <div class="trend-chart">
              <svg
                :viewBox="`0 0 ${trendChart.width} ${trendChart.height}`"
                role="img"
                aria-label="选中区域月度营收趋势"
              >
                <polyline class="trend-line-shadow" :points="trendChart.points" />
                <polyline class="trend-line" :points="trendChart.points" />
                <circle
                  v-for="point in trendChart.points.split(' ').filter(Boolean)"
                  :key="point"
                  :cx="point.split(',')[0]"
                  :cy="point.split(',')[1]"
                  r="3.8"
                />
              </svg>
              <div class="trend-axis">
                <span v-for="item in monthlyTrend" :key="item.month">{{ item.month.slice(4) }}月</span>
              </div>
              <div class="zone-trend-summary">
                <div>
                  <span>期初营收</span>
                  <strong>{{ formatMoney(focusedTrendStart.revenue) }}</strong>
                </div>
                <div>
                  <span>期末营收</span>
                  <strong>{{ formatMoney(focusedTrendEnd.revenue) }}</strong>
                </div>
                <div>
                  <span>期末毛利率</span>
                  <strong>{{ formatPercent(focusedTrendEnd.profitRate) }}</strong>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>渠道经营结构</h2>
              <span>收入 / 订单 / 客单价</span>
            </div>
            <div class="diagnostic-list">
              <div
                v-for="item in operatingChannels"
                :key="item.channel"
                class="diagnostic-row"
              >
                <div class="diagnostic-label">
                  <strong>{{ item.channel }}</strong>
                  <span>{{ formatNumber(item.orders) }} 单</span>
                </div>
                <div class="diagnostic-body">
                  <div class="row-label">
                    <span>{{ formatMoney(item.revenue) }}</span>
                    <em>客单 {{ Number(item.avgOrderValue || 0).toFixed(1) }}</em>
                  </div>
                  <div class="bar-track">
                    <i :style="{ width: `${Math.max((item.revenue / maxOperatingRevenue) * 100, 4)}%` }" />
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>客群结构</h2>
              <span>新客 / 会员</span>
            </div>
            <div v-if="isZoneFocused" class="focused-diagnostic">
              <div class="audience-portrait">
                <div class="audience-donut" :style="customerDonutStyle">
                  <div>
                    <strong>{{ formatPercent(focusedCustomerStructure.newOrderRate) }}</strong>
                    <span>新客订单</span>
                  </div>
                </div>
                <div class="audience-profile-bars">
                  <div
                    v-for="item in customerProfileBars"
                    :key="item.label"
                    class="audience-profile-row"
                  >
                    <span>
                      <b>{{ item.label }}</b>
                      <em>{{ formatPercent(item.value) }}</em>
                    </span>
                    <div class="bar-track" :class="item.tone">
                      <i :style="{ width: `${Math.max(item.value * 100, 4)}%` }" />
                    </div>
                    <small>{{ item.meta }}</small>
                  </div>
                </div>
              </div>
              <div class="audience-insights">
                <div class="audience-insight-card warm">
                  <span>新客收入</span>
                  <strong>{{ formatPercent(focusedCustomerStructure.newRevRate) }}</strong>
                </div>
                <div class="audience-insight-card primary">
                  <span>会员收入</span>
                  <strong>{{ formatPercent(focusedCustomerStructure.memberRevRate) }}</strong>
                </div>
                <div class="audience-insight-card total">
                  <span>总收入</span>
                  <strong>{{ formatMoney(focusedCustomerStructure.totalRevenue) }}</strong>
                </div>
              </div>
            </div>
            <div v-else class="audience-matrix">
              <button
                v-for="item in customerStructureMatrix"
                :key="item.zone"
                type="button"
                class="audience-matrix-row interactive-row"
                @click="selectOverviewZone(item.zone)"
              >
                <div class="audience-matrix-label">
                  <strong>{{ formatRegionName(item.zone) }}</strong>
                  <span>会员收入 {{ formatPercent(item.memberRevRate) }}</span>
                </div>
                <div class="audience-stack" :title="`${formatRegionName(item.zone)} 客群结构`">
                  <i class="new" :style="{ width: `${Math.max(item.newShare * 100, 4)}%` }" />
                  <i class="returning" :style="{ width: `${Math.max(item.returningShare * 100, 4)}%` }" />
                  <i class="member" :style="{ width: `${Math.max(item.memberShare * 100, 4)}%` }" />
                </div>
                <div class="audience-matrix-meta">
                  <span>新客 {{ formatPercent(item.newOrderRate) }}</span>
                  <em>新客收入 {{ formatPercent(item.newRevRate) }}</em>
                </div>
              </button>
              <div class="audience-matrix-legend">
                <span><i class="new" />新客</span>
                <span><i class="returning" />老客</span>
                <span><i class="member" />会员</span>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>成本与渠道毛利</h2>
              <span>食材成本 / 渠道毛利</span>
            </div>
            <div v-if="isZoneFocused" class="focused-diagnostic">
              <div class="margin-radar-card">
                <svg
                  class="margin-radar"
                  viewBox="0 0 180 150"
                  role="img"
                  aria-label="渠道毛利雷达图"
                >
                  <polygon class="radar-grid outer" points="90,24 148,116 32,116" />
                  <polygon class="radar-grid inner" points="90,52 124,104 56,104" />
                  <line x1="90" y1="82" x2="90" y2="24" />
                  <line x1="90" y1="82" x2="148" y2="116" />
                  <line x1="90" y1="82" x2="32" y2="116" />
                  <polygon class="radar-area" :points="marginRadarPoints" />
                  <circle
                    v-for="point in marginRadarDots"
                    :key="point.key"
                    :cx="point.x"
                    :cy="point.y"
                    r="3.6"
                  />
                  <text x="90" y="16" text-anchor="middle">堂食</text>
                  <text x="160" y="130" text-anchor="end">外卖</text>
                  <text x="20" y="130">团购</text>
                </svg>
                <div class="cost-pressure">
                  <span>
                    <b>食材成本率</b>
                    <em>{{ formatPercent(focusedCostMargin.materialCostRate) }}</em>
                  </span>
                  <div class="bar-track danger">
                    <i :style="{ width: `${Math.max(focusedMaterialCostRate * 100, 4)}%` }" />
                  </div>
                  <small>{{ currentZoneName }}成本压力画像</small>
                </div>
              </div>
              <div class="margin-radar-legend">
                <div
                  v-for="item in marginRadarMetrics"
                  :key="`${item.label}-focused-margin`"
                  class="margin-channel-card"
                  :class="item.tone"
                >
                  <span>{{ item.label }}</span>
                  <strong>{{ formatPercent(item.value) }}</strong>
                  <div class="bar-track" :class="item.tone">
                    <i :style="{ width: `${Math.max(item.value * 100, 4)}%` }" />
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="heat-matrix">
              <div class="heat-matrix-header">
                <span>区域</span>
                <span>食材</span>
                <span>堂食</span>
                <span>外卖</span>
                <span>团购</span>
              </div>
              <button
                v-for="item in costMarginHeatRows"
                :key="item.zone"
                type="button"
                class="heat-matrix-row interactive-row"
                @click="selectOverviewZone(item.zone)"
              >
                <strong>{{ formatRegionName(item.zone) }}</strong>
                <div
                  v-for="cell in item.cells"
                  :key="cell.key"
                  class="heat-cell"
                  :class="[cell.tone, { 'ranked-cell': cell.key === 'material' && item.materialRank }]"
                  :style="getHeatCellStyle(cell.value, cell.tone)"
                >
                  <span>{{ formatPercent(cell.value) }}</span>
                  <b
                    v-if="cell.key === 'material' && item.materialRank"
                    class="heat-rank-badge"
                  >
                    {{ item.materialRank }}
                  </b>
                </div>
              </button>
            </div>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>门店头尾差距</h2>
              <span>Top20 vs Bottom20</span>
            </div>
            <div v-if="isZoneFocused" class="focused-diagnostic">
              <div class="head-tail-visual">
                <div class="profit-column top">
                  <span>头部 Top20</span>
                  <div class="profit-column-track">
                    <i :style="{ height: `${Math.max((Math.abs(Number(focusedHeadTailGap.top20Profit || 0)) / headTailMaxProfit) * 100, 8)}%` }" />
                  </div>
                  <strong>{{ formatMoney(focusedHeadTailGap.top20Profit) }}</strong>
                </div>
                <div class="gap-bridge">
                  <span>利润差距</span>
                  <strong>{{ formatMoney(focusedHeadTailGap.profitGap) }}</strong>
                  <small>Top20 - Bottom20</small>
                  <em>{{ selectedMonth || focusedHeadTailGap.month }}</em>
                </div>
                <div class="profit-column bottom">
                  <span>尾部 Bottom20</span>
                  <div class="profit-column-track">
                    <i :style="{ height: `${Math.max((Math.abs(Number(focusedHeadTailGap.bottom20Profit || 0)) / headTailMaxProfit) * 100, 8)}%` }" />
                  </div>
                  <strong>{{ formatMoney(focusedHeadTailGap.bottom20Profit) }}</strong>
                </div>
              </div>
              <div class="repair-meter">
                <span>
                  <b>尾部门店修复空间</b>
                  <em>{{ formatMoney(focusedHeadTailGap.profitGap) }}</em>
                </span>
                <div class="bar-track green">
                  <i :style="{ width: `${Math.max((Number(focusedHeadTailGap.profitGap || 0) / maxHeadTailGap) * 100, 4)}%` }" />
                </div>
              </div>
            </div>
            <div v-else class="head-tail-range-list">
              <button
                v-for="item in headTailRangeRows"
                :key="`${item.month}-${item.zone}`"
                type="button"
                class="head-tail-range-row interactive-row"
                @click="selectOverviewZone(item.zone)"
              >
                <div class="head-tail-range-label">
                  <strong>{{ formatRegionName(item.zone) }}</strong>
                  <span>{{ formatMoney(item.bottom20Profit) }} → {{ formatMoney(item.top20Profit) }}</span>
                </div>
                <div class="head-tail-range-track">
                  <i :style="{ width: `${Math.max(item.gapShare * 100, 4)}%` }" />
                </div>
                <em>{{ formatMoney(item.profitGap) }}</em>
              </button>
            </div>
          </article>
        </section>
        </section>

        <section
          v-else-if="activeReportTab === 'quadrant'"
          key="quadrant"
          class="quadrant-section report-view-panel"
        >
          <div class="section-heading motion-row" style="--row-delay: 20ms">
            <div>
              <h2>收入规模 × 利润效率</h2>
            </div>
            <p>
              {{ quadrantAnalysis.period }} · 收入中位数
              {{ quadrantAnalysis.thresholds?.revenueMedianWan }}万 · 利润率中位数
              {{ formatPercent(quadrantAnalysis.thresholds?.profitRateMedian) }}
            </p>
          </div>

        <section class="recommendation-band motion-row" style="--row-delay: 115ms">
          <article v-for="item in recommendations" :key="item.target" class="panel">
            <div class="recommendation-title">
              <el-icon><PriceTag /></el-icon>
              <h2>{{ item.target }}</h2>
              <span>{{ item.theme }}</span>
            </div>
            <p>{{ item.action }}</p>
          </article>
        </section>

        <section class="quadrant-grid motion-row" style="--row-delay: 215ms">
          <article
            v-for="item in overallQuadrants"
            :key="item.quadrant"
            class="panel quadrant-card"
          >
            <div class="panel-title">
              <h2>{{ item.quadrant }}</h2>
              <span>{{ formatNumber(item.storeCount) }} 家</span>
            </div>
            <strong>{{ formatMoney(item.revenueWan * 10000) }}</strong>
            <div class="bar-track">
              <i :style="{ width: `${Math.max((item.revenueWan / maxQuadrantRevenue) * 100, 4)}%` }" />
            </div>
            <dl class="metric-pairs">
              <div>
                <dt>利润率</dt>
                <dd>{{ formatPercent(item.profitRate) }}</dd>
              </div>
              <div>
                <dt>外卖占比</dt>
                <dd>{{ formatPercent(item.deliveryShare) }}</dd>
              </div>
              <div>
                <dt>低价订单</dt>
                <dd>{{ formatPercent(item.lowPriceRate) }}</dd>
              </div>
              <div>
                <dt>单品达标</dt>
                <dd>{{ formatPercent(item.itemMarginPassRate) }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section class="report-grid quadrant-main-grid motion-row" style="--row-delay: 315ms">
          <article class="panel">
            <div class="panel-title">
              <h2>利润率正向驱动</h2>
              <span>Spearman</span>
            </div>
            <div class="driver-list">
              <div v-for="item in positiveDrivers" :key="item.metric" class="driver-row">
                <div class="row-label">
                  <strong>{{ item.metric }}</strong>
                  <span>{{ item.spearman.toFixed(3) }}</span>
                </div>
                <div class="bar-track green">
                  <i :style="{ width: `${Math.max((Math.abs(item.spearman) / maxDriverCorrelation) * 100, 4)}%` }" />
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>利润率负向驱动</h2>
              <span>Spearman</span>
            </div>
            <div class="driver-list">
              <div v-for="item in negativeDrivers" :key="item.metric" class="driver-row">
                <div class="row-label">
                  <strong>{{ item.metric }}</strong>
                  <span>{{ item.spearman.toFixed(3) }}</span>
                </div>
                <div class="bar-track danger">
                  <i :style="{ width: `${Math.max((Math.abs(item.spearman) / maxDriverCorrelation) * 100, 4)}%` }" />
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>高收低利差异定位</h2>
              <span>对比高收高利</span>
            </div>
            <div class="gap-list">
              <div v-for="item in highIncomeGap" :key="item.metric">
                <strong>{{ item.metric }}</strong>
                <span>{{ formatMetricValue(item, item.lowProfit) }}</span>
                <span>{{ formatMetricValue(item, item.highProfit) }}</span>
                <em>{{ formatSignedMetricValue(item, item.difference) }}</em>
              </div>
            </div>
          </article>
        </section>

        <section class="report-grid quadrant-wide-grid motion-row" style="--row-delay: 415ms">
          <article class="panel">
            <div class="panel-title">
              <h2>套餐结构 × 渠道</h2>
              <span>按象限拆分</span>
            </div>
            <div class="combo-quadrant-grid">
              <div
                v-for="group in comboChannelGroups"
                :key="group.quadrant"
                class="combo-quadrant-card"
              >
                <h3>{{ group.quadrant }}</h3>
                <div
                  v-for="item in group.channels"
                  :key="`${item.quadrant}-${item.channel}`"
                  class="combo-channel-row"
                >
                  <span>{{ item.channel }}</span>
                  <div class="bar-track warm">
                    <i :style="{ width: `${Math.max((item.revenueWan / maxComboChannelRevenue) * 100, 4)}%` }" />
                  </div>
                  <em>{{ formatPercent(item.share) }}</em>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>高频套餐结构</h2>
              <span>Top 结构</span>
            </div>
            <div class="structure-flow-list">
              <div
                v-for="item in topComboStructures"
                :key="`${item.quadrant}-${item.structure}`"
                class="structure-flow-row"
              >
                <strong>{{ item.structure }}</strong>
                <div class="structure-flow-body">
                  <span>
                    <b>{{ item.quadrant }} · {{ item.channel }}</b>
                    <em>{{ formatMoney(item.revenueWan * 10000) }} / {{ item.avgPrice.toFixed(1) }}</em>
                  </span>
                  <div class="mini-track">
                    <i :style="{ width: `${Math.max((item.revenueWan / maxTopComboRevenue) * 100, 4)}%` }" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section class="province-quadrant-section motion-row" style="--row-delay: 515ms">
          <article class="panel province-panel">
            <div class="panel-title">
              <h2>六省省内四象限</h2>
              <span>收入 × 利润矩阵</span>
            </div>
            <div class="province-matrix">
              <span class="matrix-axis y-top">利润高</span>
              <span class="matrix-axis y-bottom">利润低</span>
              <span class="matrix-axis x-left">收入低</span>
              <span class="matrix-axis x-right">收入高</span>
              <section
                v-for="group in provinceQuadrantMatrix"
                :key="group.quadrant"
                class="province-matrix-cell"
              >
                <h3>{{ group.quadrant }}</h3>
                <div
                  v-for="item in group.provinces"
                  :key="`${item.province}-${item.quadrant}`"
                  class="province-scatter-point"
                  :style="{ left: `${item.x}%`, bottom: `${item.y}%` }"
                  :title="`${item.province} · 收入 ${formatMoney(item.revenueWan * 10000)} · 利润率 ${formatPercent(item.profitRate)}`"
                >
                  <i
                    class="province-bubble"
                    :style="{ width: `${10 + (item.revenueWan / maxProvinceRevenue) * 24}px`, height: `${10 + (item.revenueWan / maxProvinceRevenue) * 24}px` }"
                  />
                  <span>
                    <strong>{{ item.province }}</strong>
                    <em>{{ formatPercent(item.profitRate) }}</em>
                  </span>
                </div>
              </section>
            </div>
          </article>

          <article class="panel">
            <div class="panel-title">
              <h2>区域补充诊断</h2>
              <span>按省份诊断</span>
            </div>
            <div class="regional-story-list">
              <div
                v-for="item in regionalDiagnosticCards"
                :key="`${item.province}-diagnostic`"
                class="regional-story-row"
              >
                <strong>{{ item.province }}</strong>
                <div class="story-metric">
                  <span>
                    <b>健康风险</b>
                    <em>{{ formatPercent(item.belowNationalRatio) }}</em>
                  </span>
                  <div class="mini-track danger-line">
                    <i :style="{ width: `${Math.max(((item.belowNationalRatio || 0) / maxRegionalBelowRatio) * 100, 4)}%` }" />
                  </div>
                </div>
                <div class="story-metric">
                  <span>
                    <b>头尾差距</b>
                    <em>{{ Number(item.gapWan || 0).toFixed(1) }}万</em>
                  </span>
                  <div class="mini-track">
                    <i :style="{ width: `${Math.max(((item.gapWan || 0) / maxRegionalGap) * 100, 4)}%` }" />
                  </div>
                </div>
                <div class="story-metric">
                  <span>
                    <b>套餐达标</b>
                    <em>{{ formatPercent(item.passRate) }}</em>
                  </span>
                  <div class="mini-track success-line">
                    <i :style="{ width: `${Math.max(((item.passRate || 0) / maxRegionalComboPassRate) * 100, 4)}%` }" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      </section>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
  .wallace-page {
    --page-bg: #ffffff;
    --panel-bg: #ffffff;
    --panel-subtle: #ffffff;
    --panel-border: #ebe8f1;
    --line: #f0edf5;
    --text: #181322;
    --muted: #746b82;
    --soft-text: #8a8198;
    --primary: #7b75ad;
    --primary-deep: #696298;
    --primary-soft: #f0eef8;
    --track: #f0eef5;
    --success: #78958b;
    --danger: #d8c789;
    --accent: #948bb5;
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: var(--page-bg);
    color: var(--text);
  }

  .report-shell {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 22px 26px 28px;
    overflow: auto;
  }

  .report-view-panel {
    animation: report-page-in 280ms ease both;
  }

  .report-tab-enter-active {
    transition: opacity 220ms ease, transform 220ms ease;
  }

  .report-tab-leave-active {
    transition: opacity 120ms ease, transform 120ms ease;
  }

  .report-tab-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .report-tab-leave-to {
    opacity: 0;
    transform: translateY(4px);
  }

  .report-view-panel .motion-row,
  .report-view-panel .motion-row-group > .panel {
    animation: report-row-in 440ms cubic-bezier(0.2, 0.72, 0.28, 1) both;
    animation-delay: var(--row-delay, 80ms);
  }

  .overview-diagnostic-motion > .panel:nth-child(-n + 2) {
    --row-delay: 390ms;
  }

  .overview-diagnostic-motion > .panel:nth-child(n + 3) {
    --row-delay: 490ms;
  }

  .zone-analysis-motion > .panel:nth-child(-n + 3) {
    --row-delay: 300ms;
  }

  .zone-analysis-motion > .panel:nth-child(n + 4) {
    --row-delay: 400ms;
  }

  .motion-row > .kpi-cell,
  .motion-row > .panel,
  .province-quadrant-section.motion-row > .panel {
    animation: report-row-child-in 300ms cubic-bezier(0.2, 0.72, 0.28, 1) both;
    animation-delay: calc(var(--row-delay, 80ms) + var(--cell-offset, 0ms));
  }

  .motion-row > :nth-child(2),
  .motion-row-group > .panel:nth-child(2) {
    --cell-offset: 18ms;
  }

  .motion-row > :nth-child(3),
  .motion-row-group > .panel:nth-child(3) {
    --cell-offset: 36ms;
  }

  .motion-row > :nth-child(4),
  .motion-row-group > .panel:nth-child(4) {
    --cell-offset: 18ms;
  }

  .motion-row > :nth-child(5),
  .motion-row-group > .panel:nth-child(5) {
    --cell-offset: 36ms;
  }

  .motion-row > :nth-child(6),
  .motion-row-group > .panel:nth-child(6) {
    --cell-offset: 54ms;
  }

  .report-view-panel .bar-track i,
  .report-view-panel .health-scale i,
  .report-view-panel .mini-track i,
  .report-view-panel .head-tail-range-track i {
    transform-origin: left center;
    animation: report-bar-in 520ms cubic-bezier(0.2, 0.72, 0.28, 1) both;
    animation-delay: calc(var(--row-delay, 120ms) + var(--cell-offset, 0ms) + 150ms);
  }

  .report-view-panel .profit-column-track i {
    transform-origin: center bottom;
    animation: report-bar-y-in 520ms cubic-bezier(0.2, 0.72, 0.28, 1) both;
    animation-delay: calc(var(--row-delay, 120ms) + var(--cell-offset, 0ms) + 150ms);
  }

  .report-view-panel .trend-chart svg,
  .report-view-panel .margin-radar,
  .report-view-panel .province-scatter-point,
  .report-view-panel .audience-donut {
    animation: report-chart-in 420ms ease both;
    animation-delay: calc(var(--row-delay, 120ms) + var(--cell-offset, 0ms) + 110ms);
  }

  @keyframes report-page-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes report-row-in {
    from {
      opacity: 0;
      transform: translateY(16px);
      filter: saturate(0.92);
    }
    to {
      opacity: 1;
      transform: translateY(0);
      filter: saturate(1);
    }
  }

  @keyframes report-row-child-in {
    from {
      opacity: 0.72;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes report-chart-in {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes report-bar-in {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  @keyframes report-bar-y-in {
    from {
      transform: scaleY(0);
    }
    to {
      transform: scaleY(1);
    }
  }

  .report-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 14px;
  }

  .eyebrow {
    display: block;
    margin-bottom: 6px;
    color: var(--muted);
    font-size: 13px;
  }

  .report-header h1 {
    margin: 0;
    color: var(--text);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0;
  }

  .report-header p {
    max-width: 720px;
    margin: 8px 0 0;
    overflow: hidden;
    color: var(--muted);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .filters {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 10px;
  }

  .filters .el-select {
    width: 150px;
  }

  .filters :deep(.el-select__wrapper) {
    border-color: var(--panel-border);
    background: var(--panel-bg);
    box-shadow: 0 0 0 1px var(--panel-border) inset;
  }

  .filters :deep(.el-select__wrapper:hover),
  .filters :deep(.el-select__wrapper.is-focused) {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary) inset;
  }

  .filters :deep(.el-select__placeholder),
  .filters :deep(.el-select__selected-item) {
    color: var(--muted);
  }

  .report-tabs {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 18px;
    padding: 4px;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: #ffffff;
  }

  .report-tab-option {
    height: 34px;
    padding: 0 16px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
  }

  .report-tab-option input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .report-tab-option.active {
    background: var(--primary-soft);
    color: var(--primary-deep);
    font-weight: 700;
  }

  .overview-tools {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    gap: 8px;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .kpi-cell {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 5px 10px;
    align-items: center;
    min-height: 92px;
    padding: 16px;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: var(--panel-bg);
  }

  .kpi-cell .el-icon {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--primary-soft);
    color: var(--primary-deep);
    font-size: 18px;
  }

  .kpi-cell span {
    color: var(--muted);
    font-size: 13px;
  }

  .kpi-cell strong {
    color: var(--text);
    font-size: 24px;
    line-height: 1.1;
  }

  .kpi-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 5px;
  }

  .report-grid {
    display: grid;
    gap: 14px;
  }

  .main-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 14px;
  }

  .detail-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .overview-diagnostic-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 14px;
  }

  .zone-focused-analysis-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .zone-focused-analysis-grid .audience-portrait,
  .zone-focused-analysis-grid .margin-radar-card,
  .zone-focused-analysis-grid .head-tail-visual {
    box-sizing: border-box;
    min-height: 164px;
  }

  .zone-focused-analysis-grid .audience-portrait {
    height: 164px;
    grid-template-columns: 112px minmax(0, 1fr);
  }

  .zone-focused-analysis-grid .audience-donut {
    width: 112px;
  }

  .zone-focused-analysis-grid .audience-donut div {
    align-content: center;
    gap: 3px;
    justify-items: center;
    width: 72px;
  }

  .zone-focused-analysis-grid .audience-donut strong {
    font-size: 17px;
  }

  .zone-focused-analysis-grid .audience-profile-bars {
    gap: 6px;
  }

  .zone-focused-analysis-grid .audience-profile-row {
    gap: 3px;
  }

  .zone-focused-analysis-grid .audience-profile-row small {
    font-size: 10px;
    line-height: 1.2;
  }

  .zone-focus-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }

  .zone-focus-wide-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .zone-focus-card {
    display: flex;
    min-height: 260px;
    flex-direction: column;
  }

  .zone-hero-metric {
    display: grid;
    position: relative;
    gap: 7px;
    box-sizing: border-box;
    min-height: 120px;
    padding: 6px 0 8px 18px;
    border: 0;
    background: transparent;
  }

  .zone-hero-metric::before {
    position: absolute;
    top: 8px;
    bottom: 10px;
    left: 0;
    width: 4px;
    border-radius: 999px;
    background: linear-gradient(180deg, var(--primary), var(--success));
    content: "";
  }

  .zone-hero-metric span,
  .zone-pass-meter span,
  .zone-risk-item span,
  .zone-trend-summary span {
    display: block;
    color: var(--muted);
    font-size: 12px;
  }

  .zone-hero-metric strong {
    display: block;
    margin-top: 0;
    color: var(--text);
    font-size: 38px;
    font-weight: 700;
    line-height: 1;
  }

  .zone-hero-metric em {
    display: block;
    margin-top: 0;
    color: var(--soft-text);
    font-size: 12px;
    font-style: normal;
  }

  .zone-metric-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin: 18px 0 0;
    padding-top: 14px;
    background: linear-gradient(var(--line), var(--line)) top / 100% 1px no-repeat;
  }

  .zone-metric-list div,
  .zone-risk-item,
  .zone-trend-summary div {
    position: relative;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .zone-metric-list div {
    display: grid;
    gap: 4px;
    padding-left: 12px;
  }

  .zone-metric-list div::before {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 0;
    width: 3px;
    border-radius: 999px;
    background: var(--primary);
    content: "";
  }

  .zone-metric-list div:nth-child(2)::before {
    background: var(--success);
  }

  .zone-metric-list div:nth-child(3)::before {
    background: var(--danger);
  }

  .zone-metric-list dt {
    margin: 0 0 5px;
    color: var(--muted);
    font-size: 12px;
  }

  .zone-metric-list dd,
  .zone-risk-item strong,
  .zone-trend-summary strong {
    margin: 0;
    color: var(--text);
    font-size: 16px;
    font-weight: 700;
  }

  .compact-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .zone-risk-stack {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    padding-top: 4px;
  }

  .zone-risk-item {
    display: grid;
    gap: 8px;
  }

  .zone-risk-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .zone-risk-item strong {
    color: var(--primary);
    white-space: nowrap;
  }

  .zone-risk-item.danger strong {
    color: var(--danger);
  }

  .zone-note {
    margin: auto 0 0;
    padding-top: 14px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.7;
  }

  .zone-pass-meter {
    display: grid;
    box-sizing: border-box;
    gap: 8px;
    min-height: 120px;
    padding: 6px 0 8px;
    border: 0;
    background: transparent;
  }

  .zone-pass-meter strong {
    color: var(--success);
    font-size: 34px;
    line-height: 1;
  }

  .zone-trend-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 16px;
    padding-top: 12px;
    background: linear-gradient(var(--line), var(--line)) top / 100% 1px no-repeat;
  }

  .zone-trend-summary div {
    display: grid;
    gap: 4px;
  }

  .overview-section {
    margin-bottom: 18px;
  }

  .overview-heading {
    margin-top: 0;
  }

  .quadrant-section {
    margin-top: 18px;
  }

  .section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin: 8px 0 14px;
  }

  .section-heading h2 {
    margin: 0;
    color: var(--text);
    font-size: 22px;
    letter-spacing: 0;
  }

  .section-heading p {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
  }

  .quadrant-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }

  .quadrant-card {
    min-height: 242px;
  }

  .quadrant-card > strong {
    display: block;
    margin-bottom: 12px;
    color: var(--text);
    font-size: 26px;
    line-height: 1.1;
  }

  .metric-pairs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 14px;
    margin: 16px 0 0;
  }

  .metric-pairs div {
    min-width: 0;
  }

  .metric-pairs dt {
    margin: 0 0 4px;
    color: var(--soft-text);
    font-size: 12px;
  }

  .metric-pairs dd {
    margin: 0;
    color: var(--text);
    font-size: 15px;
    font-weight: 700;
  }

  .quadrant-main-grid {
    grid-template-columns: 1fr 1fr 1.15fr;
    margin-bottom: 14px;
  }

  .quadrant-wide-grid {
    grid-template-columns: minmax(0, 1fr) calc((100% - 28px) * 1.15 / 3.15);
    margin-bottom: 14px;
  }

  .panel {
    min-height: 280px;
    padding: 18px;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: var(--panel-bg);
  }

  .panel-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .panel-title h2 {
    margin: 0;
    color: var(--text);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0;
  }

  .panel-title span {
    color: var(--muted);
    font-size: 12px;
  }

  .bar-list,
  .channel-list,
  .health-map,
  .diagnostic-list,
  .driver-list,
  .gap-list,
  .structure-flow-list,
  .combo-quadrant-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bar-row {
    display: grid;
    grid-template-columns: minmax(130px, 1fr) minmax(120px, 1.5fr) 70px;
    align-items: center;
    gap: 10px;
  }

  .interactive-row {
    width: 100%;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.16s ease, transform 0.16s ease;
  }

  .interactive-row:hover,
  .interactive-row:focus-visible {
    background: rgba(123, 117, 173, 0.07);
    outline: none;
    transform: translateX(2px);
  }

  .compact .bar-row {
    grid-template-columns: minmax(120px, 1fr) minmax(110px, 1.2fr);
  }

  .driver-row {
    display: grid;
    grid-template-columns: minmax(130px, 1fr) minmax(120px, 1.15fr);
    gap: 10px;
    align-items: center;
  }

  .diagnostic-row {
    display: grid;
    grid-template-columns: minmax(110px, 0.7fr) minmax(180px, 1.3fr);
    align-items: center;
    gap: 12px;
    min-height: 42px;
  }

  .diagnostic-label {
    min-width: 0;
  }

  .diagnostic-label strong {
    display: block;
    overflow: hidden;
    color: var(--text);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .diagnostic-label span {
    display: block;
    margin-top: 4px;
    color: var(--muted);
    font-size: 11px;
    white-space: nowrap;
  }

  .diagnostic-body {
    min-width: 0;
  }

  .diagnostic-body .row-label {
    margin-bottom: 5px;
  }

  .diagnostic-body em {
    color: var(--muted);
    font-size: 11px;
    font-style: normal;
    text-align: right;
    white-space: nowrap;
  }

  .focused-diagnostic {
    display: grid;
    gap: 12px;
  }

  .focused-metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .focused-metric-grid div,
  .split-diagnostic,
  .channel-margin-list div,
  .gap-hero {
    min-width: 0;
    padding: 12px;
    border: 1px solid rgba(123, 117, 173, 0.16);
    border-radius: 8px;
    background: rgba(250, 249, 255, 0.72);
  }

  .focused-metric-grid span,
  .split-diagnostic span,
  .channel-margin-list span,
  .gap-hero span {
    display: block;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.4;
  }

  .focused-metric-grid strong,
  .channel-margin-list strong,
  .gap-hero strong {
    display: block;
    margin-top: 6px;
    color: var(--text);
    font-size: 20px;
    line-height: 1.1;
  }

  .focused-metric-grid.two-cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .split-diagnostic {
    display: grid;
    gap: 8px;
  }

  .split-diagnostic span {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .split-diagnostic b {
    overflow: hidden;
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .split-diagnostic em {
    color: var(--soft-text);
    font-size: 12px;
    font-style: normal;
    white-space: nowrap;
  }

  .channel-margin-list {
    display: grid;
    gap: 10px;
  }

  .channel-margin-list div {
    display: grid;
    gap: 7px;
  }

  .compact-hero {
    padding: 14px;
  }

  .compact-hero strong {
    font-size: 28px;
  }

  .gap-hero {
    background: linear-gradient(135deg, rgba(36, 142, 93, 0.08), rgba(255, 255, 255, 0.92));
  }

  .gap-hero em {
    display: block;
    margin-top: 6px;
    color: var(--soft-text);
    font-size: 12px;
    font-style: normal;
  }

  .audience-portrait {
    display: grid;
    grid-template-columns: 128px minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    padding-bottom: 14px;
    background: linear-gradient(var(--line), var(--line)) bottom / 100% 1px no-repeat;
  }

  .audience-donut {
    display: grid;
    width: 128px;
    aspect-ratio: 1;
    place-items: center;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(123, 117, 173, 0.14);
  }

  .audience-donut div {
    display: grid;
    width: 82px;
    aspect-ratio: 1;
    place-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.94);
    text-align: center;
  }

  .audience-donut strong {
    color: var(--text);
    font-size: 21px;
    line-height: 1;
  }

  .audience-donut span,
  .audience-profile-row small,
  .cost-pressure small {
    color: var(--muted);
    font-size: 11px;
  }

  .audience-profile-bars {
    display: grid;
    gap: 9px;
  }

  .audience-profile-row {
    display: grid;
    gap: 5px;
    min-width: 0;
  }

  .audience-profile-row > span,
  .cost-pressure > span,
  .repair-meter > span {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--muted);
    font-size: 12px;
  }

  .audience-profile-row b,
  .cost-pressure b,
  .repair-meter b {
    overflow: hidden;
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .audience-profile-row em,
  .cost-pressure em,
  .repair-meter em {
    color: var(--soft-text);
    font-style: normal;
    white-space: nowrap;
  }

  .audience-insights,
  .margin-radar-legend {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .audience-insight-card,
  .margin-channel-card {
    display: grid;
    position: relative;
    min-width: 0;
    gap: 6px;
    overflow: hidden;
    padding: 0 0 0 12px;
    border: 0;
    background: transparent;
  }

  .audience-insight-card::before,
  .margin-channel-card::before {
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 0;
    width: 3px;
    border-radius: 999px;
    background: var(--primary);
    content: "";
  }

  .audience-insight-card.warm::before,
  .margin-channel-card.warm::before {
    background: var(--danger);
  }

  .audience-insight-card.total::before,
  .margin-channel-card.green::before {
    background: var(--success);
  }

  .audience-insight-card span,
  .margin-channel-card span {
    color: var(--soft-text);
    font-size: 11px;
    line-height: 1.2;
  }

  .audience-insight-card strong,
  .margin-channel-card strong {
    overflow: hidden;
    color: var(--text);
    font-size: 16px;
    line-height: 1.1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .audience-insight-card.warm {
    background: transparent;
  }

  .audience-insight-card.primary {
    background: transparent;
  }

  .audience-insight-card.total {
    background: transparent;
  }

  .margin-radar-card {
    display: grid;
    grid-template-columns: 174px minmax(0, 1fr);
    align-items: center;
    gap: 18px;
    padding-bottom: 14px;
    background: linear-gradient(var(--line), var(--line)) bottom / 100% 1px no-repeat;
  }

  .margin-radar {
    width: 100%;
    max-width: 174px;
    overflow: visible;
  }

  .margin-radar .radar-grid {
    fill: rgba(91, 61, 167, 0.04);
    stroke: rgba(123, 117, 173, 0.18);
    stroke-width: 1;
  }

  .margin-radar .radar-grid.inner {
    fill: none;
  }

  .margin-radar line {
    stroke: rgba(123, 117, 173, 0.16);
    stroke-width: 1;
  }

  .margin-radar .radar-area {
    fill: rgba(91, 61, 167, 0.22);
    stroke: var(--primary);
    stroke-linejoin: round;
    stroke-width: 2.5;
  }

  .margin-radar circle {
    fill: var(--primary);
    stroke: #fff;
    stroke-width: 2;
  }

  .margin-radar text {
    fill: var(--muted);
    font-size: 11px;
  }

  .cost-pressure,
  .repair-meter {
    display: grid;
    gap: 10px;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .head-tail-visual {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 104px minmax(0, 1fr);
    align-items: end;
    gap: 10px;
    min-height: 150px;
    padding-bottom: 14px;
    background: linear-gradient(var(--line), var(--line)) bottom / 100% 1px no-repeat;
  }

  .profit-column {
    display: grid;
    justify-items: center;
    gap: 8px;
    min-width: 0;
  }

  .profit-column span {
    color: var(--muted);
    font-size: 11px;
    text-align: center;
  }

  .profit-column strong {
    color: var(--text);
    font-size: 18px;
  }

  .profit-column-track {
    display: flex;
    align-items: flex-end;
    width: 48px;
    height: 94px;
    overflow: hidden;
    border-radius: 999px 999px 8px 8px;
    background: rgba(123, 117, 173, 0.1);
  }

  .profit-column-track i {
    display: block;
    width: 100%;
    border-radius: inherit;
    background: linear-gradient(180deg, var(--primary), rgba(91, 61, 167, 0.68));
  }

  .profit-column.bottom .profit-column-track i {
    background: linear-gradient(180deg, var(--success), rgba(36, 142, 93, 0.68));
  }

  .gap-bridge {
    align-self: center;
    padding: 11px 10px;
    border: 1px solid rgba(91, 61, 167, 0.18);
    border-radius: 12px;
    background:
      radial-gradient(circle at 50% 10%, rgba(91, 61, 167, 0.12), transparent 58%),
      rgba(250, 249, 255, 0.86);
    box-shadow: inset 0 0 0 6px rgba(91, 61, 167, 0.035);
    text-align: center;
  }

  .gap-bridge span,
  .gap-bridge small,
  .gap-bridge em {
    display: block;
    color: var(--muted);
    font-size: 11px;
    font-style: normal;
  }

  .gap-bridge strong {
    display: block;
    margin: 5px 0 4px;
    color: var(--primary);
    font-size: 19px;
    line-height: 1.1;
  }

  .gap-bridge small {
    color: var(--soft-text);
    font-size: 10px;
  }

  .audience-matrix {
    display: grid;
    gap: 11px;
  }

  .audience-matrix-row {
    display: grid;
    grid-template-columns: minmax(84px, 0.55fr) minmax(160px, 1fr) minmax(106px, 0.7fr);
    align-items: center;
    gap: 10px;
    width: 100%;
    min-width: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
  }

  .audience-matrix-label,
  .audience-matrix-meta,
  .head-tail-range-label {
    min-width: 0;
  }

  .audience-matrix-label strong,
  .head-tail-range-label strong {
    display: block;
    overflow: hidden;
    color: var(--text);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .audience-matrix-label span,
  .audience-matrix-meta span,
  .audience-matrix-meta em,
  .head-tail-range-label span {
    display: block;
    overflow: hidden;
    color: var(--muted);
    font-size: 11px;
    font-style: normal;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .audience-stack {
    display: flex;
    height: 13px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--track);
    transition: box-shadow 0.16s ease, filter 0.16s ease, transform 0.16s ease;
  }

  .audience-matrix-row:hover .audience-stack,
  .audience-matrix-row:focus-visible .audience-stack {
    box-shadow: 0 7px 16px rgba(91, 61, 167, 0.14);
    filter: saturate(1.08);
    transform: scaleX(1.015);
    transform-origin: left center;
  }

  .audience-stack i,
  .audience-matrix-legend i {
    display: block;
    height: 100%;
  }

  .audience-stack .new,
  .audience-matrix-legend .new {
    background: var(--accent);
  }

  .audience-stack .returning,
  .audience-matrix-legend .returning {
    background: var(--success);
  }

  .audience-stack .member,
  .audience-matrix-legend .member {
    background: var(--primary);
  }

  .audience-matrix-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    padding-top: 3px;
  }

  .audience-matrix-legend span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--soft-text);
    font-size: 11px;
  }

  .audience-matrix-legend i {
    width: 16px;
    height: 7px;
    border-radius: 999px;
  }

  .heat-matrix {
    display: grid;
    gap: 8px;
  }

  .heat-matrix-header,
  .heat-matrix-row {
    display: grid;
    grid-template-columns: minmax(62px, 0.78fr) repeat(4, minmax(48px, 1fr));
    align-items: center;
    gap: 7px;
    width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
  }

  .heat-matrix-header span {
    color: var(--muted);
    font-size: 11px;
    text-align: center;
  }

  .heat-matrix-header span:first-child,
  .heat-matrix-row strong {
    text-align: left;
  }

  .heat-matrix-row strong {
    overflow: hidden;
    color: var(--text);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .heat-cell {
    position: relative;
    display: grid;
    min-height: 31px;
    place-items: center;
    border: 1px solid rgba(123, 117, 173, 0.1);
    border-radius: 6px;
    transition: box-shadow 0.16s ease, filter 0.16s ease, transform 0.16s ease;
  }

  .heat-matrix-row:hover .heat-cell,
  .heat-matrix-row:focus-visible .heat-cell {
    box-shadow: 0 7px 14px rgba(91, 61, 167, 0.12);
    filter: saturate(1.08);
    transform: translateY(-1px);
  }

  .heat-cell span {
    color: inherit;
    font-size: 11px;
    white-space: nowrap;
  }

  .heat-rank-badge {
    position: absolute;
    top: -7px;
    right: -6px;
    display: grid;
    width: 18px;
    height: 18px;
    place-items: center;
    border: 2px solid #fff;
    border-radius: 999px;
    background: var(--primary);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    box-shadow: 0 4px 10px rgba(91, 61, 167, 0.2);
  }

  .head-tail-range-list {
    display: grid;
    gap: 11px;
  }

  .head-tail-range-row {
    display: grid;
    grid-template-columns: minmax(92px, 0.72fr) minmax(150px, 1fr) 68px;
    align-items: center;
    gap: 10px;
  }

  .head-tail-range-track {
    height: 22px;
    overflow: hidden;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(36, 142, 93, 0.08), rgba(91, 61, 167, 0.08));
  }

  .head-tail-range-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, rgba(36, 142, 93, 0.72), rgba(91, 61, 167, 0.82));
  }

  .head-tail-range-row > em {
    color: var(--primary);
    font-size: 12px;
    font-style: normal;
    text-align: right;
    white-space: nowrap;
  }

  .gap-list div {
    display: grid;
    grid-template-columns: minmax(120px, 1fr) 64px 64px 62px;
    align-items: center;
    gap: 8px;
    min-height: 26px;
  }

  .gap-list strong,
  .combo-channel-row strong,
  .combo-quadrant-card strong,
  .province-matrix-cell strong,
  .regional-story-row strong {
    overflow: hidden;
    color: var(--text);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gap-list span,
  .combo-channel-row span,
  .combo-quadrant-card span {
    color: var(--muted);
    font-size: 12px;
  }

  .gap-list em,
  .combo-channel-row em,
  .combo-quadrant-card em,
  .province-matrix-cell em {
    color: var(--muted);
    font-size: 12px;
    font-style: normal;
    text-align: right;
  }

  .row-label {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  }

  .row-label strong,
  .channel-body strong,
  .health-map-row strong {
    overflow: hidden;
    color: var(--text);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-label span,
  .channel-body span {
    color: var(--muted);
    font-size: 12px;
  }

  .bar-track {
    height: 9px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--track);
  }

  .bar-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--primary);
  }

  .bar-track.warm i {
    background: var(--accent);
  }

  .bar-track.danger i {
    background: var(--danger);
  }

  .bar-track.green i {
    background: var(--success);
  }

  .combo-quadrant-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .combo-quadrant-card {
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .combo-quadrant-card h3 {
    margin: 0 0 10px;
    color: var(--text);
    font-size: 14px;
    letter-spacing: 0;
  }

  .combo-channel-row {
    display: grid;
    grid-template-columns: 42px minmax(76px, 1fr) 48px;
    align-items: center;
    gap: 8px;
    min-height: 30px;
  }

  .structure-flow-row {
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    min-height: 42px;
  }

  .structure-flow-row > strong {
    color: var(--text);
    font-size: 13px;
    white-space: nowrap;
  }

  .structure-flow-body {
    min-width: 0;
  }

  .structure-flow-body span {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }

  .structure-flow-body b,
  .structure-flow-body em {
    color: var(--muted);
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    white-space: nowrap;
  }

  .province-panel {
    min-width: 0;
  }

  .province-quadrant-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 14px;
  }

  .province-quadrant-section > .panel {
    display: flex;
    min-height: 580px;
    flex-direction: column;
  }

  .province-matrix {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    position: relative;
    flex: 1;
    gap: 18px 20px;
    padding: 22px 10px 18px;
  }

  .province-matrix::before,
  .province-matrix::after {
    position: absolute;
    content: "";
    background: var(--line);
  }

  .province-matrix::before {
    top: 20px;
    bottom: 16px;
    left: 50%;
    width: 1px;
  }

  .province-matrix::after {
    right: 10px;
    bottom: 50%;
    left: 10px;
    height: 1px;
  }

  .matrix-axis {
    position: absolute;
    color: var(--soft-text);
    font-size: 10px;
    line-height: 1;
  }

  .matrix-axis.y-top {
    top: 0;
    left: 6px;
  }

  .matrix-axis.y-bottom {
    bottom: 0;
    left: 6px;
  }

  .matrix-axis.x-left {
    bottom: 2px;
    left: 46%;
  }

  .matrix-axis.x-right {
    right: 6px;
    bottom: 2px;
  }

  .province-matrix-cell {
    position: relative;
    z-index: 1;
    min-width: 0;
    min-height: 210px;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .province-matrix-cell h3 {
    margin: 0 0 10px;
    color: var(--soft-text);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0;
  }

  .province-scatter-point {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 72px;
    transform: translate(-50%, 50%);
  }

  .province-bubble {
    display: inline-block;
    flex: 0 0 auto;
    min-width: 8px;
    min-height: 8px;
    border-radius: 999px;
    background: var(--primary);
    opacity: 0.72;
  }

  .province-scatter-point strong {
    color: var(--text);
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
  }

  .province-scatter-point span {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .province-scatter-point em {
    color: var(--muted);
    font-size: 10px;
    font-style: normal;
    line-height: 1;
    white-space: nowrap;
  }

  .regional-story-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-start;
    gap: 8px;
  }

  .regional-story-row {
    display: grid;
    grid-template-columns: 42px repeat(3, minmax(0, 1fr));
    align-items: center;
    gap: 10px;
    min-height: 54px;
    padding: 4px 0;
  }

  .story-metric {
    min-width: 0;
  }

  .story-metric span {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 5px;
  }

  .story-metric b,
  .story-metric em {
    color: var(--muted);
    font-size: 10px;
    font-style: normal;
    white-space: nowrap;
  }

  .mini-track {
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--track);
  }

  .mini-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--primary);
  }

  .mini-track.danger-line i {
    background: var(--danger);
  }

  .mini-track.success-line i {
    background: var(--success);
  }

  .recommendation-band {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }

  .recommendation-band .panel {
    min-height: 150px;
    border-color: var(--panel-border);
    background: var(--panel-subtle);
  }

  .recommendation-title {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .recommendation-title .el-icon {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--primary-soft);
    color: var(--primary-deep);
    font-size: 15px;
  }

  .recommendation-title h2 {
    margin: 0;
    overflow: hidden;
    color: var(--text);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recommendation-title span {
    color: var(--muted);
    font-size: 12px;
    white-space: nowrap;
  }

  .recommendation-band p {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.7;
  }

  .bar-row em {
    color: var(--muted);
    font-size: 12px;
    font-style: normal;
    text-align: right;
  }

  .channel-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .channel-icon {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--primary-soft);
    color: var(--primary-deep);
  }

  .channel-body {
    flex: 1;
    min-width: 0;
  }

  .channel-body small {
    display: block;
    margin-top: 5px;
    color: var(--soft-text);
    font-size: 12px;
  }

  .trend-chart {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .trend-chart svg {
    width: 100%;
    height: 132px;
    overflow: visible;
  }

  .trend-chart circle {
    fill: var(--primary);
    stroke: var(--panel-bg);
    stroke-width: 2;
  }

  .trend-line,
  .trend-line-shadow {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .trend-line {
    stroke: var(--primary);
    stroke-width: 3.5;
  }

  .trend-line-shadow {
    stroke: rgba(102, 84, 209, 0.16);
    stroke-width: 9;
  }

  .trend-axis,
  .trend-summary {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }

  .trend-axis span {
    color: var(--soft-text);
    font-size: 12px;
    text-align: center;
  }

  .trend-summary div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--line);
    text-align: center;
  }

  .trend-summary span {
    color: var(--soft-text);
    font-size: 11px;
  }

  .trend-summary strong {
    color: var(--text);
    font-size: 13px;
  }

  .trend-summary em {
    color: var(--muted);
    font-size: 12px;
    font-style: normal;
  }

  .health-map {
    gap: 8px;
  }

  .health-map-row {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    min-height: 34px;
  }

  .health-map-body {
    min-width: 0;
  }

  .health-map-body span {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 5px;
  }

  .health-map-body b,
  .health-map-body em {
    color: var(--muted);
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    white-space: nowrap;
  }

  .health-map-row.high .health-map-body b,
  .health-map-row.high .health-map-body em {
    color: var(--danger);
  }

  .health-map-row.low .health-map-body b,
  .health-map-row.low .health-map-body em {
    color: var(--success);
  }

  .health-scale {
    height: 6px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--track);
  }

  .health-scale i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--primary);
  }

  .health-map-row.high .health-scale i {
    background: var(--danger);
  }

  .health-map-row.low .health-scale i {
    background: var(--success);
  }

  @media (max-width: 1360px) {
    .kpi-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .main-grid,
    .detail-grid,
    .overview-diagnostic-grid,
    .zone-focus-grid,
    .zone-focus-wide-grid,
    .quadrant-grid,
    .quadrant-main-grid,
    .quadrant-wide-grid,
    .recommendation-band {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 920px) {
    .report-header {
      align-items: stretch;
      flex-direction: column;
    }

    .filters {
      flex-wrap: wrap;
    }

    .filters .el-select {
      flex: 1 1 140px;
      width: auto;
    }

    .report-tabs {
      display: flex;
      overflow-x: auto;
    }

    .report-tab-option {
      flex: 0 0 auto;
    }

    .overview-tools {
      align-items: stretch;
      width: 100%;
    }

    .section-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .kpi-grid,
    .main-grid,
    .detail-grid,
    .overview-diagnostic-grid,
    .zone-focus-grid,
    .zone-focus-wide-grid,
    .quadrant-grid,
    .quadrant-main-grid,
    .quadrant-wide-grid,
    .province-quadrant-section,
    .recommendation-band {
      grid-template-columns: 1fr;
    }

    .province-quadrant-section > .panel {
      min-height: auto;
    }

    .compact-list,
    .zone-trend-summary {
      grid-template-columns: 1fr;
    }

    .audience-matrix-row,
    .head-tail-range-row {
      grid-template-columns: 1fr;
      gap: 7px;
    }

    .heat-matrix-header,
    .heat-matrix-row {
      grid-template-columns: minmax(54px, 0.72fr) repeat(4, minmax(44px, 1fr));
    }

    .head-tail-range-row > em {
      text-align: left;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .report-view-panel,
    .report-view-panel .motion-row,
    .report-view-panel .motion-row-group > .panel,
    .motion-row > .kpi-cell,
    .motion-row > .panel,
    .province-quadrant-section.motion-row > .panel,
    .report-view-panel .section-heading,
    .report-view-panel .kpi-cell,
    .report-view-panel .panel,
    .report-view-panel .bar-track i,
    .report-view-panel .health-scale i,
    .report-view-panel .mini-track i,
    .report-view-panel .head-tail-range-track i,
    .report-view-panel .profit-column-track i,
    .report-view-panel .trend-chart svg,
    .report-view-panel .margin-radar,
    .report-view-panel .province-scatter-point,
    .report-view-panel .audience-donut {
      animation: none;
      transform: none;
    }

    .report-tab-enter-active,
    .report-tab-leave-active {
      transition: none;
    }
  }
</style>
