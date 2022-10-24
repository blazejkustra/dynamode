import Converter from '@lib/dynamode/aws/converter';
import DDB, { DDBType } from '@lib/dynamode/aws/ddb';
import { getDynamodeStorage } from '@lib/storage';
import { DefaultError } from '@lib/utils';

class Dynamode {
  static default: Dynamode = new Dynamode();

  public converter: typeof Converter;
  public ddb: DDBType;

  constructor() {
    this.ddb = DDB();
    this.converter = Converter;
  }

  public setSeparator(separator: string) {
    if (!separator) throw new DefaultError();
    getDynamodeStorage().setSeparator(separator);
  }
}

export default Dynamode.default;
