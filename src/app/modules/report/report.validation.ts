import mongoose from 'mongoose';
import { z } from 'zod';

export const ReportValidations = {
  create: z.object({
    body:z.object({
      reportedReason: z.string({
        required_error: 'Reported reason is required',
      }),
      reportedUser: z.string().optional(),
      reportedMessage: z.string().optional(),
      reportedComment: z.string().optional(),
    })
  }),

  update: z.object({
    body:z.object({
      reportedReason: z.string().optional(),
    }),
    params:z.object({
      id: z.string({
        required_error: 'Report id is required',
      }).refine((id) => mongoose.isValidObjectId(id), {
        message: 'Invalid report id',
      }),
    }),
  }),
  updateStatus: z.object({
    body:z.object({
      status: z.enum(['pending', 'in review', 'resolved', 'rejected']),
      feedBack: z.string().optional(),
    }),
    params:z.object({
      id: z.string({
        required_error: 'Report id is required',
      }).refine((id) => mongoose.isValidObjectId(id), {
        message: 'Invalid report id',
      }),
    }),
  }),
};
