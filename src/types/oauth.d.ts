interface QQLoginUserData {
  nickname: string
  figureurl_qq_2: string
}

interface QQLoginOptions {
  btnId: string
}

interface QQLoginMethod {
  (options: QQLoginOptions, callback: (data: QQLoginUserData) => void): void
  signOut(): void
}

interface QQConnect {
  Login: QQLoginMethod
}

declare const QC: QQConnect
