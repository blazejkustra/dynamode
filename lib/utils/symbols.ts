export const partitionKey: unique symbol = Symbol('partitionKey');
export const sortKey: unique symbol = Symbol('sortKey');

export const gsi1Name: unique symbol = Symbol('gsi1Name');
export const gsi1PartitionKey: unique symbol = Symbol('gsi1PartitionKey');
export const gsi1SortKey: unique symbol = Symbol('gsi1SortKey');

export const gsi2Name: unique symbol = Symbol('gsi2Name');
export const gsi2PartitionKey: unique symbol = Symbol('gsi2PartitionKey');
export const gsi2SortKey: unique symbol = Symbol('gsi2SortKey');

export const lsi1Name: unique symbol = Symbol('lsi1Name');
export const lsi1SortKey: unique symbol = Symbol('lsi1SortKey');

export const lsi2Name: unique symbol = Symbol('lsi2Name');
export const lsi2SortKey: unique symbol = Symbol('lsi2SortKey');

export type PartitionKeys = typeof partitionKey | typeof gsi1PartitionKey | typeof gsi2PartitionKey;

export type SortKeys = typeof sortKey | typeof gsi1SortKey | typeof gsi2SortKey | typeof lsi1SortKey | typeof lsi2SortKey;

export type Keys = SortKeys | PartitionKeys;
