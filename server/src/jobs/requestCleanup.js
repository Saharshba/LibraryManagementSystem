const BookRequest = require('../models/BookRequest');

const RESET_HOURS = parseInt(process.env.REQUEST_RESET_HOURS || '24', 10);
const DELETE_DAYS = parseInt(process.env.REQUEST_DELETE_DAYS || '30', 10);

const getResetBefore = () => new Date(Date.now() - RESET_HOURS * 60 * 60 * 1000);

const expiredDeniedQuery = (resetBefore = getResetBefore()) => ({
  status: 'denied',
  $or: [
    { respondedAt: { $lte: resetBefore } },
    { respondedAt: null, requestedAt: { $lte: resetBefore } },
  ],
});

async function runCleanup() {
  const now = new Date();
  const resetBefore = getResetBefore();

  const deniedDeleteResult = await BookRequest.deleteMany(expiredDeniedQuery(resetBefore));

  const deleteBefore = new Date(now.getTime() - DELETE_DAYS * 24 * 60 * 60 * 1000);
  const staleDeleteResult = await BookRequest.deleteMany({
    requestedAt: { $lte: deleteBefore },
    status: { $in: ['pending', 'accepted', 'denied'] },
  });

  if ((deniedDeleteResult?.deletedCount ?? 0) > 0 || (staleDeleteResult?.deletedCount ?? 0) > 0) {
    console.info(
      `Request cleanup: removed ${deniedDeleteResult.deletedCount || 0} expired denied, ${staleDeleteResult.deletedCount || 0} stale`
    );
  }

  return {
    expiredDeniedRemoved: deniedDeleteResult?.deletedCount ?? 0,
    staleRemoved: staleDeleteResult?.deletedCount ?? 0,
  };
}

function startScheduler() {
  const intervalMinutes = parseInt(process.env.REQUEST_CLEANUP_INTERVAL_MINUTES || '60', 10);

  runCleanup().catch((err) => console.error('Request cleanup error:', err));
  setInterval(() => {
    runCleanup().catch((err) => console.error('Request cleanup error:', err));
  }, intervalMinutes * 60 * 1000);
}

module.exports = {
  runCleanup,
  startScheduler,
  RESET_HOURS,
  expiredDeniedQuery,
};
