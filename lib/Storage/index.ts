import { ColumnMetadata, ColumnType, EntitiesMetadata, EntityMetadata, IndexColumnType, TablesMetadata, TimestampColumnType } from '@lib/Storage/types';

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
  public tableMetadata: TablesMetadata = {};
  public entityMetadata: EntitiesMetadata = {};
  public separator = '#';

  public addPrimaryPartitionKeyMetadata(tableName: string, value: ColumnMetadata<IndexColumnType>) {
    const table = this.getTableMetadata(tableName);
    table.partitionKey = value;
  }

  public addPrimarySortKeyMetadata(tableName: string, value: ColumnMetadata<IndexColumnType>) {
    const table = this.getTableMetadata(tableName);
    table.sortKey = value;
  }

  public addGsiPartitionKeyMetadata(tableName: string, indexName: string, value: ColumnMetadata<IndexColumnType>) {
    const globalSecondaryIndexes = this.getGsiMetadata(tableName, indexName);
    globalSecondaryIndexes.partitionKey = value;
  }

  public addGsiSortKeyMetadata(tableName: string, indexName: string, value: ColumnMetadata<IndexColumnType>) {
    const globalSecondaryIndexes = this.getGsiMetadata(tableName, indexName);
    globalSecondaryIndexes.sortKey = value;
  }

  public addLsiSortKeyMetadata(tableName: string, indexName: string, value: ColumnMetadata<IndexColumnType>) {
    const localSecondaryIndexes = this.getLsiMetadata(tableName, indexName);
    localSecondaryIndexes.sortKey = value;
  }

  public addCreatedAtMetadata(tableName: string, value: ColumnMetadata<TimestampColumnType>) {
    const table = this.getTableMetadata(tableName);
    table.createdAt = value;
  }

  public addUpdatedAtMetadata(tableName: string, value: ColumnMetadata<TimestampColumnType>) {
    const table = this.getTableMetadata(tableName);
    table.updatedAt = value;
  }

  public addEntityMetadata(entityName: string, value: EntityMetadata) {
    const entityMetadata = this.getEntityMetadata(entityName);
    entityMetadata.Entity = entityMetadata.Entity || value.Entity;
    entityMetadata.tableName = entityMetadata.tableName || value.tableName;
  }

  public addEntityColumnMetadata(entityName: string, propertyName: string, value: ColumnMetadata<ColumnType>) {
    const columnMetadata = this.getEntityColumnMetadata(entityName, propertyName);
    columnMetadata.propertyName = columnMetadata.propertyName || value.propertyName;
    columnMetadata.type = columnMetadata.type || value.type;
    columnMetadata.prefix = columnMetadata.prefix || value.prefix;
    columnMetadata.suffix = columnMetadata.suffix || value.suffix;
  }

  // helpers

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

  private getTableMetadata(tableName: string) {
    if (!this.tableMetadata[tableName]) {
      this.tableMetadata[tableName] = {};
    }

    return this.tableMetadata[tableName];
  }

  private getEntityColumnMetadata(entityName: string, columnName: string) {
    const entityMetadata = this.getEntityMetadata(entityName);

    if (!entityMetadata.columns) {
      entityMetadata.columns = {};
    }

    if (!entityMetadata.columns[columnName]) {
      entityMetadata.columns[columnName] = {};
    }

    return entityMetadata.columns[columnName];
  }

  private getEntityMetadata(entityName: string) {
    if (!this.entityMetadata[entityName]) {
      this.entityMetadata[entityName] = {};
    }

    return this.entityMetadata[entityName];
  }
}
