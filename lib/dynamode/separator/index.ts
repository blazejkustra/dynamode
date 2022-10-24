import { getDynamodeStorage } from '@lib/storage';
import { DefaultError } from '@lib/utils';

export type SeparatorType = {
  get: () => string;
  set: (separator: string) => void;
};

const get = (): string => {
  return getDynamodeStorage().separator;
};

const set = (separator: string): void => {
  if (!separator) throw new DefaultError();
  getDynamodeStorage().setSeparator(separator);
};

const separator: SeparatorType = { get, set };

export default separator;
