import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DynamoDB, ReturnValue } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import Dynamode from '@lib/dynamode/index';
import * as entityExpressionsHelpers from '@lib/entity/helpers/buildExpressions';
import * as entityConvertHelpers from '@lib/entity/helpers/converters';
import * as returnValuesHelpers from '@lib/entity/helpers/returnValues';
import Query from '@lib/query';
import Scan from '@lib/scan';
import { AttributeValues } from '@lib/utils';

import { MockEntity, mockEntityManager, mockInstance, TEST_TABLE_NAME } from '../../mocks';

import { NotFoundError } from './../../../lib/utils/errors';

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
});
