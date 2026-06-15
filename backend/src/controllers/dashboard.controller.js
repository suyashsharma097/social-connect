import dashboardService from '../services/dashboard.service.js';

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user);
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStats,
};
