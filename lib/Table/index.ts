export class Table {
  public static readonly tableName: string;

  public static readonly partitionKey: string | number;
  public static readonly sortKey: string | number;

  public static readonly gsi1Name: string;
  public static readonly gsi1PartitionKey: string | number;
  public static readonly gsi1SortKey: string | number;

  public static readonly gsi2Name: string;
  public static readonly gsi2Pk: string | number;
  public static readonly gsi2Sk: string | number;

  public static readonly gsi3Name: string;
  public static readonly gsi3Pk: string | number;
  public static readonly gsi3Sk: string | number;

  public static readonly gsi4Name: string;
  public static readonly gsi4Pk: string | number;
  public static readonly gsi4Sk: string | number;

  public static readonly gsi5Name: string;
  public static readonly gsi5Pk: string | number;
  public static readonly gsi5Sk: string | number;

  constructor(props: Table) {
    console.log(props);
  }
}
