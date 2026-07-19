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
  categoryId?: string
  searchText?: string
}

export interface PexelsListResponse {
  list: PexelsItem[]
  total?: number
}

export interface PexelsHintResponse {
  total: number
  result: string[]
}

export interface PexelsTheme {
  id: string
  title: string
  photo: string
}

export interface PexelsThemesResponse {
  themes: PexelsTheme[]
}
