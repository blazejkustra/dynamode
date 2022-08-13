import { AWS } from '@lib/aws';
import { Model } from '@lib/Model';
import { Table } from '@lib/Table';
import { gsi1Name, gsi1PartitionKey, gsi1SortKey, gsi2Name, gsi2PartitionKey, gsi2SortKey, partitionKey, sortKey } from '@lib/utils/symbols';
import { dynamo, prefix, prefixPk, prefixSk, suffix, suffixPk, suffixSk, table } from '@Model/decorators';
import { ModelProps } from '@Model/types';

///// --- https://github.com/aws/aws-sdk-js-v3/issues/2125 ---
// some @aws-sdk clients references these DOM lib interfaces,
// so we need them to exist to compile without having DOM.
declare global {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  interface ReadableStream {}
  interface File {}
}

const aws = AWS.default;

export {
  //AWS
  aws,
  //Table
  Table,
  // Model
  Model,
  ModelProps,
  // decorators
  dynamo,
  prefix,
  prefixPk,
  prefixSk,
  suffix,
  suffixPk,
  suffixSk,
  table,
  // symbols
  partitionKey,
  sortKey,
  gsi1Name,
  gsi1PartitionKey,
  gsi1SortKey,
  gsi2Name,
  gsi2PartitionKey,
  gsi2SortKey,
};
