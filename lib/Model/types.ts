import { Model } from '@lib/Model';
import { Table } from '@lib/Table';

export type PrimaryKey<M extends typeof Model> = Record<M['table']['partitionKey'] | M['table']['sortKey'], string>;

export type TablePrimaryKey<T extends typeof Table> = Record<T['partitionKey'] | T['sortKey'], string>;

export type GlobalSecondaryIndex<T extends typeof Table> = Record<T['gsi1PartitionKey'] | T['gsi1SortKey'], string>;
