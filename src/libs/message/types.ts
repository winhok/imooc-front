export type MessageType = 'success' | 'warning' | 'error' | 'info'

export interface MessageItem {
  id: number
  type: MessageType
  content: string
}
