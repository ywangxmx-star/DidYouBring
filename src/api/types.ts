export type Scene = {
  id: number
  user_id?: number | null
  name: string
  icon: string
  scene_type: 'system' | 'custom'
  sort: number
  status: number
}

export type SceneItem = {
  item_id: number
  name: string
  category: string
  icon: string
  is_important: boolean
  is_required: boolean
  sort: number
}

export type SceneDetail = Scene & { items: SceneItem[] }

export type Item = {
  id: number
  user_id: number
  name: string
  category: string
  icon: string
  is_important: boolean
  status: number
}

export type TripRecord = {
  id: number
  user_id: number
  scene_id?: number | null
  scene_name: string
  status: string
  started_at: string
  completed_at?: string | null
  total_count: number
  checked_count: number
  has_unchecked_required: boolean
}

export type TripItem = {
  id: number
  trip_id: number
  source_item_id?: number | null
  item_name: string
  category: string
  icon: string
  is_important: boolean
  is_required: boolean
  is_checked: boolean
  checked_at?: string | null
  sort: number
  is_temporary: boolean
}

export type TripDetail = {
  trip: TripRecord
  items: TripItem[]
}

export type HomeData = {
  scenes: Scene[]
  recent_scenes: Scene[]
  active_trip: TripRecord | null
}
