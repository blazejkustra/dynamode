import { AttributeMetadata, AttributeType, EntityMetadata, TablesMetadata } from '@lib/dynamode/storage/types';
import { Entity } from '@lib/entity/types';
import { AttributeMap, DefaultError, mergeObjects, valueFromDynamo } from '@lib/utils';

export default class DynamodeStorage {
  public tables: TablesMetadata = {};

  public convertEntityToAttributeMap<T extends Entity<T>>(dynamoItem?: AttributeMap, tableName?: string): InstanceType<T> | undefined {
    if (!dynamoItem || !tableName) {
      return undefined;
    }

    const entityName = valueFromDynamo(dynamoItem.dynamodeEntity);

    if (typeof entityName !== 'string') {
      throw new DefaultError();
    }

    const { Constructor } = this.getEntityMetadata(tableName, entityName);

    if (!Constructor) {
      throw new DefaultError();
    }

    return Constructor.convertAttributeMapToEntity(dynamoItem);
  }

  public addPrimaryPartitionKeyMetadata(tableName: string, propertyName: string) {
    const table = this.getTableMetadata(tableName);
    table.partitionKey = propertyName;
  }

  public addPrimarySortKeyMetadata(tableName: string, propertyName: string) {
    const table = this.getTableMetadata(tableName);
    table.sortKey = propertyName;
  }

  public addCreatedAtMetadata(tableName: string, propertyName: string) {
    const table = this.getTableMetadata(tableName);
    table.createdAt = propertyName;
  }

  public addUpdatedAtMetadata(tableName: string, propertyName: string) {
    const table = this.getTableMetadata(tableName);
    table.updatedAt = propertyName;
  }

  public addGsiPartitionKeyMetadata(tableName: string, indexName: string, propertyName: string) {
    const globalSecondaryIndexes = this.getGsiMetadata(tableName, indexName);
    globalSecondaryIndexes.partitionKey = propertyName;
  }

  public addGsiSortKeyMetadata(tableName: string, indexName: string, propertyName: string) {
    const globalSecondaryIndexes = this.getGsiMetadata(tableName, indexName);
    globalSecondaryIndexes.sortKey = propertyName;
  }

  public addLsiSortKeyMetadata(tableName: string, indexName: string, propertyName: string) {
    const localSecondaryIndexes = this.getLsiMetadata(tableName, indexName);
    localSecondaryIndexes.sortKey = propertyName;
  }

  public addEntityConstructor(tableName: string, entityName: string, value: EntityMetadata['Constructor']) {
    const entityMetadata = this.getEntityMetadata(tableName, entityName);
    entityMetadata.Constructor = entityMetadata.Constructor || value;
  }

  public addEntityAttributeMetadata(tableName: string, entityName: string, propertyName: string, value: AttributeMetadata<AttributeType>) {
    const attributeMetadata = this.getEntityAttributeMetadata(tableName, entityName, propertyName);
    if (value.propertyName) attributeMetadata.propertyName = value.propertyName;
    if (value.type) attributeMetadata.type = value.type;
    if (value.prefix) attributeMetadata.prefix = value.prefix;
    if (value.suffix) attributeMetadata.suffix = value.suffix;
    if (value.indexName) attributeMetadata.indexName = value.indexName;
  }

  public getEntityAttributes(tableName: string, entityName: string) {
    const entitiesMetadata: EntityMetadata[] = [];
    let constructor = this.getEntityMetadata(tableName, entityName).Constructor;
    while (constructor) {
      const entityMetadata = this.getEntityMetadata(tableName, constructor.name);
      entitiesMetadata.push(entityMetadata);
      constructor = Object.getPrototypeOf(constructor);
    }
    return mergeObjects(...entitiesMetadata.reverse()).attributes || {};
  }

  private getGsiMetadata(tableName: string, indexName: string) {
    const tableMetadata = this.getTableMetadata(tableName);

    if (!tableMetadata.globalSecondaryIndexes) {
      tableMetadata.globalSecondaryIndexes = {};
    }

    if (!tableMetadata.globalSecondaryIndexes[indexName]) {
      tableMetadata.globalSecondaryIndexes[indexName] = {};
    }

    return tableMetadata.globalSecondaryIndexes[indexName];
  }

  private getLsiMetadata(tableName: string, indexName: string) {
    const tableMetadata = this.getTableMetadata(tableName);

    if (!tableMetadata.localSecondaryIndexes) {
      tableMetadata.localSecondaryIndexes = {};
    }

    if (!tableMetadata.localSecondaryIndexes[indexName]) {
      tableMetadata.localSecondaryIndexes[indexName] = {};
    }

    return tableMetadata.localSecondaryIndexes[indexName];
  }

  public getTableMetadata(tableName: string) {
    if (!this.tables[tableName]) {
      this.tables[tableName] = {};
    }

    return this.tables[tableName];
  }

  private getEntityAttributeMetadata(tableName: string, entityName: string, attributeName: string) {
    const entityMetadata = this.getEntityMetadata(tableName, entityName);

    if (!entityMetadata.attributes) {
      entityMetadata.attributes = {};
    }

    if (!entityMetadata.attributes[attributeName]) {
      entityMetadata.attributes[attributeName] = {};
    }

    return entityMetadata.attributes[attributeName];
  }

  private getEntityMetadata(tableName: string, entityName: string) {
    const table = this.getTableMetadata(tableName);

    if (!table.entities) {
      table.entities = {};
    }

    if (!table.entities[entityName]) {
      table.entities[entityName] = {};
    }

    return table.entities[entityName];
  }
}
