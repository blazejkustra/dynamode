import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DynamoDB, ReturnValue, ReturnValuesOnConditionCheckFailure } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import Dynamode from '@lib/dynamode/index';
import * as entityExpressionsHelpers from '@lib/entity/helpers/buildExpressions';
import * as entityConvertHelpers from '@lib/entity/helpers/converters';
import * as returnValuesHelpers from '@lib/entity/helpers/returnValues';
import Query from '@lib/query';
import Scan from '@lib/scan';
import { AttributeValues, NotFoundError } from '@lib/utils';
import * as converterUtils from '@lib/utils/converter';

import { MockEntity, mockEntityManager, mockInstance, TEST_TABLE_NAME, testTableInstance } from '../../fixtures';

const primaryKey = { partitionKey: 'PK', sortKey: 'SK' };

describe('entityManager', () => {
  describe('condition', async () => {
    test('Should initialize Condition class', async () => {
      expect(mockEntityManager.condition()).toEqual(new Condition(MockEntity));
    });
  });

  describe('query', async () => {
    test('Should initialize Query class', async () => {
      expect(mockEntityManager.query()).toEqual(new Query(MockEntity));
    });
  });

  describe('condition', async () => {
    test('Should initialize Scan class', async () => {
      expect(mockEntityManager.scan()).toEqual(new Scan(MockEntity));
    });
  });

  describe('get', async () => {
    const getItemMock = vi.fn();

    let buildProjectionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildGetProjectionExpression');
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ getItem: getItemMock } as any as DynamoDB);
      buildProjectionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildGetProjectionExpression');
      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
      convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call buildGetProjectionExpression helper', async () => {
      buildProjectionExpressionSpy.mockReturnValue({
        projectionExpression: 'ProjectionExpression',
        attributeNames: { test: 'test' },
      });

      expect(mockEntityManager.get(primaryKey, { return: 'input', attributes: ['number', 'string'] })).toEqual({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConsistentRead: false,
        ProjectionExpression: 'ProjectionExpression',
        ExpressionAttributeNames: { test: 'test' },
      });

      expect(buildProjectionExpressionSpy).toBeCalledWith(['number', 'string']);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should overwrite query with extraInput option', async () => {
      buildProjectionExpressionSpy.mockReturnValue({
        projectionExpression: 'ProjectionExpression',
        attributeNames: { test: 'test' },
      });

      expect(
        mockEntityManager.get(primaryKey, {
          return: 'input',
          extraInput: { ProjectionExpression: 'ProjectionExpression overwrite', ConsistentRead: true },
        }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConsistentRead: true,
        ProjectionExpression: 'ProjectionExpression overwrite',
        ExpressionAttributeNames: { test: 'test' },
      });

      expect(buildProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return native dynamo result (return: output)', async () => {
      buildProjectionExpressionSpy.mockReturnValue({});
      getItemMock.mockResolvedValue({ Item: mockInstance });

      await expect(mockEntityManager.get(primaryKey, { return: 'output' })).resolves.toEqual({ Item: mockInstance });

      expect(buildProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConsistentRead: false,
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return native dynamo result (item not found)', async () => {
      buildProjectionExpressionSpy.mockReturnValue({});
      getItemMock.mockResolvedValue({ Item: undefined });

      await expect(mockEntityManager.get(primaryKey, { return: 'output' })).resolves.toEqual({ Item: undefined });

      expect(buildProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConsistentRead: false,
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return dynamode result (item found)', async () => {
      buildProjectionExpressionSpy.mockReturnValue({});
      getItemMock.mockResolvedValue({ Item: mockInstance });
      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.get(primaryKey)).resolves.toEqual(mockInstance);

      expect(buildProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConsistentRead: false,
      });
      expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, mockInstance);
    });

    test("Should throw an error if item wasn't found", async () => {
      buildProjectionExpressionSpy.mockReturnValue({});
      getItemMock.mockResolvedValue({ Item: undefined });

      await expect(mockEntityManager.get(primaryKey)).rejects.toThrow(NotFoundError);

      expect(buildProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConsistentRead: false,
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });
  });

  describe('update', async () => {
    const updateItemMock = vi.fn();

    let buildUpdateConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildUpdateConditionExpression');
    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
    let mapReturnValuesSpy = vi.spyOn(returnValuesHelpers, 'mapReturnValues');
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ updateItem: updateItemMock } as any as DynamoDB);
      buildUpdateConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildUpdateConditionExpression');
      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
      mapReturnValuesSpy = vi.spyOn(returnValuesHelpers, 'mapReturnValues');
      convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call buildUpdateConditionExpression helper', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({
        updateExpression: 'updateExpression',
        conditionExpression: 'conditionExpression',
        attributeNames: { test: 'test' },
        attributeValues: { test: { S: 'test' } },
      });
      mapReturnValuesSpy.mockReturnValue(ReturnValue.ALL_NEW);

      expect(
        mockEntityManager.update(
          primaryKey,
          { set: { string: 'value' } },
          { return: 'input', condition: mockEntityManager.condition().attribute('string').beginsWith('v') },
        ),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValue.ALL_NEW,
        UpdateExpression: 'updateExpression',
        ConditionExpression: 'conditionExpression',
        ExpressionAttributeNames: { test: 'test' },
        ExpressionAttributeValues: { test: { S: 'test' } },
      });

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith(
        { set: { string: 'value' } },
        mockEntityManager.condition().attribute('string').beginsWith('v'),
      );
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesSpy).toBeCalledWith(undefined);
      expect(updateItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should call mapReturnValues with correct value', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({ updateExpression: 'updateExpression' });
      mapReturnValuesSpy.mockReturnValue(ReturnValue.NONE);

      expect(
        mockEntityManager.update(primaryKey, { set: { string: 'value' } }, { return: 'input', returnValues: 'none' }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValue.NONE,
        UpdateExpression: 'updateExpression',
      });

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith({ set: { string: 'value' } }, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesSpy).toBeCalledWith('none');
      expect(updateItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should overwrite query with extraInput option', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({ updateExpression: 'updateExpression' });
      mapReturnValuesSpy.mockReturnValue(ReturnValue.ALL_NEW);

      expect(
        mockEntityManager.update(
          primaryKey,
          { set: { string: 'value' } },
          {
            return: 'input',
            extraInput: {
              ReturnValues: ReturnValue.UPDATED_NEW,
              ConditionExpression: 'conditionExpression',
            },
          },
        ),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValue.UPDATED_NEW,
        UpdateExpression: 'updateExpression',
        ConditionExpression: 'conditionExpression',
      });

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith({ set: { string: 'value' } }, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesSpy).toBeCalledWith(undefined);
      expect(updateItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return native dynamo result (return: output)', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({ updateExpression: 'updateExpression' });
      mapReturnValuesSpy.mockReturnValue(ReturnValue.ALL_NEW);
      updateItemMock.mockResolvedValue({ Attributes: mockInstance });

      await expect(
        mockEntityManager.update(primaryKey, { set: { string: 'value' } }, { return: 'output' }),
      ).resolves.toEqual({
        Attributes: mockInstance,
      });

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith({ set: { string: 'value' } }, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesSpy).toBeCalledWith(undefined);
      expect(updateItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValue.ALL_NEW,
        UpdateExpression: 'updateExpression',
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return dynamode result of updated item', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({ updateExpression: 'updateExpression' });
      mapReturnValuesSpy.mockReturnValue(ReturnValue.ALL_NEW);
      updateItemMock.mockResolvedValue({ Attributes: mockInstance });
      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.update(primaryKey, { set: { string: 'value' } })).resolves.toEqual(mockInstance);

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith({ set: { string: 'value' } }, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesSpy).toBeCalledWith(undefined);
      expect(updateItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValue.ALL_NEW,
        UpdateExpression: 'updateExpression',
      });
      expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, mockInstance);
    });

    test('Should return dynamode empty result of updated item', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({ updateExpression: 'updateExpression' });
      mapReturnValuesSpy.mockReturnValue(ReturnValue.NONE);
      updateItemMock.mockResolvedValue({ Attributes: undefined });
      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.update(primaryKey, { set: { string: 'value' } })).resolves.toEqual({});

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith({ set: { string: 'value' } }, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesSpy).toBeCalledWith(undefined);
      expect(updateItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValue.NONE,
        UpdateExpression: 'updateExpression',
      });
      expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, {});
    });
  });

  describe('put', async () => {
    const putItemMock = vi.fn();

    let getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');
    let convertEntityToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertEntityToAttributeValues');
    let buildPutConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildPutConditionExpression');
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ putItem: putItemMock } as any as DynamoDB);

      getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');
      getEntityMetadataSpy.mockReturnValue({ partitionKey: 'partitionKey' } as any);

      convertEntityToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertEntityToAttributeValues');
      convertEntityToAttributeValuesSpy.mockImplementation((_, instance) => instance as any as AttributeValues);

      buildPutConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildPutConditionExpression');
      convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call buildPutConditionExpressionSpy helper', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({
        conditionExpression: 'conditionExpression',
        attributeNames: { test: 'test' },
        attributeValues: { test: { S: 'test' } },
      });

      expect(
        mockEntityManager.put(mockInstance, {
          return: 'input',
          condition: mockEntityManager.condition().attribute('string').beginsWith('v'),
        }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Item: mockInstance,
        ConditionExpression: 'conditionExpression',
        ExpressionAttributeNames: { test: 'test' },
        ExpressionAttributeValues: { test: { S: 'test' } },
      });

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(buildPutConditionExpressionSpy).toBeCalledWith(
        undefined,
        mockEntityManager.condition().attribute('string').beginsWith('v'),
      );
      expect(putItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should overwrite query with extraInput option', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({ conditionExpression: 'conditionExpression' });

      expect(
        mockEntityManager.put(mockInstance, {
          return: 'input',
          extraInput: { ConditionExpression: 'extra', ExpressionAttributeNames: { test: 'test' } },
        }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Item: mockInstance,
        ConditionExpression: 'extra',
        ExpressionAttributeNames: { test: 'test' },
      });

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(buildPutConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(putItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should add condition to not overwrite existing item', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({ conditionExpression: 'conditionExpression' });

      expect(mockEntityManager.put(mockInstance, { return: 'input', overwrite: false })).toEqual({
        TableName: TEST_TABLE_NAME,
        Item: mockInstance,
        ConditionExpression: 'conditionExpression',
      });

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(buildPutConditionExpressionSpy).toBeCalledWith(
        mockEntityManager.condition().attribute('partitionKey').not().exists(),
        undefined,
      );
      expect(putItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return native dynamo result (return: output)', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({ conditionExpression: 'conditionExpression' });
      putItemMock.mockResolvedValue({ Attributes: undefined });

      await expect(mockEntityManager.put(mockInstance, { return: 'output' })).resolves.toEqual({
        Attributes: undefined,
      });

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(buildPutConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(putItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Item: mockInstance,
        ConditionExpression: 'conditionExpression',
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return dynamode result of put item', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({ conditionExpression: 'conditionExpression' });
      putItemMock.mockResolvedValue({ Attributes: undefined });
      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.put(mockInstance)).resolves.toEqual(mockInstance);

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(buildPutConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(putItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Item: mockInstance,
        ConditionExpression: 'conditionExpression',
      });
      expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, mockInstance);
    });
  });

  describe('create', async () => {
    test('Should call put item with overwrite = false', async () => {
      const convertEntityToAttributeValuesSpy = vi
        .spyOn(entityConvertHelpers, 'convertEntityToAttributeValues')
        .mockImplementation((_, instance) => instance as any as AttributeValues);
      const buildPutConditionExpressionSpy = vi
        .spyOn(entityExpressionsHelpers, 'buildPutConditionExpression')
        .mockReturnValue({});

      mockEntityManager.create(mockInstance, {
        return: 'input',
        condition: mockEntityManager.condition().attribute('string').beginsWith('v'),
      });

      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(buildPutConditionExpressionSpy).toBeCalledWith(
        mockEntityManager.condition().attribute('partitionKey').not().exists(),
        mockEntityManager.condition().attribute('string').beginsWith('v'),
      );
    });
  });

  describe('delete', async () => {
    const deleteItemMock = vi.fn();

    let getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');
    let buildDeleteConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildDeleteConditionExpression');
    let mapReturnValuesLimitedSpy = vi.spyOn(returnValuesHelpers, 'mapReturnValuesLimited');
    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ deleteItem: deleteItemMock } as any as DynamoDB);

      getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');
      getEntityMetadataSpy.mockReturnValue({ partitionKey: 'partitionKey' } as any);

      buildDeleteConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildDeleteConditionExpression');
      mapReturnValuesLimitedSpy = vi.spyOn(returnValuesHelpers, 'mapReturnValuesLimited');

      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
      convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call buildDeleteConditionExpression helper', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({
        conditionExpression: 'conditionExpression',
        attributeNames: { test: 'test' },
        attributeValues: { test: { S: 'test' } },
      });
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(
        mockEntityManager.delete(primaryKey, {
          return: 'input',
          condition: mockEntityManager.condition().attribute('string').beginsWith('v'),
        }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConditionExpression: 'conditionExpression',
        ExpressionAttributeNames: { test: 'test' },
        ExpressionAttributeValues: { test: { S: 'test' } },
        ReturnValues: ReturnValuesOnConditionCheckFailure.ALL_OLD,
      });

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(
        undefined,
        mockEntityManager.condition().attribute('string').beginsWith('v'),
      );
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
      expect(deleteItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should call buildPutConditionExpressionSpy helper with throwErrorIfNotExists', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({
        conditionExpression: 'conditionExpression',
        attributeNames: { test: 'test' },
        attributeValues: { test: { S: 'test' } },
      });
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(
        mockEntityManager.delete(primaryKey, {
          return: 'input',
          condition: mockEntityManager.condition().attribute('string').beginsWith('v'),
          throwErrorIfNotExists: true,
        }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConditionExpression: 'conditionExpression',
        ExpressionAttributeNames: { test: 'test' },
        ExpressionAttributeValues: { test: { S: 'test' } },
        ReturnValues: ReturnValuesOnConditionCheckFailure.ALL_OLD,
      });

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(
        mockEntityManager.condition().attribute('partitionKey').exists(),
        mockEntityManager.condition().attribute('string').beginsWith('v'),
      );
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
      expect(deleteItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should call mapReturnValuesLimited with correct value', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({});
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.NONE);

      expect(
        mockEntityManager.delete(primaryKey, {
          return: 'input',
          returnValues: 'none',
        }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValuesOnConditionCheckFailure.NONE,
      });

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith('none');
      expect(deleteItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should properly add extra input to query', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({});
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(
        mockEntityManager.delete(primaryKey, {
          return: 'input',
          extraInput: {
            ReturnValues: ReturnValuesOnConditionCheckFailure.NONE,
            ConditionExpression: 'conditionExpression',
          },
        }),
      ).toEqual({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValuesOnConditionCheckFailure.NONE,
        ConditionExpression: 'conditionExpression',
      });

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
      expect(deleteItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return native dynamo result (return: output)', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({});
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);
      deleteItemMock.mockResolvedValue({ Attributes: undefined });

      await expect(mockEntityManager.delete(primaryKey, { return: 'output' })).resolves.toEqual({
        Attributes: undefined,
      });

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
      expect(deleteItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValuesOnConditionCheckFailure.ALL_OLD,
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return dynamode null as result', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({});
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.NONE);
      deleteItemMock.mockResolvedValue({ Attributes: undefined });

      await expect(mockEntityManager.delete(primaryKey)).resolves.toEqual(null);

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
      expect(deleteItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValuesOnConditionCheckFailure.NONE,
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return dynamode old item as result', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({});
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);
      deleteItemMock.mockResolvedValue({ Attributes: mockInstance });
      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.delete(primaryKey)).resolves.toEqual(mockInstance);

      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
      expect(deleteItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ReturnValues: ReturnValuesOnConditionCheckFailure.ALL_OLD,
      });
      expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, mockInstance);
    });
  });

  describe('batchGet', async () => {
    const batchGetItem = vi.fn();

    let buildGetProjectionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildGetProjectionExpression');
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
    let fromDynamoSpy = vi.spyOn(converterUtils, 'fromDynamo');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ batchGetItem: batchGetItem } as any as DynamoDB);
      buildGetProjectionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildGetProjectionExpression');
      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
      convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
      fromDynamoSpy = vi.spyOn(converterUtils, 'fromDynamo');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call buildGetProjectionExpression helper', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({
        projectionExpression: 'ProjectionExpression',
        attributeNames: { test: 'test' },
      });

      expect(
        mockEntityManager.batchGet([primaryKey, primaryKey], { return: 'input', attributes: ['number', 'string'] }),
      ).toEqual({
        RequestItems: {
          [TEST_TABLE_NAME]: {
            Keys: [primaryKey, primaryKey],
            ConsistentRead: false,
            ProjectionExpression: 'ProjectionExpression',
            ExpressionAttributeNames: { test: 'test' },
          },
        },
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(['number', 'string']);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(batchGetItem).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should overwrite query with extraInput option', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({
        projectionExpression: 'ProjectionExpression',
        attributeNames: { test: 'test' },
      });

      expect(
        mockEntityManager.batchGet([primaryKey, primaryKey], {
          return: 'input',
          extraInput: {
            RequestItems: {
              [TEST_TABLE_NAME]: {
                Keys: [],
                ProjectionExpression: 'ProjectionExpression overwrite',
                ConsistentRead: true,
              },
            },
          },
        }),
      ).toEqual({
        RequestItems: {
          [TEST_TABLE_NAME]: {
            Keys: [],
            ConsistentRead: true,
            ProjectionExpression: 'ProjectionExpression overwrite',
          },
        },
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(batchGetItem).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should build a ConsistentRead: true query with options.consistent', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});

      expect(mockEntityManager.batchGet([primaryKey, primaryKey], { return: 'input', consistent: true })).toEqual({
        RequestItems: {
          [TEST_TABLE_NAME]: {
            Keys: [primaryKey, primaryKey],
            ConsistentRead: true,
          },
        },
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(batchGetItem).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return native dynamo result (return: output)', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});
      batchGetItem.mockResolvedValue({
        Responses: {
          [TEST_TABLE_NAME]: [mockInstance, undefined],
          UnprocessedKeys: undefined,
        },
      });

      await expect(mockEntityManager.batchGet([primaryKey, primaryKey], { return: 'output' })).resolves.toEqual({
        Responses: {
          [TEST_TABLE_NAME]: [mockInstance, undefined],
          UnprocessedKeys: undefined,
        },
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(batchGetItem).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: {
            Keys: [primaryKey, primaryKey],
            ConsistentRead: false,
          },
        },
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return dynamode result (all items found)', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});
      batchGetItem.mockResolvedValue({
        Responses: {
          [TEST_TABLE_NAME]: [mockInstance, testTableInstance],
          UnprocessedKeys: undefined,
        },
      });
      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.batchGet([primaryKey, primaryKey])).resolves.toEqual({
        items: [mockInstance, testTableInstance],
        unprocessedKeys: [],
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(batchGetItem).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: {
            Keys: [primaryKey, primaryKey],
            ConsistentRead: false,
          },
        },
      });
      expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(2);
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, mockInstance);
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, MockEntity, testTableInstance);
    });

    test('Should return dynamode result (one item found)', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});
      batchGetItem.mockResolvedValue({
        Responses: {
          [TEST_TABLE_NAME]: [mockInstance],
          UnprocessedKeys: undefined,
        },
      });
      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.batchGet([primaryKey, primaryKey])).resolves.toEqual({
        items: [mockInstance],
        unprocessedKeys: [],
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(batchGetItem).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: {
            Keys: [primaryKey, primaryKey],
            ConsistentRead: false,
          },
        },
      });
      expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(1);
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, mockInstance);
    });

    test('Should return dynamode result with unprocessed keys', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});
      batchGetItem.mockResolvedValue({
        Responses: {},
        UnprocessedKeys: {
          [TEST_TABLE_NAME]: { Keys: [primaryKey, primaryKey] },
        },
      });
      fromDynamoSpy.mockImplementation((item) => item);

      await expect(mockEntityManager.batchGet([primaryKey, primaryKey])).resolves.toEqual({
        items: [],
        unprocessedKeys: [primaryKey, primaryKey],
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(batchGetItem).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: {
            Keys: [primaryKey, primaryKey],
            ConsistentRead: false,
          },
        },
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(fromDynamoSpy).toBeCalledTimes(2);
    });
  });

  // describe('batchPut', async () => {
  //   convertEntityToAttributeValues
  //   batchWriteItem
  //   convertAttributeValuesToEntity
  // });

  // describe('batchDelete', async () => {
  //   convertPrimaryKeyToAttributeValues
  //   batchWriteItem
  // });

  // describe('transactionGet', async () => {
  //   buildGetProjectionExpression
  //   convertPrimaryKeyToAttributeValues
  // });

  // describe('transactionUpdate', async () => {
  //   buildUpdateConditionExpression
  //   convertPrimaryKeyToAttributeValues
  //   mapReturnValuesLimited
  // });

  // describe('transactionPut', async () => {
  //   getEntityMetadata
  //   buildPutConditionExpression
  //   convertEntityToAttributeValues
  //   mapReturnValuesLimited
  // });

  // describe('transactionCreate', async () => {
  //   transactionPut
  // });

  // describe('transactionDelete', async () => {
  //   buildDeleteConditionExpression
  //   convertPrimaryKeyToAttributeValues
  // });

  // describe('transactionDelete', async () => {
  //   ExpressionBuilder
  //   convertPrimaryKeyToAttributeValues
  // });
});
