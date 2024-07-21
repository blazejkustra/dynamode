import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DynamoDB, ScanInput } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import * as entityConvertHelpers from '@lib/entity/helpers/converters';
import Scan from '@lib/scan';
import { Metadata } from '@lib/table/types';
import { BASE_OPERATOR } from '@lib/utils';

import { MockEntity, MockEntityManager, mockInstance, TEST_TABLE_NAME } from '../../fixtures/TestTable';

vi.mock('@lib/utils/ExpressionBuilder', () => {
  const ExpressionBuilder = vi.fn(() => ({
    attributeNames: { attributeNames: 'value' },
    attributeValues: { attributeValues: 'value' },
    run: vi.fn().mockImplementation((v: string[]) => v.join('')),
  }));
  return { ExpressionBuilder };
});

describe('Scan', () => {
  let scan = MockEntityManager.scan();

  beforeEach(() => {
    scan = MockEntityManager.scan();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should be able to initialize scan', async () => {
    const scan1 = MockEntityManager.scan();
    expect(scan1['operators']).toEqual([]);
    expect(scan1['entity']).toEqual(MockEntity);
    expect(scan1['logicalOperator']).toEqual(BASE_OPERATOR.and);

    const scan2 = new Scan<Metadata<typeof MockEntity>, typeof MockEntity>(MockEntity);
    expect(scan2['operators']).toEqual([]);
    expect(scan2['entity']).toEqual(MockEntity);
    expect(scan2['logicalOperator']).toEqual(BASE_OPERATOR.and);
  });

  describe('run', async () => {
    const ddbScanMock = vi.fn();

    let buildScanInputSpy = vi.spyOn(scan, 'buildScanInput' as any);
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity');
    let convertAttributeValuesToLastKeySpy = vi.spyOn(entityConvertHelpers, 'convertAttributeValuesToLastKey');

    const scanInput: ScanInput = {
      TableName: TEST_TABLE_NAME,
      FilterExpression: 'partitionKey = :value',
      ExpressionAttributeValues: { ':value': { S: 'value' } },
    };

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ scan: ddbScanMock } as any as DynamoDB);
      buildScanInputSpy = vi.spyOn(scan, 'buildScanInput' as any).mockImplementation(() => (scan['input'] = scanInput));
      convertAttributeValuesToEntitySpy = vi
        .spyOn(entityConvertHelpers, 'convertAttributeValuesToEntity')
        .mockReturnValue(mockInstance);
      convertAttributeValuesToLastKeySpy = vi
        .spyOn(entityConvertHelpers, 'convertAttributeValuesToLastKey')
        .mockReturnValue({ partitionKey: 'lastValue', sortKey: 'lastValue' } as any);
    });

    test('Should build and validate scan input', async () => {
      expect(scan.run({ return: 'input' })).toEqual(scanInput);
      expect(buildScanInputSpy).toBeCalled();
    });

    test('Should build and validate scan input with extraInput', async () => {
      scan.run({ return: 'input', extraInput: { IndexName: 'indexName' } });
      expect(buildScanInputSpy).toBeCalledWith({ IndexName: 'indexName' });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToLastKeySpy).not.toBeCalled();
    });

    test('Should return scan input for return = "input"', async () => {
      expect(scan.run({ return: 'input' })).toEqual(scanInput);
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToLastKeySpy).not.toBeCalled();
    });

    test('Should return scan output for return = "output"', async () => {
      ddbScanMock.mockImplementation(() => {
        return { Items: 'test' };
      });

      await expect(scan.run({ return: 'output' })).resolves.toEqual({ Items: 'test' });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToLastKeySpy).not.toBeCalled();
    });

    test('Should return no items with no values returned for return = "output"', async () => {
      ddbScanMock
        .mockImplementationOnce(() => {
          return { Items: [] };
        })
        .mockImplementationOnce(() => {
          return { Items: undefined };
        });

      await expect(scan.run({ return: 'default' })).resolves.toEqual({
        items: [],
        lastKey: undefined,
        count: 0,
        scannedCount: 0,
      });
      await expect(scan.run({ return: 'default' })).resolves.toEqual({
        items: [],
        lastKey: undefined,
        count: 0,
        scannedCount: 0,
      });

      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToLastKeySpy).not.toBeCalled();
    });

    test('Should return items with values returned for return = "output"', async () => {
      ddbScanMock.mockImplementationOnce(() => {
        return {
          Items: [{ key: 'value' }],
          LastEvaluatedKey: { partitionKey: 'lastValue', sortKey: 'lastValue' },
          Count: 1,
          ScannedCount: 100,
        };
      });
      convertAttributeValuesToEntitySpy.mockReturnValue(mockInstance);
      convertAttributeValuesToLastKeySpy.mockReturnValue({ partitionKey: 'lastValue', sortKey: 'lastValue' } as any);

      await expect(scan.run({ return: 'default' })).resolves.toEqual({
        items: [mockInstance],
        lastKey: { partitionKey: 'lastValue', sortKey: 'lastValue' },
        count: 1,
        scannedCount: 100,
      });

      expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(1);
      expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, { key: 'value' });
      expect(convertAttributeValuesToLastKeySpy).toBeCalledTimes(1);
      expect(convertAttributeValuesToLastKeySpy).toBeCalledWith(MockEntity, {
        partitionKey: 'lastValue',
        sortKey: 'lastValue',
      });
    });
  });

  describe('segment', () => {
    test('Should set Segment on scan input', async () => {
      scan.segment(1);
      expect(scan['input'].Segment).toEqual(1);
    });
  });

  describe('totalSegments', () => {
    test('Should set TotalSegments on scan input', async () => {
      scan.totalSegments(10);
      expect(scan['input'].TotalSegments).toEqual(10);
    });
  });

  describe('buildScanInput', async () => {
    test('Should successfully build scan input without extraInput', async () => {
      scan['operators'] = ['filterExpression'] as any;
      scan['buildScanInput']();

      expect(scan['input'].TableName).toEqual(TEST_TABLE_NAME);
      expect(scan['input'].FilterExpression).toEqual('filterExpression');
      expect(scan['input'].ExpressionAttributeNames).toEqual({
        attributeNames: 'value',
      });
      expect(scan['input'].ExpressionAttributeValues).toEqual({
        attributeValues: 'value',
      });
    });

    test('Should successfully build scan input with extraInput', async () => {
      scan['operators'] = [];
      scan['buildScanInput']({
        IndexName: 'indexName',
        ExpressionAttributeValues: { attributeValues: { S: 'overriddenValue' } },
      });

      expect(scan['input'].TableName).toEqual(TEST_TABLE_NAME);
      expect(scan['input'].FilterExpression).toEqual(undefined);
      expect(scan['input'].ExpressionAttributeNames).toEqual({
        attributeNames: 'value',
      });
      expect(scan['input'].ExpressionAttributeValues).toEqual({ attributeValues: { S: 'overriddenValue' } });
      expect(scan['input'].IndexName).toEqual('indexName');
    });
  });
});
