export const useCurrentDate = () => {
  const date = new Date();
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  } as const;

  return {currentDate: date.toLocaleDateString('en-US', options)};
};
