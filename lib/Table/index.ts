import {
  createdAt,
  gsi1PartitionKey,
  gsi1SortKey,
  gsi2PartitionKey,
  gsi2SortKey,
  gsi3PartitionKey,
  gsi3SortKey,
  gsi4PartitionKey,
  gsi4SortKey,
  gsi5PartitionKey,
  gsi5SortKey,
  gsi6PartitionKey,
  gsi6SortKey,
  gsi7PartitionKey,
  gsi7SortKey,
  gsi8PartitionKey,
  gsi8SortKey,
  gsi9PartitionKey,
  gsi9SortKey,
  gsi10PartitionKey,
  gsi10SortKey,
  Keys,
  lsi1SortKey,
  lsi2SortKey,
  lsi3SortKey,
  lsi4SortKey,
  lsi5SortKey,
  partitionKey,
  sortKey,
  updatedAt,
} from '@lib/utils';

export enum TimestampsType {
  EPOCH = 'epoch',
  ISO8601 = 'iso8601',
}

export class Table {
  public static readonly tableName: string;

  // Timestamps
  public static readonly timestampsType: TimestampsType;
  public static readonly [createdAt]: string;
  public static readonly [updatedAt]: string;

  // Primary key
  public static readonly partitionKeyType: string | number;
  public static readonly [partitionKey]: string;

  public static readonly sortKeyType?: string | number;
  public static readonly [sortKey]: string;

  // Global secondary index 1
  public static readonly gsi1Name: string;

  public static readonly gsi1PartitionKeyType: string | number;
  public static readonly [gsi1PartitionKey]: string;

  public static readonly gsi1SortKeyType: string | number;
  public static readonly [gsi1SortKey]: string;

  // Global secondary index 2
  public static readonly gsi2Name: string;

  public static readonly gsi2PartitionKeyType: string | number;
  public static readonly [gsi2PartitionKey]: string;

  public static readonly gsi2SortKeyType: string | number;
  public static readonly [gsi2SortKey]: string;

  // Global secondary index 3
  public static readonly gsi3Name: string;

  public static readonly gsi3PartitionKeyType: string | number;
  public static readonly [gsi3PartitionKey]: string;

  public static readonly gsi3SortKeyType: string | number;
  public static readonly [gsi3SortKey]: string;

  // Global secondary index 4
  public static readonly gsi4Name: string;

  public static readonly gsi4PartitionKeyType: string | number;
  public static readonly [gsi4PartitionKey]: string;

  public static readonly gsi4SortKeyType: string | number;
  public static readonly [gsi4SortKey]: string;

  // Global secondary index 5
  public static readonly gsi5Name: string;

  public static readonly gsi5PartitionKeyType: string | number;
  public static readonly [gsi5PartitionKey]: string;

  public static readonly gsi5SortKeyType: string | number;
  public static readonly [gsi5SortKey]: string;

  // Global secondary index 6
  public static readonly gsi6Name: string;

  public static readonly gsi6PartitionKeyType: string | number;
  public static readonly [gsi6PartitionKey]: string;

  public static readonly gsi6SortKeyType: string | number;
  public static readonly [gsi6SortKey]: string;

  // Global secondary index 7
  public static readonly gsi7Name: string;

  public static readonly gsi7PartitionKeyType: string | number;
  public static readonly [gsi7PartitionKey]: string;

  public static readonly gsi7SortKeyType: string | number;
  public static readonly [gsi7SortKey]: string;

  // Global secondary index 8
  public static readonly gsi8Name: string;

  public static readonly gsi8PartitionKeyType: string | number;
  public static readonly [gsi8PartitionKey]: string;

  public static readonly gsi8SortKeyType: string | number;
  public static readonly [gsi8SortKey]: string;

  // Global secondary index 9
  public static readonly gsi9Name: string;

  public static readonly gsi9PartitionKeyType: string | number;
  public static readonly [gsi9PartitionKey]: string;

  public static readonly gsi9SortKeyType: string | number;
  public static readonly [gsi9SortKey]: string;

  // Global secondary index 10
  public static readonly gsi10Name: string;

  public static readonly gsi10PartitionKeyType: string | number;
  public static readonly [gsi10PartitionKey]: string;

  public static readonly gsi10SortKeyType: string | number;
  public static readonly [gsi10SortKey]: string;

  // Local secondary index 1
  public static readonly lsi1Name: string;
  public static readonly lsi1Type: string | number;

  public static readonly [lsi1SortKey]: string;

  // Local secondary index 2
  public static readonly lsi2Name: string;
  public static readonly lsi2Type: string | number;

  public static readonly [lsi2SortKey]: string;

  // Local secondary index 3
  public static readonly lsi3Name: string;
  public static readonly lsi3Type: string | number;

  public static readonly [lsi3SortKey]: string;

  // Local secondary index 4
  public static readonly lsi4Name: string;
  public static readonly lsi4Type: string | number;

  public static readonly [lsi4SortKey]: string;

  // Local secondary index 5
  public static readonly lsi5Name: string;
  public static readonly lsi5Type: string | number;

  public static readonly [lsi5SortKey]: string;

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

      [gsi3PartitionKey]: this.gsi3Name,
      [gsi3SortKey]: this.gsi3Name,

      [gsi4PartitionKey]: this.gsi4Name,
      [gsi4SortKey]: this.gsi4Name,

      [gsi5PartitionKey]: this.gsi5Name,
      [gsi5SortKey]: this.gsi5Name,

      [gsi6PartitionKey]: this.gsi6Name,
      [gsi6SortKey]: this.gsi6Name,

      [gsi7PartitionKey]: this.gsi7Name,
      [gsi7SortKey]: this.gsi7Name,

      [gsi8PartitionKey]: this.gsi8Name,
      [gsi8SortKey]: this.gsi8Name,

      [gsi9PartitionKey]: this.gsi9Name,
      [gsi9SortKey]: this.gsi9Name,

      [gsi10PartitionKey]: this.gsi10Name,
      [gsi10SortKey]: this.gsi10Name,

      [lsi1SortKey]: this.lsi1Name,
      [lsi2SortKey]: this.lsi2Name,
      [lsi3SortKey]: this.lsi3Name,
      [lsi4SortKey]: this.lsi4Name,
      [lsi5SortKey]: this.lsi5Name,
    }[key];
  }
}
