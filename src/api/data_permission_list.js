import request from '@/utils/request'

export function getDataPermissionLists(params) {
  return request({
    url: '/auth/data_permission_lists',
    method: 'get',
    params
  })
}

export function addDataPermissionList(data) {
  return request({
    url: '/auth/data_permission_lists',
    method: 'post',
    data
  })
}

export function updateDataPermissionList(id, data) {
  return request({
    url: `/auth/data_permission_list?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteDataPermissionList(id) {
  return request({
    url: `/auth/data_permission_list?id=${id}`,
    method: 'delete'
  })
}
export function getDataPermissionList(id) {
  return request({
    url: `/auth/data_permission_list?id=${id}`,
    method: 'get'
  })
}
export function getModelFields(ids) {
  return request({
    url: `/auth/field?id=${ids}`,
    method: 'get'
  })
}
export function getLabelModelFields(label, model) {
  return request({
    url: `/auth/field?app_label=Task&model=templatedb&model=templatekubernetes&model=templatenacos&model=templatetencentservice`,
    method: 'get'
  })
}
export function getModelFieldValues(id, field) {
  return request({
    url: `/auth/field_value?id=${id}&field=${field}`,
    method: 'get'
  })
}
