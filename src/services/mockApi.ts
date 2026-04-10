export const delay = <T>(data: T, time = 350) => new Promise<T>((resolve) => setTimeout(() => resolve(data), time))
