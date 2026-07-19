const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function pad(value: number, length = 2) {
  return String(value).padStart(length, '0')
}

export function formatDuration(milliseconds: number, format: string) {
  const safeMilliseconds = Math.max(0, Math.ceil(milliseconds / SECOND) * SECOND)
  const hasDays = format.includes('DD')
  const days = Math.floor(safeMilliseconds / DAY)
  const totalHours = Math.floor(safeMilliseconds / HOUR)
  const hours = hasDays ? totalHours % 24 : totalHours
  const minutes = Math.floor(safeMilliseconds / MINUTE) % 60
  const seconds = Math.floor(safeMilliseconds / SECOND) % 60

  return format.replace(/DD|HH|mm|ss/g, (token) => {
    const values = {
      DD: pad(days),
      HH: pad(hours),
      mm: pad(minutes),
      ss: pad(seconds)
    }

    return values[token as keyof typeof values]
  })
}
