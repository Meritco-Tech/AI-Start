import { createRouter, createWebHistory } from "vue-router";
import WorkspaceView from "../views/WorkspaceView.vue";
import PlaceholderView from "../views/PlaceholderView.vue";

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
    path: "/files",
    name: "files",
    component: PlaceholderView,
    meta: {
      dockKey: "files",
      title: "文件",
      description: "文件模块待接入，可在此扩展知识库、报告附件与团队文档管理。",
    },
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
