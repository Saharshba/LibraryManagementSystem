export const formatDate = (value) => {
  if (!value) {
    return 'Unavailable';
  }

  return new Date(value).toLocaleDateString();
};
