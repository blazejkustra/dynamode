import Dynamode from '@lib/dynamode/index';
import { DYNAMODE_ENTITY } from '@lib/utils';

export default class Entity {
  public readonly dynamodeEntity!: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  constructor(...args: unknown[]) {
    this.dynamodeEntity = this.constructor.name;
  }
}

Dynamode.storage.registerAttribute(Entity.name, DYNAMODE_ENTITY, {
  propertyName: DYNAMODE_ENTITY,
  type: String,
  role: DYNAMODE_ENTITY,
});
