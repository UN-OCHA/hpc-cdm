export const isValidDate = (dateString: string): boolean => {
  // Check the format using regex
  const regEx = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/\d{4}$/;
  if (!dateString.match(regEx)) return false; // Invalid format

  const parts = dateString.split('/');
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (year < 1000 || year > 3000 || month === 0 || month > 12) return false;

  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
    monthLength[1] = 29; // February
  }
  return day > 0 && day <= monthLength[month - 1];
};

export const isValidYear = (yearString: string) => {
  if (!/^\d{4}$/.test(yearString)) {
    return false;
  }

  const year = parseInt(yearString, 10);

  return year >= 1950 && year <= 2100;
};
