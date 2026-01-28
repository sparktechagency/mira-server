import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import {
  IUser,
  IUserFilterableFields,
  UsernameConfig,
  UsernameValidationResult,
} from './user.interface'
import { User } from './user.model'

import { USER_ROLES, USER_STATUS } from '../../../enum/user'

import { JwtPayload } from 'jsonwebtoken'
import { logger } from '../../../shared/logger'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { userSearchableFields } from './user.constants'
import { IGenericResponse } from '../../../interfaces/response'
import config from '../../../config'

const updateProfile = async (user: JwtPayload, payload: Partial<IUser>) => {
  // console.log(first)
  const updatedProfile = await User.findOneAndUpdate(
    { _id: user.authId, status: { $nin: [USER_STATUS.DELETED] } },
    {
      $set: payload,
    },
    { new: true },
  )

  if (!updatedProfile) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update profile.')
  }

  return updatedProfile
}

const createAdmin = async (): Promise<Partial<IUser> | null> => {
  const admin = {
    email: config.admin_email,
    firstName: 'MIRA',
    lastName: 'MIRA',
    password: config.admin_password,
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    verified: true,
    authentication: {
      oneTimeCode: null,
      restrictionLeftAt: null,
      expiresAt: null,
      latestRequestAt: new Date(),
      authType: '',
    },
  }

  const isAdminExist = await User.findOne({
    email: admin.email,
    status: { $nin: [USER_STATUS.DELETED] },
  })

  if (isAdminExist) {
    logger.log('info', 'Admin account already exist, skipping creation.🦥')
    return isAdminExist
  }
  const result = await User.create([admin])
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin')
  }
  return result[0]
}

const getProfile = async (user: JwtPayload) => {
  const profile = await User.findById(user.authId)

  if (!profile) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get profile.')
  }

  if (profile.status === USER_STATUS.DELETED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get profile.')
  }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const lastLoginStr = profile.lastLoginDate
    ? profile.lastLoginDate.toISOString().split('T')[0]
    : null

  let newStreak = profile.dailyStreak

  if (lastLoginStr !== todayStr) {
    if (profile.lastLoginDate) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastLoginStr === yesterdayStr) {
        newStreak = profile.dailyStreak + 1
      } else {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }

    await User.updateOne(
      { _id: profile._id },
      {
        $set: {
          dailyStreak: newStreak,
          lastLoginDate: now,
        },
      },
    )

    profile.dailyStreak = newStreak
    profile.lastLoginDate = now
  }

  return profile
}
const getAllUsers = async (
  user: JwtPayload,
  pagination: IPaginationOptions,
  filters: IUserFilterableFields,
): Promise<IGenericResponse<IUser[]>> => {
  const { searchTerm, ...filterData } = filters
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)
  const andConditions = []

  // Search condition if searchTerm is provided
  if (searchTerm) {
    andConditions.push({
      $or: userSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })
  }

  // Adding additional filters if any
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    })
  }

  andConditions.push({
    role: { $ne: USER_ROLES.ADMIN },
  })

  // Combine conditions
  const whereConditions =
    andConditions.length > 0
      ? {
          $and: andConditions,
        }
      : {}

  // Fetch total count and result simultaneously
  const [total, result] = await Promise.all([
    User.countDocuments(whereConditions),
    User.find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .lean(),
  ])

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  }
}

// Application-specific configuration
const USERNAME_CONFIG: UsernameConfig = {
  minLength: 3,
  maxLength: 10,
  allowedPattern: /^[a-zA-Z0-9_-]+$/, // Letters, numbers, underscore, hyphen
  reservedWords: [
    'admin',
    'administrator',
    'root',
    'user',
    'guest',
    'api',
    'www',
    'mail',
    'support',
    'help',
    'info',
    'contact',
    'team',
    'staff',
    'official',
    'system',
    'null',
    'undefined',
    'test',
    'demo',
    'sample',
  ],
  maxSuggestions: 3,
}

class UsernameService {
  private config: UsernameConfig

  constructor(config: UsernameConfig = USERNAME_CONFIG) {
    this.config = config
  }

  async checkUsernameAvailability(
    username: string,
    includeSuggestions: boolean = true,
  ): Promise<UsernameValidationResult> {
    try {
      const validationResult = this.validateUsernameFormat(username)
      if (!validationResult.isValid) {
        return {
          available: false,
          reason: validationResult.reason,
          suggestions:
            includeSuggestions && validationResult.canSuggest
              ? await this.generateSuggestions(username)
              : undefined,
        }
      }

      const normalizedUsername = this.normalizeUsername(username)

      const exists = await this.checkUsernameExists(normalizedUsername)

      if (exists) {
        return {
          available: false,
          reason: 'Username is already taken',
          suggestions: includeSuggestions
            ? await this.generateSuggestions(normalizedUsername)
            : undefined,
        }
      }

      return { available: true }
    } catch (error) {
      console.error('Error checking username availability:', error)
      return {
        available: false,
        reason: 'Unable to check availability. Please try again.',
      }
    }
  }

  private validateUsernameFormat(username: string): {
    isValid: boolean
    reason?: string
    canSuggest: boolean
  } {
    if (!username || typeof username !== 'string') {
      return {
        isValid: false,
        reason: 'Username is required',
        canSuggest: false,
      }
    }

    const trimmed = username.trim()

    if (trimmed.length === 0) {
      return {
        isValid: false,
        reason: 'Username cannot be empty',
        canSuggest: false,
      }
    }

    if (trimmed.length < this.config.minLength) {
      return {
        isValid: false,
        reason: `Username must be at least ${this.config.minLength} characters long`,
        canSuggest: trimmed.length >= 2, // Can suggest if at least 2 chars
      }
    }

    if (trimmed.length > this.config.maxLength) {
      return {
        isValid: false,
        reason: `Username cannot exceed ${this.config.maxLength} characters`,
        canSuggest: true,
      }
    }

    if (!this.config.allowedPattern.test(trimmed)) {
      return {
        isValid: false,
        reason:
          'Username can only contain letters, numbers, hyphens, and underscores',
        canSuggest: this.hasValidCharacters(trimmed),
      }
    }

    // Check for reserved words
    const normalizedUsername = this.normalizeUsername(trimmed)
    if (this.config.reservedWords.includes(normalizedUsername)) {
      return {
        isValid: false,
        reason: 'This username is reserved',
        canSuggest: true,
      }
    }

    // Check for patterns that might be problematic
    if (this.isProblematicPattern(normalizedUsername)) {
      return {
        isValid: false,
        reason: 'Username contains invalid pattern',
        canSuggest: true,
      }
    }

    return { isValid: true, canSuggest: true }
  }

  private normalizeUsername(username: string): string {
    return username.trim().toLowerCase()
  }

  private async checkUsernameExists(
    normalizedUsername: string,
  ): Promise<boolean> {
    const count = await User.countDocuments({
      userName: {
        $regex: `^${this.escapeRegex(normalizedUsername)}$`,
        $options: 'i',
      },
    })
    return count > 0
  }

  private async generateSuggestions(baseUsername: string): Promise<string[]> {
    try {
      const normalizedBase = this.normalizeUsername(baseUsername)
      const cleanBase = this.cleanUsernameForSuggestions(normalizedBase)

      if (!cleanBase || cleanBase.length < 2) {
        return []
      }

      const candidates = this.generateSuggestionCandidates(cleanBase)

      const availableSuggestions =
        await this.filterAvailableSuggestions(candidates)

      return availableSuggestions.slice(0, this.config.maxSuggestions)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      return []
    }
  }

  private generateSuggestionCandidates(cleanBase: string): string[] {
    const candidates: string[] = []
    const currentYear = new Date().getFullYear().toString().slice(-2)

    for (let i = 1; i <= 20; i++) {
      candidates.push(`${cleanBase}${i}`)
    }

    for (let i = 1; i <= 10; i++) {
      candidates.push(`${cleanBase}_${i}`)
    }

    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(Math.random() * 999) + 1
      candidates.push(`${cleanBase}${randomNum}`)
    }

    candidates.push(
      `${cleanBase}${currentYear}`,
      `${cleanBase}_${currentYear}`,
      `${cleanBase}2024`,
      `${cleanBase}_2024`,
    )

    candidates.push(
      `${cleanBase}_user`,
      `${cleanBase}_official`,
      `${cleanBase}_real`,
      `user_${cleanBase}`,
      `the_${cleanBase}`,
      `${cleanBase}_app`,
      `${cleanBase}x`,
      `${cleanBase}_v2`,
    )

    if (cleanBase.length > 8) {
      const shortened = cleanBase.slice(0, 8)
      for (let i = 1; i <= 5; i++) {
        candidates.push(`${shortened}${i}`)
      }
    }

    candidates.push(
      `${cleanBase}pro`,
      `${cleanBase}dev`,
      `${cleanBase}123`,
      `${cleanBase}_1`,
      `new_${cleanBase}`,
      `${cleanBase}_new`,
    )

    return [...new Set(candidates)]
      .filter(candidate => this.isValidSuggestion(candidate))
      .slice(0, 30)
  }

  private async filterAvailableSuggestions(
    candidates: string[],
  ): Promise<string[]> {
    if (candidates.length === 0) return []

    const regexPatterns = candidates.map(
      candidate => new RegExp(`^${this.escapeRegex(candidate)}$`, 'i'),
    )

    const existingUsers = await User.find({
      userName: { $in: regexPatterns },
    })
      .select('userName')
      .lean()

    const takenUsernames = new Set(
      existingUsers.map(user => this.normalizeUsername(user.userName)),
    )

    return candidates.filter(
      candidate => !takenUsernames.has(this.normalizeUsername(candidate)),
    )
  }

  private cleanUsernameForSuggestions(username: string): string {
    return username
      .replace(/[^a-z0-9_-]/g, '')
      .replace(/^[_-]+|[_-]+$/g, '')
      .substring(0, this.config.maxLength - 3)
  }

  private isValidSuggestion(suggestion: string): boolean {
    return (
      suggestion.length >= this.config.minLength &&
      suggestion.length <= this.config.maxLength &&
      this.config.allowedPattern.test(suggestion) &&
      !this.config.reservedWords.includes(this.normalizeUsername(suggestion)) &&
      !this.isProblematicPattern(suggestion)
    )
  }

  private hasValidCharacters(username: string): boolean {
    const validChars = username.match(/[a-zA-Z0-9_-]/g) || []
    return validChars.length / username.length >= 0.7
  }

  private isProblematicPattern(username: string): boolean {
    return (
      /^[_-]/.test(username) ||
      /[_-]$/.test(username) ||
      /[_-]{2,}/.test(username) ||
      /^\d+$/.test(username)
    )
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

// Export singleton instance
const usernameService = new UsernameService()

// Main exported functions
export const checkAndGetUserNameAvailablity = async (
  username: string,
  includeSuggestions: boolean = true,
): Promise<UsernameValidationResult> => {
  return usernameService.checkUsernameAvailability(username, includeSuggestions)
}

// export const generateUsernameSuggestions = async (
//   username: string
// ): Promise<string[]> => {
//   const result = await usernameService.checkUsernameAvailability(username, true);
//   return result.suggestions || [];
// };

export const UserServices = {
  updateProfile,
  createAdmin,
  checkAndGetUserNameAvailablity,
  getProfile,
  getAllUsers,
}
