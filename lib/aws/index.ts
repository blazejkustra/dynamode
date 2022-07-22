import DDB, { DDBInterface } from './ddb';
import Converter from './converter';

export class AWS {
  static default: AWS = new AWS();

  public converter: typeof Converter;
  public ddb: DDBInterface;

  constructor() {
    this.ddb = DDB();
    this.converter = Converter;
  }
}
