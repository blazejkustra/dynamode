import { ScanInput } from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';
import { Metadata, TableRetrieverLastKey } from '@lib/table/types';
import { AttributeNames, AttributeValues } from '@lib/utils';

export type ScanRunOptions = {
  extraInput?: Partial<ScanInput>;
  return?: ReturnOption;
};

export type ScanRunOutput<M extends Metadata<E>, E extends typeof Entity> = {
  items: Array<InstanceType<E>>;
  count: number;
  scannedCount: number;
  lastKey?: TableRetrieverLastKey<M, E>;
};

export type BuildScanConditionExpression = {
  attributeNames: AttributeNames;
  attributeValues: AttributeValues;
  conditionExpression: string;
};
