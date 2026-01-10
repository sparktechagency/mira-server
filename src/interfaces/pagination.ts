export type IPaginationOptions = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const paginationFields = ['page', 'limit', 'sortBy', 'sortOrder', 'skip']
