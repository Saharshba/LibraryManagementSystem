import { formatDate } from './date';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const isDueSoon = (dateValue) => {
  if (!dateValue) {
    return false;
  }

  const dueDate = new Date(dateValue).getTime();
  const now = Date.now();
  return dueDate >= now && dueDate - now <= WEEK_IN_MS;
};

export const collectDueAlerts = ({ books = [], memberships = [] } = {}) => {
  const alerts = [];

  books.forEach((book) => {
    if (isDueSoon(book.dueDate)) {
      alerts.push({
        type: 'book',
        message: `Book "${book.title}" is due on ${formatDate(book.dueDate)}${book.assignedTo ? ` for ${book.assignedTo.fullName || book.assignedTo.username}` : ''}.`,
      });
    }
  });

  memberships.forEach((user) => {
    if (isDueSoon(user?.membership?.nextDueDate)) {
      alerts.push({
        type: 'membership',
        message: `Membership for ${user.fullName || user.username} is due on ${formatDate(user.membership.nextDueDate)}.`,
      });
    }
  });

  return alerts;
};