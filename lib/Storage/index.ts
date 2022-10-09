import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { Entity } from '@lib/Entity/types';
import { ColumnMetadata, ColumnType, EntityMetadata, TablesMetadata } from '@lib/Storage/types';
import { AttributeMap, DefaultError, mergeObjects, valueFromDynamo } from '@lib/utils';

declare global {
  // eslint-disable-next-line no-var
  var dynamodeStorage: DynamodeStorage | undefined;
}

export function getDynamodeStorage(): DynamodeStorage {
  // we need store metadata storage in a global variable otherwise it brings too much problems
  if (!global.dynamodeStorage) {
    global.dynamodeStorage = new DynamodeStorage();
  }

  return global.dynamodeStorage;
}

class DynamodeStorage {
  public tables: TablesMetadata = {};
  public separator = '#';
  public ddb: DynamoDB;

  public setSeparator(separator: string) {
    this.separator = separator;
  }

  public setDynamoInstance(ddb: DynamoDB) {
    this.ddb = ddb;
  }

  public convertEntityToDynamo<T extends Entity<T>>(dynamoItem?: AttributeMap, tableName?: string): InstanceType<T> | undefined {
    if (!dynamoItem || !tableName) {
      return undefined;
    }

    const entityName = valueFromDynamo(dynamoItem.dynamodeObject);

    if (typeof entityName !== 'string') {
      throw new DefaultError();
    }

    const { Constructor } = this.getEntityMetadata(tableName, entityName);

    if (!Constructor) {
      throw new DefaultError();
    }

    return Constructor.convertEntityFromDynamo(dynamoItem);
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

  public addEntityColumnMetadata(tableName: string, entityName: string, propertyName: string, value: ColumnMetadata<ColumnType>) {
    const columnMetadata = this.getEntityColumnMetadata(tableName, entityName, propertyName);
    if (value.propertyName) columnMetadata.propertyName = value.propertyName;
    if (value.type) columnMetadata.type = value.type;
    if (value.prefix) columnMetadata.prefix = value.prefix;
    if (value.suffix) columnMetadata.suffix = value.suffix;
    if (value.indexName) columnMetadata.indexName = value.indexName;
  }

  // helpers

  public getEntityColumns(tableName: string, entityName: string) {
    const entitiesMetadata: EntityMetadata[] = [];
    let constructor = this.getEntityMetadata(tableName, entityName).Constructor;
    while (constructor) {
      const entityMetadata = this.getEntityMetadata(tableName, constructor.name);
      entitiesMetadata.push(entityMetadata);
      constructor = Object.getPrototypeOf(constructor);
    }
    return mergeObjects(...entitiesMetadata.reverse()).columns || {};
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

  private getEntityColumnMetadata(tableName: string, entityName: string, columnName: string) {
    const entityMetadata = this.getEntityMetadata(tableName, entityName);

    if (!entityMetadata.columns) {
      entityMetadata.columns = {};
    }

    if (!entityMetadata.columns[columnName]) {
      entityMetadata.columns[columnName] = {};
    }

    return entityMetadata.columns[columnName];
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
