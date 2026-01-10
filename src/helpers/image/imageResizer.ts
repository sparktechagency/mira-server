import sharp from 'sharp'

interface ImageOptions {
  resize?: boolean // Optional flag to enable resizing
  width?: number // Resize width (if resize is true)
  quality?: number // Quality for JPEG/WEBP (optional, default 80)
}

const optimizeImage = async (
  file: Buffer,
  options: ImageOptions = {},
): Promise<Buffer> => {
  const { resize = false, width = 1024, quality = 80 } = options

  // Detect the file format from the MIME type
  const format = await sharp(file)
    .metadata()
    .then(metadata => metadata.format)

  let image = sharp(file)

  // Resize if the resize option is set to true
  if (resize) {
    image = image.resize(width)
  }

  // Apply quality settings based on the image format
  if (format === 'jpeg' || format === 'jpg') {
    image = image.jpeg({ quality })
  } else if (format === 'png') {
    image = image.png({ quality: Math.round(quality / 10) }) // PNG quality ranges 0-9 (sharp uses 0-9)
  } else if (format === 'webp') {
    image = image.webp({ quality })
  } else {
    throw new Error('Unsupported image format')
  }

  // Convert the image to a buffer and return the optimized image
  const optimizedImage = await image.toBuffer()
  return optimizedImage
}

export default optimizeImage
