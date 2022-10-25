import converter from '@lib/dynamode/converter';
import DDB, { DDBType } from '@lib/dynamode/ddb';
import separator, { SeparatorType } from '@lib/dynamode/separator';
import DynamodeStorage from '@lib/dynamode/storage';

class Dynamode {
  static default: Dynamode = new Dynamode();

  public ddb: DDBType;
  public storage: DynamodeStorage;
  public converter: typeof converter;
  public separator: SeparatorType;

  constructor() {
    this.ddb = DDB();
    this.storage = new DynamodeStorage();
    this.converter = converter;
    this.separator = separator;
  }
}

export default Dynamode.default;
