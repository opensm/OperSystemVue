import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}
export function resetPassword(data) {
  return request({
    url: '/auth/user/reset_passwd',
    method: 'post',
    data
  })
}
export function addUser(data) {
  return request({
    url: '/auth/users',
    method: 'post',
    data
  })
}
export function deleteUser(id) {
  return request({
    url: '/auth/user?id=' + id,
    method: 'delete'
  })
}
export function getUserInfo() {
  return request({
    url: '/auth/current_user',
    method: 'get'
  })
}
export function getUsersInfo(params) {
  return request({
    url: '/auth/users',
    method: 'get',
    params
  })
}
export function updateUser(id, data) {
  return request({
    url: '/auth/user?id=' + id,
    method: 'put',
    data: data
  })
}
export function updateUserState(id, data) {
  return request({
    url: '/auth/user/$id/state',
    method: 'put'
  })
}
export function updateUserRoles(id, data) {
  return request({
    url: '/auth/user/$id/roles',
    method: 'put'
  })
}
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
export function current_user() {
  return request({
    url: '/auth/current_user',
    method: 'get'
  })
}
