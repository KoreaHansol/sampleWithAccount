import Vue from 'vue'
import Router from 'vue-router'
import Home from "@/page/home/index"
import AccountList from "@/page/accountList/index"
import AccountAdd from "@/page/accountAdd/index"
import AccountUpdate from "@/page/accountUpdate/index"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/",
      name: "Home",
      component:Home
    },
    {
        path: "/accountList",
        name: "AccountList",
        component: AccountList
    },
    {
        path: "/accountAdd",
        name: "AccountAdd",
        component: AccountAdd
    },
    {
      path: "/accountUpdate",
      name: "AccountUpdate",
      component: AccountUpdate
    }
  ],
  mode: 'history'
})
