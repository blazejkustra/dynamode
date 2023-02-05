import { ScanInput } from '@aws-sdk/client-dynamodb';
import type { Entity, ReturnOption } from '@lib/entity/types';
import { AttributeNames, AttributeValues, GenericObject } from '@lib/utils';

export interface ScanRunOptions {
  extraInput?: Partial<ScanInput>;
  return?: ReturnOption;
}

export interface ScanRunOutput<T extends Entity<T>> {
  items: Array<InstanceType<T>>;
  count: number;
  scannedCount: number;
  lastKey?: GenericObject;
}

export interface BuildScanConditionExpression {
  attributeNames: AttributeNames;
  attributeValues: AttributeValues;
  conditionExpression: string;
}
