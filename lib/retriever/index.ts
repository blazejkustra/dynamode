import { QueryInput, ScanInput } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { Entity } from '@lib/entity';
import { buildProjectionExpression, convertPrimaryKeyToAttributeValues } from '@lib/entity/helpers';
import { EntityKey, EntityMetadata, EntityPrimaryKey } from '@lib/entity/types';
import { AttributeNames, AttributeValues } from '@lib/utils';

export default class RetrieverBase<EM extends EntityMetadata, E extends typeof Entity> extends Condition<E> {
  protected input: QueryInput | ScanInput;
  protected attributeNames: AttributeNames = {};
  protected attributeValues: AttributeValues = {};

  constructor(entity: E) {
    super(entity);
    this.input = {
      TableName: entity.tableName,
    };
  }

  public limit(count: number) {
    this.input.Limit = count;
    return this;
  }

  public startAt(key?: EntityPrimaryKey<EM, E>) {
    if (key) {
      this.input.ExclusiveStartKey = convertPrimaryKeyToAttributeValues(this.entity, key);
    }

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

  public attributes(attributes: Array<EntityKey<E>>) {
    this.input.ProjectionExpression = buildProjectionExpression(this.entity, attributes, this.attributeNames);
    return this;
  }
}
