import type { AttributeValue } from '@aws-sdk/client-dynamodb';

/**
 * Common utility types for Dynamode operations.
 */

/**
 * DynamoDB attribute values mapping.
 */
export type AttributeValues = Record<string, AttributeValue>;

/**
 * DynamoDB attribute names mapping.
 */
export type AttributeNames = Record<string, string>;

/**
 * Generic object type for flexible data structures.
 */
export type GenericObject = Record<string, unknown>;

/**
 * Entity flattening utility types.
 */

/**
 * Flattens a nested object structure into a single level with dot notation keys.
 *
 * @template TValue - The type to flatten
 * @example
 * ```typescript
 * type Nested = {
 *   user: {
 *     name: string;
 *     address: {
 *       city: string;
 *     };
 *   };
 * };
 *
 * type Flattened = FlattenObject<Nested>;
 * // Result: {
 * //   'user.name': string;
 * //   'user.address.city': string;
 * // }
 * ```
 */
export type FlattenObject<TValue> = CollapseEntries<CreateObjectEntries<TValue, TValue>>;

/** Internal entry type for flattening operations */
type Entry = { key: string; value: unknown };
/** Empty entry type for terminal values */
type EmptyEntry<TValue> = { key: ''; value: TValue };
/** Types that are excluded from flattening */
type ExcludedTypes = Date | Set<unknown> | Map<unknown, unknown> | Uint8Array;
/** Array index encoder type */
type ArrayEncoder = `[${bigint}]`;

/** Escapes array keys in dot notation */
type EscapeArrayKey<TKey extends string> = TKey extends `${infer TKeyBefore}.${ArrayEncoder}${infer TKeyAfter}`
  ? EscapeArrayKey<`${TKeyBefore}${ArrayEncoder}${TKeyAfter}`>
  : TKey;

/**
 * Transforms entries to one flattened type.
 *
 * @template TEntry - The entry type to collapse
 */
type CollapseEntries<TEntry extends Entry> = {
  [E in TEntry as EscapeArrayKey<E['key']>]: E['value'];
};

/**
 * Transforms array type to object.
 *
 * @template TValue - The value type
 * @template TValueInitial - The initial value type for recursion control
 */
type CreateArrayEntry<TValue, TValueInitial> = OmitItself<
  TValue extends unknown[] ? { [k: ArrayEncoder]: TValue[number] } : TValue,
  TValueInitial
>;

/**
 * Omit the type that references itself to prevent infinite recursion.
 *
 * @template TValue - The value type
 * @template TValueInitial - The initial value type for recursion control
 */
type OmitItself<TValue, TValueInitial> = TValue extends TValueInitial
  ? EmptyEntry<TValue>
  : OmitExcludedTypes<TValue, TValueInitial>;

/**
 * Omit the type that is listed in ExcludedTypes union.
 *
 * @template TValue - The value type
 * @template TValueInitial - The initial value type for recursion control
 */
type OmitExcludedTypes<TValue, TValueInitial> = TValue extends ExcludedTypes
  ? EmptyEntry<TValue>
  : CreateObjectEntries<TValue, TValueInitial>;

/**
 * Creates object entries for flattening operations.
 *
 * @template TValue - The value type
 * @template TValueInitial - The initial value type for recursion control
 */
type CreateObjectEntries<TValue, TValueInitial> = TValue extends object
  ? {
      // Checks that Key is of type string
      [TKey in keyof TValue]-?: TKey extends string
        ? // Nested key can be an object, run recursively to the bottom
          CreateArrayEntry<TValue[TKey], TValueInitial> extends infer TNestedValue
          ? TNestedValue extends Entry
            ? TNestedValue['key'] extends ''
              ? {
                  key: TKey;
                  value: TNestedValue['value'];
                }
              :
                  | {
                      key: `${TKey}.${TNestedValue['key']}`;
                      value: TNestedValue['value'];
                    }
                  | {
                      key: TKey;
                      value: TValue[TKey];
                    }
            : never
          : never
        : never;
    }[keyof TValue] // Builds entry for each key
  : EmptyEntry<TValue>;

/**
 * Narrow utility types.
 */

/** Types that can be narrowed */
type Narrowable = string | number | bigint | boolean;

/**
 * Narrow utility type for const assertions.
 *
 * This utility type helps with const assertions and type narrowing.
 *
 * @template T - The type to narrow
 */
export type Narrow<T> =
  | (T extends Narrowable ? T : never)
  | {
      [K in keyof T]: Narrow<T[K]>;
    };
