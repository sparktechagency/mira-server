import { ZodError, ZodIssue } from 'zod'
import {
  IGenericErrorMessage,
  IGenericErrorResponse,
} from '../interfaces/error'

const handleZodError = (error: ZodError): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = error.issues.map((issue: ZodIssue) => {
    if (issue?.code === 'invalid_type') {
      return {
        path: issue?.path[issue.path.length - 1],
        message: `${issue?.path[issue.path.length - 1]} must be a ${issue?.expected}`,
      }
    }
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    }
  })

  const statusCode = 400

  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: errors,
  }
}

export default handleZodError
