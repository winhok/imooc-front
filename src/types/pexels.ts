export interface PexelsItem {
  id: string
  title: string
  photo: string
  photoWidth: number
  photoHeight: number
  author: string
  avatar: string
}

export interface PexelsListParams {
  page: number
  size: number
}

export interface PexelsListResponse {
  list: PexelsItem[]
  total: number
}
