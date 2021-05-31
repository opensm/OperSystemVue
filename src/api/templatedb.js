import request from '@/utils/request'

export function getTemplateDBs() {
  return request({
    url: '/task/templatedbs',
    method: 'get'
  })
}

export function addTemplateDB(data) {
  return request({
    url: '/task/templatedbs',
    method: 'post',
    data
  })
}

export function updateTemplateDB(id, data) {
  return request({
    url: `/task/templatedb?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteTemplateDB(id) {
  return request({
    url: `/task/templatedb?id=${id}`,
    method: 'delete'
  })
}
