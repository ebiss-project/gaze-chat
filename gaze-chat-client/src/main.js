import Vue from "vue";
import App from "./App";
import VueRouter from "vue-router";
import router from "./router";
import VueLogger from "vuejs-logger";
import VueResource from "vue-resource";
import lodash from "lodash";
Vue.config.productionTip = false;

// Set up logging
const options = {
  logLevel: "debug",
  stringifyArguments: false,
  showLogLevel: true
};
Vue.use(VueLogger, options);

Vue.use(VueResource);

Vue.prototype.$lodash = lodash;

// Set up the vue-router
Vue.use(VueRouter);

new Vue({
  el: "#app",
  router,
  render: h => h(App)
});
