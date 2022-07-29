import { AWS } from '@lib/aws';
import { Model, ModelProps } from '@lib/Model';
import { Table } from '@lib/Table';

import { dynamo, prefix, prefixPk, prefixSk, suffix, suffixPk, suffixSk, table } from './Model/decorators';

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
};
