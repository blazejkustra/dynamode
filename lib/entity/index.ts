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
import { buildDeleteConditionExpression, buildGetProjectionExpression, buildPutConditionExpression, buildUpdateConditionExpression, mapReturnValues, mapReturnValuesOnFailure } from '@lib/entity/helpers';
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
import { getDynamodeStorage } from '@lib/storage';
import { GetTransaction } from '@lib/transactionGet/types';
import { WriteTransaction } from '@lib/transactionWrite/types';
import { AttributeMap, buildExpression, DefaultError, fromDynamo, GenericObject, isNotEmpty, NotFoundError, objectToDynamo } from '@lib/utils';

export default function Entity<Metadata extends EntityMetadata>({ ddb, tableName }: { ddb: DynamoDB; tableName: string }) {
  getDynamodeStorage().addEntityColumnMetadata(tableName, 'Entity', 'dynamodeObject', { propertyName: 'dynamodeObject', type: String, role: 'dynamodeObject' });

  return class Entity {
    public static ddb = ddb;
    public static tableName = tableName;
    public static metadata: Metadata;

    public dynamodeObject: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(..._args: any[]) {
      this.dynamodeObject = this.constructor.name;
    }

    public static query<T extends typeof Entity>(this: T): Query<T> {
      return new Query(this);
    }

    public static scan<T extends typeof Entity>(this: T): Scan<T> {
      return new Scan(this);
    }

    public static condition<T extends typeof Entity>(this: T): Condition<T> {
      return new Condition(this);
    }

    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>): Promise<InstanceType<T>>;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityGetOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityGetOptions<T> & { return: 'output' }): Promise<GetItemCommandOutput>;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityGetOptions<T> & { return: 'input' }): GetItemCommandInput;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityGetOptions<T>): Promise<InstanceType<T> | GetItemCommandOutput> | GetItemCommandInput {
      const commandInput: GetItemCommandInput = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToAttributeMap(primaryKey),
        ConsistentRead: options?.consistent || false,
        ...buildGetProjectionExpression(options?.attributes),
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

        return this.convertAttributeMapToEntity(result.Item);
      })();
    }

    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>): Promise<InstanceType<T>>;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'output' }): Promise<UpdateItemCommandOutput>;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'input' }): UpdateItemCommandInput;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options?: EntityUpdateOptions<T>): Promise<InstanceType<T> | UpdateItemCommandOutput> | UpdateItemCommandInput {
      const commandInput: UpdateItemCommandInput = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToAttributeMap(primaryKey),
        ReturnValues: mapReturnValues(options?.returnValues),
        ...buildUpdateConditionExpression(props, options?.condition),
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

        return this.convertAttributeMapToEntity(result.Attributes || {});
      })();
    }

    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>): Promise<InstanceType<T>>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'output' }): Promise<PutItemCommandOutput>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'input' }): PutItemCommandInput;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: EntityPutOptions<T>): Promise<InstanceType<T> | PutItemCommandOutput> | PutItemCommandInput {
      const overwrite = options?.overwrite ?? true;
      const partitionKey = getDynamodeStorage().getTableMetadata(this.tableName).partitionKey as EntityKey<T>;
      const overwriteCondition = overwrite ? undefined : this.condition().attribute(partitionKey).not().exists();
      const dynamoItem = this.convertEntityToAttributeMap(item);

      const commandInput: PutItemCommandInput = {
        TableName: this.tableName,
        Item: dynamoItem,
        ...buildPutConditionExpression(overwriteCondition, options?.condition),
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

        return this.convertAttributeMapToEntity(dynamoItem);
      })();
    }

    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>): Promise<InstanceType<T>>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: Omit<EntityPutOptions<T>, 'overwrite'> & { return: 'default' }): Promise<InstanceType<T>>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: Omit<EntityPutOptions<T>, 'overwrite'> & { return: 'output' }): Promise<PutItemCommandOutput>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: Omit<EntityPutOptions<T>, 'overwrite'> & { return: 'input' }): PutItemCommandInput;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: Omit<EntityPutOptions<T>, 'overwrite'>): Promise<InstanceType<T> | PutItemCommandOutput> | PutItemCommandInput {
      return this.put(item, { ...options, overwrite: false } as any);
    }

    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>): Promise<void>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityDeleteOptions<T> & { return: 'default' }): Promise<void>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityDeleteOptions<T> & { return: 'output' }): Promise<DeleteItemCommandOutput>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityDeleteOptions<T> & { return: 'input' }): DeleteItemCommandInput;
    public static delete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityDeleteOptions<T>): Promise<void | DeleteItemCommandOutput> | DeleteItemCommandInput {
      const commandInput: DeleteItemCommandInput = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToAttributeMap(primaryKey),
        ...buildDeleteConditionExpression(options?.condition),
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

        return;
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
      const commandInput: BatchGetItemCommandInput = {
        RequestItems: {
          [this.tableName]: {
            Keys: primaryKeys.map((primaryKey) => this.convertPrimaryKeyToAttributeMap(primaryKey)),
            ConsistentRead: options?.consistent || false,
            ...buildGetProjectionExpression(options?.attributes),
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

        return { items: items.map((item) => this.convertAttributeMapToEntity(item)), unprocessedKeys };
      })();
    }

    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>): Promise<EntityBatchPutOutput<T>>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'default' }): Promise<EntityBatchPutOutput<T>>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'input' }): BatchWriteItemCommandInput;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options?: EntityBatchPutOptions): Promise<EntityBatchPutOutput<T> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
      const dynamoItems = items.map((item) => this.convertEntityToAttributeMap(item));
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
            ?.filter((item): item is AttributeMap => !!item)
            ?.map((item) => this.convertAttributeMapToEntity(item)) || [];

        return { items: dynamoItems.map((dynamoItem) => this.convertAttributeMapToEntity(dynamoItem)), unprocessedItems };
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
              Key: this.convertPrimaryKeyToAttributeMap(primaryKey),
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
            ?.filter((item): item is AttributeMap => !!item)
            .map((key) => fromDynamo(key) as EntityPrimaryKey<T>) || [];

        return { unprocessedItems };
      })();
    }

    public static transactionGet<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityTransactionGetOptions<T>): GetTransaction<T> {
      const commandInput: GetTransaction<T> = {
        ...this,
        Get: {
          TableName: this.tableName,
          Key: this.convertPrimaryKeyToAttributeMap(primaryKey),
          ...buildGetProjectionExpression(options?.attributes),
          ...options?.extraInput,
        },
      };

      return commandInput;
    }

    public static transactionUpdate<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options?: EntityTransactionUpdateOptions<T>): WriteTransaction<T> {
      const commandInput: WriteTransaction<T> = {
        ...this,
        Update: {
          TableName: this.tableName,
          Key: this.convertPrimaryKeyToAttributeMap(primaryKey),
          ReturnValuesOnConditionCheckFailure: mapReturnValuesOnFailure(options?.returnValuesOnFailure),
          ...buildUpdateConditionExpression(props, options?.condition),
          ...options?.extraInput,
        },
      };

      return commandInput;
    }

    public static transactionPut<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: EntityTransactionPutOptions<T>): WriteTransaction<T> {
      const overwrite = options?.overwrite ?? true;
      const partitionKey = getDynamodeStorage().getTableMetadata(this.tableName).partitionKey as EntityKey<T>;
      const overwriteCondition = overwrite ? undefined : this.condition().attribute(partitionKey).not().exists();

      const commandInput: WriteTransaction<T> = {
        ...this,
        Put: {
          TableName: this.tableName,
          Item: this.convertEntityToAttributeMap(item),
          ReturnValuesOnConditionCheckFailure: mapReturnValuesOnFailure(options?.returnValuesOnFailure),
          ...buildPutConditionExpression(overwriteCondition, options?.condition),
          ...options?.extraInput,
        },
      };

      return commandInput;
    }

    public static transactionCreate<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: Omit<EntityTransactionPutOptions<T>, 'overwrite'>): WriteTransaction<T> {
      return this.transactionPut(item, { ...options, overwrite: false });
    }

    public static transactionDelete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityTransactionDeleteOptions<T>): WriteTransaction<T> {
      const commandInput: WriteTransaction<T> = {
        ...this,
        Delete: {
          TableName: this.tableName,
          Key: this.convertPrimaryKeyToAttributeMap(primaryKey),
          ...buildDeleteConditionExpression(options?.condition),
          ...options?.extraInput,
        },
      };

      return commandInput;
    }

    public static transactionCondition<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, conditionInstance: Condition<T>): WriteTransaction<T> {
      const attributeNames: Record<string, string> = {};
      const attributeValues: AttributeMap = {};
      const conditionExpression = buildExpression(conditionInstance.conditions, attributeNames, attributeValues);
      const commandInput: WriteTransaction<T> = {
        ...this,
        ConditionCheck: {
          TableName: this.tableName,
          Key: this.convertPrimaryKeyToAttributeMap(primaryKey),
          ConditionExpression: conditionExpression,
          ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
          ...(isNotEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
        },
      };

      return commandInput;
    }

    public static convertAttributeMapToEntity<T extends typeof Entity>(this: T, dynamoItem: AttributeMap): InstanceType<T> {
      const object = fromDynamo(dynamoItem);
      const columns = getDynamodeStorage().getEntityColumns(this.tableName, this.name);
      const { createdAt, updatedAt } = getDynamodeStorage().getTableMetadata(this.tableName);

      if (createdAt) object[createdAt] = new Date(object[createdAt] as string | number);
      if (updatedAt) object[updatedAt] = new Date(object[updatedAt] as string | number);

      Object.entries(columns).forEach(([propertyName, metadata]) => {
        let value = object[propertyName];

        if (value && typeof value === 'object' && metadata.type === Map) {
          value = new Map(Object.entries(value));
        }

        object[propertyName] = this.truncateValue(propertyName as EntityKey<T>, value);
      });

      return new this(object) as InstanceType<T>;
    }

    public static convertEntityToAttributeMap<T extends typeof Entity>(this: T, item: InstanceType<T>): AttributeMap {
      const dynamoObject: GenericObject = {};
      const columns = getDynamodeStorage().getEntityColumns(this.tableName, this.name);
      const { createdAt, updatedAt } = getDynamodeStorage().getTableMetadata(this.tableName);

      Object.keys(columns).forEach((propertyName) => {
        let value: unknown = item[propertyName as keyof InstanceType<T>];

        if (value instanceof Date) {
          if (createdAt === propertyName && columns[createdAt]?.type === String) value = value.toISOString();
          else if (createdAt === propertyName && columns[createdAt]?.type === Number) value = value.getTime();
          else if (updatedAt === propertyName && columns[updatedAt]?.type === String) value = value.toISOString();
          else if (updatedAt === propertyName && columns[updatedAt]?.type === Number) value = value.getTime();
          else throw new DefaultError();
        }

        dynamoObject[propertyName] = this.prefixSuffixValue(propertyName as EntityKey<T>, value);
      });

      return objectToDynamo(dynamoObject);
    }

    public static convertAttributeMapToPrimaryKey<T extends typeof Entity>(this: T, dynamoItem: AttributeMap): EntityPrimaryKey<T> {
      const object = fromDynamo(dynamoItem);
      const { partitionKey, sortKey } = getDynamodeStorage().getTableMetadata(this.tableName);
      if (partitionKey) object[partitionKey] = this.truncateValue(partitionKey as EntityKey<T>, object[partitionKey]);
      if (sortKey) object[sortKey] = this.truncateValue(sortKey as EntityKey<T>, object[sortKey]);

      return object as EntityPrimaryKey<T>;
    }

    public static convertPrimaryKeyToAttributeMap<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>): AttributeMap {
      const dynamoObject: GenericObject = {};
      const { partitionKey, sortKey } = getDynamodeStorage().getTableMetadata(this.tableName);
      if (partitionKey) dynamoObject[partitionKey] = this.prefixSuffixValue(partitionKey as EntityKey<T>, (<any>primaryKey)[partitionKey]);
      if (sortKey) dynamoObject[sortKey] = this.prefixSuffixValue(sortKey as EntityKey<T>, (<any>primaryKey)[sortKey]);

      return objectToDynamo(dynamoObject);
    }

    public static truncateValue<T extends typeof Entity>(this: T, key: EntityKey<T>, value: unknown): unknown {
      if (typeof value === 'string') {
        const columns = getDynamodeStorage().getEntityColumns(this.tableName, this.name);
        const separator = getDynamodeStorage().separator;
        const prefix = columns[String(key)].prefix || '';
        const suffix = columns[String(key)].suffix || '';
        return value.replace(`${prefix}${separator}`, '').replace(`${separator}${suffix}`, '');
      } else {
        return value;
      }
    }

    public static prefixSuffixValue<T extends typeof Entity>(this: T, key: EntityKey<T>, value: unknown): unknown {
      if (typeof value === 'string') {
        const columns = getDynamodeStorage().getEntityColumns(this.tableName, this.name);
        const separator = getDynamodeStorage().separator;
        const prefix = columns[String(key)].prefix || '';
        const suffix = columns[String(key)].suffix || '';
        return [prefix, value, suffix].filter((p) => p).join(separator);
      } else {
        return value;
      }
    }
  };
}
