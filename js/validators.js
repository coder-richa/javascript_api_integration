function isValidDate(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (dateStr.match(regex) === null) {
    return false;
  }

  const date = new Date(dateStr);

  const timestamp = date.getTime();

  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) {
    return false;
  }

  return date.toISOString().startsWith(dateStr);
}

const compareDates = (a, b) => {
  const aDate = new Date(a);
  const bDate = new Date(b);
  return aDate.getTime() - bDate.getTime();
};

const isEmptyString = (str) => str.trim() === "";
