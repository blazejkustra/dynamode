export const partitionKey: unique symbol = Symbol('partitionKey');
export const sortKey: unique symbol = Symbol('sortKey');

export const gsi1Name: unique symbol = Symbol('gsi1Name');
export const gsi1PartitionKey: unique symbol = Symbol('gsi1PartitionKey');
export const gsi1SortKey: unique symbol = Symbol('gsi1SortKey');

export const gsi2Name: unique symbol = Symbol('gsi2Name');
export const gsi2PartitionKey: unique symbol = Symbol('gsi2PartitionKey');
export const gsi2SortKey: unique symbol = Symbol('gsi2SortKey');

export const gsi3Name: unique symbol = Symbol('gsi3Name');
export const gsi3PartitionKey: unique symbol = Symbol('gsi3PartitionKey');
export const gsi3SortKey: unique symbol = Symbol('gsi3SortKey');

export const gsi4Name: unique symbol = Symbol('gsi4Name');
export const gsi4PartitionKey: unique symbol = Symbol('gsi4PartitionKey');
export const gsi4SortKey: unique symbol = Symbol('gsi4SortKey');

export const gsi5Name: unique symbol = Symbol('gsi5Name');
export const gsi5PartitionKey: unique symbol = Symbol('gsi5PartitionKey');
export const gsi5SortKey: unique symbol = Symbol('gsi5SortKey');

export const gsi6Name: unique symbol = Symbol('gsi6Name');
export const gsi6PartitionKey: unique symbol = Symbol('gsi6PartitionKey');
export const gsi6SortKey: unique symbol = Symbol('gsi6SortKey');

export const gsi7Name: unique symbol = Symbol('gsi7Name');
export const gsi7PartitionKey: unique symbol = Symbol('gsi7PartitionKey');
export const gsi7SortKey: unique symbol = Symbol('gsi7SortKey');

export const gsi8Name: unique symbol = Symbol('gsi8Name');
export const gsi8PartitionKey: unique symbol = Symbol('gsi8PartitionKey');
export const gsi8SortKey: unique symbol = Symbol('gsi8SortKey');

export const gsi9Name: unique symbol = Symbol('gsi9Name');
export const gsi9PartitionKey: unique symbol = Symbol('gsi9PartitionKey');
export const gsi9SortKey: unique symbol = Symbol('gsi9SortKey');

export const gsi10Name: unique symbol = Symbol('gs10Name');
export const gsi10PartitionKey: unique symbol = Symbol('gsi10PartitionKey');
export const gsi10SortKey: unique symbol = Symbol('gsi10SortKey');

export const lsi1Name: unique symbol = Symbol('lsi1Name');
export const lsi1SortKey: unique symbol = Symbol('lsi1SortKey');

export const lsi2Name: unique symbol = Symbol('lsi2Name');
export const lsi2SortKey: unique symbol = Symbol('lsi2SortKey');

export const lsi3Name: unique symbol = Symbol('lsi3Name');
export const lsi3SortKey: unique symbol = Symbol('lsi3SortKey');

export const lsi4Name: unique symbol = Symbol('lsi4Name');
export const lsi4SortKey: unique symbol = Symbol('lsi4SortKey');

export const lsi5Name: unique symbol = Symbol('lsi5Name');
export const lsi5SortKey: unique symbol = Symbol('lsi5SortKey');

export type GsiPartitionKeys =
  | typeof gsi1PartitionKey
  | typeof gsi2PartitionKey
  | typeof gsi3PartitionKey
  | typeof gsi4PartitionKey
  | typeof gsi5PartitionKey
  | typeof gsi6PartitionKey
  | typeof gsi7PartitionKey
  | typeof gsi8PartitionKey
  | typeof gsi9PartitionKey
  | typeof gsi10PartitionKey;
export type PartitionKeys = typeof partitionKey | GsiPartitionKeys;
export type GsiSortKeys = typeof gsi1SortKey | typeof gsi2SortKey | typeof gsi3SortKey | typeof gsi4SortKey | typeof gsi5SortKey | typeof gsi6SortKey | typeof gsi7SortKey | typeof gsi8SortKey | typeof gsi9SortKey | typeof gsi10SortKey;
export type LsiSortKeys = typeof lsi1SortKey | typeof lsi2SortKey | typeof lsi3SortKey | typeof lsi4SortKey | typeof lsi5SortKey;
export type SortKeys = typeof sortKey | GsiPartitionKeys | LsiSortKeys;
export type Keys = SortKeys | PartitionKeys;
