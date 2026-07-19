import { md5 } from '@noble/hashes/legacy.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'

export function encodeLegacyPassword(password: string) {
  return bytesToHex(md5(utf8ToBytes(password)))
}
