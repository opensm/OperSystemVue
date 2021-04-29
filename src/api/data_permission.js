import request from '@/utils/request'

export function getMenus(params) {
  return request({
    url: '/auth/menus',
    method: 'get',
    params
  })
}

export function addMenu(data) {
  return request({
    url: '/auth/menus',
    method: 'post',
    data
  })
}

export function updateMenu(id, data) {
  return request({
    url: `/auth/menu?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteMenu(id) {
  return request({
    url: `/auth/menu?id=${id}`,
    method: 'delete'
  })
}
export function getMenu(id) {
  return request({
    url: `/auth/menu?id=${id}`,
    method: 'get'
  })
}
