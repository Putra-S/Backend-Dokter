const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(duration);
dayjs.extend(customParseFormat);

const isValidDate = (dateString) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
};

const calculateAge = (tglLahir) => {
  const today = dayjs();
  const birthDate = dayjs(tglLahir, ['DD-MM-YYYY', 'YYYY-MM-DD']);
  if (!birthDate.isValid()) return ['0', '0', '0'];

  const years = today.diff(birthDate, 'year');
  const birthDatePlusYears = birthDate.add(years, 'year');
  const months = today.diff(birthDatePlusYears, 'month');
  const birthDatePlusMonths = birthDatePlusYears.add(months, 'month');
  const days = today.diff(birthDatePlusMonths, 'day');

  return [`${years}`, `${months}`, `${days}`];
};

module.exports = {
  isValidDate,
  calculateAge,
};
