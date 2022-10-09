import Converter from '@lib/settings/aws/converter';
import DDB, { DDBInterface } from '@lib/settings/aws/ddb';
import { getDynamodeStorage } from '@lib/storage';
import { DefaultError } from '@lib/utils';

export default class Settings {
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
