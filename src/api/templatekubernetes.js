import request from '@/utils/request'

export function getTemplateKubernetes(params) {
  return request({
    url: '/task/templatekubernetes',
    method: 'get',
    params
  })
}

export function addTemplateKubernete(data) {
  return request({
    url: '/task/templatekubernetes',
    method: 'post',
    data
  })
}

export function updateTemplateKubernete(id, data) {
  return request({
    url: `/task/templatekubernete?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteTemplateKubernete(id) {
  return request({
    url: `/task/templatekubernete?id=${id}`,
    method: 'delete'
  })
}
