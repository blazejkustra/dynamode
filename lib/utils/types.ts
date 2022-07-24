import { AttributeValue } from '@aws-sdk/client-dynamodb';

export type AttributeMap = Record<string, AttributeValue>;
export type GenericObject = Record<string, unknown>;
export type Class = { new (...args: any[]): any };
