import type {
  AttributeMetadata,
  AttributesMetadata,
  EntitiesMetadata,
  EntityMetadata,
  TableMetadata,
  TablesMetadata,
} from '@lib/dynamode/storage/types';
import Entity from '@lib/entity';
import { Metadata } from '@lib/table/types';
import { mergeObjects } from '@lib/utils';

import { DefaultError } from './../../utils/errors';

export default class DynamodeStorage {
  public tables: TablesMetadata = {};
  public entities: EntitiesMetadata = {};

  public registerTable(tableEntity: typeof Entity, metadata: Metadata): void {
    const tableMetadata: TableMetadata = {
      tableEntity,
      metadata,
      attributes: {},
    };

    if (this.tables[metadata.tableName]) {
      throw new DefaultError();
    }

    this.tables[metadata.tableName] = tableMetadata;
  }

  public registerEntity(entity: typeof Entity, tableName: string): void {
    const existingEntityMetadata = this.entities[entity.name];
    const entityMetadata: EntityMetadata = {
      entity,
      tableName,
      attributes: existingEntityMetadata?.attributes || {},
    };

    if (!this.tables[tableName]) {
      throw new DefaultError('2');
    }

    if (existingEntityMetadata?.entity || existingEntityMetadata?.tableName) {
      throw new DefaultError('1');
    }

    this.entities[entity.name] = entityMetadata;
  }

  public registerAttribute(entityName: string, propertyName: string, value: AttributeMetadata): void {
    if (!this.entities[entityName]) {
      this.entities[entityName] = { attributes: {} } as EntityMetadata;
    }

    if (this.entities[entityName].attributes[propertyName]) {
      throw new DefaultError();
    }

    this.entities[entityName].attributes[propertyName] = value;
  }

  public updateAttributePrefix(entityName: string, propertyName: string, value: string): void {
    const attributeMetadata = this.entities[entityName].attributes[propertyName];
    attributeMetadata.prefix = value;
  }

  public updateAttributeSuffix(entityName: string, propertyName: string, value: string): void {
    const attributeMetadata = this.entities[entityName].attributes[propertyName];
    attributeMetadata.suffix = value;
  }

  public getEntityAttributes(entityName: string): AttributesMetadata {
    const entitiesAttributes: AttributesMetadata[] = [];
    let constructor = this.entities[entityName]?.entity;

    while (constructor) {
      if (!constructor.name || !this.entities[constructor.name]) {
        break;
      }

      const attributes = this.entities[constructor.name].attributes;
      entitiesAttributes.push(attributes);
      constructor = Object.getPrototypeOf(constructor);
    }

    return mergeObjects(...entitiesAttributes.reverse());
  }

  public getEntityTableName(entityName: string): string {
    if (!this.entities[entityName]) {
      throw new DefaultError();
    }

    return this.entities[entityName].tableName;
  }

  public getEntityMetadata(entityName: string): Metadata {
    if (!this.entities[entityName]) {
      throw new DefaultError();
    }

    const { tableName } = this.entities[entityName];

    if (!this.tables[tableName]) {
      throw new DefaultError();
    }

    return this.tables[tableName].metadata;
  }
}
