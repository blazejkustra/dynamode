import type { AttributeValue } from '@aws-sdk/client-dynamodb';

/**
 * Attribute value type for AWS Lambda compatibility.
 *
 * This type is used for compatibility with AWS Lambda DynamoDB stream triggers.
 * @see {@link https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/aws-lambda/trigger/dynamodb-stream.d.ts}
 */
type AttributeValueAWSLambda = {
  /** Binary attribute */
  B?: string | undefined;
  /** Binary set attribute */
  BS?: string[] | undefined;
  /** Boolean attribute */
  BOOL?: boolean | undefined;
  /** List attribute */
  L?: AttributeValueAWSLambda[] | undefined;
  /** Map attribute */
  M?: { [id: string]: AttributeValueAWSLambda } | undefined;
  /** Number attribute */
  N?: string | undefined;
  /** Number set attribute */
  NS?: string[] | undefined;
  /** Null attribute */
  NULL?: boolean | undefined;
  /** String attribute */
  S?: string | undefined;
  /** String set attribute */
  SS?: string[] | undefined;
};

/**
 * DynamoDB stream payload containing item images.
 */
export type StreamPayload = {
  /** New image of the item after the change */
  NewImage?: Record<string, AttributeValue | AttributeValueAWSLambda> | undefined;
  /** Old image of the item before the change */
  OldImage?: Record<string, AttributeValue | AttributeValueAWSLambda> | undefined;
  /** Type of stream view */
  StreamViewType?: 'KEYS_ONLY' | 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | undefined;
};

/**
 * DynamoDB stream record containing event information.
 */
export type DynamoDBRecord = {
  /** Name of the event that triggered the stream record */
  eventName?: 'INSERT' | 'MODIFY' | 'REMOVE' | undefined;
  /** DynamoDB stream payload */
  dynamodb?: StreamPayload | undefined;
};
