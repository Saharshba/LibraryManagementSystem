const BookRequest = require('../models/BookRequest');

const RESET_HOURS = parseInt(process.env.REQUEST_RESET_HOURS || '24', 10);
const DELETE_DAYS = parseInt(process.env.REQUEST_DELETE_DAYS || '30', 10);
const INTERVAL_MINUTES = parseInt(process.env.REQUEST_CLEANUP_INTERVAL_MINUTES || '60', 10);

async function runCleanup() {
  try {
    const now = new Date();

    // Reset accepted/denied requests older than RESET_HOURS back to pending
    const resetBefore = new Date(now.getTime() - RESET_HOURS * 60 * 60 * 1000);
    const resetResult = await BookRequest.updateMany(
      { status: { $in: ['accepted', 'denied'] }, respondedAt: { $lte: resetBefore } },
      { $set: { status: 'pending', respondedAt: null, respondedBy: null, adminNote: '' } }
    );

    // Delete requests older than DELETE_DAYS since requestedAt
    const deleteBefore = new Date(now.getTime() - DELETE_DAYS * 24 * 60 * 60 * 1000);
    const deleteResult = await BookRequest.deleteMany({ requestedAt: { $lte: deleteBefore } });

    // Logging minimal info
    if ((resetResult?.modifiedCount ?? 0) > 0 || (deleteResult?.deletedCount ?? 0) > 0) {
      // eslint-disable-next-line no-console
      console.info(`Request cleanup: reset ${resetResult.modifiedCount || 0}, deleted ${deleteResult.deletedCount || 0}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Request cleanup error:', err);
  }
}

function startScheduler() {
  // Run once immediately, then on interval
  runCleanup().catch(() => {});
  setInterval(runCleanup, INTERVAL_MINUTES * 60 * 1000);
}

module.exports = { startScheduler };
