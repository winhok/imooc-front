export function validateUsername(value: unknown) {
  const username = typeof value === 'string' ? value.trim() : ''

  if (!username) {
    return '请输入用户名'
  }

  if (username.length < 3 || username.length > 12) {
    return '用户名长度应为 3–12 个字符'
  }

  return true
}

export function validatePassword(value: unknown) {
  const password = typeof value === 'string' ? value : ''

  if (!password) {
    return '请输入密码'
  }

  if (password.length < 6 || password.length > 12) {
    return '密码长度应为 6–12 个字符'
  }

  return true
}

export function validateConfirmPassword(value: unknown, password: unknown) {
  if (!value) {
    return '请再次输入密码'
  }

  if (value !== password) {
    return '两次输入的密码不一致'
  }

  return true
}
