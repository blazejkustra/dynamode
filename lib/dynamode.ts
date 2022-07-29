import { AWS } from '@aws/index';
import { Model, ModelProps, TablePrimaryKey } from '@Model/index';
import { Table } from '@Table/index';

const aws = AWS.default;

export { aws, Table, Model, ModelProps, TablePrimaryKey };

///// --- https://github.com/aws/aws-sdk-js-v3/issues/2125 ---
// some @aws-sdk clients references these DOM lib interfaces,
// so we need them to exist to compile without having DOM.
declare global {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  interface ReadableStream {}
  interface File {}
}
