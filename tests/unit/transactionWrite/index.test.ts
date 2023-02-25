import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { Dynamode, Entity } from '@lib/dynamode';
import * as entityConvertHelpers from '@lib/entity/helpers/convert';
import transactionWrite from '@lib/transactionWrite';
import {
  TransactionCondition,
  TransactionDelete,
  TransactionPut,
  TransactionUpdate,
} from '@lib/transactionWrite/types';

import { MockEntity, TEST_TABLE_NAME } from '../../mocks';

const transactionUpdate: TransactionUpdate<typeof MockEntity> = {
  update: {
    TableName: TEST_TABLE_NAME,
    Key: { partitionKey: { S: 'updatePartitionKey' }, sortKey: { S: 'updateSortKey' } },
    UpdateExpression: 'updateExpression',
  },
  entity: MockEntity,
};

const item = { partitionKey: { S: 'putPartitionKey' }, sortKey: { S: 'putSortKey' } };
const transactionPut: TransactionPut<typeof MockEntity> = {
  put: {
    TableName: TEST_TABLE_NAME,
    Item: item,
  },
  entity: MockEntity,
};

const transactionCondition: TransactionCondition<typeof MockEntity> = {
  condition: {
    TableName: TEST_TABLE_NAME,
    Key: { partitionKey: { S: 'conditionPartitionKey' }, sortKey: { S: 'conditionSortKey' } },
    ConditionExpression: 'conditionExpression',
  },
  entity: MockEntity,
};

const transactionDelete: TransactionDelete<typeof MockEntity> = {
  delete: {
    TableName: TEST_TABLE_NAME,
    Key: { partitionKey: { S: 'deletePartitionKey' }, sortKey: { S: 'deleteSortKey' } },
  },
  entity: MockEntity,
};

describe('transactionWrite', () => {
  const ddbTransactWriteItemsMock = vi.fn();
  let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');

  beforeEach(() => {
    convertAttributeValuesToEntitySpy = vi
      .spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity')
      .mockImplementation((_entity, item) => {
        return item as any as Entity;
      });
    vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ transactWriteItems: ddbTransactWriteItemsMock } as any as DynamoDB);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('options.return = "input"', () => {
    test('Should successfully run transactionWrite without extraInput', async () => {
      expect(transactionWrite([transactionUpdate], { return: 'input' })).toEqual({
        TransactItems: [{ Update: transactionUpdate.update }],
      });
      expect(transactionWrite([transactionPut], { return: 'input' })).toEqual({
        TransactItems: [{ Put: transactionPut.put }],
      });
      expect(transactionWrite([transactionCondition], { return: 'input' })).toEqual({
        TransactItems: [{ ConditionCheck: transactionCondition.condition }],
      });
      expect(transactionWrite([transactionDelete], { return: 'input' })).toEqual({
        TransactItems: [{ Delete: transactionDelete.delete }],
      });
      expect(
        transactionWrite([transactionUpdate, transactionPut, transactionCondition, transactionDelete], {
          return: 'input',
        }),
      ).toEqual({
        TransactItems: [
          { Update: transactionUpdate.update },
          { Put: transactionPut.put },
          { ConditionCheck: transactionCondition.condition },
          { Delete: transactionDelete.delete },
        ],
      });

      expect(ddbTransactWriteItemsMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should successfully run transactionWrite with extraInput', async () => {
      expect(
        transactionWrite([transactionUpdate], { return: 'input', extraInput: { ClientRequestToken: 'Token' } }),
      ).toEqual({
        TransactItems: [{ Update: transactionUpdate.update }],
        ClientRequestToken: 'Token',
      });

      expect(
        transactionWrite([transactionPut], { return: 'input', extraInput: { ClientRequestToken: 'Token' } }),
      ).toEqual({
        TransactItems: [{ Put: transactionPut.put }],
        ClientRequestToken: 'Token',
      });

      expect(
        transactionWrite([transactionCondition], { return: 'input', extraInput: { ClientRequestToken: 'Token' } }),
      ).toEqual({
        TransactItems: [{ ConditionCheck: transactionCondition.condition }],
        ClientRequestToken: 'Token',
      });

      expect(
        transactionWrite([transactionDelete], { return: 'input', extraInput: { ClientRequestToken: 'Token' } }),
      ).toEqual({
        TransactItems: [{ Delete: transactionDelete.delete }],
        ClientRequestToken: 'Token',
      });

      expect(
        transactionWrite([transactionUpdate, transactionPut, transactionCondition, transactionDelete], {
          return: 'input',
          extraInput: { ClientRequestToken: 'Token' },
        }),
      ).toEqual({
        TransactItems: [
          { Update: transactionUpdate.update },
          { Put: transactionPut.put },
          { ConditionCheck: transactionCondition.condition },
          { Delete: transactionDelete.delete },
        ],
        ClientRequestToken: 'Token',
      });

      expect(ddbTransactWriteItemsMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should successfully run transactionWrite with extraInput that overwrites existing Token', async () => {
      expect(
        transactionWrite([transactionUpdate, transactionPut, transactionCondition, transactionDelete], {
          return: 'input',
          idempotencyKey: 'PrevToken',
          extraInput: { ClientRequestToken: 'Token' },
        }),
      ).toEqual({
        TransactItems: [
          { Update: transactionUpdate.update },
          { Put: transactionPut.put },
          { ConditionCheck: transactionCondition.condition },
          { Delete: transactionDelete.delete },
        ],
        ClientRequestToken: 'Token',
      });

      expect(ddbTransactWriteItemsMock).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });
  });

  describe('options.return = "output"', () => {
    test('Should successfully run transactionWrite and return dynamo output', async () => {
      ddbTransactWriteItemsMock.mockImplementation(() => {
        return { ItemCollectionMetrics: { metric: 'value' } };
      });

      const output = await transactionWrite([transactionUpdate], { return: 'output' });
      expect(output).toEqual({ ItemCollectionMetrics: { metric: 'value' } });
      expect(ddbTransactWriteItemsMock).toBeCalledWith({
        TransactItems: [{ Update: transactionUpdate.update }],
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });

    test('Should successfully run transactionWrite with idempotencyKey', async () => {
      ddbTransactWriteItemsMock.mockImplementation(() => {
        return { ItemCollectionMetrics: { metric: 'value' } };
      });

      const output = await transactionWrite([transactionUpdate], { return: 'output', idempotencyKey: 'Token' });
      expect(output).toEqual({ ItemCollectionMetrics: { metric: 'value' } });
      expect(ddbTransactWriteItemsMock).toBeCalledWith({
        TransactItems: [{ Update: transactionUpdate.update }],
        ClientRequestToken: 'Token',
      });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
    });
  });

  describe('options.return = "default"', () => {
    test('Should successfully run transactionWrite', async () => {
      ddbTransactWriteItemsMock.mockImplementation(() => {
        return { ItemCollectionMetrics: { metric: 'value' } };
      });

      const output = await transactionWrite([transactionUpdate, transactionPut]);
      expect(ddbTransactWriteItemsMock).toBeCalledWith({
        TransactItems: [{ Update: transactionUpdate.update }, { Put: transactionPut.put }],
      });
      expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, item);
      expect(output).toEqual({ items: [undefined, item], count: 2 });
    });
  });
});
