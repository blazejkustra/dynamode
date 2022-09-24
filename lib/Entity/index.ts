import {
  BatchGetItemCommandInput,
  BatchGetItemCommandOutput,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  GetItemCommandInput,
  GetItemCommandOutput,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
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
  EntityCreateOptions,
  EntityDeleteOptions,
  EntityGetOptions,
  EntityKeys,
  EntityPutOptions,
  EntityUpdateOptions,
  UpdateProps,
} from '@Entity/types';
import { Condition } from '@lib/Condition';
import { column } from '@lib/decorators';
import { Query } from '@lib/Query';
import { getDynamodeStorage } from '@lib/Storage';
import { Table as BaseTable } from '@lib/Table';
import { AttributeMap, buildExpression, ConditionExpression, DefaultError, fromDynamo, GenericObject, isNotEmpty, isNotEmptyArray, NotFoundError, objectToDynamo, substituteAttributeName } from '@lib/utils';

import { addPrefixSuffix, truncatePrefixSuffix } from './utils';

export function Entity<TableT extends ReturnType<typeof BaseTable>>(Table: TableT) {
  class Entity extends Table {
    public dynamodeObject: string;

    constructor(...args: any[]) {
      super(args[0]);
      this.dynamodeObject = args[0]?.dynamodeObject || this.constructor.name;
    }

    public static query<T extends typeof Entity>(this: T, key: EntityKeys<T>, value: string | number): InstanceType<typeof Query<T>> {
      return new Query(this, key, value);
    }

    public static condition<T extends typeof Entity>(this: T, key: EntityKeys<T>): Condition<T> {
      return new Condition(this, key);
    }

    public static get<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey']): Promise<InstanceType<T>>;
    public static get<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options: Omit<EntityGetOptions<T>, 'return'>): Promise<InstanceType<T>>;
    public static get<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options: EntityGetOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static get<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options: EntityGetOptions<T> & { return: 'output' }): Promise<GetItemCommandOutput>;
    public static get<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options: EntityGetOptions<T> & { return: 'input' }): GetItemCommandInput;
    public static get<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options?: EntityGetOptions<T>): Promise<InstanceType<T> | GetItemCommandOutput> | GetItemCommandInput {
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

        if (!result || !result.Item) {
          throw new NotFoundError();
        }

        if (options?.return === 'output') {
          return result;
        }

        return this.parseFromDynamo(result.Item || {});
      })();
    }

    public static update<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>): Promise<InstanceType<T>>;
    public static update<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options: Omit<EntityUpdateOptions<T>, 'return'>): Promise<InstanceType<T>>;
    public static update<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static update<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'output' }): Promise<UpdateItemCommandOutput>;
    public static update<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'input' }): UpdateItemCommandInput;
    public static update<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options?: EntityUpdateOptions<T>): Promise<InstanceType<T> | UpdateItemCommandOutput> | UpdateItemCommandInput {
      const commandInput: UpdateItemCommandInput = {
        TableName: this.tableName,
        Key: this.convertPrimaryKeyToDynamo(primaryKey),
        ReturnValues: 'ALL_NEW', // TODO: Make adjustable
        ...this.buildUpdateConditionExpression(props),
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

        return this.parseFromDynamo(result.Attributes || {});
      })();
    }

    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>): Promise<InstanceType<T>>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: Omit<EntityPutOptions<T>, 'return'>): Promise<InstanceType<T>>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'output' }): Promise<PutItemCommandOutput>;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityPutOptions<T> & { return: 'input' }): PutItemCommandInput;
    public static put<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: EntityPutOptions<T>): Promise<InstanceType<T> | PutItemCommandOutput> | PutItemCommandInput {
      const overwrite = options?.overwrite ?? true;
      const partitionKey = getDynamodeStorage().getTableMetadata(this.tableName).partitionKey?.propertyName as EntityKeys<T>;
      const overwriteCondition = overwrite ? undefined : this.condition(partitionKey).not().exists();

      const commandInput: PutItemCommandInput = {
        TableName: this.tableName,
        Item: this.convertEntityToDynamo(item),
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

        return item;
      })();
    }

    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>): Promise<InstanceType<T>>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: Omit<EntityCreateOptions<T>, 'return'>): Promise<InstanceType<T>>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityCreateOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityCreateOptions<T> & { return: 'output' }): Promise<PutItemCommandOutput>;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options: EntityCreateOptions<T> & { return: 'input' }): PutItemCommandInput;
    public static create<T extends typeof Entity>(this: T, item: InstanceType<T>, options?: EntityCreateOptions<T>): Promise<InstanceType<T> | PutItemCommandOutput> | PutItemCommandInput {
      return this.put(item, { ...options, overwrite: false });
    }

    public static delete<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey']): Promise<void>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options: Omit<EntityDeleteOptions<T>, 'return'>): Promise<void>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options: EntityDeleteOptions<T> & { return: 'default' }): Promise<void>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options: EntityDeleteOptions<T> & { return: 'output' }): Promise<DeleteItemCommandOutput>;
    public static delete<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options: EntityDeleteOptions<T> & { return: 'input' }): DeleteItemCommandInput;
    public static delete<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey'], options?: EntityDeleteOptions<T>): Promise<void | DeleteItemCommandOutput> | DeleteItemCommandInput {
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

    public static batchGet<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>): Promise<EntityBatchGetOutput<T, TableT['primaryKey']>>;
    public static batchGet<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: Omit<EntityBatchGetOptions<T>, 'return'>): Promise<EntityBatchGetOutput<T, TableT['primaryKey']>>;
    public static batchGet<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: EntityBatchGetOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static batchGet<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: EntityBatchGetOptions<T> & { return: 'output' }): Promise<BatchGetItemCommandOutput>;
    public static batchGet<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: EntityBatchGetOptions<T> & { return: 'input' }): BatchGetItemCommandInput;
    public static batchGet<T extends typeof Entity>(
      this: T,
      primaryKeys: Array<TableT['primaryKey']>,
      options?: EntityBatchGetOptions<T>,
    ): Promise<EntityBatchGetOutput<T, TableT['primaryKey']> | BatchGetItemCommandOutput> | BatchGetItemCommandInput {
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
        const unprocessedKeys = result.UnprocessedKeys?.[this.tableName]?.Keys?.map((key) => fromDynamo(key) as TableT['primaryKey']) || [];

        return { items: items.map((item) => this.parseFromDynamo(item)), unprocessedKeys };
      })();
    }

    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>): Promise<EntityBatchPutOutput<T>>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: Omit<EntityBatchPutOptions, 'return'>): Promise<EntityBatchPutOutput<T>>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'default' }): Promise<EntityBatchPutOutput<T>>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options: EntityBatchPutOptions & { return: 'input' }): BatchWriteItemCommandInput;
    public static batchPut<T extends typeof Entity>(this: T, items: Array<InstanceType<T>>, options?: EntityBatchPutOptions): Promise<EntityBatchPutOutput<T> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
      const commandInput: BatchWriteItemCommandInput = {
        RequestItems: {
          [this.tableName]: items.map((item) => ({
            PutRequest: {
              Item: this.convertEntityToDynamo(item),
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
            ?.map((item) => this.parseFromDynamo(item)) || [];

        return { items, unprocessedItems };
      })();
    }

    public static batchDelete<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>): Promise<EntityBatchDeleteOutput<TableT['primaryKey']>>;
    public static batchDelete<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: Omit<EntityBatchDeleteOptions, 'return'>): Promise<EntityBatchDeleteOutput<TableT['primaryKey']>>;
    public static batchDelete<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: EntityBatchDeleteOptions & { return: 'default' }): Promise<EntityBatchDeleteOutput<TableT['primaryKey']>>;
    public static batchDelete<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: EntityBatchDeleteOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
    public static batchDelete<T extends typeof Entity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: EntityBatchDeleteOptions & { return: 'input' }): BatchWriteItemCommandInput;
    public static batchDelete<T extends typeof Entity>(
      this: T,
      primaryKeys: Array<TableT['primaryKey']>,
      options?: EntityBatchDeleteOptions,
    ): Promise<EntityBatchDeleteOutput<TableT['primaryKey']> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
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
            .map((key) => fromDynamo(key) as TableT['primaryKey']) || [];

        return { unprocessedItems };
      })();
    }

    public static parseFromDynamo<T extends typeof Entity>(this: T, dynamoItem: AttributeMap): InstanceType<T> {
      const object = fromDynamo(dynamoItem);
      const columns = getDynamodeStorage().getEntityColumns(this.tableName, this.name);
      const { createdAt, updatedAt } = getDynamodeStorage().getTableMetadata(this.tableName);

      if (createdAt?.propertyName) object[createdAt.propertyName] = new Date(object[createdAt.propertyName] as string | number);
      if (updatedAt?.propertyName) object[updatedAt.propertyName] = new Date(object[updatedAt.propertyName] as string | number);

      Object.entries(columns).forEach(([propertyName, metadata]) => {
        let value = object[propertyName];

        if (metadata.type === Map && value && typeof value === 'object') {
          value = new Map(Object.entries(value));
        }

        const truncatedValue = typeof value === 'string' ? truncatePrefixSuffix(metadata.prefix || '', value, metadata.suffix || '') : value;
        object[propertyName] = truncatedValue;
      });

      const item = new this(object) as InstanceType<T>;
      return item;
    }

    public static convertEntityToDynamo<T extends typeof Entity>(this: T, item: InstanceType<T>): AttributeMap {
      const dynamoObject: GenericObject = {};
      const columns = getDynamodeStorage().getEntityColumns(this.tableName, this.name);
      const { createdAt, updatedAt } = getDynamodeStorage().getTableMetadata(this.tableName);

      Object.entries(columns).forEach(([propertyName, metadata]) => {
        let value: unknown = item[propertyName as keyof InstanceType<T>];

        if (value instanceof Date) {
          if (createdAt?.propertyName === propertyName && createdAt?.type === String) value = value.toISOString();
          else if (createdAt?.propertyName === propertyName && createdAt?.type === Number) value = value.getTime();
          else if (updatedAt?.propertyName === propertyName && updatedAt?.type === String) value = value.toISOString();
          else if (updatedAt?.propertyName === propertyName && updatedAt?.type === Number) value = value.getTime();
          else throw new DefaultError();
        }

        const prefixedSuffixedValue = typeof value === 'string' ? addPrefixSuffix(metadata.prefix || '', value, metadata.suffix || '') : value;
        dynamoObject[propertyName] = prefixedSuffixedValue;
      });

      return objectToDynamo(dynamoObject);
    }

    public static convertPrimaryKeyToDynamo<T extends typeof Entity>(this: T, primaryKey: TableT['primaryKey']): AttributeMap {
      const dynamoObject: GenericObject = {};
      const columns = getDynamodeStorage().getEntityColumns(this.tableName, this.name);

      Object.entries(primaryKey).forEach(([propertyName, value]) => {
        const metadata = columns[propertyName];
        const prefixedSuffixedValue = typeof value === 'string' ? addPrefixSuffix(metadata.prefix || '', value, metadata.suffix || '') : value;
        dynamoObject[propertyName] = prefixedSuffixedValue;
      });

      return objectToDynamo(dynamoObject);
    }

    public static buildGetProjectionExpression<T extends typeof Entity>(this: T, attributes?: Array<EntityKeys<T>>): BuildGetProjectionExpression {
      const attributeNames: Record<string, string> = {};
      const projectionExpression = attributes?.map((attribute) => substituteAttributeName(attributeNames, String(attribute))).join(', ');

      return {
        ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(projectionExpression ? { ProjectionExpression: projectionExpression } : {}),
      };
    }

    public static buildUpdateConditionExpression<T extends typeof Entity>(this: T, props: UpdateProps<T>): BuildUpdateConditionExpression {
      const attributeNames: Record<string, string> = {};
      const attributeValues: AttributeMap = {};
      const conditions = this.buildUpdateConditions(props);
      const updateExpression = buildExpression(conditions, attributeNames, attributeValues);

      return {
        ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(isNotEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
        ...(updateExpression ? { UpdateExpression: updateExpression } : {}),
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
  }

  column(String)(new Entity({}), 'dynamodeObject');
  return Entity;
}
