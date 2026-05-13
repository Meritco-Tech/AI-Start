import { Bell, Files, HomeFilled, Management } from "@element-plus/icons-vue";

export const dockItems = [
  { key: "home", label: "主页", icon: HomeFilled, path: "/home" },
  { key: "files", label: "文件", icon: Files, path: "/files" },
  { key: "notice", label: "通知", icon: Bell, path: "/notice" },
  { key: "admin", label: "管理员", icon: Management, path: "/admin" },
];
