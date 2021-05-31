import request from '@/utils/request'

export function getAuthKEYs(params) {
  return request({
    url: '/task/authkeys',
    method: 'get',
    params
  })
}

export function addAuthKey(data) {
  return request({
    url: '/task/authkeys',
    method: 'post',
    data
  })
}

export function updateAuthKey(id, data) {
  return request({
    url: `/task/authkey?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteAuthKey(id) {
  return request({
    url: `/task/authkey?id=${id}`,
    method: 'delete'
  })
}
