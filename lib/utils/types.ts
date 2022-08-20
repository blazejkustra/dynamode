import type { AttributeValue } from '@aws-sdk/client-dynamodb';

export type AttributeMap = Record<string, AttributeValue>;
export type GenericObject = Record<string | symbol, unknown>;

type Entry = { key: string; value: unknown };

type Explode<T, O = never> = _Explode<
  T extends readonly unknown[]
    ? {
        [k: `${number}`]: T[number];
      }
    : T,
  O
>;

type _Explode<T, O = never> = Writable<T, O> extends infer U
  ? U extends O
    ? { key: ''; value: U }
    : U extends object
    ? {
        [K in keyof U]-?: K extends string
          ? Explode<U[K], O> extends infer E
            ? E extends Entry
              ?
                  | {
                      key: E['key'] extends '' ? K : `${K}.${E['key']}`;
                      value: E['value'];
                    }
                  | {
                      key: K;
                      value: U[K];
                    }
              : never
            : never
          : K extends symbol
          ? {
              key: K;
              value: U[K];
            }
          : never;
      }[keyof U]
    : { key: ''; value: U }
  : never;

type Collapse<T extends Entry> = { [E in T as E['key']]: E['value'] } extends infer V ? { [K in keyof V]: V[K] } : never;

type Writable<T, O> = T extends O
  ? T
  : {
      [P in keyof T as IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>]: T[P];
    };

type IfEquals<X, Y, A = X> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : never;

export type Flatten<T, O> = Collapse<Explode<T, O>>;

export type PickByType<T, Value> = {
  [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P];
};
