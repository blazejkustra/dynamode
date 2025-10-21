/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { describe, expectTypeOf, test } from 'vitest';

import Entity from '@lib/entity';
import { EntitySelectedAttributes } from '@lib/entity/types';

import { MockEntity } from '../fixtures/TestTable';

class User extends Entity {
  id!: string;
  name!: string;
  email!: string;
  age!: number;
  address!: string;
}

class NestedEntity extends Entity {
  id!: string;
  profile!: {
    name: string;
    bio?: string;
  };
  tags!: Array<string>;
  metadata!: Record<string, string>;
}

describe('EntitySelectedAttributes type tests', () => {
  test('Should return full InstanceType<E> when Attributes is undefined', () => {
    type Result = EntitySelectedAttributes<typeof User, undefined>;
    expectTypeOf<Result>().toEqualTypeOf<InstanceType<typeof User>>();
  });

  test('Should return full InstanceType<E> when Attributes is not provided', () => {
    type Result = EntitySelectedAttributes<typeof User>;
    expectTypeOf<Result>().toEqualTypeOf<InstanceType<typeof User>>();
  });

  test('Should return full InstanceType<E> when Attributes is empty array type', () => {
    type Result = EntitySelectedAttributes<typeof User, []>;
    expectTypeOf<Result>().toEqualTypeOf<InstanceType<typeof User>>();
  });

  test('Should narrow to single attribute plus dynamodeEntity', () => {
    type Result = EntitySelectedAttributes<typeof User, ['id']>;

    // Should have these properties
    expectTypeOf<Result>().toHaveProperty('id');
    expectTypeOf<Result>().toHaveProperty('dynamodeEntity');

    // Should NOT have these properties
    expectTypeOf<Result>().not.toHaveProperty('name');
    expectTypeOf<Result>().not.toHaveProperty('email');
    expectTypeOf<Result>().not.toHaveProperty('age');
    expectTypeOf<Result>().not.toHaveProperty('address');
  });

  test('Should narrow to multiple selected attributes plus dynamodeEntity', () => {
    type Result = EntitySelectedAttributes<typeof User, ['id', 'name', 'email']>;

    // Should have these properties
    expectTypeOf<Result>().toHaveProperty('id');
    expectTypeOf<Result>().toHaveProperty('name');
    expectTypeOf<Result>().toHaveProperty('email');
    expectTypeOf<Result>().toHaveProperty('dynamodeEntity');

    // Should NOT have these properties
    expectTypeOf<Result>().not.toHaveProperty('age');
    expectTypeOf<Result>().not.toHaveProperty('address');
  });

  test('Should preserve correct property types in narrowed result', () => {
    type Result = EntitySelectedAttributes<typeof User, ['id', 'age']>;

    expectTypeOf<Result>().toMatchTypeOf<{ id: string; age: number; dynamodeEntity: string }>();
  });

  test('Should work with nested object properties', () => {
    type Result = EntitySelectedAttributes<typeof NestedEntity, ['id', 'profile', 'profile.name']>;

    expectTypeOf<Result>().toHaveProperty('id');
    expectTypeOf<Result>().toHaveProperty('profile');
    expectTypeOf<Result>().toHaveProperty('dynamodeEntity');

    // Should NOT have these
    expectTypeOf<Result>().not.toHaveProperty('tags');
    expectTypeOf<Result>().not.toHaveProperty('metadata');
  });

  test('Should work with array properties', () => {
    type Result = EntitySelectedAttributes<typeof NestedEntity, ['id', 'tags']>;

    expectTypeOf<Result>().toHaveProperty('id');
    expectTypeOf<Result>().toHaveProperty('tags');
    expectTypeOf<Result>().toHaveProperty('dynamodeEntity');

    expectTypeOf<Result>().not.toHaveProperty('profile');
    expectTypeOf<Result>().not.toHaveProperty('metadata');
  });

  test('Should always include dynamodeEntity even if not specified', () => {
    type Result = EntitySelectedAttributes<typeof User, ['id']>;

    expectTypeOf<Result>().toHaveProperty('dynamodeEntity');
    expectTypeOf<Result['dynamodeEntity']>().toEqualTypeOf<string>();
  });

  test('Should work with MockEntity complex structure', () => {
    type Result = EntitySelectedAttributes<
      typeof MockEntity,
      ['partitionKey', 'sortKey', 'string', 'number', 'boolean']
    >;

    // Should have selected properties
    expectTypeOf<Result>().toHaveProperty('partitionKey');
    expectTypeOf<Result>().toHaveProperty('sortKey');
    expectTypeOf<Result>().toHaveProperty('string');
    expectTypeOf<Result>().toHaveProperty('number');
    expectTypeOf<Result>().toHaveProperty('boolean');
    expectTypeOf<Result>().toHaveProperty('dynamodeEntity');

    // Should NOT have unselected properties
    expectTypeOf<Result>().not.toHaveProperty('object');
    expectTypeOf<Result>().not.toHaveProperty('array');
    expectTypeOf<Result>().not.toHaveProperty('map');
    expectTypeOf<Result>().not.toHaveProperty('set');
    expectTypeOf<Result>().not.toHaveProperty('binary');
    expectTypeOf<Result>().not.toHaveProperty('GSI_1_PK');
  });

  test('Should work with all properties selected', () => {
    type Result = EntitySelectedAttributes<typeof User, ['id', 'name', 'email', 'age', 'address']>;

    expectTypeOf<Result>().toHaveProperty('id');
    expectTypeOf<Result>().toHaveProperty('name');
    expectTypeOf<Result>().toHaveProperty('email');
    expectTypeOf<Result>().toHaveProperty('age');
    expectTypeOf<Result>().toHaveProperty('address');
    expectTypeOf<Result>().toHaveProperty('dynamodeEntity');
  });

  test('Should narrow nested object paths correctly', () => {
    type Result = EntitySelectedAttributes<typeof MockEntity, ['object', 'object.optional', 'object.required']>;

    expectTypeOf<Result>().toHaveProperty('object');
    expectTypeOf<Result>().toHaveProperty('dynamodeEntity');

    expectTypeOf<Result>().not.toHaveProperty('string');
    expectTypeOf<Result>().not.toHaveProperty('number');
    expectTypeOf<Result>().not.toHaveProperty('array');
  });

  test('Should work with different attribute types', () => {
    type StringOnly = EntitySelectedAttributes<typeof User, ['name']>;
    expectTypeOf<StringOnly>().toMatchTypeOf<{ name: string; dynamodeEntity: string }>();

    type NumberOnly = EntitySelectedAttributes<typeof User, ['age']>;
    expectTypeOf<NumberOnly>().toMatchTypeOf<{ age: number; dynamodeEntity: string }>();

    type Mixed = EntitySelectedAttributes<typeof User, ['name', 'age']>;
    expectTypeOf<Mixed>().toMatchTypeOf<{ name: string; age: number; dynamodeEntity: string }>();
  });

  test('Should maintain instance type structure', () => {
    type Result = EntitySelectedAttributes<typeof User, ['id', 'name']>;

    // Result should still be an object type
    expectTypeOf<Result>().toBeObject();

    // Should not be the full User instance
    expectTypeOf<Result>().not.toEqualTypeOf<InstanceType<typeof User>>();

    // But should be assignable from a partial User with selected fields
    type Partial = Pick<InstanceType<typeof User>, 'id' | 'name' | 'dynamodeEntity'>;
    expectTypeOf<Result>().toMatchTypeOf<Partial>();
  });
});
