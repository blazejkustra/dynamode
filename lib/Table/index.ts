import {
  gsi1PartitionKey,
  gsi1SortKey,
  gsi2PartitionKey,
  gsi2SortKey,
  Keys,
  lsi1SortKey,
  lsi2SortKey,
  partitionKey,
  sortKey,
} from '@lib/utils';

export class Table {
  public static readonly tableName: string;

  public static readonly [partitionKey]: string;
  public static readonly [sortKey]: string;

  public static readonly gsi1Name: string;
  public static readonly [gsi1PartitionKey]: string;
  public static readonly [gsi1SortKey]: string;

  public static readonly gsi2Name: string;
  public static readonly [gsi2PartitionKey]: string;
  public static readonly [gsi2SortKey]: string;

  public static readonly lsi1Name: string;
  public static readonly [lsi1SortKey]: string;

  public static readonly lsi2Name: string;
  public static readonly [lsi2SortKey]: string;

  constructor(props: Table) {
    console.log(props);
  }

  public static getIndexName(key: Keys) {
    return {
      [partitionKey]: undefined,
      [sortKey]: undefined,
      [gsi1PartitionKey]: this.gsi1Name,
      [gsi1SortKey]: this.gsi1Name,
      [gsi2PartitionKey]: this.gsi2Name,
      [gsi2SortKey]: this.gsi2Name,
      [lsi1SortKey]: this.lsi1Name,
      [lsi2SortKey]: this.lsi2Name,
    }[key];
  }
}
