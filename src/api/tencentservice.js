import request from '@/utils/request'

export function getTemplateTencentServices() {
  return request({
    url: '/task/tencentservices',
    method: 'get'
  })
}

export function addTemplateTencentService(data) {
  return request({
    url: '/task/tencentservices',
    method: 'post',
    data
  })
}

export function updateTemplateTencentService(id, data) {
  return request({
    url: `/task/tencentservice?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteTemplateTencentService(id) {
  return request({
    url: `/task/tencentservice?id=${id}`,
    method: 'delete'
  })
}
