import type { AttributeValue } from '@aws-sdk/client-dynamodb';

export type AttributeMap = Record<string, AttributeValue>;
export type GenericObject = Record<string, unknown>;
export type Class<T = object> = { new (...args: unknown[]): T };

export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
}[keyof T];
export type NonFunctionProperties<T> = keyof Pick<T, NonFunctionPropertyNames<T>>;
