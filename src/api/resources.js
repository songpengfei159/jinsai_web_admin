import request from '@/utils/request'

export function addResource (params) {
  return request({
    url: process.env.ADMIN_API + '/resource/add',
    method: 'post',
    data: params
  })
}

export function deleteResource (params) {
  return request({
    url: process.env.ADMIN_API + '/resource/delete',
    method: 'post',
    data: params
  })
}

export function getResources (params) {
  return request({
    url: process.env.ADMIN_API + '/resource/getList',
    method: 'post',
    data: params
  })
}
