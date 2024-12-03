export const asyncWrapper = <T>(func: () => T): Promise<T> => {
  return new Promise<T>((resolve) => setTimeout(() => resolve(func()), 1000));
};
