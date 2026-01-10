import { USER_ROLES, USER_STATUS } from "../../../enum/user"
import { User } from "../user/user.model"

const getGeneralStats = async ()=> {
    const [totalUsers, totalActiveUser, totalDeactivatedUsers] = await Promise.all([
      User.countDocuments({role: USER_ROLES.USER}),
      User.countDocuments({ role: USER_ROLES.USER, status: USER_STATUS.ACTIVE }),
      User.countDocuments({ role: USER_ROLES.USER, status: {$nin:[USER_STATUS.ACTIVE]} }),
    ])

  return {
    totalUsers,
    totalActiveUser,
    totalDeactivatedUsers,
  }
}


const getMonthlyUserStats = async (year: number) => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
  const currentYear = currentDate.getFullYear()

  // Get monthly user registration data
  const monthlyStats = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.USER,
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        totalUsers: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ])

  // Create a map for easy lookup
  const statsMap = new Map()
  monthlyStats.forEach(stat => {
    statsMap.set(stat._id.month, stat.totalUsers)
  })

  // Generate all 12 months with proper format
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const result: Record<string, { totalUser: number; thisMonthUser: number }> = {}

  for (let month = 1; month <= 12; month++) {
    const monthName = monthNames[month - 1]
    const totalUser = statsMap.get(month) || 0
    const thisMonthUser = (year === currentYear && month === currentMonth) ? totalUser : 0

    result[monthName] = {
      totalUser,
      thisMonthUser
    }
  }

  return result
}

export const DashboardService = {
  getGeneralStats,
  getMonthlyUserStats,
}
