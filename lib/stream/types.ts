import type { AttributeValue } from '@aws-sdk/client-dynamodb';

export type StreamPayload = {
  NewImage?: Record<string, AttributeValue> | undefined;
  OldImage?: Record<string, AttributeValue> | undefined;
  StreamViewType?: 'KEYS_ONLY' | 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | undefined;
};

export type DynamoDBRecord = {
  eventName?: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined;
  dynamodb?: StreamPayload | undefined;
};

export type StreamHandlerOptions = {
  streamType?: 'newImage' | 'oldImage' | 'newAndOldImages';
};
