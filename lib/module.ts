/* eslint-disable @typescript-eslint/consistent-type-definitions */
import Condition, { AttributeType } from '@lib/condition';
import attribute, { entity } from '@lib/decorators';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import Query from '@lib/query';
import Scan from '@lib/scan';
import Stream from '@lib/stream';
import TableManager from '@lib/table';
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

export {
  //Condition
  Condition,
  AttributeType,

  //decorators
  attribute,
  entity,

  //Entity
  Entity,

  //table manager
  TableManager,

  //Query
  Query,

  //Scan
  Scan,

  //Dynamode
  Dynamode,

  //transactions
  transactionGet,
  transactionWrite,

  //Stream
  Stream,
};
