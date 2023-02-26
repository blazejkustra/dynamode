import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DynamoDB } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import * as entityConvertHelpers from '@lib/entity/helpers/converters';
import transactionGet from '@lib/transactionGet';
import { TransactionGet } from '@lib/transactionGet/types';
import { NotFoundError } from '@lib/utils';

import { MockEntity, mockInstance, TEST_TABLE_NAME, TestTable, testTableInstance } from '../../mocks';

const transactionGetInputMockEntity: TransactionGet<typeof MockEntity> = {
  get: {
    TableName: TEST_TABLE_NAME,
    Key: { partitionKey: { S: 'partitionKey' }, sortKey: { S: 'sortKey' } },
  },
  entity: MockEntity,
};

const transactionGetInputTestTable: TransactionGet<typeof TestTable> = {
  get: {
    TableName: TEST_TABLE_NAME,
    Key: { partitionKey: { S: 'partitionKey' }, sortKey: { S: 'sortKey' } },
  },
  entity: TestTable,
};

describe('transactionGet', () => {
  const ddbTransactGetItemsMock = vi.fn();
  let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');

  beforeEach(() => {
    convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ transactGetItems: ddbTransactGetItemsMock } as any as DynamoDB);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('options.return = "input"', () => {
    test('Should successfully run transactionGet without extraInput', async () => {
      expect(transactionGet([transactionGetInputMockEntity], { return: 'input' })).toEqual({
        TransactItems: [{ Get: transactionGetInputMockEntity.get }],
      });
      expect(ddbTransactGetItemsMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should successfully run transactionGet with extraInput', async () => {
      expect(
        transactionGet([transactionGetInputMockEntity], {
          return: 'input',
          extraInput: { ReturnConsumedCapacity: 'INDEXES' },
        }),
      ).toEqual({
        TransactItems: [{ Get: transactionGetInputMockEntity.get }],
        ReturnConsumedCapacity: 'INDEXES',
      });
      expect(ddbTransactGetItemsMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });
  });

  describe('options.return = "output"', () => {
    test('Should successfully run transactionGet and return dynamo output', async () => {
      ddbTransactGetItemsMock.mockImplementation(() => {
        return { Responses: [{ Item: 'item' }] };
      });
      const output = await transactionGet([transactionGetInputMockEntity], { return: 'output' });
      expect(output).toEqual({ Responses: [{ Item: 'item' }] });
      expect(ddbTransactGetItemsMock).toBeCalledWith({
        TransactItems: [{ Get: transactionGetInputMockEntity.get }],
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });
  });

  describe('options.return = "default"', () => {
    test('Should throw an error for undefined response', async () => {
      ddbTransactGetItemsMock.mockImplementation(() => {
        return { Responses: undefined };
      });
      await expect(transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable])).rejects.toThrow(
        NotFoundError,
      );
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should successfully run transactionGet with no response', async () => {
      ddbTransactGetItemsMock.mockImplementation(() => {
        return { Responses: undefined };
      });

      const output = await transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable], {
        throwOnNotFound: false,
      });
      expect(output).toEqual({ items: [undefined, undefined], count: 2 });
    });

    test('Should successfully run transactionGet with no options', async () => {
      ddbTransactGetItemsMock.mockImplementation(() => {
        return { Responses: [{ Item: 'mockEntity' }, { Item: 'testTable' }] };
      });
      convertAttributeValuesToEntitySpy.mockReturnValueOnce(mockInstance).mockReturnValueOnce(testTableInstance);

      const output = await transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable]);

      expect(output).toEqual({ items: [mockInstance, testTableInstance], count: 2 });
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, 'mockEntity');
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, TestTable, 'testTable');
    });

    test('Should successfully run transactionGet with throwOnNotFound = true', async () => {
      ddbTransactGetItemsMock.mockImplementation(() => {
        return { Responses: [{ Item: 'mockEntity' }, { Item: 'testTable' }] };
      });
      convertAttributeValuesToEntitySpy
        .mockReturnValueOnce(mockInstance)
        .mockReturnValueOnce(testTableInstance)
        .mockReturnValueOnce(mockInstance)
        .mockReturnValueOnce(testTableInstance);

      const output1 = await transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable], {
        return: 'default',
        throwOnNotFound: true,
      });

      expect(output1).toEqual({ items: [mockInstance, testTableInstance], count: 2 });
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, 'mockEntity');
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, TestTable, 'testTable');

      const output2 = await transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable], {
        throwOnNotFound: true,
      });

      expect(output2).toEqual({ items: [mockInstance, testTableInstance], count: 2 });
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(3, MockEntity, 'mockEntity');
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(4, TestTable, 'testTable');
    });

    test('Should throw an error for undefined values with throwOnNotFound = true', async () => {
      ddbTransactGetItemsMock.mockImplementation(() => {
        return { Responses: [{ Item: 'mockEntity' }, { Item: undefined }] };
      });

      await expect(transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable])).rejects.toThrow(
        NotFoundError,
      );

      await expect(
        transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable], {
          return: 'default',
          throwOnNotFound: true,
        }),
      ).rejects.toThrow(NotFoundError);

      await expect(
        transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable], { throwOnNotFound: true }),
      ).rejects.toThrow(NotFoundError);

      expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(3);
    });

    test('Should successfully run transactionGet with throwOnNotFound = false', async () => {
      ddbTransactGetItemsMock.mockImplementation(() => {
        return { Responses: [{ Item: 'mockEntity' }, { Item: 'testTable' }] };
      });
      convertAttributeValuesToEntitySpy
        .mockReturnValueOnce(mockInstance)
        .mockReturnValueOnce(testTableInstance)
        .mockReturnValueOnce(mockInstance)
        .mockReturnValueOnce(testTableInstance);

      const output1 = await transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable], {
        return: 'default',
        throwOnNotFound: false,
      });

      expect(output1).toEqual({ items: [mockInstance, testTableInstance], count: 2 });
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, 'mockEntity');
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, TestTable, 'testTable');

      const output2 = await transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable], {
        return: 'default',
        throwOnNotFound: false,
      });

      expect(output2).toEqual({ items: [mockInstance, testTableInstance], count: 2 });
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(3, MockEntity, 'mockEntity');
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(4, TestTable, 'testTable');
    });

    test('Should successfully run transactionGet with throwOnNotFound = false and undefined values returned', async () => {
      ddbTransactGetItemsMock.mockImplementation(() => {
        return { Responses: [{ Item: 'mockEntity' }, { Item: undefined }] };
      });
      convertAttributeValuesToEntitySpy = vi
        .spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity')
        .mockReturnValue(mockInstance);

      const output1 = await transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable], {
        return: 'default',
        throwOnNotFound: false,
      });

      expect(output1).toEqual({ items: [mockInstance, undefined], count: 2 });

      const output2 = await transactionGet([transactionGetInputMockEntity, transactionGetInputTestTable], {
        return: 'default',
        throwOnNotFound: false,
      });

      expect(output2).toEqual({ items: [mockInstance, undefined], count: 2 });
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, 'mockEntity');
      expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, MockEntity, 'mockEntity');
      expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(2);
    });
  });
});
