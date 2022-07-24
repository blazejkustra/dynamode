import Converter from '@aws/converter';
import DDB, { DDBInterface } from '@aws/ddb';

export class AWS {
  static default: AWS = new AWS();

  public converter: typeof Converter;
  public ddb: DDBInterface;

  constructor() {
    this.ddb = DDB();
    this.converter = Converter;
  }
}
