import { AWS } from '@lib/aws';
import { Entity } from '@lib/Entity';
import { Table } from '@lib/Table';

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
  // Entity
  Entity,
  // decorators
};
