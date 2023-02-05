import {
  BatchGetItemCommandInput,
  BatchGetItemCommandOutput,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  DynamoDB,
  GetItemCommandInput,
  GetItemCommandOutput,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { Dynamode } from '@lib/dynamode';
import { buildDeleteConditionExpression, buildGetProjectionExpression, buildPutConditionExpression, buildUpdateConditionExpression, mapReturnValues, mapReturnValuesLimited } from '@lib/entity/helpers';
import {
  EntityBatchDeleteOptions,
  EntityBatchDeleteOutput,
  EntityBatchGetOptions,
  EntityBatchGetOutput,
  EntityBatchPutOptions,
  EntityBatchPutOutput,
  EntityDeleteOptions,
  EntityGetOptions,
  EntityKey,
  EntityMetadata,
  EntityPrimaryKey,
  EntityPutOptions,
  EntityTransactionDeleteOptions,
  EntityTransactionGetOptions,
  EntityTransactionPutOptions,
  EntityTransactionUpdateOptions,
  EntityUpdateOptions,
  UpdateProps,
} from '@lib/entity/types';
import Query from '@lib/query';
import Scan from '@lib/scan';
import type { GetTransaction } from '@lib/transactionGet/types';
import type { WriteTransaction } from '@lib/transactionWrite/types';
import { AttributeValues, DefaultError, ExpressionBuilder, fromDynamo, GenericObject, NotFoundError, objectToDynamo } from '@lib/utils';

export default function Entity<Metadata extends EntityMetadata>(tableName: string) {
  Dynamode.storage.addEntityAttributeMetadata(tableName, 'Entity', 'dynamodeEntity', { propertyName: 'dynamodeEntity', type: String, role: 'dynamodeEntity' });

  return class Entity {
    public static ddb: DynamoDB;
    public static tableName = tableName;
    public static metadata: Metadata;

    public readonly dynamodeEntity: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(..._args: any[]) {
      this.dynamodeEntity = this.constructor.name;
    }

    public static condition<T extends typeof Entity>(this: T): Condition<T> {
      return new Condition(this);
    }

    public static query<T extends typeof Entity>(this: T): Query<T> {
      return new Query(this);
    }

    public static scan<T extends typeof Entity>(this: T): Scan<T> {
      return new Scan(this);
    }

    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>): Promise<InstanceType<T>>;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityGetOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityGetOptions<T> & { return: 'output' }): Promise<GetItemCommandOutput>;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityGetOptions<T> & { return: 'input' }): GetItemCommandInput;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityGetOptions<T>): Promise<InstanceType<T> | GetItemCommandOutput> | GetItemCommandInput {
      const { projectionExpression, attributeNames } = buildGetProjectionExpression(options?.attributes);

      const commandInput: GetItemCommandInput = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToAttributeValues(primaryKey),
        ConsistentRead: options?.consistent || false,
        ProjectionExpression: projectionExpression,
        ExpressionAttributeNames: attributeNames,
        ...options?.extraInput,
      };

      if (options?.return === 'input') {
        return commandInput;
      }

      return (async () => {
        const result = await this.ddb.getItem(commandInput);

        if (!result.Item) {
          throw new NotFoundError();
        }

        if (options?.return === 'output') {
          return result;
        }

        return this.convertAttributeValuesToEntity(result.Item);
      })();
    }

    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>): Promise<InstanceType<T>>;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'output' }): Promise<UpdateItemCommandOutput>;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'input' }): UpdateItemCommandInput;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options?: EntityUpdateOptions<T>): Promise<InstanceType<T> | UpdateItemCommandOutput> | UpdateItemCommandInput {
      const { updateExpression, conditionExpression, attributeNames, attributeValues } = buildUpdateConditionExpression(props, options?.condition);

      const commandInput: UpdateItemCommandInput = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToAttributeValues(primaryKey),
        ReturnValues: mapReturnValues(options?.returnValues),
        UpdateExpression: updateExpression,
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ...options?.extraInput,
      };

      if (options?.return === 'input') {
        return commandInput;
      }

      return (async () => {
        const result = await this.ddb.updateItem(commandInput);

        if (options?.return === 'output') {
          return result;
        }

        return this.convertAttributeValuesToEntity(result.Attributes || {});
      })();
    }

    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>): Promise<InstanceType<T>>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'output' }): Promise<PutItemCommandOutput>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'input' }): PutItemCommandInput;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: EntityPutOptions<T>): Promise<InstanceType<T> | PutItemCommandOutput> | PutItemCommandInput {
      const overwrite = options?.overwrite ?? true;
      const partitionKey = Dynamode.storage.getTableMetadata(this.tableName).partitionKey as EntityKey<T>;
      const overwriteCondition = overwrite ? undefined : this.condition().attribute(partitionKey).not().exists();
      const dynamoItem = this.convertEntityToAttributeValues(item);
      const { conditionExpression, attributeNames, attributeValues } = buildPutConditionExpression(overwriteCondition, options?.condition);

      const commandInput: PutItemCommandInput = {
        TableName: this.tableName,
        Item: dynamoItem,
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ...options?.extraInput,
      };

      if (options?.return === 'input') {
        return commandInput;
      }

      return (async () => {
        const result = await this.ddb.putItem(commandInput);

        if (options?.return === 'output') {
          return result;
        }

        return this.convertAttributeValuesToEntity(dynamoItem);
      })();
    }

    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>): Promise<InstanceType<T>>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'output' }): Promise<PutItemCommandOutput>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'input' }): PutItemCommandInput;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: EntityPutOptions<T>): Promise<InstanceType<T> | PutItemCommandOutput> | PutItemCommandInput {
      const overwrite = options?.overwrite ?? false;
      return this.put(item, { ...options, overwrite } as any);
    }

    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>): Promise<InstanceType<T> | null>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityDeleteOptions<T> & { return: 'default' }): Promise<InstanceType<T> | null>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityDeleteOptions<T> & { return: 'output' }): Promise<DeleteItemCommandOutput>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityDeleteOptions<T> & { return: 'input' }): DeleteItemCommandInput;
    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityDeleteOptions<T>): Promise<InstanceType<T> | null | DeleteItemCommandOutput> | DeleteItemCommandInput {
      const throwErrorIfNotExists = options?.throwErrorIfNotExists ?? false;
      const partitionKey = Dynamode.storage.getTableMetadata(this.tableName).partitionKey as EntityKey<T>;
      const notExistsCondition = throwErrorIfNotExists ? this.condition().attribute(partitionKey).exists() : undefined;
      const { conditionExpression, attributeNames, attributeValues } = buildDeleteConditionExpression(notExistsCondition, options?.condition);

      const commandInput: DeleteItemCommandInput = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToAttributeValues(primaryKey),
        ReturnValues: mapReturnValuesLimited(options?.returnValues),
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ...options?.extraInput,
      };

      if (options?.return === 'input') {
        return commandInput;
      }

      return (async () => {
        const result = await this.ddb.deleteItem(commandInput);

        if (options?.return === 'output') {
          return result;
        }

        return result.Attributes ? this.convertAttributeValuesToEntity(result.Attributes) : null;
      })();
    }

    public static batchGet<T extends typeof Entity>(this: T, primaryKeys: Array<EntityPrimaryKey<T>>): Promise<EntityBatchGetOutput<T, EntityPrimaryKey<T>>>;
    public static batchGet<T extends typeof Entity>(this: T, primaryKeys: Array<EntityPrimaryKey<T>>, options: EntityBatchGetOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static batchGet<T extends typeof Entity>(this: T, primaryKeys: Array<EntityPrimaryKey<T>>, options: EntityBatchGetOptions<T> & { return: 'output' }): Promise<BatchGetItemCommandOutput>;
    public static batchGet<T extends typeof Entity>(this: T, primaryKeys: Array<EntityPrimaryKey<T>>, options: EntityBatchGetOptions<T> & { return: 'input' }): BatchGetItemCommandInput;
    public static batchGet<T extends typeof Entity>(
      this: T,
      primaryKeys: Array<EntityPrimaryKey<T>>,
      options?: EntityBatchGetOptions<T>,
    ): Promise<EntityBatchGetOutput<T, EntityPrimaryKey<T>> | BatchGetItemCommandOutput> | BatchGetItemCommandInput {
      const { projectionExpression, attributeNames } = buildGetProjectionExpression(options?.attributes);

      const commandInput: BatchGetItemCommandInput = {
        RequestItems: {
          [this.tableName]: {
            Keys: primaryKeys.map((primaryKey) => this.convertPrimaryKeyToAttributeValues(primaryKey)),
            ConsistentRead: options?.consistent || false,
            ProjectionExpression: projectionExpression,
            ExpressionAttributeNames: attributeNames,
          },
        },
        ...options?.extraInput,
      };

      if (options?.return === 'input') {
        return commandInput;
      }

      return (async () => {
        const result = await this.ddb.batchGetItem(commandInput);

        if (options?.return === 'output') {
          return result;
        }

        const items = result.Responses?.[this.tableName] || [];
        const unprocessedKeys = result.UnprocessedKeys?.[this.tableName]?.Keys?.map((key) => fromDynamo(key) as EntityPrimaryKey<T>) || [];

        return { items: items.map((item) => this.convertAttributeValuesToEntity(item)), unprocessedKeys };
      })();
    }

    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>): Promise<EntityBatchPutOutput<T>>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'default' }): Promise<EntityBatchPutOutput<T>>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'input' }): BatchWriteItemCommandInput;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options?: EntityBatchPutOptions): Promise<EntityBatchPutOutput<T> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
      const dynamoItems = items.map((item) => this.convertEntityToAttributeValues(item));
      const commandInput: BatchWriteItemCommandInput = {
        RequestItems: {
          [this.tableName]: dynamoItems.map((dynamoItem) => ({
            PutRequest: {
              Item: dynamoItem,
            },
          })),
        },
        ...options?.extraInput,
      };

      if (options?.return === 'input') {
        return commandInput;
      }

      return (async () => {
        const result = await this.ddb.batchWriteItem(commandInput);

        if (options?.return === 'output') {
          return result;
        }

        const unprocessedItems =
          result.UnprocessedItems?.[this.tableName]
            ?.map((request) => request.PutRequest?.Item)
            ?.filter((item): item is AttributeValues => !!item)
            ?.map((item) => this.convertAttributeValuesToEntity(item)) || [];

        return { items: dynamoItems.map((dynamoItem) => this.convertAttributeValuesToEntity(dynamoItem)), unprocessedItems };
      })();
    }

    public static batchDelete<T extends typeof Entity>(this: T, primaryKeys: Array<EntityPrimaryKey<T>>): Promise<EntityBatchDeleteOutput<EntityPrimaryKey<T>>>;
    public static batchDelete<T extends typeof Entity>(this: T, primaryKeys: Array<EntityPrimaryKey<T>>, options: EntityBatchDeleteOptions & { return: 'default' }): Promise<EntityBatchDeleteOutput<EntityPrimaryKey<T>>>;
    public static batchDelete<T extends typeof Entity>(this: T, primaryKeys: Array<EntityPrimaryKey<T>>, options: EntityBatchDeleteOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
    public static batchDelete<T extends typeof Entity>(this: T, primaryKeys: Array<EntityPrimaryKey<T>>, options: EntityBatchDeleteOptions & { return: 'input' }): BatchWriteItemCommandInput;
    public static batchDelete<T extends typeof Entity>(
      this: T,
      primaryKeys: Array<EntityPrimaryKey<T>>,
      options?: EntityBatchDeleteOptions,
    ): Promise<EntityBatchDeleteOutput<EntityPrimaryKey<T>> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
      const commandInput: BatchWriteItemCommandInput = {
        RequestItems: {
          [this.tableName]: primaryKeys.map((primaryKey) => ({
            DeleteRequest: {
              Key: this.convertPrimaryKeyToAttributeValues(primaryKey),
            },
          })),
        },
        ...options?.extraInput,
      };

      if (options?.return === 'input') {
        return commandInput;
      }

      return (async () => {
        const result = await this.ddb.batchWriteItem(commandInput);

        if (options?.return === 'output') {
          return result;
        }

        const unprocessedItems =
          result.UnprocessedItems?.[this.tableName]
            ?.map((request) => request.DeleteRequest?.Key)
            ?.filter((item): item is AttributeValues => !!item)
            .map((key) => fromDynamo(key) as EntityPrimaryKey<T>) || [];

        return { unprocessedItems };
      })();
    }

    public static transactionGet<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityTransactionGetOptions<T>): GetTransaction<T> {
      const { projectionExpression, attributeNames } = buildGetProjectionExpression(options?.attributes);

      const commandInput: GetTransaction<T> = {
        ...this,
        Get: {
          TableName: this.tableName,
          Key: this.convertPrimaryKeyToAttributeValues(primaryKey),
          ProjectionExpression: projectionExpression,
          ExpressionAttributeNames: attributeNames,
          ...options?.extraInput,
        },
      };

      return commandInput;
    }

    public static transactionUpdate<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options?: EntityTransactionUpdateOptions<T>): WriteTransaction<T> {
      const { updateExpression, conditionExpression, attributeNames, attributeValues } = buildUpdateConditionExpression(props, options?.condition);

      const commandInput: WriteTransaction<T> = {
        ...this,
        Update: {
          TableName: this.tableName,
          Key: this.convertPrimaryKeyToAttributeValues(primaryKey),
          ReturnValuesOnConditionCheckFailure: mapReturnValuesLimited(options?.returnValuesOnFailure),
          UpdateExpression: updateExpression,
          ConditionExpression: conditionExpression,
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          ...options?.extraInput,
        },
      };

      return commandInput;
    }

    public static transactionPut<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: EntityTransactionPutOptions<T>): WriteTransaction<T> {
      const overwrite = options?.overwrite ?? true;
      const partitionKey = Dynamode.storage.getTableMetadata(this.tableName).partitionKey as EntityKey<T>;
      const overwriteCondition = overwrite ? undefined : this.condition().attribute(partitionKey).not().exists();
      const { conditionExpression, attributeNames, attributeValues } = buildPutConditionExpression(overwriteCondition, options?.condition);

      const commandInput: WriteTransaction<T> = {
        ...this,
        Put: {
          TableName: this.tableName,
          Item: this.convertEntityToAttributeValues(item),
          ReturnValuesOnConditionCheckFailure: mapReturnValuesLimited(options?.returnValuesOnFailure),
          ConditionExpression: conditionExpression,
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          ...options?.extraInput,
        },
      };

      return commandInput;
    }

    public static transactionCreate<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: EntityTransactionPutOptions<T>): WriteTransaction<T> {
      const overwrite = options?.overwrite ?? false;
      return this.transactionPut(item, { ...options, overwrite });
    }

    public static transactionDelete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityTransactionDeleteOptions<T>): WriteTransaction<T> {
      const { conditionExpression, attributeNames, attributeValues } = buildDeleteConditionExpression(options?.condition);

      const commandInput: WriteTransaction<T> = {
        ...this,
        Delete: {
          TableName: this.tableName,
          Key: this.convertPrimaryKeyToAttributeValues(primaryKey),
          ConditionExpression: conditionExpression,
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          ...options?.extraInput,
        },
      };

      return commandInput;
    }

    public static transactionCondition<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, conditionInstance: Condition<T>): WriteTransaction<T> {
      const expressionBuilder = new ExpressionBuilder();
      const conditionExpression = expressionBuilder.run(conditionInstance['operators']);

      const commandInput: WriteTransaction<T> = {
        ...this,
        ConditionCheck: {
          TableName: this.tableName,
          Key: this.convertPrimaryKeyToAttributeValues(primaryKey),
          ConditionExpression: conditionExpression,
          ExpressionAttributeNames: expressionBuilder.attributeNames,
          ExpressionAttributeValues: expressionBuilder.attributeValues,
        },
      };

      return commandInput;
    }

    public static convertAttributeValuesToEntity<T extends typeof Entity>(this: T, dynamoItem: AttributeValues): InstanceType<T> {
      const object = fromDynamo(dynamoItem);
      const attributes = Dynamode.storage.getEntityAttributes(this.tableName, this.name);
      const { createdAt, updatedAt } = Dynamode.storage.getTableMetadata(this.tableName);

      if (createdAt) object[createdAt] = new Date(object[createdAt] as string | number);
      if (updatedAt) object[updatedAt] = new Date(object[updatedAt] as string | number);

      Object.entries(attributes).forEach(([propertyName, metadata]) => {
        let value = object[propertyName];

        if (value && typeof value === 'object' && metadata.type === Map) {
          value = new Map(Object.entries(value));
        }

        object[propertyName] = this.truncateValue(propertyName as EntityKey<T>, value);
      });

      return new this(object) as InstanceType<T>;
    }

    public static convertEntityToAttributeValues<T extends typeof Entity>(this: T, item: InstanceType<T>): AttributeValues {
      const dynamoObject: GenericObject = {};
      const attributes = Dynamode.storage.getEntityAttributes(this.tableName, this.name);

      Object.keys(attributes).forEach((propertyName) => {
        let value: unknown = item[propertyName as keyof InstanceType<T>];

        if (value instanceof Date) {
          if (attributes[propertyName].type === String) {
            value = value.toISOString();
          } else if (attributes[propertyName].type === Number) {
            value = value.getTime();
          } else {
            throw new DefaultError();
          }
        }

        dynamoObject[propertyName] = this.prefixSuffixValue(propertyName as EntityKey<T>, value);
      });

      return objectToDynamo(dynamoObject);
    }

    public static convertAttributeValuesToPrimaryKey<T extends typeof Entity>(this: T, dynamoItem: AttributeValues): EntityPrimaryKey<T> {
      const object = fromDynamo(dynamoItem);
      const { partitionKey, sortKey } = Dynamode.storage.getTableMetadata(this.tableName);
      if (partitionKey) object[partitionKey] = this.truncateValue(partitionKey as EntityKey<T>, object[partitionKey]);
      if (sortKey) object[sortKey] = this.truncateValue(sortKey as EntityKey<T>, object[sortKey]);

      return object as EntityPrimaryKey<T>;
    }

    public static convertPrimaryKeyToAttributeValues<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>): AttributeValues {
      const dynamoObject: GenericObject = {};
      const { partitionKey, sortKey } = Dynamode.storage.getTableMetadata(this.tableName);
      if (partitionKey) dynamoObject[partitionKey] = this.prefixSuffixValue(partitionKey as EntityKey<T>, (<any>primaryKey)[partitionKey]);
      if (sortKey) dynamoObject[sortKey] = this.prefixSuffixValue(sortKey as EntityKey<T>, (<any>primaryKey)[sortKey]);

      return objectToDynamo(dynamoObject);
    }

    public static truncateValue<T extends typeof Entity>(this: T, key: EntityKey<T>, value: unknown): unknown {
      if (typeof value === 'string') {
        const attributes = Dynamode.storage.getEntityAttributes(this.tableName, this.name);
        const separator = Dynamode.separator.get();
        const prefix = attributes[String(key)].prefix || '';
        const suffix = attributes[String(key)].suffix || '';
        return value.replace(`${prefix}${separator}`, '').replace(`${separator}${suffix}`, '');
      } else {
        return value;
      }
    }

    public static prefixSuffixValue<T extends typeof Entity>(this: T, key: EntityKey<T>, value: unknown): unknown {
      if (typeof value === 'string') {
        const attributes = Dynamode.storage.getEntityAttributes(this.tableName, this.name);
        const separator = Dynamode.separator.get();
        const prefix = attributes[String(key)].prefix || '';
        const suffix = attributes[String(key)].suffix || '';
        return [prefix, value, suffix].filter((p) => p).join(separator);
      } else {
        return value;
      }
    }
  };
}
