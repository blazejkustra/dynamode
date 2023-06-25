import { KeySchemaElement } from '@aws-sdk/client-dynamodb';

export function getKeySchema(partitionKey: string, sortKey?: string): KeySchemaElement[] {
  const schema: KeySchemaElement[] = [{ AttributeName: String(partitionKey), KeyType: 'HASH' }];

  if (sortKey) {
    schema.push({ AttributeName: String(sortKey), KeyType: 'RANGE' });
  }

  return schema;
}
