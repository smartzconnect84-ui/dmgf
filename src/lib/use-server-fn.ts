export function useServerFn<T extends (...args: never[]) => unknown>(action: T): T {
  return action;
}
