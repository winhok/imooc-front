export interface PexelsItem {
  id: string
  title: string
  photo: string
  photoLink?: string
  photoDownLink?: string
  photoWidth: number
  photoHeight: number
  photoType?: string
  author: string
  authorLike?: string
  avatar: string
  tags?: string[]
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
  /** Number of records returned by the backend before invalid records were removed. */
  sourceLength: number
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
