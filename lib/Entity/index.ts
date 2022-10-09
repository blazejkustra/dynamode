import {
  BatchGetItemCommandInput,
  BatchGetItemCommandOutput,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  ConditionCheck,
  Delete,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  DynamoDB,
  Get,
  GetItemCommandInput,
  GetItemCommandOutput,
  Put,
  PutItemCommandInput,
  PutItemCommandOutput,
  Update,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { mapReturnValues, mapReturnValuesOnFailure } from '@Entity/helpers';
import {
  BuildDeleteConditionExpression,
  BuildGetProjectionExpression,
  BuildPutConditionExpression,
  BuildUpdateConditionExpression,
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
} from '@Entity/types';
import { Condition } from '@lib/Condition';
import { Query } from '@lib/Query';
import { Scan } from '@lib/Scan';
import { getDynamodeStorage } from '@lib/Storage';
import { AttributeMap, buildExpression, ConditionExpression, DefaultError, fromDynamo, GenericObject, isNotEmpty, isNotEmptyArray, NotFoundError, objectToDynamo, substituteAttributeName } from '@lib/utils';

export function Entity<Metadata extends EntityMetadata>({ ddb, tableName }: { ddb: DynamoDB; tableName: string }) {
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

    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>): Promise<InstanceType<T>>;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityGetOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityGetOptions<T> & { return: 'output' }): Promise<GetItemCommandOutput>;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options: EntityGetOptions<T> & { return: 'input' }): GetItemCommandInput;
    public static get<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityGetOptions<T>): Promise<InstanceType<T> | GetItemCommandOutput> | GetItemCommandInput {
      const commandInput: GetItemCommandInput = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToDynamo(primaryKey),
        ConsistentRead: options?.consistent || false,
        ...this.buildGetProjectionExpression(options?.attributes),
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

        return this.convertEntityFromDynamo(result.Item);
      })();
    }

    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>): Promise<InstanceType<T>>;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'output' }): Promise<UpdateItemCommandOutput>;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'input' }): UpdateItemCommandInput;
    public static update<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options?: EntityUpdateOptions<T>): Promise<InstanceType<T> | UpdateItemCommandOutput> | UpdateItemCommandInput {
      const commandInput: UpdateItemCommandInput = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToDynamo(primaryKey),
        ReturnValues: mapReturnValues(options?.returnValues),
        ...this.buildUpdateConditionExpression(props, options?.condition),
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

        return this.convertEntityFromDynamo(result.Attributes || {});
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
      const dynamoItem = this.convertEntityToDynamo(item);

      const commandInput: PutItemCommandInput = {
        TableName: this.tableName,
        Item: dynamoItem,
        ...this.buildPutConditionExpression(overwriteCondition, options?.condition),
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

        return this.convertEntityFromDynamo(dynamoItem);
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
        Key: this.convertPrimaryKeyToDynamo(primaryKey),
        ...this.buildDeleteConditionExpression(options?.condition),
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
            Keys: primaryKeys.map((primaryKey) => this.convertPrimaryKeyToDynamo(primaryKey)),
            ConsistentRead: options?.consistent || false,
            ...this.buildGetProjectionExpression(options?.attributes),
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

        return { items: items.map((item) => this.convertEntityFromDynamo(item)), unprocessedKeys };
      })();
    }

    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>): Promise<EntityBatchPutOutput<T>>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'default' }): Promise<EntityBatchPutOutput<T>>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'input' }): BatchWriteItemCommandInput;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options?: EntityBatchPutOptions): Promise<EntityBatchPutOutput<T> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
      const dynamoItems = items.map((item) => this.convertEntityToDynamo(item));
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
            ?.map((item) => this.convertEntityFromDynamo(item)) || [];

        return { items: dynamoItems.map((dynamoItem) => this.convertEntityFromDynamo(dynamoItem)), unprocessedItems };
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
              Key: this.convertPrimaryKeyToDynamo(primaryKey),
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

    public static query<T extends typeof Entity>(this: T): Query<T> {
      return new Query(this);
    }

    public static scan<T extends typeof Entity>(this: T): Scan<T> {
      return new Scan(this);
    }

    public static condition<T extends typeof Entity>(this: T): Condition<T> {
      return new Condition(this);
    }

    public static transactionGet<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityTransactionGetOptions<T>): Get & T {
      const commandInput: Get & T = {
        ...this,
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToDynamo(primaryKey),
        ...this.buildGetProjectionExpression(options?.attributes),
        ...options?.extraInput,
      };

      return commandInput;
    }

    public static transactionUpdate<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, props: UpdateProps<T>, options?: EntityTransactionUpdateOptions<T>): Update {
      const commandInput: Update = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToDynamo(primaryKey),
        ReturnValuesOnConditionCheckFailure: mapReturnValuesOnFailure(options?.returnValuesOnFailure),
        ...this.buildUpdateConditionExpression(props),
        ...options?.extraInput,
      };

      return commandInput;
    }

    public static transactionPut<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: EntityTransactionPutOptions<T>): Put {
      const overwrite = options?.overwrite ?? true;
      const partitionKey = getDynamodeStorage().getTableMetadata(this.tableName).partitionKey as EntityKey<T>;
      const overwriteCondition = overwrite ? undefined : this.condition().attribute(partitionKey).not().exists();

      const commandInput: Put = {
        TableName: this.tableName,
        Item: this.convertEntityToDynamo(item),
        ReturnValuesOnConditionCheckFailure: mapReturnValuesOnFailure(options?.returnValuesOnFailure),
        ...this.buildPutConditionExpression(overwriteCondition, options?.condition),
        ...options?.extraInput,
      };

      return commandInput;
    }

    public static transactionCreate<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: Omit<EntityTransactionPutOptions<T>, 'overwrite'>): Put {
      return this.transactionCreate(item, { ...options, overwrite: false } as any);
    }

    public static transactionDelete<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, options?: EntityTransactionDeleteOptions<T>): Delete {
      const commandInput: Delete = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToDynamo(primaryKey),
        ...this.buildDeleteConditionExpression(options?.condition),
        ...options?.extraInput,
      };

      return commandInput;
    }

    public static transactionCondition<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>, conditionInstance: Condition<T>): ConditionCheck {
      const attributeNames: Record<string, string> = {};
      const attributeValues: AttributeMap = {};
      const conditionExpression = buildExpression(conditionInstance.conditions, attributeNames, attributeValues);
      const commandInput: ConditionCheck = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToDynamo(primaryKey),
        ConditionExpression: conditionExpression,
        ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(isNotEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
      };

      return commandInput;
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

    public static convertObjectFromDynamo<T extends typeof Entity>(this: T, dynamoItem: AttributeMap): GenericObject {
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

      return object;
    }

    public static convertEntityFromDynamo<T extends typeof Entity>(this: T, dynamoItem: AttributeMap): InstanceType<T> {
      const object = this.convertObjectFromDynamo(dynamoItem);
      const item = new this(object) as InstanceType<T>;
      return item;
    }

    public static convertPrimaryKeyFromDynamo<T extends typeof Entity>(this: T, dynamoItem: AttributeMap): EntityPrimaryKey<T> {
      const object = fromDynamo(dynamoItem);
      const { partitionKey, sortKey } = getDynamodeStorage().getTableMetadata(this.tableName);
      if (partitionKey) object[partitionKey] = this.truncateValue(partitionKey as EntityKey<T>, object[partitionKey]);
      if (sortKey) object[sortKey] = this.truncateValue(sortKey as EntityKey<T>, object[sortKey]);

      return object as EntityPrimaryKey<T>;
    }

    public static convertEntityToDynamo<T extends typeof Entity>(this: T, item: InstanceType<T>): AttributeMap {
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

    public static convertPrimaryKeyToDynamo<T extends typeof Entity>(this: T, primaryKey: EntityPrimaryKey<T>): AttributeMap {
      const dynamoObject: GenericObject = {};
      const { partitionKey, sortKey } = getDynamodeStorage().getTableMetadata(this.tableName);
      if (partitionKey) dynamoObject[partitionKey] = this.prefixSuffixValue(partitionKey as EntityKey<T>, (<any>primaryKey)[partitionKey]);
      if (sortKey) dynamoObject[sortKey] = this.prefixSuffixValue(sortKey as EntityKey<T>, (<any>primaryKey)[sortKey]);

      return objectToDynamo(dynamoObject);
    }

    public static buildGetProjectionExpression<T extends typeof Entity>(this: T, attributes?: Array<EntityKey<T>>): BuildGetProjectionExpression {
      const attributeNames: Record<string, string> = {};
      const projectionExpression = attributes?.map((attribute) => substituteAttributeName(attributeNames, String(attribute))).join(', ');

      return {
        ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(projectionExpression ? { ProjectionExpression: projectionExpression } : {}),
      };
    }

    public static buildUpdateConditionExpression<T extends typeof Entity>(this: T, props: UpdateProps<T>, optionsCondition: Condition<T> | undefined): BuildUpdateConditionExpression {
      const attributeNames: Record<string, string> = {};
      const attributeValues: AttributeMap = {};
      const conditions = this.buildUpdateConditions(props);
      const updateExpression = buildExpression(conditions, attributeNames, attributeValues);
      const conditionExpression = optionsCondition ? buildExpression(optionsCondition.conditions, attributeNames, attributeValues) : undefined;

      return {
        ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(isNotEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
        ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
        UpdateExpression: updateExpression,
      };
    }

    public static buildUpdateConditions<T extends typeof Entity>(this: T, props: UpdateProps<T>): ConditionExpression[] {
      const conditions: ConditionExpression[] = [];

      if (isNotEmpty(props.set) || isNotEmpty(props.setIfNotExists) || isNotEmpty(props.listAppend) || isNotEmpty(props.increment) || isNotEmpty(props.decrement)) {
        const setKeys: string[] = [];
        const setValues: unknown[] = [];
        const setExprs: string[] = [];
        const setProps = [
          { ops: props.set, expr: '$K = $V', twoKeys: false },
          { ops: props.setIfNotExists, expr: '$K = if_not_exists($K, $V)', twoKeys: true },
          { ops: props.listAppend, expr: '$K = list_append($K, $V)', twoKeys: true },
          { ops: props.increment, expr: '$K = $K + $V', twoKeys: true },
          { ops: props.decrement, expr: '$K = $K - $V', twoKeys: true },
        ];

        setProps.forEach(({ ops, expr, twoKeys }) => {
          if (isNotEmpty(ops)) {
            const keys = Object.keys(ops);
            const values = Object.values(ops);

            setKeys.push(...keys.flatMap((key) => Array(twoKeys ? 2 : 1).fill(key)));
            setValues.push(...values);
            setExprs.push(...Array(keys.length).fill(expr));
          }
        });

        conditions.push({ expr: 'SET' }, { keys: setKeys, values: setValues, expr: setExprs.join(', ') });
      }

      if (isNotEmpty(props.add)) {
        const keys = Object.keys(props.add);
        const values = Object.values(props.add);

        conditions.push(
          { expr: 'ADD' },
          {
            keys,
            values,
            expr: Array(keys.length).fill('$K $V').join(', '),
          },
        );
      }

      if (isNotEmpty(props.delete)) {
        const keys = Object.keys(props.delete);
        const values = Object.values(props.delete);

        conditions.push(
          { expr: 'DELETE' },
          {
            keys,
            values,
            expr: Array(keys.length).fill('$K $V').join(', '),
          },
        );
      }

      if (isNotEmptyArray(props.remove)) {
        const keys = props.remove.map((key) => String(key));

        conditions.push(
          { expr: 'REMOVE' },
          {
            keys,
            expr: Array(keys.length).fill('$K').join(', '),
          },
        );
      }

      return conditions;
    }

    public static buildPutConditionExpression<T extends typeof Entity>(this: T, overwriteCondition?: Condition<T>, optionsCondition?: Condition<T>): BuildPutConditionExpression {
      const attributeNames: Record<string, string> = {};
      const attributeValues: AttributeMap = {};
      const conditions = overwriteCondition ? overwriteCondition.condition(optionsCondition).conditions : optionsCondition?.conditions || [];
      const conditionExpression = buildExpression(conditions, attributeNames, attributeValues);

      return {
        ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(isNotEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
        ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
      };
    }

    public static buildDeleteConditionExpression<T extends typeof Entity>(this: T, optionsCondition?: Condition<T>): BuildDeleteConditionExpression {
      const attributeNames: Record<string, string> = {};
      const attributeValues: AttributeMap = {};
      const conditionExpression = buildExpression(optionsCondition?.conditions || [], attributeNames, attributeValues);

      return {
        ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(isNotEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
        ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
      };
    }
  };
}
