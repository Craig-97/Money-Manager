/* Data selectors */
export const getAmountTotal = amounts => amounts?.reduce((n, { amount }) => n + amount, 0);

export const getDiscIncome = (monthlyIncome, billsTotal) => monthlyIncome - billsTotal;

export const getBankFreeToSpend = (bankBalance, paymentsDueTotal) => bankBalance - paymentsDueTotal;

export const getPayDayDiscIncome = (bankFreeToSpend, discIncome) => bankFreeToSpend + discIncome;
