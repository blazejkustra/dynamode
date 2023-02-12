import { ScanInput } from '@aws-sdk/client-dynamodb';
import { Entity } from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';
import { AttributeNames, AttributeValues, GenericObject } from '@lib/utils';

export interface ScanRunOptions {
  extraInput?: Partial<ScanInput>;
  return?: ReturnOption;
}

export interface ScanRunOutput<E extends typeof Entity> {
  items: Array<InstanceType<E>>;
  count: number;
  scannedCount: number;
  lastKey?: GenericObject;
}

export interface BuildScanConditionExpression {
  attributeNames: AttributeNames;
  attributeValues: AttributeValues;
  conditionExpression: string;
}
