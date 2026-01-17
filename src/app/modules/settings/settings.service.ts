import path from 'path'
import { ISettings } from './settings.interface'
import Settings from './settings.model'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
const upsertSettings = async (
  payload: Partial<ISettings>,
): Promise<ISettings> => {
  const existingSettings = await Settings.findOne({})
  if (existingSettings) {
    const updatedSettings = await Settings.findOneAndUpdate({}, payload, {
      new: true,
    })
    return updatedSettings!
  } else {
    const newSettings = await Settings.create({
      aboutUs: payload.aboutUs || '',
      termsOfService: payload.termsOfService || '',
      support: payload.support || '',
      privacyPolicy: payload.privacyPolicy || '',
    })
    if (!newSettings) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add settings')
    }
    return newSettings
  }
}
const getSettings = async (key: string) => {
  const settings: any = await Settings.findOne()
  if (!settings) {
    await Settings.create({
      termsOfService: '',
      privacyPolicy: '',
      support: '',
      aboutUs: '',
    })
  }
  if (key) {
    if (settings[key] !== undefined) {
      return settings[key]
    }
    return ''
  }
  return settings || {}
}
const getTermsOfService = async () => {
  const settings: any = await Settings.findOne()
  if (!settings) {
    return ''
  }
  return settings.termsOfService
}
const getSupport = async () => {
  const settings: any = await Settings.findOne()

  if (!settings) {
    return ''
  }
  return settings.support
}
const getPrivacyPolicy = async () => {
  const settings: any = await Settings.findOne()

  if (!settings) {
    return ''
  }
  return settings.privacyPolicy
}
const getAboutUs = async () => {
  const settings: any = await Settings.findOne()

  if (!settings) {
    return ''
  }
  return settings.aboutUs
}

// const getPrivacyPolicy = async () => {
//   return path.join(__dirname, '..', 'htmlResponse', 'privacyPolicy.html');
// };

const getAccountDelete = async () => {
  return path.join(__dirname, '..', 'htmlResponse', 'accountDelete.html')
}

// const getSupport = async () => {
//   return path.join(__dirname, '..', 'htmlResponse', 'support.html');
// };
export const settingsService = {
  upsertSettings,
  getSettings,
  getPrivacyPolicy,
  getAccountDelete,
  getSupport,
  getTermsOfService,
  getAboutUs,
}
