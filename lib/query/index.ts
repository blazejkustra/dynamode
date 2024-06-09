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

export default class Query<M extends Metadata<E>, E extends typeof Entity> extends RetrieverBase<M, E> {
  protected declare input: QueryInput;
  protected keyOperators: Operators = [];
  protected partitionKeyMetadata?: AttributeMetadata;
  protected sortKeyMetadata?: AttributeMetadata;

  constructor(entity: E) {
    super(entity);
  }

  public run(options?: QueryRunOptions & { return?: 'default' }): Promise<QueryRunOutput<M, E>>;
  public run(options: QueryRunOptions & { return: 'output' }): Promise<QueryCommandOutput>;
  public run(options: QueryRunOptions & { return: 'input' }): QueryInput;
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

  public partitionKey<Q extends Query<M, E>, K extends EntityKey<E> & TablePartitionKeys<M, E>>(this: Q, key: K) {
    this.maybePushKeyLogicalOperator();
    const attributes = Dynamode.storage.getEntityAttributes(this.entity.name);
    this.partitionKeyMetadata = attributes[key as string];

    return {
      eq: (value: EntityValue<E, K>): Q => this.eq(this.keyOperators, key, value),
    };
  }

  public sortKey<Q extends Query<M, E>, K extends EntityKey<E> & TableSortKeys<M, E>>(this: Q, key: K) {
    this.maybePushKeyLogicalOperator();
    const attributes = Dynamode.storage.getEntityAttributes(this.entity.name);
    this.sortKeyMetadata = attributes[key as string];

    return {
      eq: (value: EntityValue<E, K>): Q => this.eq(this.keyOperators, key, value),
      ne: (value: EntityValue<E, K>): Q => this.ne(this.keyOperators, key, value),
      lt: (value: EntityValue<E, K>): Q => this.lt(this.keyOperators, key, value),
      le: (value: EntityValue<E, K>): Q => this.le(this.keyOperators, key, value),
      gt: (value: EntityValue<E, K>): Q => this.gt(this.keyOperators, key, value),
      ge: (value: EntityValue<E, K>): Q => this.ge(this.keyOperators, key, value),
      beginsWith: (value: EntityValue<E, K>): Q => this.beginsWith(this.keyOperators, key, value),
      between: (value1: EntityValue<E, K>, value2: EntityValue<E, K>): Q =>
        this.between(this.keyOperators, key, value1, value2),
    };
  }

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

    // Primary key
    if (partitionKeyMetadata.role === 'partitionKey' && sortKeyMetadata?.role !== 'index') {
      return;
    }

    // GSI with sort key
    if (partitionKeyMetadata.role === 'index' && sortKeyMetadata?.role === 'index') {
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
    if (partitionKeyMetadata.role === 'index' && !sortKeyMetadata) {
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
    if (partitionKeyMetadata.role === 'partitionKey' && sortKeyMetadata?.role === 'index') {
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
