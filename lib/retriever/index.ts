import { QueryInput, ScanInput } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { buildProjectionExpression } from '@lib/entity/helpers';
import { Entity, EntityKey, EntityPrimaryKey } from '@lib/entity/types';
import { AttributeMap } from '@lib/utils';

export default class RetrieverBase<T extends Entity<T>> extends Condition<T> {
  protected input: QueryInput | ScanInput;
  protected attributeNames: Record<string, string> = {};
  protected attributeValues: AttributeMap = {};

  constructor(entity: T) {
    super(entity);
    this.input = {
      TableName: entity.tableName,
    };
  }

  public limit(count: number) {
    this.input.Limit = count;
    return this;
  }

  public startAt(key?: EntityPrimaryKey<T>) {
    if (key) this.input.ExclusiveStartKey = this.entity.convertPrimaryKeyToAttributeMap(key);
    return this;
  }

  public consistent() {
    this.input.ConsistentRead = true;
    return this;
  }

  public count() {
    this.input.Select = 'COUNT';
    return this;
  }

  public attributes(attributes: Array<EntityKey<T>>) {
    this.input.ProjectionExpression = buildProjectionExpression(attributes, this.attributeNames);
    return this;
  }
}
