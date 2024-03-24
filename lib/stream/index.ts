import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity } from '@lib/entity/helpers/converters';
import { AttributeValues, DynamodeStreamError, fromDynamo } from '@lib/utils';

import { DynamoDBRecord } from './types';

export default class Stream<E extends typeof Entity = typeof Entity> {
  streamType: 'newImage' | 'oldImage' | 'both';
  operation: 'insert' | 'modify' | 'remove';
  oldImage?: InstanceType<E>;
  newImage?: InstanceType<E>;

  // Dynamode entity class
  entity: E;

  constructor({ dynamodb: record, eventName }: DynamoDBRecord) {
    switch (eventName) {
      case 'INSERT':
        this.operation = 'insert';
        break;
      case 'MODIFY':
        this.operation = 'modify';
        break;
      case 'REMOVE':
        this.operation = 'remove';
        break;
      default:
        throw new DynamodeStreamError('Invalid operation');
    }

    if (!record) {
      throw new DynamodeStreamError('Invalid record');
    }

    switch (record.StreamViewType) {
      case 'KEYS_ONLY':
        throw new DynamodeStreamError("Stream of 'KEYS_ONLY' type is not supported");
      case 'NEW_IMAGE':
        this.streamType = 'newImage';
        break;
      case 'OLD_IMAGE':
        this.streamType = 'oldImage';
        break;
      case 'NEW_AND_OLD_IMAGES':
        this.streamType = 'both';
        break;
      default:
        throw new DynamodeStreamError('Invalid streamType');
    }

    const item = fromDynamo((record.NewImage as AttributeValues) ?? (record.OldImage as AttributeValues) ?? {});
    const dynamodeEntity = item?.dynamodeEntity;

    if (!dynamodeEntity || typeof dynamodeEntity !== 'string') {
      throw new DynamodeStreamError("Processed item isn't a Dynamode entity");
    }

    this.entity = Dynamode.storage.getEntityClass(dynamodeEntity) as E;

    if (record.OldImage) {
      this.oldImage = convertAttributeValuesToEntity(this.entity, record.OldImage as AttributeValues);
    }
    if (record.NewImage) {
      this.newImage = convertAttributeValuesToEntity(this.entity, record.NewImage as AttributeValues);
    }
  }

  isEntity<TargetEntity extends E>(entity: TargetEntity): this is Stream<TargetEntity> {
    return this.entity === entity;
  }
}
