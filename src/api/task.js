import request from '@/utils/request'

export function getTasks(params) {
  return request({
    url: '/task/tasks',
    method: 'get',
    params
  })
}

export function getSubtasks() {
  return request({
    url: '/task/subtasks',
    method: 'get'
  })
}

export function addTask(data) {
  return request({
    url: '/task/tasks',
    method: 'post',
    data
  })
}

export function updateTask(id, data) {
  return request({
    url: `/task/task?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteTask(id) {
  return request({
    url: `/task/task?id=${id}`,
    method: 'delete'
  })
}
export function get_exec_logs(params) {
  return request({
    url: `/task/execlistlogs`,
    method: 'get',
    params
  })
}
