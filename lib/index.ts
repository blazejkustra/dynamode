/**
 * @fileoverview Main entry point for the Dynamode library.
 *
 * Dynamode is a modeling tool for Amazon's DynamoDB that provides a straightforward,
 * object-oriented class-based solution to model your data. It includes strongly typed
 * classes and methods, query and scan builders, and much more.
 *
 * @example
 * ```typescript
 * import Dynamode, { Entity, TableManager, attribute } from 'dynamode';
 *
 * // Configure Dynamode
 * Dynamode.configure({
 *   region: 'us-east-1',
 *   endpoint: 'http://localhost:8000' // for local development
 * });
 *
 * // Define an entity
 * class User extends Entity {
 *   ＠attribute.partitionKey.string()
 *   id: string;
 *
 *   ＠attribute.string()
 *   name: string;
 * }
 *
 * // Create table manager
 * const UserTableManager = new TableManager(User, {
 *   tableName: 'users-table',
 *   partitionKey: 'id'
 * });
 *
 * // Create table and get entity manager
 * await UserTableManager.createTable();
 * const UserManager = UserTableManager.entityManager();
 *
 * // Use the entity manager
 * const user = await UserManager.put(new User({ id: '1', name: 'John' }));
 * ```
 *
 * @see {@link https://blazejkustra.github.io/dynamode/docs/getting_started/introduction} for more information
 */

import * as dynamode from '@lib/module';

export default dynamode;
export * from '@lib/module';
