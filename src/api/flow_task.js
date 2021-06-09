import request from '@/utils/request'

export function getFlowTasks(params) {
  return request({
    url: '/flow/flow_tasks',
    method: 'get',
    params
  })
}

export function updateFlowTask(id, data) {
  return request({
    url: `/flow/flow_task?id=${id}`,
    method: 'put',
    data
  })
}
