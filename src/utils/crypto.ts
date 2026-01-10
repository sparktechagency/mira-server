import crypto from 'crypto'

const cryptoToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

export default cryptoToken

export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex')
}
export const compareOtp = (otp: string, hashedOtp: string): boolean => {
  return crypto.timingSafeEqual(
    Buffer.from(hashOtp(otp)),
    Buffer.from(hashedOtp),
  )
}
export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString()
}
