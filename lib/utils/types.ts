import type { AttributeValue } from '@aws-sdk/client-dynamodb';

export type AttributeMap = Record<string, AttributeValue>;
export type GenericObject = Record<string | symbol, unknown>;

export type ExtractPathExpressions<T> = Exclude<
  keyof {
    [P in Exclude<keyof T, symbol> as T[P] extends unknown[] | readonly unknown[]
      ? P | `${P}[${number}]` | `${P}[${number}].${Exclude<ExtractPathExpressions<T[P][number]>, keyof number | keyof string>}`
      : T[P] extends { [x: string]: unknown }
      ? `${P}.${ExtractPathExpressions<T[P]>}` | P
      : P]: string;
  },
  symbol
>;
