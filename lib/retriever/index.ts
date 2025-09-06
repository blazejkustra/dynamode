import { QueryInput, ScanInput } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { buildGetProjectionExpression } from '@lib/entity/helpers/buildExpressions';
import { convertRetrieverLastKeyToAttributeValues } from '@lib/entity/helpers/converters';
import { EntityKey } from '@lib/entity/types';
import { Metadata, TableIndexNames, TableRetrieverLastKey } from '@lib/table/types';
import { AttributeNames, AttributeValues } from '@lib/utils';

/**
 * Base class for DynamoDB retrieval operations (Query and Scan).
 *
 * This abstract class provides common functionality for both Query and Scan operations,
 * including index selection, pagination, filtering, and projection. It extends the
 * Condition class to provide filtering capabilities.
 *
 * @template M - The metadata type for the table
 * @template E - The entity class type
 */
export default class RetrieverBase<M extends Metadata<E>, E extends typeof Entity> extends Condition<E> {
  /** The DynamoDB input object (QueryInput or ScanInput) */
  protected input: QueryInput | ScanInput;
  /** Attribute names mapping for expression attribute names */
  protected attributeNames: AttributeNames = {};
  /** Attribute values mapping for expression attribute values */
  protected attributeValues: AttributeValues = {};

  /**
   * Creates a new RetrieverBase instance.
   *
   * @param entity - The entity class to retrieve data for
   */
  constructor(entity: E) {
    super(entity);
    this.input = {
      TableName: Dynamode.storage.getEntityTableName(entity.name),
    };
  }

  /**
   * Specifies the index to query or scan.
   *
   * @param name - The name of the index to use
   * @returns The retriever instance for chaining
   *
   * @example
   * ```typescript
   * const users = await UserManager.query()
   *   .indexName('StatusIndex')
   *   .partitionKey('status').eq('active')
   *   .run();
   * ```
   */
  public indexName(name: TableIndexNames<M, E>) {
    this.input.IndexName = String(name);
    return this;
  }

  /**
   * Limits the number of items returned.
   *
   * @param count - Maximum number of items to return
   * @returns The retriever instance for chaining
   *
   * @example
   * ```typescript
   * const users = await UserManager.query()
   *   .partitionKey('status').eq('active')
   *   .limit(10)
   *   .run();
   * ```
   */
  public limit(count: number) {
    this.input.Limit = count;
    return this;
  }

  /**
   * Sets the starting point for pagination.
   *
   * @param key - The last evaluated key from a previous operation
   * @returns The retriever instance for chaining
   *
   * @example
   * ```typescript
   * const firstPage = await UserManager.query()
   *   .partitionKey('status').eq('active')
   *   .limit(10)
   *   .run();
   *
   * const secondPage = await UserManager.query()
   *   .partitionKey('status').eq('active')
   *   .limit(10)
   *   .startAt(firstPage.lastKey)
   *   .run();
   * ```
   */
  public startAt(key?: TableRetrieverLastKey<M, E>) {
    if (key) {
      this.input.ExclusiveStartKey = convertRetrieverLastKeyToAttributeValues(this.entity, key);
    }

    return this;
  }

  /**
   * Enables consistent read for the operation.
   *
   * Consistent reads return data that reflects all successful write operations
   * that completed before the read operation. This may increase latency and
   * consume more read capacity.
   *
   * @returns The retriever instance for chaining
   *
   * @example
   * ```typescript
   * const user = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .consistent()
   *   .run();
   * ```
   */
  public consistent() {
    this.input.ConsistentRead = true;
    return this;
  }

  /**
   * Returns only the count of items instead of the actual items.
   *
   * This is more efficient when you only need to know how many items
   * match your criteria without retrieving the actual data.
   *
   * @returns The retriever instance for chaining
   *
   * @example
   * ```typescript
   * const result = await UserManager.query()
   *   .partitionKey('status').eq('active')
   *   .count()
   *   .run();
   *
   * console.log('Active users count:', result.count);
   * ```
   */
  public count() {
    this.input.Select = 'COUNT';
    return this;
  }

  /**
   * Specifies which attributes to return.
   *
   * @param attributes - Array of attribute names to project
   * @returns The retriever instance for chaining
   *
   * @example
   * ```typescript
   * const users = await UserManager.query()
   *   .partitionKey('status').eq('active')
   *   .attributes(['id', 'name', 'email'])
   *   .run();
   * ```
   */
  public attributes(attributes: Array<EntityKey<E>>) {
    this.input.ProjectionExpression = buildGetProjectionExpression(
      attributes,
      this.attributeNames,
    ).projectionExpression;
    return this;
  }
}
