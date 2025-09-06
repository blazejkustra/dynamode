import { ScanInput } from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';
import { Metadata, TableRetrieverLastKey } from '@lib/table/types';
import { AttributeNames, AttributeValues } from '@lib/utils';

/**
 * Options for scan operation execution.
 */
export type ScanRunOptions = {
  /** Additional DynamoDB scan input parameters */
  extraInput?: Partial<ScanInput>;
  /** Return type option */
  return?: ReturnOption;
};

/**
 * Output from scan operation execution.
 *
 * @template M - The metadata type for the table
 * @template E - The entity class type
 */
export type ScanRunOutput<M extends Metadata<E>, E extends typeof Entity> = {
  /** Array of entity instances returned from the scan */
  items: Array<InstanceType<E>>;
  /** Number of items returned */
  count: number;
  /** Number of items scanned */
  scannedCount: number;
  /** Last evaluated key for pagination */
  lastKey?: TableRetrieverLastKey<M, E>;
};

/**
 * Built scan condition expression components.
 */
export type BuildScanConditionExpression = {
  /** Attribute names mapping */
  attributeNames: AttributeNames;
  /** Attribute values mapping */
  attributeValues: AttributeValues;
  /** Filter expression string */
  conditionExpression: string;
};
