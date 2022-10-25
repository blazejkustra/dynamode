import { QueryCommandOutput, QueryInput } from '@aws-sdk/client-dynamodb';
import { Operator } from '@lib/condition/types';
import { Dynamode } from '@lib/dynamode';
import { Entity, EntityKey, EntityPartitionKeys, EntitySortKeys, EntityValue } from '@lib/entity/types';
import { QueryRunOptions, QueryRunOutput } from '@lib/query/types';
import RetrieverBase from '@lib/retriever';
import { AttributeMap, buildExpression, ConditionExpression, isNotEmpty, isNotEmptyString, timeout } from '@lib/utils';

export default class Query<T extends Entity<T>> extends RetrieverBase<T> {
  protected input: QueryInput;
  public keyConditions: ConditionExpression[] = [];

  constructor(entity: T) {
    super(entity);
  }

  public partitionKey<Q extends Query<T>, K extends EntityKey<T> & EntityPartitionKeys<T>>(this: Q, key: K) {
    const attributes = Dynamode.storage.getEntityAttributes(this.entity.tableName, this.entity.name);
    const indexName = attributes[String(key)].indexName;
    if (indexName) this.input.IndexName = indexName;

    return {
      eq: (value: EntityValue<T, K>): Q => this.eq(this.keyConditions, key, value),
    };
  }

  public sortKey<Q extends Query<T>, K extends EntityKey<T> & EntitySortKeys<T>>(this: Q, key: K) {
    this.keyConditions.push({ expr: Operator.AND });

    return {
      eq: (value: EntityValue<T, K>): Q => this.eq(this.keyConditions, key, value),
      ne: (value: EntityValue<T, K>): Q => this.ne(this.keyConditions, key, value),
      lt: (value: EntityValue<T, K>): Q => this.lt(this.keyConditions, key, value),
      le: (value: EntityValue<T, K>): Q => this.le(this.keyConditions, key, value),
      gt: (value: EntityValue<T, K>): Q => this.gt(this.keyConditions, key, value),
      ge: (value: EntityValue<T, K>): Q => this.ge(this.keyConditions, key, value),
      beginsWith: (value: EntityValue<T, K>): Q => this.beginsWith(this.keyConditions, key, value),
      between: (value1: EntityValue<T, K>, value2: EntityValue<T, K>): Q => this.between(this.keyConditions, key, value1, value2),
    };
  }

  public sort(order: 'ascending' | 'descending'): this {
    this.input.ScanIndexForward = order === 'ascending';
    return this;
  }

  public run(): Promise<QueryRunOutput<T>>;
  public run(options: Omit<QueryRunOptions, 'return'>): Promise<QueryRunOutput<T>>;
  public run(options: QueryRunOptions & { return: 'default' }): Promise<QueryRunOutput<T>>;
  public run(options: QueryRunOptions & { return: 'output' }): Promise<QueryCommandOutput>;
  public run(options: QueryRunOptions & { return: 'input' }): QueryInput;
  public run(options?: QueryRunOptions): Promise<QueryRunOutput<T> | QueryCommandOutput> | QueryInput {
    this.buildQueryInput(options?.extraInput);
    this.validateQueryInput();

    if (options?.return === 'input') {
      return this.input;
    }

    return (async () => {
      if (options?.return === 'output') {
        const result = await this.entity.ddb.query(this.input);
        return result;
      }

      const all = options?.all ?? false;
      const delay = options?.delay ?? 0;
      const max = options?.max ?? Infinity;
      const items: AttributeMap[] = [];

      let count = 0;
      let scannedCount = 0;
      let lastKey: AttributeMap | undefined = undefined;

      do {
        const result = await this.entity.ddb.query(this.input);
        await timeout(delay);
        items.push(...(result.Items || []));

        lastKey = result.LastEvaluatedKey;
        this.input.ExclusiveStartKey = lastKey;

        count += result.Count || 0;
        scannedCount += result.ScannedCount || 0;
      } while (all && !!lastKey && count < max);

      return {
        items: items.map((item) => this.entity.convertAttributeMapToEntity(item)),
        count,
        scannedCount,
        lastKey: lastKey && this.entity.convertAttributeMapToPrimaryKey(lastKey),
      };
    })();
  }

  private buildQueryInput(extraInput?: Partial<QueryInput>): void {
    const keyConditionExpression = buildExpression(this.keyConditions, this.attributeNames, this.attributeValues);
    const conditionExpression = buildExpression(this.conditions, this.attributeNames, this.attributeValues);

    this.input.KeyConditionExpression = isNotEmptyString(keyConditionExpression) ? keyConditionExpression : undefined;
    this.input.FilterExpression = isNotEmptyString(conditionExpression) ? conditionExpression : undefined;
    this.input.ExpressionAttributeNames = isNotEmpty(this.attributeNames) ? this.attributeNames : undefined;
    this.input.ExpressionAttributeValues = isNotEmpty(this.attributeValues) ? this.attributeValues : undefined;
    this.input = { ...this.input, ...extraInput };
  }

  //TODO: Implement validation
  private validateQueryInput(): void {
    // ValidationException: Invalid FilterExpression: The BETWEEN operator requires upper bound to be greater than or equal to lower bound; lower bound operand: AttributeValue: {S:5}, upper bound operand: AttributeValue: {S:100}
    // Index validation
    console.log('validateQueryInput');
  }
}
