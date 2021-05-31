import request from '@/utils/request'

export function getProjects() {
  return request({
    url: '/task/projects',
    method: 'get'
  })
}

export function addProject(data) {
  return request({
    url: '/task/projects',
    method: 'post',
    data
  })
}

export function updateProject(id, data) {
  return request({
    url: `/task/project?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteProject(id) {
  return request({
    url: `/task/project?id=${id}`,
    method: 'delete'
  })
}
