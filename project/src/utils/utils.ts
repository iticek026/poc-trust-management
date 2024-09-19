export function pickProperties<T>(obj: T, keys: (keyof T)[]): Partial<T> {
  const newObj: Partial<T> = {};
  keys.forEach((key) => {
    newObj[key] = obj[key];
  });
  return newObj;
}
