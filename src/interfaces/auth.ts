export type IVerifyEmail = {
  email: string
  oneTimeCode: number
}

export type ILoginData = {
  password: string
  userName?: string
  email?:string
  phone?: string
  deviceToken?: string
}

export type IAuthResetPassword = {
  newPassword: string
  confirmPassword: string
}

export type IChangePassword = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
