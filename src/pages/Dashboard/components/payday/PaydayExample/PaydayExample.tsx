import { usePaydayExample } from '../../../hooks';
import { PaydayPrompt } from '../PaydayPrompt';

/* The tour's look at the payday prompt, with made-up money */
export const PaydayExample = () => <PaydayPrompt prompt={usePaydayExample()} example />;
