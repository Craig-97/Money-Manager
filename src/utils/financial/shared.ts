// General case: convert "SNAKE_CASE" to "Title Case"
export const formatLabel = (value: string) => {
  // Handles special cases first
  if (value === 'FOUR_WEEKLY') return '4 Weekly';

  return value
    .toLowerCase()
    .split('_')
    .map(word => {
      if (word === 'and') return '&';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};
