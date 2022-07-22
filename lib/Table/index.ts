import { TableDescription, DynamoDB } from '@aws-sdk/client-dynamodb';
import { GlobalIndex, LocalIndex, PrimaryKey } from './types';
import { getTableDetails, getTableGlobalIndexes, getTableLocalIndexes, getTablePrimaryKey } from './utils';

/* Represents a single DynamoDB table */
export class Table {
  name: string;
  primaryKey: PrimaryKey;
  globalSecondaryIndexes: GlobalIndex[];
  localSecondaryIndexes: LocalIndex[];

  private ddb: DynamoDB;
  private tableDescription: TableDescription;
  private pendingTasks: Array<Promise<unknown>> = [];

  _ready = false;

  constructor(ddb: DynamoDB, name: string) {
    this.name = name;
    this.ddb = ddb;

    const getTableDetailsPromise = getTableDetails(this.ddb, name).then(async (tableDescription) => {
      this.tableDescription = tableDescription;

      this.primaryKey = getTablePrimaryKey(this.tableDescription);
      this.globalSecondaryIndexes = getTableGlobalIndexes(this.tableDescription);
      this.localSecondaryIndexes = getTableLocalIndexes(this.tableDescription);
    });

    this.pendingTasks.push(getTableDetailsPromise);
  }

  async wait() {
    await Promise.all(this.pendingTasks);
    this.pendingTasks = [];
    this._ready = true;
  }
}
