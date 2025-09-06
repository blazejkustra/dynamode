import { QueryInput } from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import type { ReturnOption } from '@lib/entity/types';
import { Metadata, TableRetrieverLastKey } from '@lib/table/types';
import { AttributeNames, AttributeValues } from '@lib/utils';

/**
 * Options for query operation execution.
 */
export type QueryRunOptions = {
  /** Additional DynamoDB query input parameters */
  extraInput?: Partial<QueryInput>;
  /** Return type option */
  return?: ReturnOption;
  /** Whether to fetch all results (pagination) */
  all?: boolean;
  /** Delay between paginated requests in milliseconds */
  delay?: number;
  /** Maximum number of items to return */
  max?: number;
};

/**
 * Output from query operation execution.
 *
 * @template M - The metadata type for the table
 * @template E - The entity class type
 */
export type QueryRunOutput<M extends Metadata<E>, E extends typeof Entity> = {
  /** Array of entity instances returned from the query */
  items: Array<InstanceType<E>>;
  /** Number of items returned */
  count: number;
  /** Number of items scanned */
  scannedCount: number;
  /** Last evaluated key for pagination */
  lastKey?: TableRetrieverLastKey<M, E>;
};

/**
 * Built query condition expression components.
 */
export type BuildQueryConditionExpression = {
  /** Attribute names mapping */
  attributeNames: AttributeNames;
  /** Attribute values mapping */
  attributeValues: AttributeValues;
  /** Filter expression string */
  conditionExpression: string;
  /** Key condition expression string */
  keyConditionExpression: string;
};
