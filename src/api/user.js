import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}
export function resetPassword(id,data) {
  return request({
    url: '/auth/user/$id/reset_passoword',
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
    url: '/auth/user/$id',
    method: 'delete'
  })
}
export function getUserInfo() {
  return request({
    url: '/auth/user',
    method: 'get',
  })
}
export function getUsersInfo() {
  return request({
    url: '/auth/users',
    method: 'get',
  })
}
export function updateUser(id,data) {
  return request({
    url: '/auth/user',
    method: 'put'
  })
}
export function updateUserState(id,data) {
  return request({
    url: '/auth/user/$id/state',
    method: 'put'
  })
}
export function updateUserRoles(id,data) {
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
