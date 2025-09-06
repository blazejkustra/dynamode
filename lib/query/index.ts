import { QueryCommandOutput, QueryInput } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import { AttributeMetadata, IndexMetadata } from '@lib/dynamode/storage/types';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity, convertAttributeValuesToLastKey } from '@lib/entity/helpers/converters';
import { EntityKey, EntityValue } from '@lib/entity/types';
import type { QueryRunOptions, QueryRunOutput } from '@lib/query/types';
import RetrieverBase from '@lib/retriever';
import { Metadata, TablePartitionKeys, TableSortKeys } from '@lib/table/types';
import {
  AttributeValues,
  BASE_OPERATOR,
  ExpressionBuilder,
  isNotEmptyString,
  Operators,
  timeout,
  ValidationError,
} from '@lib/utils';

/**
 * Query builder for DynamoDB query operations.
 *
 * The Query class provides a fluent interface for building and executing
 * DynamoDB query operations. It supports querying by partition key and
 * sort key with various comparison operators, and can work with both
 * primary keys and secondary indexes.
 *
 * @example
 * ```typescript
 * // Query by partition key only
 * const users = await UserManager.query()
 *   .partitionKey('id').eq('user-123')
 *   .run();
 *
 * // Query by partition key and sort key
 * const users = await UserManager.query()
 *   .partitionKey('id').eq('user-123')
 *   .sortKey('createdAt').gt(new Date('2023-01-01'))
 *   .run();
 *
 * // Query with filter expression
 * const users = await UserManager.query()
 *   .partitionKey('id').eq('user-123')
 *   .attribute('status').eq('active')
 *   .run();
 *
 * // Query with index
 * const users = await UserManager.query()
 *   .indexName('StatusIndex')
 *   .partitionKey('status').eq('active')
 *   .sortKey('createdAt').between(startDate, endDate)
 *   .run();
 * ```
 *
 * @see {@link https://blazejkustra.github.io/dynamode/docs/guide/query} for more information
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html} for DynamoDB Query operations
 */
export default class Query<M extends Metadata<E>, E extends typeof Entity> extends RetrieverBase<M, E> {
  /** The DynamoDB QueryInput object */
  protected declare input: QueryInput;
  /** Key condition operators for building key condition expressions */
  protected keyOperators: Operators = [];
  /** Metadata for the partition key attribute */
  protected partitionKeyMetadata?: AttributeMetadata;
  /** Metadata for the sort key attribute */
  protected sortKeyMetadata?: AttributeMetadata;

  /**
   * Creates a new Query instance.
   *
   * @param entity - The entity class to query
   */
  constructor(entity: E) {
    super(entity);
  }

  /**
   * Executes the query operation.
   *
   * @param options - Optional configuration for the query execution
   * @returns A promise that resolves to the query results
   *
   * @example
   * ```typescript
   * // Execute query and get all results
   * const result = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .run();
   *
   * // Execute query with pagination
   * const result = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .run({ all: false, max: 10 });
   *
   * // Execute query with delay between pages
   * const result = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .run({ all: true, delay: 100 });
   * ```
   */
  public run(options?: QueryRunOptions & { return?: 'default' }): Promise<QueryRunOutput<M, E>>;

  /**
   * Executes the query operation, returning the raw AWS response.
   *
   * @param options - Configuration for the query execution with return type 'output'
   * @returns A promise that resolves to the raw QueryCommandOutput
   */
  public run(options: QueryRunOptions & { return: 'output' }): Promise<QueryCommandOutput>;

  /**
   * Builds the Query command input without executing it.
   *
   * @param options - Configuration for the query execution with return type 'input'
   * @returns The QueryInput object
   */
  public run(options: QueryRunOptions & { return: 'input' }): QueryInput;

  /**
   * Executes the query operation.
   *
   * @param options - Optional configuration for the query execution
   * @returns A promise that resolves to the query results, raw AWS response, or command input
   */
  public run(options?: QueryRunOptions): Promise<QueryRunOutput<M, E> | QueryCommandOutput> | QueryInput {
    this.setAssociatedIndexName();
    this.buildQueryInput(options?.extraInput);

    if (options?.return === 'input') {
      return this.input;
    }

    return (async () => {
      if (options?.return === 'output') {
        const result = await Dynamode.ddb.get().query(this.input);
        return result;
      }

      const all = options?.all ?? false;
      const delay = options?.delay ?? 0;
      const max = options?.max ?? Infinity;
      const items: AttributeValues[] = [];

      let count = 0;
      let scannedCount = 0;
      let lastKey: AttributeValues | undefined = undefined;

      do {
        const result = await Dynamode.ddb.get().query(this.input);
        if (all) {
          await timeout(delay);
        }

        items.push(...(result.Items || []));
        lastKey = result.LastEvaluatedKey;
        this.input.ExclusiveStartKey = lastKey;

        count += result.Count || 0;
        scannedCount += result.ScannedCount || 0;
      } while (all && !!lastKey && count < max);

      return {
        items: items.map((item) => convertAttributeValuesToEntity(this.entity, item)),
        lastKey: lastKey && convertAttributeValuesToLastKey(this.entity, lastKey),
        count,
        scannedCount,
      };
    })();
  }

  /**
   * Specifies the partition key for the query.
   *
   * @template Q - The query instance type
   * @template K - The partition key type
   * @param key - The partition key attribute name
   * @returns An object with comparison operators for the partition key
   *
   * @example
   * ```typescript
   * const users = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .run();
   * ```
   */
  public partitionKey<Q extends Query<M, E>, K extends EntityKey<E> & TablePartitionKeys<M, E>>(this: Q, key: K) {
    this.maybePushKeyLogicalOperator();
    const attributes = Dynamode.storage.getEntityAttributes(this.entity.name);
    this.partitionKeyMetadata = attributes[key as string];

    return {
      /** Equal comparison operator */
      eq: (value: EntityValue<E, K>): Q => this.eq(this.keyOperators, key, value),
    };
  }

  /**
   * Specifies the sort key for the query.
   *
   * @template Q - The query instance type
   * @template K - The sort key type
   * @param key - The sort key attribute name
   * @returns An object with comparison operators for the sort key
   *
   * @example
   * ```typescript
   * const users = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .sortKey('createdAt').gt(new Date('2023-01-01'))
   *   .run();
   *
   * // Using between operator
   * const users = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .sortKey('createdAt').between(startDate, endDate)
   *   .run();
   * ```
   */
  public sortKey<Q extends Query<M, E>, K extends EntityKey<E> & TableSortKeys<M, E>>(this: Q, key: K) {
    this.maybePushKeyLogicalOperator();
    const attributes = Dynamode.storage.getEntityAttributes(this.entity.name);
    this.sortKeyMetadata = attributes[key as string];

    return {
      /** Equal comparison operator */
      eq: (value: EntityValue<E, K>): Q => this.eq(this.keyOperators, key, value),
      /** Not equal comparison operator */
      ne: (value: EntityValue<E, K>): Q => this.ne(this.keyOperators, key, value),
      /** Less than comparison operator */
      lt: (value: EntityValue<E, K>): Q => this.lt(this.keyOperators, key, value),
      /** Less than or equal comparison operator */
      le: (value: EntityValue<E, K>): Q => this.le(this.keyOperators, key, value),
      /** Greater than comparison operator */
      gt: (value: EntityValue<E, K>): Q => this.gt(this.keyOperators, key, value),
      /** Greater than or equal comparison operator */
      ge: (value: EntityValue<E, K>): Q => this.ge(this.keyOperators, key, value),
      /** Begins with comparison operator (for string values) */
      beginsWith: (value: EntityValue<E, K>): Q => this.beginsWith(this.keyOperators, key, value),
      /** Between comparison operator */
      between: (value1: EntityValue<E, K>, value2: EntityValue<E, K>): Q =>
        this.between(this.keyOperators, key, value1, value2),
    };
  }

  /**
   * Sets the sort order for the query results.
   *
   * @param order - The sort order ('ascending' or 'descending')
   * @returns The query instance for method chaining
   *
   * @example
   * ```typescript
   * // Sort in ascending order (default)
   * const users = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .sort('ascending')
   *   .run();
   *
   * // Sort in descending order
   * const users = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .sort('descending')
   *   .run();
   * ```
   */
  public sort(order: 'ascending' | 'descending'): this {
    this.input.ScanIndexForward = order === 'ascending';
    return this;
  }

  private maybePushKeyLogicalOperator(): void {
    if (this.keyOperators.length > 0) {
      this.keyOperators.push(BASE_OPERATOR.space, BASE_OPERATOR.and, BASE_OPERATOR.space);
    }
  }

  private setAssociatedIndexName() {
    if (this.input.IndexName) {
      return;
    }

    const { partitionKeyMetadata, sortKeyMetadata } = this;
    if (!partitionKeyMetadata) {
      throw new ValidationError('You need to use ".partitionKey()" method before calling ".run()"');
    }

    // Primary key without sort key
    if (partitionKeyMetadata.role === 'partitionKey' && !sortKeyMetadata) {
      return;
    }

    // Primary key with sort key
    if (partitionKeyMetadata.role === 'partitionKey' && sortKeyMetadata?.role === 'sortKey') {
      return;
    }

    // GSI with sort key
    if (partitionKeyMetadata.indexes && sortKeyMetadata?.indexes) {
      const pkIndexes: IndexMetadata[] = partitionKeyMetadata.indexes;
      const skIndexes: IndexMetadata[] = sortKeyMetadata.indexes;

      const commonIndexes = pkIndexes.filter((pkIndex) => skIndexes.some((skIndex) => skIndex.name === pkIndex.name));
      if (commonIndexes.length === 0) {
        throw new ValidationError(
          `No common indexes found for "${partitionKeyMetadata.propertyName}" and "${sortKeyMetadata.propertyName}"`,
        );
      }

      if (commonIndexes.length > 1) {
        throw new ValidationError(
          `Multiple common indexes found for "${partitionKeyMetadata.propertyName}" and "${sortKeyMetadata.propertyName}"`,
        );
      }

      this.input.IndexName = commonIndexes[0].name;
      return;
    }

    // GSI without sort key
    if (partitionKeyMetadata.indexes && !sortKeyMetadata) {
      const possibleIndexes = partitionKeyMetadata.indexes;

      if (possibleIndexes.length > 1) {
        throw new ValidationError(
          `Multiple indexes found for "${partitionKeyMetadata.propertyName}", please use ".indexName(${possibleIndexes
            .map((index) => index.name)
            .join(' | ')})" method to specify the index name`,
        );
      }

      this.input.IndexName = possibleIndexes[0].name;
      return;
    }

    // LSI with sort key
    if (partitionKeyMetadata.role === 'partitionKey' && sortKeyMetadata?.indexes) {
      const possibleIndexes = sortKeyMetadata.indexes;

      if (possibleIndexes.length > 1) {
        throw new ValidationError(
          `Multiple indexes found for "${sortKeyMetadata.propertyName}", an LSI can only have one index`,
        );
      }

      this.input.IndexName = possibleIndexes[0].name;
      return;
    }
  }

  private buildQueryInput(extraInput?: Partial<QueryInput>): void {
    const expressionBuilder = new ExpressionBuilder({
      attributeNames: this.attributeNames,
      attributeValues: this.attributeValues,
    });
    const keyConditionExpression = expressionBuilder.run(this.keyOperators);
    const filterExpression = expressionBuilder.run(this.operators);

    this.input = {
      ...this.input,
      KeyConditionExpression: keyConditionExpression,
      FilterExpression: isNotEmptyString(filterExpression) ? filterExpression : undefined,
      ExpressionAttributeNames: expressionBuilder.attributeNames,
      ExpressionAttributeValues: expressionBuilder.attributeValues,
      ...extraInput,
    };
  }
}
