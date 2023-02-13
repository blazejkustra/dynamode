import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DynamoDB, ScanInput } from '@aws-sdk/client-dynamodb';
import { Dynamode } from '@lib/dynamode';
import * as entityHelpers from '@lib/entity/helpers';
import Scan from '@lib/scan';
import { BASE_OPERATOR } from '@lib/utils';

import { MockEntity, MockEntityRegistry, mockInstance, TEST_TABLE_NAME, TestTableKeys } from '../mocks';

vi.mock('@lib/utils/ExpressionBuilder', () => {
  const ExpressionBuilder = vi.fn(() => ({
    attributeNames: { attributeNames: 'value' },
    attributeValues: { attributeValues: 'value' },
    run: vi.fn().mockReturnValue('filterExpression'),
  }));
  return { ExpressionBuilder };
});

describe('Scan', () => {
  let scan = MockEntityRegistry.scan();

  beforeEach(() => {
    scan = MockEntityRegistry.scan();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should be able to initialize scan', async () => {
    const scan1 = MockEntityRegistry.scan();
    expect(scan1['operators']).toEqual([]);
    expect(scan1['entity']).toEqual(MockEntity);
    expect(scan1['logicalOperator']).toEqual(BASE_OPERATOR.and);

    const scan2 = new Scan<TestTableKeys, typeof MockEntity>(MockEntity);
    expect(scan2['operators']).toEqual([]);
    expect(scan2['entity']).toEqual(MockEntity);
    expect(scan2['logicalOperator']).toEqual(BASE_OPERATOR.and);
  });

  describe('run', async () => {
    const ddbScanMock = vi.fn();

    let buildScanInputSpy = vi.spyOn(scan, 'buildScanInput' as any);
    let validateScanInputSpy = vi.spyOn(scan, 'validateScanInput' as any);
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityHelpers, 'convertAttributeValuesToEntity');
    let convertAttributeValuesToPrimaryKeySpy = vi.spyOn(entityHelpers, 'convertAttributeValuesToPrimaryKey');

    const scanInput: ScanInput = {
      TableName: TEST_TABLE_NAME,
      FilterExpression: 'partitionKey = :value',
      ExpressionAttributeValues: { ':value': { S: 'value' } },
    };

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ scan: ddbScanMock } as any as DynamoDB);
      buildScanInputSpy = vi.spyOn(scan, 'buildScanInput' as any).mockImplementation(() => (scan['input'] = scanInput));
      validateScanInputSpy = vi.spyOn(scan, 'validateScanInput' as any).mockReturnValue(undefined);
      convertAttributeValuesToEntitySpy = vi.spyOn(entityHelpers, 'convertAttributeValuesToEntity').mockReturnValue(mockInstance);
      convertAttributeValuesToPrimaryKeySpy = vi.spyOn(entityHelpers, 'convertAttributeValuesToPrimaryKey').mockReturnValue({ partitionKey: 'lastValue', sortKey: 'lastValue' } as any);
    });

    test('Should build and validate scan input', async () => {
      expect(scan.run({ return: 'input' })).toEqual(scanInput);
      expect(buildScanInputSpy).toBeCalled();
      expect(validateScanInputSpy).toBeCalled();
    });

    test('Should build and validate scan input with extraInput', async () => {
      scan.run({ return: 'input', extraInput: { IndexName: 'indexName' } });
      expect(buildScanInputSpy).toBeCalledWith({ IndexName: 'indexName' });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToPrimaryKeySpy).not.toBeCalled();
    });

    test('Should return scan input for return = "input"', async () => {
      expect(scan.run({ return: 'input' })).toEqual(scanInput);
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToPrimaryKeySpy).not.toBeCalled();
    });

    test('Should return scan output for return = "output"', async () => {
      ddbScanMock.mockImplementation(() => {
        return { Items: 'test' };
      });

      await expect(scan.run({ return: 'output' })).resolves.toEqual({ Items: 'test' });
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToPrimaryKeySpy).not.toBeCalled();
    });

    test('Should return no items with no values returned for return = "output"', async () => {
      ddbScanMock.mockImplementationOnce(() => {
        return { Items: [] };
      });

      await expect(scan.run({ return: 'default' })).resolves.toEqual({
        items: [],
        lastKey: undefined,
        count: 0,
        scannedCount: 0,
      });

      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToPrimaryKeySpy).not.toBeCalled();
    });

    test('Should return items with values returned for return = "output"', async () => {
      ddbScanMock.mockImplementationOnce(() => {
        return { Items: [{ key: 'value' }], LastEvaluatedKey: { partitionKey: 'lastValue', sortKey: 'lastValue' }, Count: 1, ScannedCount: 100 };
      });
      convertAttributeValuesToEntitySpy.mockReturnValue(mockInstance);
      convertAttributeValuesToPrimaryKeySpy.mockReturnValue({ partitionKey: 'lastValue', sortKey: 'lastValue' } as any);

      await expect(scan.run({ return: 'default' })).resolves.toEqual({
        items: [mockInstance],
        lastKey: { partitionKey: 'lastValue', sortKey: 'lastValue' },
        count: 1,
        scannedCount: 100,
      });

      expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(1);
      expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, { key: 'value' });
      expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledTimes(1);
      expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledWith(MockEntity, { partitionKey: 'lastValue', sortKey: 'lastValue' });
    });
  });

  describe('indexName', () => {
    test('Should set IndexName on scan input', async () => {
      scan.indexName('GSI_1_NAME');
      expect(scan['input'].IndexName).toEqual('GSI_1_NAME');

      scan.indexName('LSI_1_NAME');
      expect(scan['input'].IndexName).toEqual('LSI_1_NAME');
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
      scan['buildScanInput']({ IndexName: 'indexName', ExpressionAttributeValues: { attributeValues: { S: 'overriddenValue' } } });

      expect(scan['input'].TableName).toEqual(TEST_TABLE_NAME);
      expect(scan['input'].FilterExpression).toEqual('filterExpression');
      expect(scan['input'].ExpressionAttributeNames).toEqual({
        attributeNames: 'value',
      });
      expect(scan['input'].ExpressionAttributeValues).toEqual({ attributeValues: { S: 'overriddenValue' } });
      expect(scan['input'].IndexName).toEqual('indexName');
    });
  });

  describe('validateScanInput', async () => {
    test.todo('Should successfully validate scan input');
  });
});
