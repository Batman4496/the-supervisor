import { createHashRouter } from "react-router";
import Main from "@/pages/main";
import Settings from "@/pages/settings";
import Resource from "@/pages/resource";

export default createHashRouter([
  {
    path: "/",
    Component: Main,
  },
  {
    path: "/resource/:resourceId?",
    Component: Resource,
  },
  {
    path: '/settings',
    Component: Settings
  }
]);