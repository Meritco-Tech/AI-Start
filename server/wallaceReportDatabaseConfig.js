export const WALLACE_REPORT_PASSWORD_ENV = "WALLACE_REPORT_MYSQL_PASSWORD";

export const getWallaceReportDatabaseConfig = (env = process.env) => ({
  id: "wallace-report-mysql",
  type: "mysql",
  host: env.WALLACE_REPORT_MYSQL_HOST || "120.26.181.139",
  port: Number(env.WALLACE_REPORT_MYSQL_PORT || 3306),
  username: env.WALLACE_REPORT_MYSQL_USER || "dev_backend",
  database: env.WALLACE_REPORT_MYSQL_DATABASE || "data_metrics_v2",
  passwordEnv: WALLACE_REPORT_PASSWORD_ENV,
  charset: env.WALLACE_REPORT_MYSQL_CHARSET || "utf8mb4",
  connectTimeoutSeconds: Number(env.WALLACE_REPORT_MYSQL_CONNECT_TIMEOUT || 8),
});
