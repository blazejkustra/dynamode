import { DefaultError } from '@lib/utils';

export type SeparatorType = {
  get: () => string;
  set: (separator: string) => void;
};

let defaultConverter = '#';

const get = (): string => {
  return defaultConverter;
};

const set = (separator: string): void => {
  if (!separator) throw new DefaultError();
  defaultConverter = separator;
};

export default { get, set };
