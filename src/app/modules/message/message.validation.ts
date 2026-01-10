import { z } from 'zod';

export const MessageValidations = {
  create:z.object({
    body:z.object({
      message:z.string({
        required_error:'Message is required'
      }).min(5)
    })
  }).refine((data)=>data.body.message.length>5,{
    message:'Message must be at least 5 characters'
  }),
  share:z.object({
    params:z.object({
      messageId:z.string({
        required_error:'Message id is required'
      })
    })
  })
};
