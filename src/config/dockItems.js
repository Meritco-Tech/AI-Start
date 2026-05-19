import {
  Bell,
  ChatDotRound,
  HomeFilled,
  Management,
} from "@element-plus/icons-vue";

export const dockItems = [
  { key: "home", label: "主页", icon: HomeFilled, path: "/home" },
  { key: "sessions", label: "会话", icon: ChatDotRound, path: "/sessions" },
  { key: "notice", label: "通知", icon: Bell, path: "/notice" },
  { key: "admin", label: "管理员", icon: Management, path: "/admin" },
];
