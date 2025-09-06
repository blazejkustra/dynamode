import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity } from '@lib/entity/helpers/converters';
import { AttributeValues, DynamodeStreamError, fromDynamo } from '@lib/utils';

import { DynamoDBRecord } from './types';

/**
 * Stream class for processing DynamoDB stream records.
 *
 * This class provides a convenient way to process DynamoDB stream records
 * and convert them into Dynamode entity instances. It handles different
 * stream view types and operations (INSERT, MODIFY, REMOVE).
 *
 * @template E - The entity class type
 *
 * @example
 * ```typescript
 * // In an AWS Lambda function
 * export const handler = async (event: any) => {
 *   for (const record of event.Records) {
 *     const stream = new Stream(record);
 *
 *     if (stream.operation === 'insert') {
 *       console.log('New item:', stream.newImage);
 *     } else if (stream.operation === 'modify') {
 *       console.log('Old item:', stream.oldImage);
 *       console.log('New item:', stream.newImage);
 *     } else if (stream.operation === 'remove') {
 *       console.log('Removed item:', stream.oldImage);
 *     }
 *
 *     // Type-safe entity checking
 *     if (stream.isEntity(User)) {
 *       // stream is now typed as Stream<typeof User>
 *       console.log('User entity:', stream.newImage?.name);
 *     }
 *   }
 * };
 * ```
 *
 * @see {@link https://blazejkustra.github.io/dynamode/docs/guide/stream} for more information
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html} for DynamoDB Streams documentation
 * @see {@link https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html} for AWS Lambda with DynamoDB streams
 */
export default class Stream<E extends typeof Entity = typeof Entity> {
  /** The type of stream data available */
  streamType: 'newImage' | 'oldImage' | 'both';
  /** The operation that triggered the stream record */
  operation: 'insert' | 'modify' | 'remove';
  /** The old image of the item (available for MODIFY and REMOVE operations) */
  oldImage?: InstanceType<E>;
  /** The new image of the item (available for INSERT and MODIFY operations) */
  newImage?: InstanceType<E>;

  /** The Dynamode entity class for this stream record */
  entity: E;

  /**
   * Creates a new Stream instance from a DynamoDB stream record.
   *
   * @param record - The DynamoDB stream record containing event information
   * @throws {DynamodeStreamError} When the operation is invalid
   * @throws {DynamodeStreamError} When the record is invalid
   * @throws {DynamodeStreamError} When the stream type is KEYS_ONLY (not supported)
   * @throws {DynamodeStreamError} When the stream type is invalid
   * @throws {DynamodeStreamError} When the processed item is not a Dynamode entity
   *
   * @example
   * ```typescript
   * // In AWS Lambda handler
   * export const handler = async (event: any) => {
   *   for (const record of event.Records) {
   *     try {
   *       const stream = new Stream(record);
   *       // Process the stream...
   *     } catch (error) {
   *       if (error instanceof DynamodeStreamError) {
   *         console.error('Stream processing error:', error.message);
   *       }
   *     }
   *   }
   * };
   * ```
   */
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

  /**
   * Type guard to check if the stream record is for a specific entity type.
   *
   * This method provides type-safe entity checking and narrows the type
   * of the stream instance to the specified entity type.
   *
   * @template TargetEntity - The target entity class type
   * @param entity - The entity class to check against
   * @returns True if the stream record is for the specified entity type
   *
   * @example
   * ```typescript
   * const stream = new Stream(record);
   *
   * if (stream.isEntity(User)) {
   *   // stream is now typed as Stream<typeof User>
   *   console.log('User name:', stream.newImage?.name);
   *   console.log('User email:', stream.newImage?.email);
   * }
   *
   * if (stream.isEntity(Product)) {
   *   // stream is now typed as Stream<typeof Product>
   *   console.log('Product title:', stream.newImage?.title);
   *   console.log('Product price:', stream.newImage?.price);
   * }
   * ```
   */
  isEntity<TargetEntity extends E>(entity: TargetEntity): this is Stream<TargetEntity> {
    return this.entity === entity;
  }
}
