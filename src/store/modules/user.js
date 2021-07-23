import { login, logout, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
// import da from "element-ui/src/locale/lang/da";

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    role_name: [],
    menu: [],
    roles: '',
    last: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ROLE: (state, roles) => {
    state.role_name = roles
  },
  SET_MENUS: (state, menu) => {
    state.menu = menu
  },
  SET_LAST: (state, last) => {
    state.last = last
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { token } = response
        commit('SET_TOKEN', token)
        setToken(token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getUserInfo().then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { last_login, roles, name, user_permissions, id, role_set } = data
        // roles must be a non-empty array
        if (!user_permissions || user_permissions.length <= 0) {
          reject('严重报错: 用户权限列表为空!')
        }
        if (!roles) {
          reject('角色获取异常！')
        }
        if (id % 2 !== 0 && id % 3 !== 0) {
          commit('SET_AVATAR', 'naruto')
        } else if (id % 2 === 0 && id % 3 !== 0) {
          commit('SET_AVATAR', 'jiraiya')
        } else {
          commit('SET_AVATAR', 'shinnosuke')
        }
        commit('SET_MENUS', user_permissions)
        commit('SET_ROLES', roles)
        commit('SET_ROLE', role_set)
        commit('SET_NAME', name)
        commit('SET_LAST', last_login)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

