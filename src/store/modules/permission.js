/* Layout */
import Layout from '@/layout'

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
      const parent = generateRouter(item, true)
      const children = []
      if (item.children) {
        item.children.forEach(child => {
          children.push(generateRouter(child, false))
        })
      }
      parent.children = children
      accessedRouters.push(parent)
    })
  }
  accessedRouters.push({
    path: '*', redirect: '/404', hidden: true
  })
  return accessedRouters
}

function generateRouter(item, isParent) {
  return {
    path: item.path === '/' ? '/' : '/' + item.path,
    name: item.name,
    meta: {
      title: item.name, icon: item.icon
    },
    component: isParent ? Layout : componentsMap[item.path]
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
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
  generateRoutes: function({ commit }, data) {
    return new Promise(resolve => {
      // console.log(data)
      const accessedRouters = convertRouter(data)
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
  // 权限验证
  reset_passwd: () => import('@/views/auth/reset_passwd'),
  roles: () => import('@/views/auth/roles'),
  users: () => import('@/views/auth/user'),
  menus: () => import('@/views/system/menus'),
  data_permission: () => import('@/views/system/data_permission'),
  data_permissionlist: () => import('@/views/system/data_permissionlist'),
  // 任务处理
  subtasks: () => import('@/views/task/subtasks'),
  tasks: () => import('@/views/task/tasks'),
  project: () => import('@/views/task/project'),
  templatedb: () => import('@/views/task/templatedb'),
  templatekubernetes: () => import('@/views/task/templatekubernetes'),
  templateNacos: () => import('@/views/task/templatenacos'),
  tencentService: () => import('@/views/task/templatetencentservice'),
  authkey: () => import('@/views/task/authkey'),
  flowengine: () => import('@/views/flow/FlowEngine'),
  flownode: () => import('@/views/flow/flowNode'),
  flowtask: () => import('@/views/flow/flowTask')
}
