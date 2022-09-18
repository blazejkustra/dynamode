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
  EntityGetOptions,
  EntityKeys,
  EntityUpdateOptions,
  ModelBatchDeleteOptions,
  ModelBatchDeleteOutput,
  ModelBatchGetOptions,
  ModelBatchGetOutput,
  ModelBatchPutOptions,
  ModelBatchPutOutput,
  ModelCreateOptions,
  ModelDeleteOptions,
  ModelPutOptions,
  UpdateProps,
} from '@Entity/types';
import { Condition } from '@lib/Condition';
import { Table as BaseTable } from '@lib/Table';
import { AttributeMap, buildExpression, classToObject, ConditionExpression, fromDynamo, isEmpty, NotFoundError, objectToDynamo, substituteAttributeName } from '@lib/utils';

export function Entity<TableT extends ReturnType<typeof BaseTable>>(Table: TableT) {
  return class BaseEntity extends Table {
    constructor(...args: any[]) {
      super(args[0]);
    }

    // public static query<T extends typeof BaseEntity>(this: T, key: PartitionKeys, value: string | number): InstanceType<typeof Query<T>> {
    //   return new Query(this, key, value);
    // }

    public static condition<T extends typeof BaseEntity>(this: T, key: keyof EntityKeys<T>): Condition<T> {
      return new Condition(this, key);
    }

    public static get<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey']): Promise<InstanceType<T>>;
    public static get<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options: Omit<EntityGetOptions<T>, 'return'>): Promise<InstanceType<T>>;
    public static get<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options: EntityGetOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static get<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options: EntityGetOptions<T> & { return: 'output' }): Promise<GetItemCommandOutput>;
    public static get<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options: EntityGetOptions<T> & { return: 'input' }): GetItemCommandInput;
    public static get<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options?: EntityGetOptions<T>): Promise<InstanceType<T> | GetItemCommandOutput> | GetItemCommandInput {
      const commandInput: GetItemCommandInput = {
        TableName: this.tableName,
        Key: objectToDynamo(primaryKey),
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

    public static update<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>): Promise<InstanceType<T>>;
    public static update<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options: Omit<EntityUpdateOptions<T>, 'return'>): Promise<InstanceType<T>>;
    public static update<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static update<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'output' }): Promise<UpdateItemCommandOutput>;
    public static update<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options: EntityUpdateOptions<T> & { return: 'input' }): UpdateItemCommandInput;
    public static update<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], props: UpdateProps<T>, options?: EntityUpdateOptions<T>): Promise<InstanceType<T> | UpdateItemCommandOutput> | UpdateItemCommandInput {
      const commandInput: UpdateItemCommandInput = {
        TableName: this.tableName,
        Key: objectToDynamo(primaryKey),
        ReturnValues: 'ALL_NEW',
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

    public static put<T extends typeof BaseEntity>(this: T, item: InstanceType<T>): Promise<InstanceType<T>>;
    public static put<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options: Omit<ModelPutOptions<T>, 'return'>): Promise<InstanceType<T>>;
    public static put<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options: ModelPutOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static put<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options: ModelPutOptions<T> & { return: 'output' }): Promise<PutItemCommandOutput>;
    public static put<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options: ModelPutOptions<T> & { return: 'input' }): PutItemCommandInput;
    public static put<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options?: ModelPutOptions<T>): Promise<InstanceType<T> | PutItemCommandOutput> | PutItemCommandInput {
      const overwrite = options?.overwrite ?? true;
      const overwriteCondition = overwrite
        ? undefined
        : this.condition('PK' as any)
            .not()
            .exists(); // set real partition key here

      const commandInput: PutItemCommandInput = {
        TableName: this.tableName,
        Item: this.modelToDynamo(item),
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

    public static create<T extends typeof BaseEntity>(this: T, item: InstanceType<T>): Promise<InstanceType<T>>;
    public static create<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options: Omit<ModelCreateOptions<T>, 'return'>): Promise<InstanceType<T>>;
    public static create<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options: ModelCreateOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static create<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options: ModelCreateOptions<T> & { return: 'output' }): Promise<PutItemCommandOutput>;
    public static create<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options: ModelCreateOptions<T> & { return: 'input' }): PutItemCommandInput;
    public static create<T extends typeof BaseEntity>(this: T, item: InstanceType<T>, options?: ModelCreateOptions<T>): Promise<InstanceType<T> | PutItemCommandOutput> | PutItemCommandInput {
      return this.put(item, { ...options, overwrite: false });
    }

    public static delete<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey']): Promise<void>;
    public static delete<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options: Omit<ModelDeleteOptions<T>, 'return'>): Promise<void>;
    public static delete<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options: ModelDeleteOptions<T> & { return: 'default' }): Promise<void>;
    public static delete<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options: ModelDeleteOptions<T> & { return: 'output' }): Promise<DeleteItemCommandOutput>;
    public static delete<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options: ModelDeleteOptions<T> & { return: 'input' }): DeleteItemCommandInput;
    public static delete<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey'], options?: ModelDeleteOptions<T>): Promise<void | DeleteItemCommandOutput> | DeleteItemCommandInput {
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

    public static batchGet<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>): Promise<ModelBatchGetOutput<T, TableT['primaryKey']>>;
    public static batchGet<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: Omit<ModelBatchGetOptions<T>, 'return'>): Promise<ModelBatchGetOutput<T, TableT['primaryKey']>>;
    public static batchGet<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: ModelBatchGetOptions<T> & { return: 'default' }): Promise<InstanceType<T>>;
    public static batchGet<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: ModelBatchGetOptions<T> & { return: 'output' }): Promise<BatchGetItemCommandOutput>;
    public static batchGet<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: ModelBatchGetOptions<T> & { return: 'input' }): BatchGetItemCommandInput;
    public static batchGet<T extends typeof BaseEntity>(
      this: T,
      primaryKeys: Array<TableT['primaryKey']>,
      options?: ModelBatchGetOptions<T>,
    ): Promise<ModelBatchGetOutput<T, TableT['primaryKey']> | BatchGetItemCommandOutput> | BatchGetItemCommandInput {
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

    public static batchPut<T extends typeof BaseEntity>(this: T, items: Array<InstanceType<T>>): Promise<ModelBatchPutOutput<T>>;
    public static batchPut<T extends typeof BaseEntity>(this: T, items: Array<InstanceType<T>>, options: Omit<ModelBatchPutOptions, 'return'>): Promise<ModelBatchPutOutput<T>>;
    public static batchPut<T extends typeof BaseEntity>(this: T, items: Array<InstanceType<T>>, options: ModelBatchPutOptions & { return: 'default' }): Promise<ModelBatchPutOutput<T>>;
    public static batchPut<T extends typeof BaseEntity>(this: T, items: Array<InstanceType<T>>, options: ModelBatchPutOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
    public static batchPut<T extends typeof BaseEntity>(this: T, items: Array<InstanceType<T>>, options: ModelBatchPutOptions & { return: 'input' }): BatchWriteItemCommandInput;
    public static batchPut<T extends typeof BaseEntity>(this: T, items: Array<InstanceType<T>>, options?: ModelBatchPutOptions): Promise<ModelBatchPutOutput<T> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
      const commandInput: BatchWriteItemCommandInput = {
        RequestItems: {
          [this.tableName]: items.map((item) => ({
            PutRequest: {
              Item: this.modelToDynamo(item),
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

    public static batchDelete<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>): Promise<ModelBatchDeleteOutput<TableT['primaryKey']>>;
    public static batchDelete<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: Omit<ModelBatchDeleteOptions, 'return'>): Promise<ModelBatchDeleteOutput<TableT['primaryKey']>>;
    public static batchDelete<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: ModelBatchDeleteOptions & { return: 'default' }): Promise<ModelBatchDeleteOutput<TableT['primaryKey']>>;
    public static batchDelete<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: ModelBatchDeleteOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
    public static batchDelete<T extends typeof BaseEntity>(this: T, primaryKeys: Array<TableT['primaryKey']>, options: ModelBatchDeleteOptions & { return: 'input' }): BatchWriteItemCommandInput;
    public static batchDelete<T extends typeof BaseEntity>(
      this: T,
      primaryKeys: Array<TableT['primaryKey']>,
      options?: ModelBatchDeleteOptions,
    ): Promise<ModelBatchDeleteOutput<TableT['primaryKey']> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
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

    public static parseFromDynamo<T extends typeof BaseEntity>(this: T, dynamoItem: AttributeMap): InstanceType<T> {
      const props = fromDynamo(dynamoItem);
      const item = new this(props) as InstanceType<T>;
      return item;
    }

    public static modelToDynamo<T extends typeof BaseEntity>(this: T, item: InstanceType<T>): AttributeMap {
      const object = classToObject(item);
      return objectToDynamo(object);
    }

    public static convertPrimaryKeyToDynamo<T extends typeof BaseEntity>(this: T, primaryKey: TableT['primaryKey']): AttributeMap {
      return objectToDynamo(primaryKey);
    }

    public static buildGetProjectionExpression<T extends typeof BaseEntity>(this: T, attributes?: Array<keyof EntityKeys<T>>): BuildGetProjectionExpression {
      const attributeNames: Record<string, string> = {};
      const projectionExpression = attributes?.map((attribute) => substituteAttributeName(attributeNames, String(attribute))).join(', ');

      return {
        ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(projectionExpression ? { ProjectionExpression: projectionExpression } : {}),
      };
    }

    public static buildUpdateConditionExpression<T extends typeof BaseEntity>(this: T, props: UpdateProps<T>): BuildUpdateConditionExpression {
      const attributeNames: Record<string, string> = {};
      const attributeValues: AttributeMap = {};
      const conditions = this.buildUpdateConditions(props);
      const updateExpression = buildExpression(conditions, attributeNames, attributeValues);

      return {
        ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(!isEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
        ...(updateExpression ? { UpdateExpression: updateExpression } : {}),
      };
    }

    public static buildUpdateConditions<T extends typeof BaseEntity>(this: T, props: UpdateProps<T>): ConditionExpression[] {
      const { set, setIfNotExists, listAppend, increment, decrement, add, delete: deleteOp, remove } = props;
      const conditions: ConditionExpression[] = [];

      const setKeys: string[] = [];
      const setValues: unknown[] = [];
      const setExpr: string[] = [];

      if (set && !isEmpty(set)) {
        setKeys.push(...Object.keys(set));
        setValues.push(...Object.values(set));
        setExpr.push(...Object.keys(set).map(() => '$K = $V'));
      }

      if (setIfNotExists && !isEmpty(setIfNotExists)) {
        setKeys.push(...Object.keys(setIfNotExists).flatMap((k) => [k, k]));
        setValues.push(...Object.values(setIfNotExists));
        setExpr.push(...Object.keys(setIfNotExists).map(() => '$K = if_not_exists($K, $V)'));
      }

      if (listAppend && !isEmpty(listAppend)) {
        setKeys.push(...Object.keys(listAppend).flatMap((k) => [k, k]));
        setValues.push(...Object.values(listAppend));
        setExpr.push(...Object.keys(listAppend).map(() => '$K = list_append($K, $V)'));
      }

      if (increment && !isEmpty(increment)) {
        setKeys.push(...Object.keys(increment).flatMap((k) => [k, k]));
        setValues.push(...Object.values(increment));
        setExpr.push(...Object.keys(increment).map(() => '$K = $K + $V'));
      }

      if (decrement && !isEmpty(decrement)) {
        setKeys.push(...Object.keys(decrement).flatMap((k) => [k, k]));
        setValues.push(...Object.values(decrement));
        setExpr.push(...Object.keys(decrement).map(() => '$K = $K - $V'));
      }

      if (setExpr.length > 0) {
        conditions.push({ expr: 'SET' }, { keys: setKeys, values: setValues, expr: setExpr.join(', ') });
      }

      if (add && !isEmpty(add)) {
        conditions.push(
          { expr: 'ADD' },
          {
            keys: Object.keys(add),
            values: Object.values(add),
            expr: Object.keys(add)
              .map(() => '$K $V')
              .join(', '),
          },
        );
      }

      if (deleteOp && !isEmpty(deleteOp)) {
        conditions.push(
          { expr: 'DELETE' },
          {
            keys: Object.keys(deleteOp),
            values: Object.values(deleteOp),
            expr: Object.keys(deleteOp)
              .map(() => '$K $V')
              .join(', '),
          },
        );
      }

      if (remove && remove.length > 0) {
        conditions.push({ expr: 'REMOVE' }, { keys: remove.map((key) => String(key)), expr: remove.map(() => '$K').join(', ') });
      }

      return conditions;
    }

    public static buildPutConditionExpression<T extends typeof BaseEntity>(this: T, overwriteCondition?: Condition<T>, optionsCondition?: Condition<T>): BuildPutConditionExpression {
      const attributeNames: Record<string, string> = {};
      const attributeValues: AttributeMap = {};
      let conditionExpression: string | undefined = undefined;

      if (overwriteCondition && optionsCondition) {
        conditionExpression = buildExpression(overwriteCondition.condition(optionsCondition).conditions, attributeNames, attributeValues);
      } else if (overwriteCondition) {
        conditionExpression = buildExpression(overwriteCondition.conditions, attributeNames, attributeValues);
      } else if (optionsCondition) {
        conditionExpression = buildExpression(optionsCondition.conditions, attributeNames, attributeValues);
      }

      return {
        ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(!isEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
        ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
      };
    }

    public static buildDeleteConditionExpression<T extends typeof BaseEntity>(this: T, optionsCondition?: Condition<T>): BuildDeleteConditionExpression {
      const attributeNames: Record<string, string> = {};
      const attributeValues: AttributeMap = {};
      const conditionExpression = buildExpression(optionsCondition?.conditions || [], attributeNames, attributeValues);

      return {
        ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
        ...(!isEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
        ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
      };
    }
  };
}
