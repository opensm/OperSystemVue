import request from '@/utils/request'

export function getDataPermissions(params) {
  return request({
    url: '/auth/data_permissions',
    method: 'get',
    params
  })
}

export function addDataPermission(data) {
  return request({
    url: '/auth/data_permissions',
    method: 'post',
    data
  })
}

export function updateDataPermission(id, data) {
  return request({
    url: `/auth/data_permission?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteDataPermission(id) {
  return request({
    url: `/auth/data_permission?id=${id}`,
    method: 'delete'
  })
}
export function getDataPermission(id) {
  return request({
    url: `/auth/data_permission?id=${id}`,
    method: 'get'
  })
}
export function getContentType(params) {
  return request({
    url: `/auth/contenttypes`,
    method: 'get',
    params
  })
}
