import request from '@/utils/request'

export function getFlowNodes(params) {
  return request({
    url: '/flow/flow_nodes',
    method: 'get',
    params
  })
}

export function addFlowNode(data) {
  return request({
    url: '/flow/flow_nodes',
    method: 'post',
    data
  })
}

export function updateFlowNode(id, data) {
  return request({
    url: `/flow/flow_node?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteFlowNode(id) {
  return request({
    url: `/flow/flow_node?id=${id}`,
    method: 'delete'
  })
}
