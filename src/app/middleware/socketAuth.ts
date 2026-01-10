import { StatusCodes } from "http-status-codes"
import ApiError from "../../errors/ApiError"
import { ErrorResponse, SocketWithUser } from "../../interfaces/socket"
import { ExtendedError } from "socket.io"
import { jwtHelper } from "../../helpers/jwtHelper"
import { Socket } from 'socket.io'
import colors from "colors"
import { logger } from "../../shared/logger"
import config from "../../config"
import { Secret } from "jsonwebtoken"
import { ZodSchema } from "zod"
import handleZodError from "../../errors/handleZodError"

const socketAuth = (...roles: string[]) => {
    return (socket: SocketWithUser, next: (err?: ExtendedError) => void) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.query.token ||
          socket.handshake.headers.authorization
  
  
  
        if (!token) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Authentication token is required to access this resource',
          )
        }
  
        try {
          let jwtToken = extractToken(token)
  
          // Verify token
          const verifiedUser = jwtHelper.verifyToken(jwtToken, config.jwt.jwt_secret as Secret)
  
          // Attach user to socket
          socket.user = {
            authId: verifiedUser.authId,
            name: verifiedUser.name,
            email: verifiedUser.email,
            role: verifiedUser.role,
            ...verifiedUser,
          }
  
          // Guard user based on roles
          if (roles.length && !roles.includes(verifiedUser.role)) {
            logger.error(
              colors.red(
                `Socket authentication failed: User role ${verifiedUser.role} not authorized`,
              ),
            )
            return next(
              new ApiError(StatusCodes.FORBIDDEN, "You don't have permission to access this socket event"),
            )
          }
  
          logger.info(
            colors.green(`Socket authenticated for user: ${verifiedUser.authId}`),
          )
          next()
        } catch (error) {
        if(error instanceof Error && error.name === 'TokenExpiredError') {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Access Token has expired')
          }
          throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid Access Token')
        }
      } catch (error) {
        if (error instanceof ApiError) {
          const apiError = error as ApiError
          const errorResponse: ErrorResponse = {
            statusCode: apiError.statusCode,
            error: getErrorName(apiError.statusCode),
            message: apiError.message,
          }
          socket.emit('socket_error', errorResponse)
        }
        next(error as ExtendedError)
      }
    }
  }



  const handleSocketRequest = (socket: Socket, ...roles: string[]) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.query.token ||
        socket.handshake.headers.authorization
  
      let jwtToken = extractToken(token)
  
      // Verify token
      const verifiedUser = jwtHelper.verifyToken(jwtToken, config.jwt.jwt_secret as Secret)
      // Guard user based on roles
      if (roles.length && !roles.includes(verifiedUser.role)) {
        socket.emit(
          'socket_error',
          createErrorResponse(
            StatusCodes.FORBIDDEN,
            "You don't have permission to access this socket event",
          ),
        )
        return null
      }
  
      return {
        ...verifiedUser,
      }
    } catch (error) {
        handleSocketError(socket, error)
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Access Token has expired')
        }
        throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid Access Token')

    }
  }
  


  function createErrorResponse(
    statusCode: number,
    message: string,
    errorMessages?: Record<string, unknown>[],
  ): ErrorResponse {
    return {
      statusCode,
      error: getErrorName(statusCode),
      message,
      ...(errorMessages && { errorMessages }),
    }
  }

  function handleSocketError(socket: SocketWithUser, error: any): void {
    if (error instanceof ApiError) {
      socket.emit(
        'socket_error',
        createErrorResponse(error.statusCode, error.message),
      )
    } else {
      socket.emit(
        'socket_error',
        createErrorResponse(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Internal server error',
        ),
      )
    }
    logger.error(colors.red(`Socket error: ${error.message}`), error)
  }

  function extractToken(token: string | string[]): string {
    if (typeof token === 'string') {
      if (token.includes('{')) {
        try {
          const parsedToken = JSON.parse(token)
          return parsedToken?.token?.split(' ')[1] || parsedToken?.token || token
        } catch {
          // If parsing fails, continue with other methods
        }
      }
  
      if (token.startsWith('Bearer ')) {
        return token.split(' ')[1]
      }
    }
    return token as string
  }
  


  function getErrorName(statusCode: number): string {
    switch (statusCode) {
      case StatusCodes.BAD_REQUEST:
        return 'Bad Request'
      case StatusCodes.UNAUTHORIZED:
        return 'Unauthorized'
      case StatusCodes.FORBIDDEN:
        return 'Forbidden'
      case StatusCodes.NOT_FOUND:
        return 'Not Found'
      default:
        return 'Error'
    }
  }
  

/**
 * Validate socket event data against schema
 */
const validateEventData = <T>(
    socket: Socket,
    schema: ZodSchema,
    data: any,
  ): T | null => {
    try {
      return schema.parse(data) as T
    } catch (error: any) {
      const zodError = handleZodError(error)
      socket.emit('socket_error', {
        statusCode: zodError.statusCode,
        error: getErrorName(zodError.statusCode),
        message: zodError.message,
        errorMessages: zodError.errorMessages,
      })
      return null
    }
  } 
  
  export const socketMiddleware = {
    socketAuth,
    validateEventData,
    handleSocketRequest,
  }
  