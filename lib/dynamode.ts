import Condition, { AttributeType } from '@lib/condition';
import { attribute, createdAt, gsiPartitionKey, gsiSortKey, lsiSortKey, prefix, primaryPartitionKey, primarySortKey, suffix, updatedAt } from '@lib/decorators';
import Dynamode from '@lib/dynamode/index';
import { Entity } from '@lib/entity';
import Query from '@lib/query';
import Scan from '@lib/scan';
import transactionGet from '@lib/transactionGet';
import transactionWrite from '@lib/transactionWrite';

///// --- https://github.com/aws/aws-sdk-js-v3/issues/2125 ---
// some @aws-sdk clients references these DOM lib interfaces,
// so we need them to exist to compile without having DOM.
declare global {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  interface ReadableStream {}
  interface File {}
}

const decorators = { attribute, createdAt, gsiPartitionKey, gsiSortKey, lsiSortKey, prefix, primaryPartitionKey, primarySortKey, suffix, updatedAt };

export {
  //Condition
  Condition,
  AttributeType,

  //decorators
  decorators,

  //Entity
  Entity,

  //Query
  Query,

  //Scan
  Scan,

  //Dynamode
  Dynamode,

  //transactions
  transactionGet,
  transactionWrite,
};
