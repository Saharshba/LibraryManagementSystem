const RESET_HOURS = parseInt(process.env.REQUEST_RESET_HOURS || '24', 10);
const RESET_MS = RESET_HOURS * 60 * 60 * 1000;

const getDecisionDate = (request) => {
  if (request.respondedAt) {
    return new Date(request.respondedAt);
  }

  return new Date(request.requestedAt);
};

const isDeniedRequestExpired = (request) => {
  if (request.status !== 'denied') {
    return false;
  }

  return Date.now() - getDecisionDate(request).getTime() >= RESET_MS;
};

const isActiveUserRequest = (request) => !isDeniedRequestExpired(request);

module.exports = {
  RESET_HOURS,
  RESET_MS,
  getDecisionDate,
  isDeniedRequestExpired,
  isActiveUserRequest,
};
