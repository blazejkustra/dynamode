import type { AttributeValue } from '@aws-sdk/client-dynamodb';

// For compatibility with aws lambda: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/aws-lambda/trigger/dynamodb-stream.d.ts
type AttributeValueAWSLambda = {
  B?: string | undefined;
  BS?: string[] | undefined;
  BOOL?: boolean | undefined;
  L?: AttributeValueAWSLambda[] | undefined;
  M?: { [id: string]: AttributeValueAWSLambda } | undefined;
  N?: string | undefined;
  NS?: string[] | undefined;
  NULL?: boolean | undefined;
  S?: string | undefined;
  SS?: string[] | undefined;
};

export type StreamPayload = {
  NewImage?: Record<string, AttributeValue | AttributeValueAWSLambda> | undefined;
  OldImage?: Record<string, AttributeValue | AttributeValueAWSLambda> | undefined;
  StreamViewType?: 'KEYS_ONLY' | 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | undefined;
};

export type DynamoDBRecord = {
  eventName?: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined;
  dynamodb?: StreamPayload | undefined;
};
