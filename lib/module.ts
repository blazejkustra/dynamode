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

/**
 * Main Dynamode module exports.
 *
 * This module provides all the core functionality of Dynamode, including
 * entity management, table operations, querying, scanning, and transactions.
 *
 * @example
 * ```typescript
 * import { Entity, TableManager, attribute } from 'dynamode';
 *
 * class User extends Entity {
 *   @attribute.partitionKey.string()
 *   id: string;
 *
 *   @attribute.string()
 *   name: string;
 * }
 *
 * const UserTableManager = new TableManager(User, {
 *   tableName: 'users-table',
 *   partitionKey: 'id'
 * });
 * ```
 */
export {
  /** Condition builder for building conditional expressions */
  Condition,
  /** Attribute type definitions */
  AttributeType,

  /** Attribute decorators for defining entity properties */
  attribute,
  /** Entity decorators for entity-level configurations */
  entity,

  /** Base Entity class for all Dynamode entities */
  Entity,

  /** Table manager for managing DynamoDB tables */
  TableManager,

  /** Query builder for DynamoDB query operations */
  Query,

  /** Scan builder for DynamoDB scan operations */
  Scan,

  /** Main Dynamode instance for configuration and global operations */
  Dynamode,

  /** Transaction get operations */
  transactionGet,
  /** Transaction write operations */
  transactionWrite,

  /** Stream operations for DynamoDB streams */
  Stream,
};
