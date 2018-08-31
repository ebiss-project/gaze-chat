import Vue from "vue";
import Router from "vue-router";
import Credentials from "@/components/client/Credentials";
import Chat from "@/components/client/Chat";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      component: Credentials
    },
    {
      path: "/chat/:username/:picture/:color",
      name: "chat",
      component: Chat,
      props: true
    }
  ]
});
