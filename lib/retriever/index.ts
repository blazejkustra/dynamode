import { QueryInput, ScanInput } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { Entity, EntityKey, EntityPrimaryKey } from '@lib/entity/types';
import { checkDuplicatesInArray, DefaultError } from '@lib/utils';

export default class RetrieverBase<T extends Entity<T>> extends Condition<T> {
  protected input: QueryInput | ScanInput;

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
    if (checkDuplicatesInArray(attributes)) {
      throw new DefaultError();
    }

    this.input.ProjectionExpression = attributes.join(', ');
    return this;
  }
}
