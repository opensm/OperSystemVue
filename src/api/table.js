import request from '@/utils/request'

export function getUserList() {
  return request({
    url: 'auth/users',
    method: 'get'
  })
}

export function getRoleList() {
  return request({
    url: 'auth/role',
    method: 'get'
  })
}

export function getPermissionsList() {
  return request({
    url: 'auth/permissions',
    method: 'get'
  })
}
