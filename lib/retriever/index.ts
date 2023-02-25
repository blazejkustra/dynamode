import { QueryInput, ScanInput } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { buildProjectionExpression } from '@lib/entity/helpers/buildExpressions';
import { convertPrimaryKeyToAttributeValues } from '@lib/entity/helpers/convert';
import { EntityKey } from '@lib/entity/types';
import { Metadata, TablePrimaryKey } from '@lib/table/types';
import { AttributeNames, AttributeValues } from '@lib/utils';

export default class RetrieverBase<M extends Metadata<E>, E extends typeof Entity> extends Condition<E> {
  protected input: QueryInput | ScanInput;
  protected attributeNames: AttributeNames = {};
  protected attributeValues: AttributeValues = {};

  constructor(entity: E) {
    super(entity);
    this.input = {
      TableName: Dynamode.storage.getEntityTableName(entity.name),
    };
  }

  public limit(count: number) {
    this.input.Limit = count;
    return this;
  }

  public startAt(key?: TablePrimaryKey<M, E>) {
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
