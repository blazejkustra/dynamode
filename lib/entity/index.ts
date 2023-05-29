import Dynamode from '@lib/dynamode/index';
import { DYNAMODE_ENTITY } from '@lib/utils';

export default class Entity {
  public readonly dynamodeEntity: string;

  // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  constructor(...args: unknown[]) {}
}

Dynamode.storage.registerAttribute(Entity.name, DYNAMODE_ENTITY, {
  propertyName: DYNAMODE_ENTITY,
  type: String,
  role: DYNAMODE_ENTITY,
});
