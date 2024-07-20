import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import Entity from '@lib/entity';
import Stream from '@lib/stream';
import { DynamoDBRecord } from '@lib/stream/types';
import { DynamodeStreamError } from '@lib/utils';

import { mockDate, MockEntity, mockInstance, TestTable } from '../../fixtures/TestTable';

const validMockEntityImage = {
  dynamodeEntity: { S: 'MockEntity' },
  partitionKey: { S: 'prefix#PK' },
  sortKey: { S: 'SK' },
  createdAt: { S: '2001-09-09T01:46:40.000Z' },
  updatedAt: { N: '1000000000000' },
  string: { S: 'string' },
  object: { M: { required: { N: '2' } } },
  array: { L: [{ S: '1' }, { S: '2' }] },
  map: { M: { '1': { S: '2' } } },
  set: { SS: ['1', '2', '3'] },
  boolean: { BOOL: true },
  strDate: { S: '2001-09-09T01:46:40.000Z' },
  numDate: { N: '1000000000000' },
  binary: { B: new Uint8Array([1, 2, 3]) },
};

const validNewImageStream: DynamoDBRecord = {
  dynamodb: {
    NewImage: validMockEntityImage,
    StreamViewType: 'NEW_IMAGE',
  },
  eventName: 'INSERT',
};
const validNewAndOldImageStream: DynamoDBRecord = {
  dynamodb: {
    NewImage: validMockEntityImage,
    OldImage: validMockEntityImage,
    StreamViewType: 'NEW_AND_OLD_IMAGES',
  },
  eventName: 'INSERT',
};
const validOldImageStream: DynamoDBRecord = {
  dynamodb: {
    OldImage: validMockEntityImage,
    StreamViewType: 'OLD_IMAGE',
  },
  eventName: 'INSERT',
};

const invalidImage = {
  partitionKey: { S: 'prefix#PK' },
  sortKey: { S: 'SK' },
  createdAt: { S: '2001-09-09T01:46:40.000Z' },
  updatedAt: { N: '1000000000000' },
  string: { S: 'string' },
};
const invalidOperationStream: DynamoDBRecord = { ...validNewImageStream, eventName: 'INVALID' as any };
const missingRecordStream: DynamoDBRecord = { ...validNewImageStream, dynamodb: undefined };
const invalidTypeStream: DynamoDBRecord = {
  ...validNewImageStream,
  dynamodb: { ...validNewImageStream.dynamodb, StreamViewType: 'INVALID' as any },
};
const keysOnlyTypeStream: DynamoDBRecord = {
  ...validNewImageStream,
  dynamodb: { ...validNewImageStream.dynamodb, StreamViewType: 'KEYS_ONLY' },
};
const invalidEntityStream: DynamoDBRecord = {
  ...validNewImageStream,
  dynamodb: { ...validNewImageStream.dynamodb, NewImage: invalidImage },
};
const withoutImagesStream: DynamoDBRecord = {
  dynamodb: {
    StreamViewType: 'NEW_IMAGE',
  },
  eventName: 'INSERT',
};

describe('Stream', () => {
  beforeAll(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterAll(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('isEntity', () => {
    test('Should initialize stream with a valid record', async () => {
      const stream = new Stream(validNewImageStream);
      expect(stream['streamType']).toEqual('newImage');
      expect(stream['operation']).toEqual('insert');
      expect(stream['oldImage']).toEqual(undefined);
      expect(stream['newImage']).toEqual(mockInstance);
      expect(stream['entity']).toEqual(MockEntity);

      const stream2 = new Stream(validNewAndOldImageStream);
      expect(stream2['streamType']).toEqual('both');
      expect(stream2['operation']).toEqual('insert');
      expect(stream2['oldImage']).toEqual(mockInstance);
      expect(stream2['newImage']).toEqual(mockInstance);
      expect(stream2['entity']).toEqual(MockEntity);

      const stream3 = new Stream(validOldImageStream);
      expect(stream3['streamType']).toEqual('oldImage');
      expect(stream3['operation']).toEqual('insert');
      expect(stream3['oldImage']).toEqual(mockInstance);
      expect(stream3['newImage']).toEqual(undefined);
      expect(stream3['entity']).toEqual(MockEntity);

      expect(new Stream({ ...validNewImageStream, eventName: 'MODIFY' }).operation).toEqual('modify');
      expect(new Stream({ ...validNewImageStream, eventName: 'REMOVE' }).operation).toEqual('remove');
      expect(
        new Stream({
          ...validNewImageStream,
          dynamodb: { ...validNewImageStream.dynamodb, StreamViewType: 'OLD_IMAGE' },
        }).streamType,
      ).toEqual('oldImage');
      expect(
        new Stream({
          ...validNewImageStream,
          dynamodb: { ...validNewImageStream.dynamodb, StreamViewType: 'NEW_AND_OLD_IMAGES' },
        }).streamType,
      ).toEqual('both');
    });

    test('Should throw an error for invalid operation', async () => {
      expect(() => new Stream(invalidOperationStream)).toThrow(DynamodeStreamError);
      expect(() => new Stream(invalidOperationStream)).toThrow(`Invalid operation`);
    });

    test('Should throw an error for a missing record', async () => {
      expect(() => new Stream(missingRecordStream)).toThrow(DynamodeStreamError);
      expect(() => new Stream(missingRecordStream)).toThrow(`Invalid record`);
    });

    test('Should throw an error for invalid streamType', async () => {
      expect(() => new Stream(invalidTypeStream)).toThrow(DynamodeStreamError);
      expect(() => new Stream(invalidTypeStream)).toThrow(`Invalid streamType`);
    });

    test('Should throw an error for KEYS_ONLY streamType', async () => {
      expect(() => new Stream(keysOnlyTypeStream)).toThrow(DynamodeStreamError);
      expect(() => new Stream(keysOnlyTypeStream)).toThrow("Stream of 'KEYS_ONLY' type is not supported");
    });

    test('Should throw an error for a model without dynamodeEntity property', async () => {
      expect(() => new Stream(invalidEntityStream)).toThrow(DynamodeStreamError);
      expect(() => new Stream(invalidEntityStream)).toThrow("Processed item isn't a Dynamode entity");

      expect(() => new Stream(withoutImagesStream)).toThrow(DynamodeStreamError);
      expect(() => new Stream(withoutImagesStream)).toThrow("Processed item isn't a Dynamode entity");
    });
  });

  describe('isEntity', () => {
    const stream = new Stream(validNewImageStream);

    test('Should return true for matching entities', async () => {
      expect(stream.isEntity(MockEntity)).toEqual(true);
    });

    test('Should return false for other entities', async () => {
      class TestEntity extends Entity {}
      expect(stream.isEntity(Entity)).toEqual(false);
      expect(stream.isEntity(TestTable)).toEqual(false);
      expect(stream.isEntity(TestEntity)).toEqual(false);
    });
  });
});
