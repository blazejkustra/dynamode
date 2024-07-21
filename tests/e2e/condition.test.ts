import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { AttributeType } from '@lib/condition';

import { mockDate, MockEntityManager, TEST_TABLE_NAME, TestTableManager } from '../fixtures/TestTable';

import { mockEntityFactory } from './mockEntityFactory';

describe.sequential('EntityManager.condition', () => {
  beforeAll(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    await TestTableManager.createTable();
  });

  afterAll(async () => {
    await TestTableManager.deleteTable(TEST_TABLE_NAME);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe.sequential('MockEntityManager', () => {
    test('All conditions should fail', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });
      await MockEntityManager.put(mock);

      const conditionsToFail = [
        // string
        MockEntityManager.condition().attribute('string').eq('anything'),
        MockEntityManager.condition().attribute('string').ne('string'),
        MockEntityManager.condition().attribute('string').lt('string'),
        MockEntityManager.condition().attribute('string').le('str'),
        MockEntityManager.condition().attribute('string').gt('string'),
        MockEntityManager.condition().attribute('string').ge('ttring'),
        MockEntityManager.condition().attribute('string').beginsWith('any'),
        MockEntityManager.condition().attribute('string').between('a', 'c'),
        MockEntityManager.condition().attribute('string').in(['anything', 'anything2']),
        MockEntityManager.condition().attribute('string').in([]),
        MockEntityManager.condition().attribute('string').not().in(['string', 'string2']),
        MockEntityManager.condition().attribute('string').not().eq('string'),
        MockEntityManager.condition().attribute('string').not().ne('anything'),
        MockEntityManager.condition().attribute('string').not().lt('ttring'),
        MockEntityManager.condition().attribute('string').not().le('string'),
        MockEntityManager.condition().attribute('string').not().gt('str'),
        MockEntityManager.condition().attribute('string').not().ge('string'),
        MockEntityManager.condition().attribute('string').not().exists(),
        MockEntityManager.condition().attribute('object.optional').exists(),
        MockEntityManager.condition().attribute('string').size().eq(0),
        MockEntityManager.condition().attribute('string').size().ne(6),
        MockEntityManager.condition().attribute('string').size().lt(0),
        MockEntityManager.condition().attribute('string').size().le(5),
        MockEntityManager.condition().attribute('string').size().gt(6),
        MockEntityManager.condition().attribute('string').size().ge(7),

        // number
        MockEntityManager.condition().attribute('number').eq(0),
        MockEntityManager.condition().attribute('number').ne(1),
        MockEntityManager.condition().attribute('number').lt(1),
        MockEntityManager.condition().attribute('number').le(0),
        MockEntityManager.condition().attribute('number').gt(1),
        MockEntityManager.condition().attribute('number').ge(2),
        MockEntityManager.condition().attribute('number').between(2, 4),
        MockEntityManager.condition().attribute('number').in([0]),
        MockEntityManager.condition().attribute('number').not().in([1]),
        MockEntityManager.condition().attribute('number').type(AttributeType.String),

        // array
        MockEntityManager.condition().attribute('array').contains(['4']),
        MockEntityManager.condition().attribute('array').not().contains(['1']),

        // set
        MockEntityManager.condition()
          .attribute('set')
          .contains(new Set(['4'])),
        MockEntityManager.condition()
          .attribute('set')
          .not()
          .contains(new Set(['1'])),
      ];

      // Act & Assert
      for (const condition of conditionsToFail) {
        await expect(MockEntityManager.put(mock, { condition })).rejects.toThrow('The conditional request failed');
      }
    });

    test('All conditions should pass', async () => {
      // Arrange
      const mock = mockEntityFactory({ partitionKey: 'PK1', sortKey: 'SK1' });

      const conditionsToPass = [
        // string
        MockEntityManager.condition().attribute('string').exists(),
        MockEntityManager.condition().attribute('string').size().eq(6),
        MockEntityManager.condition().attribute('string').beginsWith('str'),
        MockEntityManager.condition().attribute('object.optional').not().exists(),

        // number
        MockEntityManager.condition().attribute('number').exists(),
        MockEntityManager.condition().attribute('number').between(0, 2),
        MockEntityManager.condition().attribute('number').in([1]),
        MockEntityManager.condition().attribute('number').not().in([0]),
        MockEntityManager.condition().attribute('string').not().in([]),

        // boolean
        MockEntityManager.condition().attribute('boolean').exists(),
        MockEntityManager.condition().attribute('boolean').eq(true),
        MockEntityManager.condition().attribute('boolean').not().eq(false),

        // type
        MockEntityManager.condition().attribute('string').type(AttributeType.String),
        MockEntityManager.condition().attribute('number').type(AttributeType.Number),
        MockEntityManager.condition().attribute('boolean').type(AttributeType.Boolean),
        MockEntityManager.condition().attribute('array').type(AttributeType.List),
        MockEntityManager.condition().attribute('set').type(AttributeType.StringSet),
        MockEntityManager.condition().attribute('map').type(AttributeType.Map),

        // array
        MockEntityManager.condition().attribute('array').contains(['1']),
        MockEntityManager.condition().attribute('array').not().contains(['4']),

        // set
        MockEntityManager.condition()
          .attribute('set')
          .contains(new Set(['1'])),
        MockEntityManager.condition()
          .attribute('set')
          .not()
          .contains(new Set(['4'])),

        // map
        MockEntityManager.condition()
          .attribute('map')
          .eq(new Map([['1', '2']])),

        // composite
        MockEntityManager.condition().attribute('string').eq('string').and.attribute('number').eq(1),
        MockEntityManager.condition().attribute('string').eq('string').or.attribute('number').eq(0),
        MockEntityManager.condition().attribute('string').eq('string').and.attribute('number').not().eq(0),
        MockEntityManager.condition()
          .attribute('string')
          .eq('string')
          .and.parenthesis(MockEntityManager.condition().attribute('number').eq(0).or.attribute('number').eq(1)),
      ];

      // Act & Assert
      for (const condition of conditionsToPass) {
        await MockEntityManager.put(mock);
        await expect(MockEntityManager.put(mock, { condition })).resolves.toEqual(mock);
      }
    });
  });
});
