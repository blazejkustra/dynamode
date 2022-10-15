import type { AttributeValue } from '@aws-sdk/client-dynamodb';

// Common

export type AttributeMap = Record<string, AttributeValue>;
export type GenericObject = Record<string, unknown>;

// Flatten entity

export type Flatten<T, O> = Collapse<Explode<T, O>>;

type Entry = { key: string; value: unknown };

type Collapse<T extends Entry> = { [E in T as E['key']]: E['value'] } extends infer V ? { [K in keyof V]: V[K] } : never;

type Explode<T, O = never> = _Explode<
  T extends readonly unknown[]
    ? {
        [k: `${number}`]: T[number];
      }
    : T,
  O
>;

type _Explode<T, O = never> = T extends infer U
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
          : never;
      }[keyof U]
    : { key: ''; value: U }
  : never;
