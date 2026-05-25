export const workbenchConnections = [
  {
    id: "dev-mysql",
    name: "开发 MySQL",
    type: "mysql",
    connection: {
      host: "120.26.178.41",
      port: 3306,
      username: "dev_backend",
      passwordEnv: "WORKBENCH_MYSQL_DEV_BACKEND_PASSWORD",
      charset: "utf8mb4",
      connectTimeoutSeconds: 8,
      readTimeoutSeconds: 20,
      writeTimeoutSeconds: 20,
    },
    executionPolicy: {
      readOnly: true,
      requireLimit: true,
      defaultLimit: 100,
      maxLimit: 200,
    },
    status: "待连接",
  },
];

export const defaultWorkbenchConnection = workbenchConnections[0];
