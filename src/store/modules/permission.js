import {asyncRoutes, constantRoutes} from '@/router'

/* Layout */
import Layout from '@/layout'
import da from "element-ui/src/locale/lang/da";

// import da from "element-ui/src/locale/lang/da";

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  // console.log(route)
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 *将后台的路由表进行格式化
 * @param {*} asyncRouterMap
 */
function convertRouter(asyncRouterMap) {
  const accessedRouters = []
  if (asyncRouterMap) {
    // console.log(asyncRouterMap)
    asyncRouterMap.forEach(item => {
      let parent = generateRouter(item, true)
      let children = []
      if (item.children) {
        item.children.forEach(child => {
          children.push(generateRouter(child, false))
        })
      }
      parent.children = children
      accessedRouters.push(parent)
    })
  }
  accessedRouters.push({path: '*', redirect: '/404', hidden: true})
  return accessedRouters
}

function generateRouter(item, isParent) {
  let router = {
    path: '/' + item.path,
    name: item.name,
    meta: {title: item.name, icon: item.icon},
    component: isParent ? Layout : componentsMap[item.path]
  }
  return router
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = {...route}
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    // state.routes = constantRoutes.concat(routes)
    state.routes = routes
  }
}

const actions = {
  generateRoutes({commit}, data) {
    return new Promise(resolve => {
      // console.log(data)
      const asyncRouterMap = data
      console.log(data);
      const accessedRouters = convertRouter(asyncRouterMap)
      commit('SET_ROUTES', accessedRouters)
      resolve(accessedRouters)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
export const componentsMap = {
  reset_passoword: () => import('@/views/reset_passoword/index'),
  roles: () => import('@/views/roles/index'),
  users: () => import('@/views/users/user'),
  permissions: () => import('@/views/permissions/index')
}
