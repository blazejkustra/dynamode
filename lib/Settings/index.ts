import { getDynamodeStorage } from '@lib/Storage';
import { DefaultError } from '@lib/utils';
import Converter from '@Settings/aws/converter';
import DDB, { DDBInterface } from '@Settings/aws/ddb';

export class Settings {
  static default: Settings = new Settings();

  public converter: typeof Converter;
  public ddb: DDBInterface;

  constructor() {
    this.ddb = DDB();
    this.converter = Converter;
  }

  public setSeparator(separator: string) {
    if (!separator) throw new DefaultError();
    getDynamodeStorage().setSeparator(separator);
  }
}
