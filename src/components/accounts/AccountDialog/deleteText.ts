interface Options {
  // Payments that go out of or into the account
  moving: readonly { kind: string; type: string }[];
  // How many move money into it
  paidIn: number;
  paidIntoName: string;
  // Two or more accounts to spend from are left, so they can be moved to another
  canMove: boolean;
}

/*
 * What deleting an account does to its payments, as a count rather than every name, as an account
 * can have lots: "Its 3 payments will come out of Everyday instead, where you get paid. You can move
 * them on Recurring."
 */
export const deleteTextOf = ({ moving, paidIn, paidIntoName, canMove }: Options) => {
  const one = moving.length === 1;
  const incomes = moving.filter(payment => payment.type === 'INCOME').length;
  const how = incomes === moving.length ? 'go into' : incomes === 0 ? 'come out of' : 'use';
  const movable = canMove && moving.some(payment => payment.kind === 'recurring');
  const moves = moving.length
    ? `Its ${one ? 'payment' : `${moving.length} payments`} will ${how} ${paidIntoName} instead, where you get paid.${
        movable ? ` You can move ${one ? 'it' : 'them'} on Recurring.` : ''
      }`
    : null;
  return {
    moves,
    paidIn: paidIn
      ? paidIn === 1
        ? 'The payment into it will carry on as a plain expense.'
        : `The ${paidIn} payments into it will carry on as plain expenses.`
      : null
  };
};
