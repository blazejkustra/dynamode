import type { AttributeValue } from '@aws-sdk/client-dynamodb';

// Common

export type AttributeValues = Record<string, AttributeValue>;
export type AttributeNames = Record<string, string>;
export type GenericObject = Record<string, unknown>;

// Flatten entity
export type FlattenObject<T> = CollapseEntries<OmitExcludedTypes<T, T>>;

type Entry = { key: string; value: unknown };
type EmptyEntry<T> = { key: ''; value: T };
type ExcludedTypes = Date | Set<unknown> | Map<unknown, unknown>;

// Transforms entries to one flattened type
type CollapseEntries<T extends Entry> = {
  [E in T as E['key']]: E['value'];
} extends infer V
  ? { [K in keyof V]: V[K] }
  : never;

// Transforms array type to object
type CreateArrayEntry<T, I> = OmitItself<T extends Array<unknown> ? { [k: `__${bigint}__`]: T[number] } : T, I>;

// Omit the type that references itself
type OmitItself<T, I> = T extends I ? EmptyEntry<T> : OmitExcludedTypes<T, I>;

// Omit the type that is listed in ExcludedTypes union
type OmitExcludedTypes<T, I> = T extends ExcludedTypes ? EmptyEntry<T> : CreateObjectEntries<T, I>;

type CreateObjectEntries<T, I> = T extends infer U
  ? // Checks that U is an object
    U extends object
    ? {
        // Checks that Key is of type string
        [K in keyof U]-?: K extends string
          ? // Nested key can be an object, run recursively to the bottom
            CreateArrayEntry<U[K], I> extends infer E
            ? E extends Entry
              ?
                  | {
                      key: E['key'] extends ''
                        ? K
                        : E['key'] extends `__${bigint}__`
                        ? `${K}[${bigint}]`
                        : `${K}.${E['key']}`;
                      value: E['value'];
                    }
                  | {
                      key: K;
                      value: U[K];
                    }
              : never
            : never
          : never;
      }[keyof U] // Builds entry for each key
    : EmptyEntry<U>
  : never;

// Narrow utility

type Narrowable = string | number | bigint | boolean;
export type Narrow<T> =
  | (T extends Narrowable ? T : never)
  | {
      [K in keyof T]: Narrow<T[K]>;
    };
