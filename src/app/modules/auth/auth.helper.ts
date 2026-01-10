import { Secret } from 'jsonwebtoken'
import { jwtHelper } from '../../../helpers/jwtHelper'
import config from '../../../config'
import { Types } from 'mongoose'
import bcrypt from 'bcrypt'

const createToken = (authId: Types.ObjectId, role: string, name?: string, email?: string, profile?: string, deviceToken?: string) => {
  const accessToken = jwtHelper.createToken(
    { authId, role, name, email, profile, deviceToken },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  )
  const refreshToken = jwtHelper.createToken(
    { authId, role, name, email, profile, deviceToken },
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as string,
  )

  return { accessToken, refreshToken }
}

const tempAccessToken = (authId: Types.ObjectId, role: string, name?: string, email?: string, profile?: string, deviceToken?: string) => {
  const accessToken = jwtHelper.createToken(
    { authId, role, name, email, profile, deviceToken },
    'asjdhashd#$uaas98',
    config.jwt.jwt_expire_in as string,
  )

  return { accessToken }
}

const isPasswordMatched = async (
  plainTextPassword: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(plainTextPassword, hashedPassword)
}

export const AuthHelper = { createToken, isPasswordMatched }
