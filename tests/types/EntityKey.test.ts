import { describe, expectTypeOf, test } from 'vitest';

import Entity from '@lib/entity';
import { EntityKey } from '@lib/entity/types';

import { MockEntity } from '../fixtures';

type BaseKeys = 'dynamodeEntity';

type MockEntityDeepKeys =
  | BaseKeys
  | 'string'
  | 'object'
  | 'object.optional'
  | 'object.required'
  | 'object.nestedArray'
  | `object.nestedArray[${bigint}]`
  | `object.nestedArray[${bigint}].date`
  | 'array'
  | `array[${bigint}]`
  | 'map'
  | 'set'
  | 'number'
  | 'boolean'
  | 'strDate'
  | 'numDate'
  | 'binary'
  | 'unsaved'
  | 'partitionKey'
  | 'sortKey'
  | 'GSI_1_PK'
  | 'GSI_2_PK'
  | 'GSI_SK'
  | 'GSI_3_SK'
  | 'LSI_1_SK'
  | 'createdAt'
  | 'updatedAt';

class ArrayEntity extends Entity {
  array!: Array<string>;
}

type ArrayKeys = BaseKeys | 'array' | `array[${bigint}]`;

class MapEntity extends Entity {
  map!: Map<string, string>;
}

type MapKeys = BaseKeys | 'map';

class ObjectEntity extends Entity {
  object!: {
    optional?: string;
    required: string;
    deep: {
      optional?: string;
      required: string;
    };
  };
}

type ObjectKeys =
  | BaseKeys
  | 'object'
  | 'object.optional'
  | 'object.required'
  | 'object.deep'
  | 'object.deep.optional'
  | 'object.deep.required';

class RecordEntity extends Entity {
  record!: Record<string, string>;
}

type RecordKeys = BaseKeys | 'record' | `record.${string}`;

class RecurringEntity extends Entity {
  entity!: RecurringEntity;
}

type RecurringKeys = BaseKeys | 'entity';

describe('EntityKey type tests', () => {
  test('Should return deep keys of all attributes', async () => {
    expectTypeOf<EntityKey<typeof MockEntity>>().toEqualTypeOf<MockEntityDeepKeys>();
    expectTypeOf<EntityKey<typeof ArrayEntity>>().toEqualTypeOf<ArrayKeys>();
    expectTypeOf<EntityKey<typeof MapEntity>>().toEqualTypeOf<MapKeys>();
    expectTypeOf<EntityKey<typeof RecordEntity>>().toEqualTypeOf<RecordKeys>();
    expectTypeOf<EntityKey<typeof ObjectEntity>>().toEqualTypeOf<ObjectKeys>();
    expectTypeOf<EntityKey<typeof RecurringEntity>>().toEqualTypeOf<RecurringKeys>();
  });
});
