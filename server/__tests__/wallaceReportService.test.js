import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  getWallaceReportCatalog,
  getWallaceReportOverview,
} from "../wallaceReportService.js";
import { wallaceReportMiddleware } from "../wallaceReportMiddleware.js";

const writeCsv = (dir, fileName, rows) =>
  writeFile(path.join(dir, fileName), `${rows.join("\n")}\n`, "utf8");

test("wallace report service builds catalog and overview from local csv files", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "wallace-report-"));
  try {
    await writeCsv(dataDir, "1.1+1.2 月度门店利润 & 渠道拆解.csv", [
      "month,zone_name,store_id,store_name,total_profit,total_rev,profit_rate,dinein_profit,dinein_rev,group_profit,group_rev,delivery_profit,delivery_rev,instore_profit",
      "202601,上海区域,101,上海A店,100,200,0.5,20,40,30,60,50,100,10",
      "202601,江苏区域,201,江苏A店,240,400,0.6,80,120,40,80,120,200,0",
      "202602,上海区域,101,上海A店,150,300,0.5,30,60,45,90,75,150,10",
    ]);
    await writeCsv(dataDir, "1.4+1.5+1.11 区域利润率分析.csv", [
      "month,zone_name,zone_avg_rate,cv,below_national_ratio,store_cnt,pattern",
      "202601,上海区域,0.5,0.02,0.1,1,正常",
      "202601,江苏区域,0.6,0.03,0.2,1,正常",
    ]);
    await writeCsv(dataDir, "5.1+5.2+5.5+5.6 异常低价综合.csv", [
      "month,zone_name,store_id,low_price_rate,low_price_cnt,total_cnt,dinein_low,group_low,delivery_low,refund_rate",
      "202601,上海区域,101,0.1,10,100,1,2,7,0.03",
      "202601,江苏区域,201,0.2,20,100,2,3,15,0.04",
    ]);

    const catalog = await getWallaceReportCatalog({ dataDir, forceRefresh: true });

    assert.deepEqual(catalog.months, ["202601", "202602"]);
    assert.deepEqual(catalog.zones, ["上海区域", "江苏区域"]);
    assert.equal(catalog.tables.length, 3);
    assert.equal(catalog.tables[0].rows, 3);
    assert.equal(catalog.tables[0].grain, "门店×月");

    const overview = await getWallaceReportOverview({
      dataDir,
      month: "202601",
      forceRefresh: true,
    });

    assert.equal(overview.filters.month, "202601");
    assert.equal(overview.kpis.totalRevenue, 600);
    assert.equal(overview.kpis.totalProfit, 340);
    assert.equal(overview.kpis.profitRate, 340 / 600);
    assert.equal(overview.kpis.storeCount, 2);
    assert.equal(overview.kpis.lowPriceRate, 30 / 200);
    assert.deepEqual(
      overview.monthlyTrend.map((item) => item.month),
      ["202601", "202602"],
    );
    assert.equal(overview.zoneProfit.length, 2);
    assert.equal(overview.channelMix.delivery.revenue, 300);
    assert.equal(overview.riskSignals.length, 2);
    assert.equal(overview.quadrantAnalysis.overallQuadrants.length, 4);
    assert.equal(overview.quadrantAnalysis.positiveDrivers[0].metric, "单品毛利达标率");
    assert.equal(overview.quadrantAnalysis.highIncomeGap.length > 0, true);
    assert.equal(overview.quadrantAnalysis.provinceQuadrants.length, 24);
    assert.equal(overview.quadrantAnalysis.recommendations.length, 4);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("wallace report middleware returns catalog json", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "wallace-report-"));
  try {
    await writeCsv(dataDir, "1.1+1.2 月度门店利润 & 渠道拆解.csv", [
      "month,zone_name,store_id,store_name,total_profit,total_rev,profit_rate,dinein_profit,dinein_rev,group_profit,group_rev,delivery_profit,delivery_rev,instore_profit",
      "202601,上海区域,101,上海A店,100,200,0.5,20,40,30,60,50,100,10",
    ]);

    const middleware = wallaceReportMiddleware({ WALLACE_REPORT_DATA_DIR: dataDir });
    const response = {
      statusCode: 200,
      headers: {},
      body: "",
      setHeader(name, value) {
        this.headers[name.toLowerCase()] = value;
      },
      end(payload) {
        this.body = payload;
      },
    };

    await middleware(
      { method: "GET", url: "/api/v1/wallace-reports/catalog" },
      response,
      () => {
        throw new Error("next should not be called for wallace catalog route");
      },
    );

    const payload = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
    assert.equal(payload.tables.length, 1);
    assert.equal(payload.tables[0].title, "月度门店利润与渠道拆解");
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});
