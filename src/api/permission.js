import request from '@/utils/request'

export function getPermissions(params) {
  return request({
    url: '/auth/permissions',
    method: 'get',
    params
  })
}

export function addPermission(data) {
  return request({
    url: '/auth/permissions',
    method: 'post',
    data
  })
}

export function updatePermission(id, data) {
  return request({
    url: `/auth/permission/${id}`,
    method: 'put',
    data
  })
}

export function deletePermission(id) {
  return request({
    url: `/auth/permission/${id}`,
    method: 'delete'
  })
}
export function getMenus() {
  return request({
    url: `/auth/user/menus`,
    method: 'get'
  })
}
