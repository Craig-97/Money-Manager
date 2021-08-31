/* Data selectors */
export const getAmountTotal = (amounts: Array<any>) =>
  amounts?.reduce((n, { amount }) => n + amount, 0);

export const getDiscIncome = (monthlyIncome: number, billsTotal: number) =>
  monthlyIncome - billsTotal;

export const getBankFreeToSpend = (
  bankBalance: number,
  paymentsDueTotal: number
) => bankBalance - paymentsDueTotal;

export const getPayDayDiscIncome = (
  bankFreeToSpend: number,
  discIncome: number
) => bankFreeToSpend + discIncome;
