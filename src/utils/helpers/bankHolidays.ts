import { BankHoliday, BANK_HOLIDAY_REGION } from '~/types';

const BANK_HOLIDAYS_API = 'https://www.gov.uk/bank-holidays.json';

export const getBankHolidays = async (region: BANK_HOLIDAY_REGION): Promise<BankHoliday[]> => {
  try {
    const response = await fetch(BANK_HOLIDAYS_API);
    const data = await response.json();
    return data[region]?.events || [];
  } catch (error) {
    console.error('Error fetching bank holidays:', error);
    return [];
  }
};

export const isBankHoliday = (date: Date, bankHolidays: BankHoliday[]): boolean => {
  const dateString = date.toISOString().split('T')[0];
  return bankHolidays.some(holiday => holiday.date === dateString);
};
