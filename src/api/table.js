import request from '@/utils/request'

export function getUserList() {
  return request({
    url: 'auth/user',
    method: 'get'
  })
}
