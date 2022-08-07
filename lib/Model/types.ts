import { Table } from '@lib/Table';
import {
  gsi1PartitionKey,
  gsi1SortKey,
  gsi2PartitionKey,
  gsi2SortKey,
  lsi1SortKey,
  lsi2SortKey,
  partitionKey,
  sortKey,
} from '@lib/utils/symbols';

export type PrimaryKey = { [partitionKey]: string | number; [sortKey]: string | number };
export interface ModelProps<T extends Table> {
  [partitionKey]: string;
  [sortKey]: string;

  [gsi1PartitionKey]?: string;
  [gsi1SortKey]?: string;

  [gsi2PartitionKey]?: string;
  [gsi2SortKey]?: string;

  [lsi1SortKey]?: string;
  [lsi2SortKey]?: string;
}
