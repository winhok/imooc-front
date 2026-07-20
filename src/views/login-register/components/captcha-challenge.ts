export interface CaptchaChallenge {
  imageUrl: string
  targetProgress: number
  targetY: number
}

const TARGET_MIN_PROGRESS = 58
const TARGET_MAX_PROGRESS = 78
const TARGET_MIN_Y = 20
const TARGET_MAX_Y = 88

function randomInteger(min: number, max: number) {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return min + ((values[0] ?? 0) % (max - min + 1))
}

export function createCaptchaChallenge(previousImageUrl?: string): CaptchaChallenge {
  let imageUrl = ''

  do {
    imageUrl = `https://picsum.photos/300/150/?image=${randomInteger(0, 200)}`
  } while (imageUrl === previousImageUrl)

  return {
    imageUrl,
    targetProgress: randomInteger(TARGET_MIN_PROGRESS, TARGET_MAX_PROGRESS),
    targetY: randomInteger(TARGET_MIN_Y, TARGET_MAX_Y)
  }
}
