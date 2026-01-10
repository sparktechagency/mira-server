import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";

export interface SocketWithUser extends Socket {
    user?: JwtPayload & {
      authId: string
      name: string
      role: string
    }
  }


  // Standard error response format
export interface ErrorResponse {
    statusCode: number
    error: string
    message: string
    errorMessages?: Record<string, unknown>[]
  }
  