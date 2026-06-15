import cron from 'node-cron';
import prisma from '../config/db.js';
import logger from '../config/logger.js';

// 1. Allocate leaves monthly (Runs at 00:00 on day 1 of every month)
cron.schedule('0 0 1 * *', async () => {
  logger.info('Running monthly leave balance allocation job...');
  try {
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
    });

    for (const employee of employees) {
      // Increment SICK and CASUAL balances by 1
      await prisma.leaveBalance.updateMany({
        where: {
          employeeId: employee.id,
          leaveType: { in: ['SICK', 'CASUAL', 'ANNUAL'] },
        },
        data: {
          balance: {
            increment: 1,
          },
        },
      });
    }
    logger.info(`Monthly leave balances successfully updated for ${employees.length} employees.`);
  } catch (error) {
    logger.error(`Error in monthly leave balance cron job: ${error.message}`);
  }
});

// 2. Alert for pending leave requests (Runs daily at 9:00 AM)
cron.schedule('0 9 * * *', async () => {
  logger.info('Running daily pending leave reminder job...');
  try {
    const pendingCount = await prisma.leave.count({
      where: {
        status: { in: ['PENDING_MANAGER', 'PENDING_HR'] },
      },
    });

    if (pendingCount > 0) {
      logger.info(`Daily Reminder: There are ${pendingCount} pending leave requests requiring review.`);
      // Mock sending an email to HR Admin
    }
  } catch (error) {
    logger.error(`Error in pending leave reminder cron job: ${error.message}`);
  }
});

logger.info('Cron jobs scheduled successfully.');
export default cron;
