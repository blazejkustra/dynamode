import { MockEntity, MockEntityProps } from '../fixtures/TestTable';

export function mockEntityFactory(props?: Partial<MockEntityProps>): MockEntity {
  return new MockEntity({
    partitionKey: 'PK',
    sortKey: 'SK',
    string: 'string',
    number: 1,
    object: {
      required: 2,
    },
    map: new Map([['1', '2']]),
    set: new Set(['1', '2', '3']),
    array: ['1', '2'],
    boolean: true,
    binary: new Uint8Array([1, 2, 3]),
    ...props,
  });
}
