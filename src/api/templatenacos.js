import request from '@/utils/request'

export function getTemplateNacoses() {
  return request({
    url: '/task/templatenacoses',
    method: 'get'
  })
}

export function addTemplateNacos(data) {
  return request({
    url: '/task/templatenacoses',
    method: 'post',
    data
  })
}

export function updateTemplateNacos(id, data) {
  return request({
    url: `/task/templatenacos?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteTemplateNacos(id) {
  return request({
    url: `/task/templatenacos?id=${id}`,
    method: 'delete'
  })
}
