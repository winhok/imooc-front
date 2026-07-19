export function colorFromString(seed: string) {
  let hash = 0

  for (const character of seed) {
    hash = (hash * 31 + character.codePointAt(0)!) | 0
  }

  return `hsl(${Math.abs(hash) % 360} 45% 78%)`
}
