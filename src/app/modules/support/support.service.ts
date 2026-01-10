import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISupportFilterables, ISupport } from './support.interface';
import { Support } from './support.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { supportSearchableFields } from './support.constants';
import { Types } from 'mongoose';


const createSupport = async (
  user: JwtPayload,
  payload: ISupport
): Promise<ISupport> => {
  try {
    const result = await Support.create(payload);
    if (!result) {
      
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Support, please try again with valid data.'
      );
    }

    return result;
  } catch (error: any) {
    
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

const getAllSupports = async (
  user: JwtPayload,
  filterables: ISupportFilterables,
  pagination: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = filterables;
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const andConditions = [];

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: supportSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {};

  const [result, total] = await Promise.all([
    Support
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }).populate('user'),
    Support.countDocuments(whereConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getSingleSupport = async (id: string): Promise<ISupport> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Support ID');
  }

  const result = await Support.findById(id).populate('user');
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested support not found, please try again with valid id'
    );
  }

  return result;
};

const updateSupport = async (
  id: string,
  payload: Partial<ISupport>
): Promise<ISupport | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Support ID');
  }

  const result = await Support.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  ).populate('user');

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested support not found, please try again with valid id'
    );
  }

  return result;
};

const deleteSupport = async (id: string): Promise<ISupport> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Support ID');
  }

  const result = await Support.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting support, please try again with valid id.'
    );
  }

  return result;
};

export const SupportServices = {
  createSupport,
  getAllSupports,
  getSingleSupport,
  updateSupport,
  deleteSupport,
};