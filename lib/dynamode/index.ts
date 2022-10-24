import Converter from '@lib/dynamode/aws/converter';
import DDB, { DDBType } from '@lib/dynamode/aws/ddb';
import separator, { SeparatorType } from '@lib/dynamode/separator';

class Dynamode {
  static default: Dynamode = new Dynamode();

  public converter: typeof Converter;
  public ddb: DDBType;
  public separator: SeparatorType;

  constructor() {
    this.ddb = DDB();
    this.converter = Converter;
    this.separator = separator;
  }
}

export default Dynamode.default;
