import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity } from '@lib/entity/helpers/converters';
import { AttributeValues, DynamodeStreamError, fromDynamo } from '@lib/utils';

import { DynamoDBRecord, StreamHandlerOptions } from './types';

class Stream<E extends typeof Entity = typeof Entity> {
  streamType: 'newImage' | 'oldImage' | 'newAndOldImages';
  operation: 'insert' | 'modify' | 'remove';
  entity: E;
  oldImage?: InstanceType<E>;
  newImage?: InstanceType<E>;

  constructor({ dynamodb: record, eventName }: DynamoDBRecord, options?: StreamHandlerOptions) {
    this.streamType = options?.streamType ?? 'newAndOldImages';

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

    if (record.StreamViewType === 'KEYS_ONLY') {
      throw new DynamodeStreamError("Stream of 'KEYS_ONLY' type is not supported");
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
}

export default Stream;
