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

import { OPERATORS } from './../../../lib/utils/constants';

const expressionBuilderRunSpy = vi.fn();

vi.mock('@lib/utils/ExpressionBuilder', () => {
  const ExpressionBuilder = vi.fn(() => ({
    attributeNames: { attributeNames: 'value' },
    attributeValues: { attributeValues: 'value' },
    run: expressionBuilderRunSpy,
  }));
  return { ExpressionBuilder };
});

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

    let buildGetProjectionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildGetProjectionExpression');
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ getItem: getItemMock } as any as DynamoDB);
      buildGetProjectionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildGetProjectionExpression');
      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
      convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call buildGetProjectionExpression helper', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({
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

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(['number', 'string']);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should overwrite query with extraInput option', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({
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

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return native dynamo result (return: output)', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});
      getItemMock.mockResolvedValue({ Item: mockInstance });

      await expect(mockEntityManager.get(primaryKey, { return: 'output' })).resolves.toEqual({ Item: mockInstance });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConsistentRead: false,
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return native dynamo result (item not found)', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});
      getItemMock.mockResolvedValue({ Item: undefined });

      await expect(mockEntityManager.get(primaryKey, { return: 'output' })).resolves.toEqual({ Item: undefined });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConsistentRead: false,
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return dynamode result (item found)', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});
      getItemMock.mockResolvedValue({ Item: mockInstance });
      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.get(primaryKey)).resolves.toEqual(mockInstance);

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(getItemMock).toBeCalledWith({
        TableName: TEST_TABLE_NAME,
        Key: primaryKey,
        ConsistentRead: false,
      });
      expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, mockInstance);
    });

    test("Should throw an error if item wasn't found", async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});
      getItemMock.mockResolvedValue({ Item: undefined });

      await expect(mockEntityManager.get(primaryKey)).rejects.toThrow(NotFoundError);

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
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

  describe('batchPut', async () => {
    const batchWriteMock = vi.fn();

    let convertEntityToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertEntityToAttributeValues');
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ batchWriteItem: batchWriteMock } as any as DynamoDB);

      convertEntityToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertEntityToAttributeValues');
      convertEntityToAttributeValuesSpy.mockImplementation((_, instance) => instance as any as AttributeValues);
      convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should return proper dynamo input', async () => {
      expect(mockEntityManager.batchPut([mockInstance, testTableInstance as any], { return: 'input' })).toEqual({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              PutRequest: {
                Item: mockInstance,
              },
            },
            {
              PutRequest: {
                Item: testTableInstance,
              },
            },
          ],
        },
      });

      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, mockInstance);
      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, testTableInstance);
      expect(convertEntityToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should overwrite query with extraInput option', async () => {
      expect(
        mockEntityManager.batchPut([mockInstance, testTableInstance as any], {
          return: 'input',
          extraInput: { ReturnConsumedCapacity: 'returnConsumedCapacity' },
        }),
      ).toEqual({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              PutRequest: {
                Item: mockInstance,
              },
            },
            {
              PutRequest: {
                Item: testTableInstance,
              },
            },
          ],
        },
        ReturnConsumedCapacity: 'returnConsumedCapacity',
      });

      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, mockInstance);
      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, testTableInstance);
      expect(convertEntityToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return native dynamo result (return: output)', async () => {
      batchWriteMock.mockResolvedValue({ UnprocessedItems: undefined });

      await expect(
        mockEntityManager.batchPut([mockInstance, testTableInstance as any], { return: 'output' }),
      ).resolves.toEqual({
        UnprocessedItems: undefined,
      });

      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, mockInstance);
      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, testTableInstance);
      expect(convertEntityToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              PutRequest: {
                Item: mockInstance,
              },
            },
            {
              PutRequest: {
                Item: testTableInstance,
              },
            },
          ],
        },
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should return dynamode result of batch put item with no unprocessed items', async () => {
      batchWriteMock.mockResolvedValue({ UnprocessedItems: undefined });
      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.batchPut([mockInstance, testTableInstance as any])).resolves.toEqual({
        items: [mockInstance, testTableInstance],
        unprocessedItems: [],
      });

      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, mockInstance);
      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, testTableInstance);
      expect(convertEntityToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              PutRequest: {
                Item: mockInstance,
              },
            },
            {
              PutRequest: {
                Item: testTableInstance,
              },
            },
          ],
        },
      });
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, mockInstance);
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, MockEntity, testTableInstance);
      expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(2);
    });

    test('Should return dynamode result of batch put item with unprocessed items', async () => {
      batchWriteMock.mockResolvedValue({
        UnprocessedItems: {
          [TEST_TABLE_NAME]: [
            {
              PutRequest: {
                Item: mockInstance,
              },
            },
          ],
        },
      });

      convertAttributeValuesToEntitySpy.mockImplementation((_, item) => item as any);

      await expect(mockEntityManager.batchPut([mockInstance, testTableInstance as any])).resolves.toEqual({
        items: [mockInstance, testTableInstance],
        unprocessedItems: [mockInstance],
      });

      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, mockInstance);
      expect(convertEntityToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, testTableInstance);
      expect(convertEntityToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              PutRequest: {
                Item: mockInstance,
              },
            },
            {
              PutRequest: {
                Item: testTableInstance,
              },
            },
          ],
        },
      });
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, mockInstance);
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, MockEntity, mockInstance);
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(3, MockEntity, testTableInstance);
      expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(3);
    });
  });

  describe('batchDelete', async () => {
    const batchWriteMock = vi.fn();

    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
    let fromDynamoSpy = vi.spyOn(converterUtils, 'fromDynamo');

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ batchWriteItem: batchWriteMock } as any as DynamoDB);

      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
      fromDynamoSpy = vi.spyOn(converterUtils, 'fromDynamo');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should return proper dynamo input', async () => {
      expect(mockEntityManager.batchDelete([primaryKey, primaryKey], { return: 'input' })).toEqual({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
          ],
        },
      });

      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).not.toBeCalled();
      expect(fromDynamoSpy).not.toBeCalled();
    });

    test('Should overwrite query with extraInput option', async () => {
      expect(
        mockEntityManager.batchDelete([primaryKey, primaryKey], {
          return: 'input',
          extraInput: { ReturnConsumedCapacity: 'returnConsumedCapacity' },
        }),
      ).toEqual({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
          ],
        },
        ReturnConsumedCapacity: 'returnConsumedCapacity',
      });

      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).not.toBeCalled();
      expect(fromDynamoSpy).not.toBeCalled();
    });

    test('Should return native dynamo result (return: output)', async () => {
      batchWriteMock.mockResolvedValue({ UnprocessedItems: undefined });

      await expect(mockEntityManager.batchDelete([primaryKey, primaryKey], { return: 'output' })).resolves.toEqual({
        UnprocessedItems: undefined,
      });

      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
          ],
        },
      });
      expect(fromDynamoSpy).not.toBeCalled();
    });

    test('Should return dynamode result of batch delete item with no unprocessed items', async () => {
      batchWriteMock.mockResolvedValue({ UnprocessedItems: undefined });

      await expect(mockEntityManager.batchDelete([primaryKey, primaryKey])).resolves.toEqual({
        unprocessedItems: [],
      });

      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
          ],
        },
      });
      expect(fromDynamoSpy).not.toBeCalled();
    });

    test('Should return dynamode result of batch put item with unprocessed items', async () => {
      batchWriteMock.mockResolvedValue({
        UnprocessedItems: {
          [TEST_TABLE_NAME]: [
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
          ],
        },
      });
      fromDynamoSpy.mockImplementation((key) => key);

      await expect(mockEntityManager.batchDelete([primaryKey, primaryKey])).resolves.toEqual({
        unprocessedItems: [primaryKey],
      });

      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(1, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toHaveBeenNthCalledWith(2, MockEntity, primaryKey);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledTimes(2);
      expect(batchWriteMock).toBeCalledWith({
        RequestItems: {
          [TEST_TABLE_NAME]: [
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
            {
              DeleteRequest: {
                Key: primaryKey,
              },
            },
          ],
        },
      });
      expect(fromDynamoSpy).toHaveBeenNthCalledWith(1, primaryKey);
      expect(fromDynamoSpy).toBeCalledTimes(1);
    });
  });

  describe('transactionGet', async () => {
    let buildGetProjectionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildGetProjectionExpression');
    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');

    beforeEach(() => {
      buildGetProjectionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildGetProjectionExpression');
      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should build transaction get input without options', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});

      expect(mockEntityManager.transaction.get(primaryKey)).toEqual({
        entity: MockEntity,
        get: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
        },
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
    });

    test('Should build transaction get input with extraInput option', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({});

      expect(mockEntityManager.transaction.get(primaryKey, { extraInput: { TableName: 'tableName' } })).toEqual({
        entity: MockEntity,
        get: {
          TableName: 'tableName',
          Key: primaryKey,
        },
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
    });

    test('Should build transaction get input with attributes option', async () => {
      buildGetProjectionExpressionSpy.mockReturnValue({
        projectionExpression: 'ProjectionExpression',
        attributeNames: { test: 'test' },
      });

      expect(mockEntityManager.transaction.get(primaryKey, { attributes: ['number', 'string'] })).toEqual({
        entity: MockEntity,
        get: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
          ProjectionExpression: 'ProjectionExpression',
          ExpressionAttributeNames: { test: 'test' },
        },
      });

      expect(buildGetProjectionExpressionSpy).toBeCalledWith(['number', 'string']);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
    });
  });

  describe('transactionUpdate', async () => {
    let buildUpdateConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildUpdateConditionExpression');
    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
    let mapReturnValuesLimitedSpy = vi.spyOn(returnValuesHelpers, 'mapReturnValuesLimited');

    beforeEach(() => {
      buildUpdateConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildUpdateConditionExpression');
      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
      mapReturnValuesLimitedSpy = vi.spyOn(returnValuesHelpers, 'mapReturnValuesLimited');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should build transaction update input without options', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({
        updateExpression: 'updateExpression',
        conditionExpression: 'conditionExpression',
        attributeNames: { test: 'test' },
        attributeValues: { test: { S: 'test' } },
      });
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(mockEntityManager.transaction.update(primaryKey, { set: { string: 'value' } })).toEqual({
        entity: MockEntity,
        update: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
          ReturnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure.ALL_OLD,
          UpdateExpression: 'updateExpression',
          ConditionExpression: 'conditionExpression',
          ExpressionAttributeNames: { test: 'test' },
          ExpressionAttributeValues: { test: { S: 'test' } },
        },
      });

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith({ set: { string: 'value' } }, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
    });

    test('Should build transaction update input with extraInput option', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({
        updateExpression: 'updateExpression',
      });
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(
        mockEntityManager.transaction.update(
          primaryKey,
          { set: { string: 'value' } },
          {
            extraInput: { ExpressionAttributeNames: { test: 'test' }, UpdateExpression: 'updateExpression overwrite' },
          },
        ),
      ).toEqual({
        entity: MockEntity,
        update: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
          ReturnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure.ALL_OLD,
          UpdateExpression: 'updateExpression overwrite',
          ExpressionAttributeNames: { test: 'test' },
        },
      });

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith({ set: { string: 'value' } }, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
    });

    test('Should build transaction update input with condition option', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({
        updateExpression: 'updateExpression',
      });
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(
        mockEntityManager.transaction.update(
          primaryKey,
          { set: { string: 'value' } },
          { condition: mockEntityManager.condition().attribute('string').beginsWith('v') },
        ),
      ).toEqual({
        entity: MockEntity,
        update: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
          ReturnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure.ALL_OLD,
          UpdateExpression: 'updateExpression',
        },
      });

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith(
        { set: { string: 'value' } },
        mockEntityManager.condition().attribute('string').beginsWith('v'),
      );
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
    });

    test('Should build transaction update input with returnValuesOnFailure option', async () => {
      buildUpdateConditionExpressionSpy.mockReturnValue({
        updateExpression: 'updateExpression',
      });
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.NONE);

      expect(
        mockEntityManager.transaction.update(
          primaryKey,
          { set: { string: 'value' } },
          { returnValuesOnFailure: 'none' },
        ),
      ).toEqual({
        entity: MockEntity,
        update: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
          ReturnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure.NONE,
          UpdateExpression: 'updateExpression',
        },
      });

      expect(buildUpdateConditionExpressionSpy).toBeCalledWith({ set: { string: 'value' } }, undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith('none');
    });
  });

  describe('transactionPut', async () => {
    let getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');
    let buildPutConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildPutConditionExpression');
    let convertEntityToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertEntityToAttributeValues');
    let mapReturnValuesLimitedSpy = vi.spyOn(returnValuesHelpers, 'mapReturnValuesLimited');

    beforeEach(() => {
      getEntityMetadataSpy = vi.spyOn(Dynamode.storage, 'getEntityMetadata');
      getEntityMetadataSpy.mockReturnValue({ partitionKey: 'partitionKey' } as any);

      buildPutConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildPutConditionExpression');

      convertEntityToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertEntityToAttributeValues');
      convertEntityToAttributeValuesSpy.mockImplementation((_, instance) => instance as any as AttributeValues);

      mapReturnValuesLimitedSpy = vi.spyOn(returnValuesHelpers, 'mapReturnValuesLimited');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should build transaction put input without options', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({});
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(mockEntityManager.transaction.put(mockInstance)).toEqual({
        entity: MockEntity,
        put: {
          TableName: TEST_TABLE_NAME,
          Item: mockInstance,
          ReturnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure.ALL_OLD,
        },
      });

      expect(buildPutConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
    });

    test('Should build transaction put input with extraInput option', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({});
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(
        mockEntityManager.transaction.put(mockInstance, { extraInput: { ConditionExpression: 'conditionExpression' } }),
      ).toEqual({
        entity: MockEntity,
        put: {
          TableName: TEST_TABLE_NAME,
          Item: mockInstance,
          ReturnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure.ALL_OLD,
          ConditionExpression: 'conditionExpression',
        },
      });

      expect(buildPutConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
    });

    test('Should build transaction put input with overwrite option', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({});
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(mockEntityManager.transaction.put(mockInstance, { overwrite: false })).toEqual({
        entity: MockEntity,
        put: {
          TableName: TEST_TABLE_NAME,
          Item: mockInstance,
          ReturnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure.ALL_OLD,
        },
      });

      expect(buildPutConditionExpressionSpy).toBeCalledWith(
        mockEntityManager.condition().attribute('partitionKey').not().exists(),
        undefined,
      );
      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
    });

    test('Should build transaction put input with condition option', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({
        conditionExpression: 'conditionExpression',
        attributeNames: { test: 'test' },
        attributeValues: { test: { S: 'test' } },
      });
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      expect(
        mockEntityManager.transaction.put(mockInstance, {
          condition: mockEntityManager.condition().attribute('string').beginsWith('v'),
        }),
      ).toEqual({
        entity: MockEntity,
        put: {
          TableName: TEST_TABLE_NAME,
          Item: mockInstance,
          ReturnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure.ALL_OLD,
          ConditionExpression: 'conditionExpression',
          ExpressionAttributeNames: { test: 'test' },
          ExpressionAttributeValues: { test: { S: 'test' } },
        },
      });

      expect(buildPutConditionExpressionSpy).toBeCalledWith(
        undefined,
        mockEntityManager.condition().attribute('string').beginsWith('v'),
      );
      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
    });

    test('Should build transaction put input with returnValuesOnFailure option', async () => {
      buildPutConditionExpressionSpy.mockReturnValue({});
      mapReturnValuesLimitedSpy.mockReturnValue(ReturnValuesOnConditionCheckFailure.NONE);

      expect(
        mockEntityManager.transaction.put(mockInstance, {
          returnValuesOnFailure: 'none',
        }),
      ).toEqual({
        entity: MockEntity,
        put: {
          TableName: TEST_TABLE_NAME,
          Item: mockInstance,
          ReturnValuesOnConditionCheckFailure: ReturnValuesOnConditionCheckFailure.NONE,
        },
      });

      expect(buildPutConditionExpressionSpy).toBeCalledWith(undefined, undefined);
      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith('none');
    });
  });

  describe('transactionCreate', async () => {
    test('Should call transactionPut item with overwrite = false', async () => {
      const convertEntityToAttributeValuesSpy = vi
        .spyOn(entityConvertHelpers, 'convertEntityToAttributeValues')
        .mockImplementation((_, instance) => instance as any as AttributeValues);
      const buildPutConditionExpressionSpy = vi
        .spyOn(entityExpressionsHelpers, 'buildPutConditionExpression')
        .mockReturnValue({});
      const getEntityMetadataSpy = vi
        .spyOn(Dynamode.storage, 'getEntityMetadata')
        .mockReturnValue({ partitionKey: 'partitionKey' } as any);
      const mapReturnValuesLimitedSpy = vi
        .spyOn(returnValuesHelpers, 'mapReturnValuesLimited')
        .mockReturnValue(ReturnValuesOnConditionCheckFailure.ALL_OLD);

      mockEntityManager.transaction.create(mockInstance, {
        condition: mockEntityManager.condition().attribute('string').beginsWith('v'),
      });

      expect(convertEntityToAttributeValuesSpy).toBeCalledWith(MockEntity, mockInstance);
      expect(buildPutConditionExpressionSpy).toBeCalledWith(
        mockEntityManager.condition().attribute('partitionKey').not().exists(),
        mockEntityManager.condition().attribute('string').beginsWith('v'),
      );
      expect(getEntityMetadataSpy).toBeCalledWith(MockEntity.name);
      expect(mapReturnValuesLimitedSpy).toBeCalledWith(undefined);
    });
  });

  describe('transactionDelete', async () => {
    let buildDeleteConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildDeleteConditionExpression');
    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');

    beforeEach(() => {
      buildDeleteConditionExpressionSpy = vi.spyOn(entityExpressionsHelpers, 'buildDeleteConditionExpression');

      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should build transaction delete input without options', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({
        conditionExpression: 'conditionExpression',
        attributeNames: { test: 'test' },
        attributeValues: { test: { S: 'test' } },
      });

      expect(mockEntityManager.transaction.delete(primaryKey)).toEqual({
        entity: MockEntity,
        delete: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
          ConditionExpression: 'conditionExpression',
          ExpressionAttributeNames: { test: 'test' },
          ExpressionAttributeValues: { test: { S: 'test' } },
        },
      });

      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
    });

    test('Should build transaction delete input with extraInput option', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({});

      expect(
        mockEntityManager.transaction.delete(primaryKey, {
          extraInput: { ConditionExpression: 'conditionExpression' },
        }),
      ).toEqual({
        entity: MockEntity,
        delete: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
          ConditionExpression: 'conditionExpression',
        },
      });

      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
    });

    test('Should build transaction delete input with condition option', async () => {
      buildDeleteConditionExpressionSpy.mockReturnValue({});

      expect(
        mockEntityManager.transaction.delete(primaryKey, {
          condition: mockEntityManager.condition().attribute('string').beginsWith('v'),
        }),
      ).toEqual({
        entity: MockEntity,
        delete: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
        },
      });

      expect(buildDeleteConditionExpressionSpy).toBeCalledWith(
        mockEntityManager.condition().attribute('string').beginsWith('v'),
      );
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
    });
  });

  describe('transactionCondition', async () => {
    let convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');

    beforeEach(() => {
      convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityConvertHelpers, 'convertPrimaryKeyToAttributeValues');
      convertPrimaryKeyToAttributeValuesSpy.mockImplementation((_, primaryKey) => primaryKey as any as AttributeValues);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should build transaction condition input', async () => {
      expressionBuilderRunSpy.mockReturnValue('number = 1');

      expect(
        mockEntityManager.transaction.condition(primaryKey, mockEntityManager.condition().attribute('number').eq(1)),
      ).toEqual({
        entity: MockEntity,
        condition: {
          TableName: TEST_TABLE_NAME,
          Key: primaryKey,
          ConditionExpression: 'number = 1',
          ExpressionAttributeNames: { attributeNames: 'value' },
          ExpressionAttributeValues: { attributeValues: 'value' },
        },
      });

      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, primaryKey);
      expect(expressionBuilderRunSpy).toBeCalledWith(OPERATORS.eq('number', 1));
    });
  });
});
