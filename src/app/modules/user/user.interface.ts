import { Model, Types } from 'mongoose'

type IAuthentication = {
  restrictionLeftAt: Date | null
  resetPassword: boolean
  wrongLoginAttempts: number
  passwordChangedAt?: Date
  oneTimeCode: string
  latestRequestAt: Date
  expiresAt?: Date
  requestCount?: number
  authType?: 'createAccount' | 'resetPassword'
}


export type Point = {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

export type IUser = {
  _id: Types.ObjectId
  firstName: string
  lastName: string
  userName: string
  email: string
  status: string
  profile:string
  category: string
  verified: boolean
  location: Point
  password: string
  role: string
  dailyStreak: number
  lastLoginDate?: Date
  appId?: string
  deviceToken?: string

  authentication: IAuthentication
  createdAt: Date
  updatedAt: Date
}

export type IUserFilterableFields={
  searchTerm?:string
  userName?:string
  email?:string
  role?:string
  status?:string
  category?:string
}

export type UserModel = {
  isPasswordMatched: (
    givenPassword: string,
    savedPassword: string,
  ) => Promise<boolean>
} & Model<IUser>


export interface UsernameValidationResult {
  available: boolean;
  reason?: string;
  suggestions?: string[];
}

export interface UsernameConfig {
  minLength: number;
  maxLength: number;
  allowedPattern: RegExp;
  reservedWords: string[];
  maxSuggestions: number;
}