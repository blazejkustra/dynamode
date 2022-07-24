import { Model } from '../Model';
import { Table } from '../Table';

export class Query<M extends typeof Model> {
  table: Table;
  Class: M;

  constructor(model: M) {
    this.table = model.table;
    this.Class = model;
  }

  exec() {
    console.log('table::', this.table?.name);
    console.log('Class::', new this.Class({ x: 'x' } as any));
    console.log();
  }
}
