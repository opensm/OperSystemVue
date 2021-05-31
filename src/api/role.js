import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/auth/user/menus',
    method: 'get'
  })
}
export function getUserInfo() {
  return request({
    url: '/auth/current_user',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/auth/roles',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/auth/roles',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/auth/role?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  console.log(id)
  return request({
    url: `/auth/role?id=${id}`,
    method: 'delete'
  })
}
