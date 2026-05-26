const RESET_HOURS = 24;
const RESET_MS = RESET_HOURS * 60 * 60 * 1000;

const getDecisionDate = (request) => {
  if (request.respondedAt) {
    return new Date(request.respondedAt);
  }

  return new Date(request.requestedAt);
};

export const isDeniedRequestExpired = (request) => {
  if (request.status !== 'denied') {
    return false;
  }

  return Date.now() - getDecisionDate(request).getTime() >= RESET_MS;
};

export const isActiveUserRequest = (request) => !isDeniedRequestExpired(request);

export const getRequestResetHours = () => RESET_HOURS;
