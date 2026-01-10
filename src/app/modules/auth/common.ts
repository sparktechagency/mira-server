import { StatusCodes } from 'http-status-codes'
import { ILoginData } from '../../../interfaces/auth'
import ApiError from '../../../errors/ApiError'
import { USER_STATUS } from '../../../enum/user'
import { User } from '../user/user.model'
import { AuthHelper } from './auth.helper'
import { generateOtp } from '../../../utils/crypto'
import { IAuthResponse } from './auth.interface'
import { IUser } from '../user/user.interface'
import { emailTemplate } from '../../../shared/emailTemplate'
import { emailHelper } from '../../../helpers/emailHelper'
import config from '../../../config'


const handleLoginLogic = async (payload: ILoginData, isUserExist: IUser):Promise<IAuthResponse> => {
  const { authentication, verified, status, email, password } = isUserExist
  const { restrictionLeftAt, wrongLoginAttempts } = authentication

  // Validate user status
  if (status === USER_STATUS.DELETED) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Invalid credentials',
    )
  }

  // Check if account is currently restricted
  if (status === USER_STATUS.RESTRICTED && restrictionLeftAt && new Date() < restrictionLeftAt) {
    const remainingMinutes = Math.ceil(
      (restrictionLeftAt.getTime() - Date.now()) / 60000,
    )
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Account temporarily locked. Try again in ${remainingMinutes} minutes`,
    )
  }

  // Verify password
  const isPasswordMatched = await User.isPasswordMatched(
    payload.password,
    password,
  )
  const fullName = getFullName(isUserExist.firstName, isUserExist.lastName)

  if (!isPasswordMatched) {
    const newWrongAttempts = wrongLoginAttempts + 1
    const updateData: any = {
      'authentication.wrongLoginAttempts': newWrongAttempts,
      'authentication.latestRequestAt': new Date()
    }

    // Apply progressive restrictions
    if (newWrongAttempts >= 5) {
      updateData.status = USER_STATUS.RESTRICTED
      updateData['authentication.restrictionLeftAt'] = new Date(
        Date.now() + 30 * 60 * 1000, // 30 minutes restriction
      )
    }

    // Persist failed login attempt
    await User.findByIdAndUpdate(isUserExist._id, { $set: updateData })

    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Invalid credentials',
    )
  }


  // Handle unverified accounts
  if (!verified) {
    const otp = generateOtp()
    const otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000)

    const authenticationUpdate = {
      email: email,
      oneTimeCode: otp,
      expiresAt: otpExpiresIn,
      latestRequestAt: new Date(),
      authType: 'createAccount',
      wrongLoginAttempts: 0, // Reset on successful password verification
    }

    await User.findByIdAndUpdate(isUserExist._id, {
      $set: {
        authentication: authenticationUpdate,
      },
    })

    const otpTemplate = emailTemplate.createAccount({
      name: fullName,
      email: isUserExist.email!,
      otp,
    })

    // Send email asynchronously to avoid blocking
    emailHelper.sendEmail(otpTemplate).catch(error => {
      console.error('Failed to send verification email:', error)
    })

    return authResponse(
      StatusCodes.PROXY_AUTHENTICATION_REQUIRED, 
      config.node_env === 'development' 
        ? `Verification required. OTP: ${email} ${otp}`   
        : "Account verification required. Please check your email for OTP."
    )
  }


  // Successful login - single atomic update
  const loginUpdateData: any = {
    deviceToken: payload.deviceToken,
    'authentication.restrictionLeftAt': null,
    'authentication.wrongLoginAttempts': 0,
    'authentication.latestRequestAt': new Date(),
  }

  // If user was restricted but restriction expired, reactivate account
  if (status === USER_STATUS.RESTRICTED) {
    loginUpdateData.status = USER_STATUS.ACTIVE
  }

  // Single database update for successful login
  await User.findByIdAndUpdate(
    isUserExist._id,
    { $set: loginUpdateData },
    { new: true }
  )

  // Generate tokens
  const tokens = AuthHelper.createToken(isUserExist._id, isUserExist.role, fullName, isUserExist.email)

  // Log successful login for audit purposes
  console.log(`Successful login: User ${isUserExist._id} (${email}) at ${new Date().toISOString()}`)

  return authResponse(StatusCodes.OK, `Welcome back ${fullName}`, isUserExist.role, tokens.accessToken, tokens.refreshToken)
}

export const AuthCommonServices = {
  handleLoginLogic,
}



export const authResponse = (status: number, message: string,role?: string, accessToken?: string, refreshToken?: string, token?: string): IAuthResponse => {
  return {
    status,
    message,
    ...(role && { role }),
    ...(accessToken && { accessToken }),
    ...(refreshToken && { refreshToken }),
    ...(token && { token }),
  }
}


export const getFullName = (firstName:string, lastName?:string) => {
  return lastName ? `${firstName} ${lastName}` : firstName 
}