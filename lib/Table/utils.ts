import { DynamoDB, TableDescription } from '@aws-sdk/client-dynamodb';
import { error } from '../utils';
import { GlobalIndex, KeyType, LocalIndex, PrimaryKey } from './types';

export async function getTableDetails(ddb: DynamoDB, name: string): Promise<TableDescription> {
  const { Table } = await ddb.describeTable({ TableName: name });
  if (!Table) {
    throw new error.DefaultError();
  }

  return Table;
}

export function getTablePrimaryKey(describeTable: TableDescription): PrimaryKey {
  const { KeySchema } = describeTable;
  const pk = KeySchema?.find((key) => key.KeyType === 'HASH')?.AttributeName;
  const sk = KeySchema?.find((key) => key.KeyType === 'RANGE')?.AttributeName;

  if (!pk) {
    throw new error.DefaultError();
  }

  if (sk) {
    return {
      pk,
      sk,
      keyType: KeyType.COMPOSITE,
    };
  }

  return {
    pk,
    keyType: KeyType.SIMPLE,
  };
}

export function getTableGlobalIndexes(describeTable: TableDescription): GlobalIndex[] {
  const { GlobalSecondaryIndexes } = describeTable;

  return (
    GlobalSecondaryIndexes?.map(({ KeySchema, IndexName }) => {
      const pk = KeySchema?.find((key) => key.KeyType === 'HASH')?.AttributeName;
      const sk = KeySchema?.find((key) => key.KeyType === 'RANGE')?.AttributeName;

      if (!pk || !IndexName) {
        throw new error.DefaultError();
      }

      if (sk) {
        return {
          name: IndexName,
          pk,
          sk,
          keyType: KeyType.COMPOSITE,
        };
      }

      return {
        name: IndexName,
        pk,
        keyType: KeyType.SIMPLE,
      };
    }) || []
  );
}

export function getTableLocalIndexes(describeTable: TableDescription): LocalIndex[] {
  const { LocalSecondaryIndexes } = describeTable;

  return (
    LocalSecondaryIndexes?.map(({ KeySchema, IndexName }) => {
      const sk = KeySchema?.find((key) => key.KeyType === 'RANGE')?.AttributeName;

      if (!sk || !IndexName) {
        throw new error.DefaultError();
      }

      return {
        name: IndexName,
        sk,
      };
    }) || []
  );
}
