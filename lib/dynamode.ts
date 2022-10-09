import { Condition } from '@lib/Condition';
import { column, createdAt, gsiPartitionKey, gsiSortKey, lsiSortKey, prefix, primaryPartitionKey, primarySortKey, suffix, updatedAt } from '@lib/decorators';
import { Entity } from '@lib/Entity';
import { Query } from '@lib/Query';
import { Scan } from '@lib/Scan';
import { Settings } from '@lib/Settings';
import { transactionGet, transactionWrite } from '@lib/Transaction';

///// --- https://github.com/aws/aws-sdk-js-v3/issues/2125 ---
// some @aws-sdk clients references these DOM lib interfaces,
// so we need them to exist to compile without having DOM.
declare global {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  interface ReadableStream {}
  interface File {}
}

const settings = Settings.default;

export {
  //Condition
  Condition,

  //decorators
  column,
  prefix,
  suffix,
  primaryPartitionKey,
  primarySortKey,
  gsiPartitionKey,
  gsiSortKey,
  lsiSortKey,
  createdAt,
  updatedAt,

  //Entity
  Entity,

  //Query
  Query,

  //Scan
  Scan,

  //Settings
  settings,

  //transactions
  transactionGet,
  transactionWrite,
};
