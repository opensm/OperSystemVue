import request from '@/utils/request'

export function getSubtasks(params) {
  return request({
    url: '/task/subtasks',
    method: 'get',
    params
  })
}

export function getExecLists() {
  return request({
    url: '/task/execlists',
    method: 'get'
  })
}

export function addSubtask(data) {
  return request({
    url: '/task/subtasks',
    method: 'post',
    data
  })
}

export function updateSubtask(id, data) {
  return request({
    url: `/task/subtask?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteSubtask(id) {
  return request({
    url: `/task/subtask?id=${id}`,
    method: 'delete'
  })
}
export function getObjectid(object) {
  return request({
    url: `/task/${object}`,
    method: 'get'
  })
}
export function getTemplateValues() {
  return request({
    url: '/task/template_list',
    method: 'get'
  })
}
