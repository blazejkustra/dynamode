import { describe, expectTypeOf, test } from 'vitest';

import { EntityValue } from '@lib/entity/types';

import { MockEntity, Property } from '../fixtures/TestTable';

type DynamodeEntityValue = EntityValue<typeof MockEntity, 'dynamodeEntity'>;
type StringValue = EntityValue<typeof MockEntity, 'string'>;
type ObjectValue = EntityValue<typeof MockEntity, 'object'>;
type ObjectOptionalValue = EntityValue<typeof MockEntity, 'object.optional'>;
type ObjectRequiredValue = EntityValue<typeof MockEntity, 'object.required'>;
type ObjectNestedArray = EntityValue<typeof MockEntity, 'object.nestedArray'>;
type ObjectNestedArrayElement = EntityValue<typeof MockEntity, 'object.nestedArray[0]'>;
type ObjectNestedArrayElementValue = EntityValue<typeof MockEntity, 'object.nestedArray[100].date'>;
type ArrayValue = EntityValue<typeof MockEntity, 'array'>;
type ArrayBigIntValue = EntityValue<typeof MockEntity, `array[${bigint}]`>;
type MapValue = EntityValue<typeof MockEntity, 'map'>;
type SetValue = EntityValue<typeof MockEntity, 'set'>;
type NumberValue = EntityValue<typeof MockEntity, 'number'>;
type BooleanValue = EntityValue<typeof MockEntity, 'boolean'>;
type StrDateValue = EntityValue<typeof MockEntity, 'strDate'>;
type NumDateValue = EntityValue<typeof MockEntity, 'numDate'>;
type BinaryValue = EntityValue<typeof MockEntity, 'binary'>;
type UnsavedValue = EntityValue<typeof MockEntity, 'unsaved'>;
type PartitionKeyValue = EntityValue<typeof MockEntity, 'partitionKey'>;
type SortKeyValue = EntityValue<typeof MockEntity, 'sortKey'>;
type GSI_1_PKValue = EntityValue<typeof MockEntity, 'GSI_1_PK'>;
type GSI_SKValue = EntityValue<typeof MockEntity, 'GSI_SK'>;
type LSI_1_SKValue = EntityValue<typeof MockEntity, 'LSI_1_SK'>;
type CreatedAtValue = EntityValue<typeof MockEntity, 'createdAt'>;
type UpdatedAtValue = EntityValue<typeof MockEntity, 'updatedAt'>;

describe('EntityValue type tests', () => {
  test('Should return value types of all attributes', async () => {
    expectTypeOf<DynamodeEntityValue>().toEqualTypeOf<string>();
    expectTypeOf<StringValue>().toEqualTypeOf<string>();
    expectTypeOf<ObjectValue>().toEqualTypeOf<{
      optional?: string | undefined;
      required: number;
      nestedArray?: Property[] | undefined;
    }>();
    expectTypeOf<ObjectOptionalValue>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ObjectRequiredValue>().toEqualTypeOf<number>();
    expectTypeOf<ObjectNestedArray>().toEqualTypeOf<Property[] | undefined>();
    expectTypeOf<ObjectNestedArrayElement>().toEqualTypeOf<Property>();
    expectTypeOf<ObjectNestedArrayElementValue>().toEqualTypeOf<Date>();
    expectTypeOf<ArrayValue>().toEqualTypeOf<string[] | undefined>();
    expectTypeOf<ArrayBigIntValue>().toEqualTypeOf<string>();
    expectTypeOf<MapValue>().toEqualTypeOf<Map<string, string>>();
    expectTypeOf<SetValue>().toEqualTypeOf<Set<string>>();
    expectTypeOf<NumberValue>().toEqualTypeOf<number | undefined>();
    expectTypeOf<BooleanValue>().toEqualTypeOf<boolean>();
    expectTypeOf<StrDateValue>().toEqualTypeOf<Date>();
    expectTypeOf<NumDateValue>().toEqualTypeOf<Date>();
    expectTypeOf<BinaryValue>().toEqualTypeOf<Uint8Array>();
    expectTypeOf<UnsavedValue>().toEqualTypeOf<string>();
    expectTypeOf<PartitionKeyValue>().toEqualTypeOf<string>();
    expectTypeOf<SortKeyValue>().toEqualTypeOf<string>();
    expectTypeOf<GSI_1_PKValue>().toEqualTypeOf<string | undefined>();
    expectTypeOf<GSI_SKValue>().toEqualTypeOf<number | undefined>();
    expectTypeOf<LSI_1_SKValue>().toEqualTypeOf<number | undefined>();
    expectTypeOf<CreatedAtValue>().toEqualTypeOf<Date>();
    expectTypeOf<UpdatedAtValue>().toEqualTypeOf<Date>();
  });
});
