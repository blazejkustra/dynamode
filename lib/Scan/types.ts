import { ScanInput } from '@aws-sdk/client-dynamodb';
import { EntityClass, ReturnOption } from '@lib/Entity/types';
import { AttributeMap, GenericObject } from '@lib/utils';

export interface ScanRunOptions {
  extraInput?: Partial<ScanInput>;
  return?: ReturnOption;
}

export interface ScanRunOutput<T extends EntityClass<T>> {
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
