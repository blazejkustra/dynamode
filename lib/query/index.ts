import { QueryCommandOutput, QueryInput } from '@aws-sdk/client-dynamodb';
import { Dynamode } from '@lib/dynamode';
import { Entity } from '@lib/entity';
import { convertAttributeValuesToEntity, convertAttributeValuesToPrimaryKey } from '@lib/entity/helpers';
import { EntityKey, EntityMetadata, EntityPartitionKeys, EntitySortKeys, EntityValue } from '@lib/entity/types';
import type { QueryRunOptions, QueryRunOutput } from '@lib/query/types';
import RetrieverBase from '@lib/retriever';
import { AttributeValues, ExpressionBuilder, isNotEmptyString, Operators, timeout } from '@lib/utils';

import { BASE_OPERATOR } from './../utils/constants';

export default class Query<E extends typeof Entity, EM extends EntityMetadata> extends RetrieverBase<E, EM> {
  protected declare input: QueryInput;
  protected keyOperators: Operators = [];

  constructor(entity: E) {
    super(entity);
  }

  public run(): Promise<QueryRunOutput<E>>;
  public run(options: Omit<QueryRunOptions, 'return'>): Promise<QueryRunOutput<E>>;
  public run(options: QueryRunOptions & { return: 'default' }): Promise<QueryRunOutput<E>>;
  public run(options: QueryRunOptions & { return: 'output' }): Promise<QueryCommandOutput>;
  public run(options: QueryRunOptions & { return: 'input' }): QueryInput;
  public run(options?: QueryRunOptions): Promise<QueryRunOutput<E> | QueryCommandOutput> | QueryInput {
    this.buildQueryInput(options?.extraInput);
    this.validateQueryInput();

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
        items: items.map((item) => convertAttributeValuesToEntity(item, this.entity)),
        lastKey: lastKey && convertAttributeValuesToPrimaryKey(this.entity, lastKey),
        count,
        scannedCount,
      };
    })();
  }

  public partitionKey<Q extends Query<E, EM>, K extends EntityKey<E> & EntityPartitionKeys<EM>>(this: Q, key: K) {
    this.maybePushKeyLogicalOperator();
    this.setAssociatedIndexName(String(key));

    return {
      eq: (value: EntityValue<E, K>): Q => this.eq(this.keyOperators, key, value),
    };
  }

  public sortKey<Q extends Query<E, EM>, K extends EntityKey<E> & EntitySortKeys<EM>>(this: Q, key: K) {
    this.maybePushKeyLogicalOperator();
    this.setAssociatedIndexName(String(key));

    return {
      eq: (value: EntityValue<E, K>): Q => this.eq(this.keyOperators, key, value),
      ne: (value: EntityValue<E, K>): Q => this.ne(this.keyOperators, key, value),
      lt: (value: EntityValue<E, K>): Q => this.lt(this.keyOperators, key, value),
      le: (value: EntityValue<E, K>): Q => this.le(this.keyOperators, key, value),
      gt: (value: EntityValue<E, K>): Q => this.gt(this.keyOperators, key, value),
      ge: (value: EntityValue<E, K>): Q => this.ge(this.keyOperators, key, value),
      beginsWith: (value: EntityValue<E, K>): Q => this.beginsWith(this.keyOperators, key, value),
      between: (value1: EntityValue<E, K>, value2: EntityValue<E, K>): Q => this.between(this.keyOperators, key, value1, value2),
    };
  }

  public sort(order: 'ascending' | 'descending'): this {
    this.input.ScanIndexForward = order === 'ascending';
    return this;
  }

  private buildQueryInput(extraInput?: Partial<QueryInput>): void {
    const expressionBuilder = new ExpressionBuilder({ attributeNames: this.attributeNames, attributeValues: this.attributeValues });
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

  //TODO: Implement validation
  private validateQueryInput(): void {
    // ValidationException: Invalid FilterExpression: The BETWEEN operator requires upper bound to be greater than or equal to lower bound; lower bound operand: AttributeValue: {S:5}, upper bound operand: AttributeValue: {S:100}
    // Index validation
    console.log('validateQueryInput');
  }

  private maybePushKeyLogicalOperator(): void {
    if (this.keyOperators.length > 0) {
      this.keyOperators.push(BASE_OPERATOR.space, BASE_OPERATOR.and, BASE_OPERATOR.space);
    }
  }

  private setAssociatedIndexName(key: string) {
    const attributes = Dynamode.storage.getEntityAttributes(this.entity.tableName, this.entity.name);
    const { indexName } = attributes[key];
    if (indexName) {
      this.input.IndexName = indexName;
    }
  }
}
