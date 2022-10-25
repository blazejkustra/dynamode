import { AttributeValue } from '@aws-sdk/client-dynamodb';
import DynamoDBconverter from '@lib/dynamode/converter';
import { AttributeMap, GenericObject } from '@lib/utils';

export function objectToDynamo(object: GenericObject): AttributeMap {
  return DynamoDBconverter.get().marshall(object, { removeUndefinedValues: true });
}

export function valueToDynamo(value: any): AttributeValue {
  return DynamoDBconverter.get().convertToAttr(value);
}

export function valueFromDynamo(value: AttributeValue): unknown {
  return DynamoDBconverter.get().convertToNative(value);
}

export function fromDynamo(object: AttributeMap): GenericObject {
  return DynamoDBconverter.get().unmarshall(object);
}
