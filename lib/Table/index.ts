import { DynamoDB } from '@aws-sdk/client-dynamodb';
interface TableProps {
  ddb: DynamoDB;
  tableName: string;
}

export function Table<PrimaryKey extends Record<string, string | number>>({ ddb, tableName }: TableProps) {
  return class BaseTable {
    public static primaryKey: PrimaryKey;

    public static ddb = ddb;
    public static tableName = tableName;

    constructor(...args: any[]) {
      console.log('constructor', args);
    }
  };
}
