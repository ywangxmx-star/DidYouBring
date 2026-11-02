import { request } from '@/utils/request'
import type { HomeData, Item, Scene, SceneDetail, TripDetail, TripRecord } from './types'

export const api = {
  home: () => request<HomeData>({ url: '/home' }),
  scenes: () => request<Scene[]>({ url: '/scenes' }),
  sceneDetail: (id: number) => request<SceneDetail>({ url: `/scenes/${id}` }),
  createScene: (data: { name: string; icon?: string; sort?: number }) =>
    request<Scene>({ url: '/scenes', method: 'POST', data }),
  updateScene: (id: number, data: { name: string; icon?: string; sort?: number }) =>
    request<Scene>({ url: `/scenes/${id}`, method: 'PUT', data }),
  deleteScene: (id: number) => request<null>({ url: `/scenes/${id}`, method: 'DELETE' }),
  copyScene: (id: number) => request<SceneDetail>({ url: `/scenes/${id}/copy`, method: 'POST' }),
  setSceneItems: (id: number, items: { item_id: number; sort: number; is_required: boolean }[]) =>
    request<SceneDetail>({ url: `/scenes/${id}/items`, method: 'PUT', data: { items } }),

  items: (keyword = '') =>
    request<Item[]>({ url: keyword ? `/items?keyword=${encodeURIComponent(keyword)}` : '/items' }),
  createItem: (data: Partial<Item> & { name: string }) =>
    request<Item>({ url: '/items', method: 'POST', data }),
  updateItem: (id: number, data: Partial<Item> & { name: string }) =>
    request<Item>({ url: `/items/${id}`, method: 'PUT', data }),
  deleteItem: (id: number) => request<null>({ url: `/items/${id}`, method: 'DELETE' }),

  createTrip: (scene_id: number, restart_policy = 'reject') =>
    request<TripDetail>({ url: '/trips', method: 'POST', data: { scene_id, restart_policy } }),
  activeTrip: () => request<TripDetail | null>({ url: '/trips/active' }),
  tripDetail: (id: number) => request<TripDetail>({ url: `/trips/${id}` }),
  checkItem: (tripId: number, itemId: number, is_checked: boolean) =>
    request<TripDetail>({ url: `/trips/${tripId}/items/${itemId}`, method: 'PATCH', data: { is_checked } }),
  addTempItem: (tripId: number, data: { name: string; is_important?: boolean; is_required?: boolean }) =>
    request<TripDetail>({ url: `/trips/${tripId}/items`, method: 'POST', data }),
  deleteTempItem: (tripId: number, itemId: number) =>
    request<TripDetail>({ url: `/trips/${tripId}/items/${itemId}`, method: 'DELETE' }),
  completeTrip: (tripId: number, confirm_unchecked = false) =>
    request<TripDetail>({ url: `/trips/${tripId}/complete`, method: 'POST', data: { confirm_unchecked } }),
  abandonTrip: (tripId: number) =>
    request<TripDetail>({ url: `/trips/${tripId}/abandon`, method: 'POST' }),

  records: (page = 1, page_size = 20) =>
    request<{ list: TripRecord[]; total: number; page: number; page_size: number }>({
      url: `/trip-records?page=${page}&page_size=${page_size}`,
    }),
  recordDetail: (id: number) => request<TripDetail>({ url: `/trip-records/${id}` }),
  deleteRecord: (id: number) => request<null>({ url: `/trip-records/${id}`, method: 'DELETE' }),
}
