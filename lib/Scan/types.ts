import { ScanInput } from '@aws-sdk/client-dynamodb';
import { Entity, ReturnOption } from '@lib/entity/types';
import { AttributeMap, GenericObject } from '@lib/utils';

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
  attributeNames: Record<string, string>;
  attributeValues: AttributeMap;
  conditionExpression: string;
}
