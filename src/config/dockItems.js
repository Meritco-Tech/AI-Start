import {
  Bell,
  ChatDotRound,
  DataAnalysis,
  HomeFilled,
  Management,
  Platform,
} from "@element-plus/icons-vue";

export const dockItems = [
  { key: "home", label: "主页", icon: HomeFilled, path: "/home" },
  { key: "workbench", label: "工作台", icon: Platform, path: "/workbench" },
  { key: "wallaceReports", label: "报表", icon: DataAnalysis, path: "/wallace-reports" },
  { key: "sessions", label: "会话", icon: ChatDotRound, path: "/sessions" },
  { key: "notice", label: "通知", icon: Bell, path: "/notice" },
  { key: "admin", label: "管理员", icon: Management, path: "/admin" },
];
