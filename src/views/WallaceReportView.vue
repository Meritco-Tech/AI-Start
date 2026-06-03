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

      <section v-if="activeReportTab === 'overview'" class="overview-section">
        <div class="section-heading overview-heading">
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

        <section class="kpi-grid">
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
          <section class="zone-focus-grid">
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
                  <span>异常低价率</span>
                  <strong>{{ formatPercent(focusedRiskSignal.lowPriceRate ?? kpis.lowPriceRate) }}</strong>
                </div>
                <div class="zone-risk-item">
                  <span>退款率</span>
                  <strong>{{ formatPercent(focusedRiskSignal.refundRate ?? kpis.refundRate) }}</strong>
                </div>
                <div class="zone-risk-item">
                  <span>低于全国均值门店占比</span>
                  <strong>{{ formatPercent(focusedZoneHealth.belowNationalRatio) }}</strong>
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

          <section class="report-grid zone-focus-wide-grid">
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
          </section>
        </template>

        <template v-else>
          <section class="report-grid main-grid">
            <article class="panel">
              <div class="panel-title">
                <h2>区域利润率</h2>
                <span>{{ zoneProfit.length }} 个区域</span>
              </div>
              <div class="bar-list">
                <div v-for="item in zoneProfit" :key="item.zone" class="bar-row">
                  <div class="row-label">
                    <strong>{{ formatRegionName(item.zone) }}</strong>
                    <span>{{ formatPercent(item.profitRate) }}</span>
                  </div>
                  <div class="bar-track">
                    <i :style="{ width: `${Math.max((item.profit / maxZoneProfit) * 100, 4)}%` }" />
                  </div>
                  <em>{{ formatMoney(item.profit) }}</em>
                </div>
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

          <section class="report-grid detail-grid">
            <article class="panel">
              <div class="panel-title">
                <h2>异常低价风险</h2>
                <span>{{ formatPercent(kpis.refundRate) }} 退款率</span>
              </div>
              <div class="bar-list compact">
                <div v-for="item in riskSignals" :key="item.zone" class="bar-row">
                  <div class="row-label">
                    <strong>{{ formatRegionName(item.zone) }}</strong>
                    <span>{{ formatPercent(item.lowPriceRate) }}</span>
                  </div>
                  <div class="bar-track danger">
                    <i :style="{ width: `${Math.max((item.lowPriceRate / maxRisk) * 100, 4)}%` }" />
                  </div>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <h2>区域健康度</h2>
                <span>低于全国均值占比</span>
              </div>
              <div class="health-map">
                <div
                  v-for="item in zoneHealth"
                  :key="`${item.month}-${item.zone}`"
                  class="health-map-row"
                  :class="getHealthTone(item.belowNationalRatio)"
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
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <h2>套餐毛利达标</h2>
                <span>实际 vs 理论</span>
              </div>
              <div class="bar-list compact">
                <div v-for="item in comboMargins" :key="`${item.month}-${item.zone}`" class="bar-row">
                  <div class="row-label">
                    <strong>{{ formatRegionName(item.zone) }}</strong>
                    <span>{{ formatPercent(item.passRate) }}</span>
                  </div>
                  <div class="bar-track green">
                    <i :style="{ width: `${Math.max((item.passRate / maxCombo) * 100, 4)}%` }" />
                  </div>
                </div>
              </div>
            </article>
          </section>
        </template>
      </section>

      <section v-else-if="activeReportTab === 'quadrant'" class="quadrant-section">
        <div class="section-heading">
          <div>
            <h2>收入规模 × 利润效率</h2>
          </div>
          <p>
            {{ quadrantAnalysis.period }} · 收入中位数
            {{ quadrantAnalysis.thresholds?.revenueMedianWan }}万 · 利润率中位数
            {{ formatPercent(quadrantAnalysis.thresholds?.profitRateMedian) }}
          </p>
        </div>

        <section class="recommendation-band">
          <article v-for="item in recommendations" :key="item.target" class="panel">
            <div class="recommendation-title">
              <el-icon><PriceTag /></el-icon>
              <h2>{{ item.target }}</h2>
              <span>{{ item.theme }}</span>
            </div>
            <p>{{ item.action }}</p>
          </article>
        </section>

        <section class="quadrant-grid">
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

        <section class="report-grid quadrant-main-grid">
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

        <section class="report-grid quadrant-wide-grid">
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

        <section class="province-quadrant-section">
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
    padding: 18px;
    border: 1px solid rgba(91, 61, 167, 0.14);
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(91, 61, 167, 0.09), rgba(255, 255, 255, 0.9));
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
    margin-top: 6px;
    color: var(--text);
    font-size: 34px;
    line-height: 1;
  }

  .zone-hero-metric em {
    display: block;
    margin-top: 8px;
    color: var(--soft-text);
    font-size: 12px;
    font-style: normal;
  }

  .zone-metric-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin: 16px 0 0;
  }

  .zone-metric-list div,
  .zone-risk-item,
  .zone-trend-summary div {
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.74);
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
    gap: 10px;
  }

  .zone-risk-item {
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
    gap: 8px;
    padding: 18px;
    border: 1px solid rgba(36, 142, 93, 0.16);
    border-radius: 8px;
    background: rgba(36, 142, 93, 0.06);
  }

  .zone-pass-meter strong {
    color: var(--success);
    font-size: 34px;
    line-height: 1;
  }

  .zone-trend-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
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

  .compact .bar-row {
    grid-template-columns: minmax(120px, 1fr) minmax(110px, 1.2fr);
  }

  .driver-row {
    display: grid;
    grid-template-columns: minmax(130px, 1fr) minmax(120px, 1.15fr);
    gap: 10px;
    align-items: center;
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
  }
</style>
