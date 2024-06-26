import {
  validateDecoratedAttribute,
  validateMetadataAttribute,
  validateMetadataUniqueness,
} from '@lib/dynamode/storage/helpers/validator';
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
import { DynamodeStorageError, mergeObjects, ValidationError } from '@lib/utils';

export default class DynamodeStorage {
  public tables: TablesMetadata = {};
  public entities: EntitiesMetadata = {};

  public registerTable(tableEntity: typeof Entity, metadata: Metadata<typeof Entity>): void {
    const tableMetadata: TableMetadata = {
      tableEntity,
      metadata,
    };

    if (this.tables[metadata.tableName]) {
      throw new DynamodeStorageError(`Table "${metadata.tableName}" already registered`);
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
      throw new DynamodeStorageError(`Table "${tableName}" not registered`);
    }

    if (existingEntityMetadata?.entity || existingEntityMetadata?.tableName) {
      throw new DynamodeStorageError(`Entity "${entity.name}" already registered`);
    }

    this.entities[entity.name] = entityMetadata;
  }

  public registerAttribute(entityName: string, propertyName: string, value: AttributeMetadata): void {
    if (!this.entities[entityName]) {
      this.entities[entityName] = { attributes: {} } as EntityMetadata;
    }

    const attributeMetadata = this.entities[entityName].attributes[propertyName];

    if (attributeMetadata && (attributeMetadata.role !== 'index' || value.role !== 'index')) {
      throw new DynamodeStorageError(`Attribute "${propertyName}" was already decorated in entity "${entityName}"`);
    }

    if (attributeMetadata && attributeMetadata.role === 'index' && value.role === 'index') {
      return void attributeMetadata.indexes.push(...value.indexes);
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

  public getEntityClass(entityName: string): typeof Entity {
    const entityMetadata = this.entities[entityName];

    if (!entityMetadata) {
      throw new DynamodeStorageError(`Invalid entity name "${entityName}"`);
    }

    if (!entityMetadata.entity) {
      throw new DynamodeStorageError(
        `Entity "${entityName}" not registered, use TableManager.entityManager(${entityName}) first.`,
      );
    }

    return entityMetadata.entity;
  }

  public getEntityTableName(entityName: string): string {
    if (!this.entities[entityName]) {
      throw new DynamodeStorageError(`Invalid entity name "${entityName}`);
    }

    return this.entities[entityName].tableName;
  }

  public getEntityMetadata(entityName: string): Metadata<typeof Entity> {
    if (!this.entities[entityName]) {
      throw new DynamodeStorageError(`Invalid entity name "${entityName}`);
    }

    const { tableName } = this.entities[entityName];

    if (!this.tables[tableName]) {
      throw new DynamodeStorageError(`Invalid table name "${tableName}`);
    }

    return this.tables[tableName].metadata;
  }

  public validateTableMetadata(entityName: string): void {
    const metadata = this.getEntityMetadata(entityName);
    const attributes = this.getEntityAttributes(entityName);

    // Validate metadata
    validateMetadataUniqueness(entityName, metadata);

    // Validate decorated attributes
    Object.entries(attributes).forEach(([name, attribute]) =>
      validateDecoratedAttribute({ name, attribute, metadata, entityName }),
    );

    // Validate table partition key
    validateMetadataAttribute({ name: metadata.partitionKey, attributes, role: 'partitionKey', entityName });

    // Validate table sort key
    if (metadata.sortKey) {
      validateMetadataAttribute({ name: metadata.sortKey, attributes, role: 'sortKey', entityName });
    }

    // Validate table timestamps
    if (metadata.createdAt) {
      validateMetadataAttribute({ name: metadata.createdAt, attributes, role: 'date', entityName });
    }
    if (metadata.updatedAt) {
      validateMetadataAttribute({ name: metadata.updatedAt, attributes, role: 'date', entityName });
    }

    // Validate table indexes
    Object.entries(metadata.indexes ?? {}).forEach(([indexName, index]) => {
      if (!index.partitionKey && !index.sortKey) {
        throw new ValidationError(
          `Index "${indexName}" should have a partition key or a sort key in "${entityName}" Entity.`,
        );
      }

      // Validate GSI
      if (index.partitionKey) {
        validateMetadataAttribute({
          name: index.partitionKey,
          attributes,
          role: 'index',
          indexName,
          entityName,
        });

        if (index.sortKey) {
          validateMetadataAttribute({ name: index.sortKey, attributes, role: 'index', indexName, entityName });
        }
      }

      // Validate LSI
      if (index.sortKey && !index.partitionKey) {
        validateMetadataAttribute({ name: index.sortKey, attributes, role: 'index', indexName, entityName });
      }
    });
  }
}
