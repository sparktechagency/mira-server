import { Request, Response } from 'express'
import { PublicServices } from './public.service'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'

const createPublic = catchAsync(async (req: Request, res: Response) => {
  const publicData = req.body
  const result = await PublicServices.createPublic(publicData)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `${publicData?.type} updated successfully`,
    data: result,
  })
})

const getAllPublics = catchAsync(async (req: Request, res: Response) => {
  const result = await PublicServices.getAllPublics(
    req.params.type as 'privacy-policy' | 'terms-and-condition',
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `${req.params.type} retrieved successfully`,
    data: result,
  })
})

const deletePublic = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await PublicServices.deletePublic(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `${result?.type} deleted successfully`,
    data: result,
  })
})

const createContact = catchAsync(async (req: Request, res: Response) => {
  const result = await PublicServices.createContact(req.body)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Thank you for contacting us. We will get back to you soon.',
    data: result,
  })
})

const createFaq = catchAsync(async (req: Request, res: Response) => {
  const faqData = req.body
  const result = await PublicServices.createFaq(faqData)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Faq created successfully',
    data: result,
  })
})

const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const faqData = req.body
  const result = await PublicServices.updateFaq(id, faqData)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq updated successfully',
    data: result,
  })
})

const getSingleFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await PublicServices.getSingleFaq(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq retrieved successfully',
    data: result,
  })
})

const getAllFaqs = catchAsync(async (req: Request, res: Response) => {
  const result = await PublicServices.getAllFaqs()

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faqs retrieved successfully',
    data: result,
  })
})

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await PublicServices.deleteFaq(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faq deleted successfully',
    data: result,
  })
})

export const PublicController = {
  createPublic,
  getAllPublics,
  deletePublic,
  createContact,
  createFaq,
  updateFaq,
  getSingleFaq,
  getAllFaqs,
  deleteFaq,
}
