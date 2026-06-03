import { createRouter, createWebHistory } from "vue-router";
import WorkspaceView from "../views/WorkspaceView.vue";
import PlaceholderView from "../views/PlaceholderView.vue";
import SessionView from "../views/SessionView.vue";
import WallaceReportView from "../views/WallaceReportView.vue";
import WorkbenchView from "../views/WorkbenchView.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: WorkspaceView,
    meta: {
      dockKey: "home",
      title: "主页",
    },
  },
  {
    path: "/sessions",
    name: "sessions",
    component: SessionView,
    meta: {
      dockKey: "sessions",
      title: "会话",
    },
  },
  {
    path: "/workbench",
    name: "workbench",
    component: WorkbenchView,
    meta: {
      dockKey: "workbench",
      title: "工作台",
    },
  },
  {
    path: "/wallace-reports",
    name: "wallaceReports",
    component: WallaceReportView,
    meta: {
      dockKey: "wallaceReports",
      title: "华莱士报表",
    },
  },
  {
    path: "/files",
    redirect: "/sessions",
  },
  {
    path: "/notice",
    name: "notice",
    component: PlaceholderView,
    meta: {
      dockKey: "notice",
      title: "通知",
      description: "暂无新的通知，后续可接入系统消息、任务提醒与协作动态。",
    },
  },
  {
    path: "/admin",
    name: "admin",
    component: PlaceholderView,
    meta: {
      dockKey: "admin",
      title: "管理员",
      description: "管理员模块待接入，可在此配置成员权限、空间设置与数据源管理。",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/home",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
