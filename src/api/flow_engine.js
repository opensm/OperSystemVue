import request from '@/utils/request'

export function getFlowEngines(params) {
  return request({
    url: '/flow/flow_engines',
    method: 'get',
    params
  })
}

export function addFlowEngine(data) {
  return request({
    url: '/flow/flow_engines',
    method: 'post',
    data
  })
}

export function updateFlowEngine(id, data) {
  return request({
    url: `/flow/flow_engine?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteFlowEngine(id) {
  return request({
    url: `/flow/flow_engine?id=${id}`,
    method: 'delete'
  })
}
