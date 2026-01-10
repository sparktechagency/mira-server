import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import multer, { FileFilterCallback } from 'multer'
import sharp from 'sharp'
import ApiError from '../../errors/ApiError'

const fileUploadHandler = () => {
  // Configure storage
  const storage = multer.memoryStorage()

  // File filter
  const filterFilter = async (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    try {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg']
      const allowedMediaTypes = ['video/mp4', 'audio/mpeg']
      const allowedDocTypes = ['application/pdf']

      if (
        ['image', 'license', 'signature', 'businessProfile'].includes(
          file.fieldname,
        )
      ) {
        if (allowedImageTypes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(
            new ApiError(
              StatusCodes.BAD_REQUEST,
              'Only .jpeg, .png, .jpg file supported',
            ),
          )
        }
      } else if (file.fieldname === 'media') {
        if (allowedMediaTypes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(
            new ApiError(
              StatusCodes.BAD_REQUEST,
              'Only .mp4, .mp3 file supported',
            ),
          )
        }
      } else if (file.fieldname === 'doc') {
        if (allowedDocTypes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only pdf supported'))
        }
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file is not supported'))
      }
    } catch (error) {
      cb(
        new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'File validation failed',
        ),
      )
    }
  }

  // Configure multer
  const upload = multer({
    storage: storage,
    fileFilter: filterFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB (adjust as needed)
      files: 10, // Maximum number of files allowed
    },
  }).fields([
    { name: 'image', maxCount: 5 },
    { name: 'media', maxCount: 3 },
    { name: 'doc', maxCount: 3 },
  ])

  // Process uploaded images with Sharp
  const processImages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.files) return next()

    try {
      const imageFields = ['image', 'license', 'signature', 'businessProfile']

      // Process each image field
      for (const field of imageFields) {
        const files = (req.files as any)[field]
        if (!files) continue

        // Process each file in the field
        for (const file of files) {
          if (!file.mimetype.startsWith('image')) continue

          // Resize and optimize the image
          const optimizedBuffer = await sharp(file.buffer)
            .resize(1024) // Resize to max width of 800px (maintain aspect ratio)
            .jpeg({ quality: 80 }) // Compress with 80% quality
            .png({ quality: 80 }) // Compress with 80% quality
            .jpeg({ quality: 80 }) // Compress with 80% quality
            .toBuffer()

          // Replace the original buffer with the optimized one
          file.buffer = optimizedBuffer
        }
      }
      next()
    } catch (error) {
      next(
        new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Image processing failed',
        ),
      )
    }
  }

  // Return middleware chain
  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, err => {
      if (err) return next(err)
      processImages(req, res, next)
    })
  }
}

export default fileUploadHandler
