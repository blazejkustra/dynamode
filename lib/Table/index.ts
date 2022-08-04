import { gsi1PartitionKey, gsi1SortKey, partitionKey, sortKey } from '@lib/utils/symbols';

export class Table {
  public static readonly tableName: string;

  public static readonly [partitionKey]: string | number;
  public static readonly [sortKey]: string | number;

  public static readonly gsi1Name: string;
  public static readonly [gsi1PartitionKey]: string | number;
  public static readonly [gsi1SortKey]: string | number;

  constructor(props: Table) {
    console.log(props);
  }
}
