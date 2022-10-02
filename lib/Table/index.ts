import { DynamoDB } from '@aws-sdk/client-dynamodb';
interface TableProps {
  ddb: DynamoDB;
  tableName: string;
}

export function Table<PrimaryKeyType extends string>({ ddb, tableName }: TableProps) {
  return class Table {
    public static PrimaryKey: PrimaryKeyType;

    public static ddb = ddb;
    public static tableName = tableName;

    constructor(...args: any[]) {
      console.log('table constructor', args);
    }
  };
}
