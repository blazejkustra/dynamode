import { describe, expect, test, vi } from 'vitest';

import { AttributeType } from '@lib/condition';
import { attribute } from '@lib/decorators';
import Entity from '@lib/entity';
import { BASE_OPERATOR, OPERATORS } from '@lib/utils';

//FIX this and instead use tests/mocks.ts
class MockEntity extends Entity('tableName') {
  @attribute(String)
  key: string;

  @attribute(String, { prefix: 'PREFIX' })
  prefixedKey: string;

  @attribute(Set)
  set: Set<string>;
}

describe('Condition', () => {
  test('Should be able to initialize condition', async () => {
    const condition1 = MockEntity.condition();
    expect(condition1['operators']).toEqual([]);
    expect(condition1['entity']).toEqual(MockEntity);
    expect(condition1['logicalOperator']).toEqual(BASE_OPERATOR.and);

    //FIX this
    // const condition2 = new Condition(MockEntity);
    // expect(condition2['operators']).toEqual([]);
    // expect(condition2['entity']).toEqual(MockEntity);
    // expect(condition2['logicalOperator']).toEqual(BASE_OPERATOR.and);
  });

  describe('attribute', () => {
    test('Should call maybePushLogicalOperator on each use', async () => {
      const condition = MockEntity.condition();
      const maybePushLogicalOperatorSpy = vi.spyOn(condition, 'maybePushLogicalOperator' as any);

      condition.attribute('key');
      expect(maybePushLogicalOperatorSpy).toBeCalled();
    });

    describe('Methods', () => {
      describe('eq', () => {
        test('Should call Condition.eq', async () => {
          const condition = MockEntity.condition();
          const eqSpy = vi.spyOn(condition, 'eq' as any);

          condition.attribute('key').eq('value');
          expect(eqSpy).toBeCalled();
        });
      });

      describe('ne', () => {
        test('Should call Condition.ne', async () => {
          const condition = MockEntity.condition();
          const neSpy = vi.spyOn(condition, 'ne' as any);

          condition.attribute('key').ne('value');
          expect(neSpy).toBeCalled();
        });
      });

      describe('lt', () => {
        test('Should call Condition.lt', async () => {
          const condition = MockEntity.condition();
          const ltSpy = vi.spyOn(condition, 'lt' as any);

          condition.attribute('key').lt('value');
          expect(ltSpy).toBeCalled();
        });
      });

      describe('le', () => {
        test('Should call Condition.le', async () => {
          const condition = MockEntity.condition();
          const leSpy = vi.spyOn(condition, 'le' as any);

          condition.attribute('key').le('value');
          expect(leSpy).toBeCalled();
        });
      });

      describe('gt', () => {
        test('Should call Condition.gt', async () => {
          const condition = MockEntity.condition();
          const gtSpy = vi.spyOn(condition, 'gt' as any);

          condition.attribute('key').gt('value');
          expect(gtSpy).toBeCalled();
        });
      });

      describe('ge', () => {
        test('Should call Condition.ge', async () => {
          const condition = MockEntity.condition();
          const geSpy = vi.spyOn(condition, 'ge' as any);

          condition.attribute('key').ge('value');
          expect(geSpy).toBeCalled();
        });
      });

      describe('beginsWith', () => {
        test('Should call Condition.beginsWith', async () => {
          const condition = MockEntity.condition();
          const beginsWithSpy = vi.spyOn(condition, 'beginsWith' as any);

          condition.attribute('key').beginsWith('value');
          expect(beginsWithSpy).toBeCalled();
        });
      });

      describe('between', () => {
        test('Should call Condition.between', async () => {
          const condition = MockEntity.condition();
          const betweenSpy = vi.spyOn(condition, 'between' as any);

          condition.attribute('key').between('value1', 'value2');
          expect(betweenSpy).toBeCalled();
        });
      });

      describe('contains', () => {
        test('Should push contains expression', async () => {
          const condition = MockEntity.condition();
          condition.attribute('key').contains('value');

          expect(condition['operators']).toEqual([...OPERATORS.contains('key', 'value')]);
        });

        test('Should push contains expression with prefix', async () => {
          const condition = MockEntity.condition();
          condition.attribute('prefixedKey').contains('value');

          expect(condition['operators']).toEqual([...OPERATORS.contains('prefixedKey', 'PREFIX#value')]);
        });
      });

      describe('in', () => {
        test('Should push in expression', async () => {
          const condition = MockEntity.condition();
          condition.attribute('key').in(['value1', 'value2']);

          expect(condition['operators']).toEqual([...OPERATORS.in('key', ['value1', 'value2'])]);
        });

        test('Should push in expression with prefix', async () => {
          const condition = MockEntity.condition();
          condition.attribute('prefixedKey').in(['value1', 'value2']);

          expect(condition['operators']).toEqual([...OPERATORS.in('prefixedKey', ['PREFIX#value1', 'PREFIX#value2'])]);
        });
      });

      describe('type', () => {
        test('Should push attributeType expression', async () => {
          const condition = MockEntity.condition();
          condition.attribute('key').type(AttributeType.String);

          expect(condition['operators']).toEqual([...OPERATORS.attributeType('key', 'S')]);
        });
      });

      describe('exists', () => {
        test('Should push attributeExists expression', async () => {
          const condition = MockEntity.condition();
          condition.attribute('key').exists();

          expect(condition['operators']).toEqual([...OPERATORS.attributeExists('key')]);
        });
      });

      describe('size', () => {
        describe('eq', () => {
          test('Should push size equality expression', async () => {
            const condition = MockEntity.condition();
            condition.attribute('key').size().eq(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeEq('key', 100)]);
          });
        });

        describe('ne', () => {
          test('Should push size negated equality expression', async () => {
            const condition = MockEntity.condition();
            condition.attribute('key').size().ne(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeNe('key', 100)]);
          });
        });

        describe('lt', () => {
          test('Should push size less than expression', async () => {
            const condition = MockEntity.condition();
            condition.attribute('key').size().lt(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeLt('key', 100)]);
          });
        });

        describe('le', () => {
          test('Should push size less than or equal expression', async () => {
            const condition = MockEntity.condition();
            condition.attribute('key').size().le(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeLe('key', 100)]);
          });
        });

        describe('gt', () => {
          test('Should push size greater than expression', async () => {
            const condition = MockEntity.condition();
            condition.attribute('key').size().gt(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeGt('key', 100)]);
          });
        });

        describe('ge', () => {
          test('Should push size greater than or equal expression', async () => {
            const condition = MockEntity.condition();
            condition.attribute('key').size().ge(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeGe('key', 100)]);
          });
        });
      });

      describe('not', () => {
        describe('eq', () => {
          test('Should call Condition.not().ne', async () => {
            const condition = MockEntity.condition();
            const neSpy = vi.spyOn(condition, 'ne' as any);

            condition.attribute('key').not().eq('value');
            expect(neSpy).toBeCalled();
          });
        });

        describe('ne', () => {
          test('Should call Condition.not().ne', async () => {
            const condition = MockEntity.condition();
            const eqSpy = vi.spyOn(condition, 'eq' as any);

            condition.attribute('key').not().ne('value');
            expect(eqSpy).toBeCalled();
          });
        });

        describe('lt', () => {
          test('Should call Condition.not().lt', async () => {
            const condition = MockEntity.condition();
            const geSpy = vi.spyOn(condition, 'ge' as any);

            condition.attribute('key').not().lt('value');
            expect(geSpy).toBeCalled();
          });
        });

        describe('le', () => {
          test('Should call Condition.not().le', async () => {
            const condition = MockEntity.condition();
            const gtSpy = vi.spyOn(condition, 'gt' as any);

            condition.attribute('key').not().le('value');
            expect(gtSpy).toBeCalled();
          });
        });

        describe('gt', () => {
          test('Should call Condition.not().gt', async () => {
            const condition = MockEntity.condition();
            const leSpy = vi.spyOn(condition, 'le' as any);

            condition.attribute('key').not().gt('value');
            expect(leSpy).toBeCalled();
          });
        });

        describe('ge', () => {
          test('Should call Condition.not().ge', async () => {
            const condition = MockEntity.condition();
            const ltSpy = vi.spyOn(condition, 'lt' as any);

            condition.attribute('key').not().ge('value');
            expect(ltSpy).toBeCalled();
          });
        });

        describe('contains', () => {
          test('Should push contains expression', async () => {
            const condition = MockEntity.condition();
            condition.attribute('key').not().contains('value');

            expect(condition['operators']).toEqual([...OPERATORS.notContains('key', 'value')]);
          });

          test('Should push contains expression with prefix', async () => {
            const condition = MockEntity.condition();
            condition.attribute('prefixedKey').not().contains('value');

            expect(condition['operators']).toEqual([...OPERATORS.notContains('prefixedKey', 'PREFIX#value')]);
          });
        });

        describe('in', () => {
          test('Should push in expression', async () => {
            const condition = MockEntity.condition();
            condition.attribute('key').not().in(['value1', 'value2']);

            expect(condition['operators']).toEqual([...OPERATORS.notIn('key', ['value1', 'value2'])]);
          });

          test('Should push in expression with prefix', async () => {
            const condition = MockEntity.condition();
            condition.attribute('prefixedKey').not().in(['value1', 'value2']);

            expect(condition['operators']).toEqual([...OPERATORS.notIn('prefixedKey', ['PREFIX#value1', 'PREFIX#value2'])]);
          });
        });

        describe('exists', () => {
          test('Should push attributeExists expression', async () => {
            const condition = MockEntity.condition();
            condition.attribute('key').not().exists();

            expect(condition['operators']).toEqual([...OPERATORS.attributeNotExists('key')]);
          });
        });
      });
    });
  });

  describe('parenthesis', () => {
    test('Should not add parenthesis if undefined condition is passed as argument', async () => {
      const condition = MockEntity.condition().parenthesis(undefined);

      expect(condition['operators']).toEqual([]);
    });

    test('Should add parenthesis if defined condition is passed as argument', async () => {
      const innerCondition = MockEntity.condition();
      const condition = MockEntity.condition();
      innerCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.parenthesis(innerCondition);
      expect(condition['operators']).toEqual([BASE_OPERATOR.leftParenthesis, ...innerCondition['operators'], BASE_OPERATOR.rightParenthesis]);
    });

    test('Should add parenthesis if defined condition is passed as argument + should add logical operator', async () => {
      const innerCondition = MockEntity.condition();
      const condition = MockEntity.condition();
      condition['operators'].push(BASE_OPERATOR.contains);
      innerCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.parenthesis(innerCondition);
      expect(condition['operators']).toEqual([BASE_OPERATOR.contains, BASE_OPERATOR.space, BASE_OPERATOR.and, BASE_OPERATOR.space, BASE_OPERATOR.leftParenthesis, ...innerCondition['operators'], BASE_OPERATOR.rightParenthesis]);
    });
  });

  describe('group', () => {
    test('Should not add parenthesis if undefined condition is passed as argument', async () => {
      const condition = MockEntity.condition().group(undefined);

      expect(condition['operators']).toEqual([]);
    });

    test('Should add parenthesis if defined condition is passed as argument', async () => {
      const innerCondition = MockEntity.condition();
      const condition = MockEntity.condition();
      innerCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.group(innerCondition);
      expect(condition['operators']).toEqual([BASE_OPERATOR.leftParenthesis, ...innerCondition['operators'], BASE_OPERATOR.rightParenthesis]);
    });

    test('Should add parenthesis if defined condition is passed as argument + should add logical operator', async () => {
      const innerCondition = MockEntity.condition();
      const condition = MockEntity.condition();
      condition['operators'].push(BASE_OPERATOR.contains);
      innerCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.group(innerCondition);
      expect(condition['operators']).toEqual([BASE_OPERATOR.contains, BASE_OPERATOR.space, BASE_OPERATOR.and, BASE_OPERATOR.space, BASE_OPERATOR.leftParenthesis, ...innerCondition['operators'], BASE_OPERATOR.rightParenthesis]);
    });
  });

  describe('condition', () => {
    test('Should not join conditions if undefined condition is passed as argument', async () => {
      const condition = MockEntity.condition().group(undefined);

      expect(condition['operators']).toEqual([]);
    });

    test('Should join conditions if defined condition is passed as argument', async () => {
      const otherCondition = MockEntity.condition();
      const condition = MockEntity.condition();
      otherCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.condition(otherCondition);
      expect(condition['operators']).toEqual([...otherCondition['operators']]);
    });

    test('Should join conditions if defined condition is passed as argument + should add logical operator', async () => {
      const otherCondition = MockEntity.condition();
      const condition = MockEntity.condition();
      condition['operators'].push(BASE_OPERATOR.contains);
      otherCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.condition(otherCondition);
      expect(condition['operators']).toEqual([BASE_OPERATOR.contains, BASE_OPERATOR.space, BASE_OPERATOR.and, BASE_OPERATOR.space, ...otherCondition['operators']]);
    });
  });

  describe('and', () => {
    test('Should set logicalOperator to "AND"', async () => {
      const condition = MockEntity.condition();
      condition['logicalOperator'] = BASE_OPERATOR.or;

      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.or);
      condition.and;
      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.and);
    });
  });

  describe('or', () => {
    test('Should set logicalOperator to "OR"', async () => {
      const condition = MockEntity.condition();
      condition['logicalOperator'] = BASE_OPERATOR.and;

      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.and);
      condition.or;
      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.or);
    });
  });

  describe('eq', () => {
    test('Should push equality expression', async () => {
      const condition = MockEntity.condition();
      condition['eq'](condition['operators'], 'key', 'value');

      expect(condition['operators']).toEqual([{ key: 'key' }, BASE_OPERATOR.space, BASE_OPERATOR.eq, BASE_OPERATOR.space, { key: 'key', value: 'value' }]);
    });

    test('Should push equality expression with prefix', async () => {
      const condition = MockEntity.condition();
      condition['eq'](condition['operators'], 'prefixedKey', 'value');

      expect(condition['operators']).toEqual([{ key: 'prefixedKey' }, BASE_OPERATOR.space, BASE_OPERATOR.eq, BASE_OPERATOR.space, { key: 'prefixedKey', value: 'PREFIX#value' }]);
    });
  });

  describe('ne', () => {
    test('Should push negated equality expression', async () => {
      const condition = MockEntity.condition();
      condition['ne'](condition['operators'], 'key', 'value');

      expect(condition['operators']).toEqual([{ key: 'key' }, BASE_OPERATOR.space, BASE_OPERATOR.ne, BASE_OPERATOR.space, { key: 'key', value: 'value' }]);
    });

    test('Should push negated equality expression with prefix', async () => {
      const condition = MockEntity.condition();
      condition['ne'](condition['operators'], 'prefixedKey', 'value');

      expect(condition['operators']).toEqual([{ key: 'prefixedKey' }, BASE_OPERATOR.space, BASE_OPERATOR.ne, BASE_OPERATOR.space, { key: 'prefixedKey', value: 'PREFIX#value' }]);
    });
  });

  describe('lt', () => {
    test('Should push less than expression', async () => {
      const condition = MockEntity.condition();
      condition['lt'](condition['operators'], 'key', 'value');

      expect(condition['operators']).toEqual([{ key: 'key' }, BASE_OPERATOR.space, BASE_OPERATOR.lt, BASE_OPERATOR.space, { key: 'key', value: 'value' }]);
    });

    test('Should push less than expression with prefix', async () => {
      const condition = MockEntity.condition();
      condition['lt'](condition['operators'], 'prefixedKey', 'value');

      expect(condition['operators']).toEqual([{ key: 'prefixedKey' }, BASE_OPERATOR.space, BASE_OPERATOR.lt, BASE_OPERATOR.space, { key: 'prefixedKey', value: 'PREFIX#value' }]);
    });
  });

  describe('le', () => {
    test('Should push less than or equal expression', async () => {
      const condition = MockEntity.condition();
      condition['le'](condition['operators'], 'key', 'value');

      expect(condition['operators']).toEqual([{ key: 'key' }, BASE_OPERATOR.space, BASE_OPERATOR.le, BASE_OPERATOR.space, { key: 'key', value: 'value' }]);
    });

    test('Should push less than or equal expression with prefix', async () => {
      const condition = MockEntity.condition();
      condition['le'](condition['operators'], 'prefixedKey', 'value');

      expect(condition['operators']).toEqual([{ key: 'prefixedKey' }, BASE_OPERATOR.space, BASE_OPERATOR.le, BASE_OPERATOR.space, { key: 'prefixedKey', value: 'PREFIX#value' }]);
    });
  });

  describe('gt', () => {
    test('Should push greater than expression', async () => {
      const condition = MockEntity.condition();
      condition['gt'](condition['operators'], 'key', 'value');

      expect(condition['operators']).toEqual([{ key: 'key' }, BASE_OPERATOR.space, BASE_OPERATOR.gt, BASE_OPERATOR.space, { key: 'key', value: 'value' }]);
    });

    test('Should push greater than expression with prefix', async () => {
      const condition = MockEntity.condition();
      condition['gt'](condition['operators'], 'prefixedKey', 'value');

      expect(condition['operators']).toEqual([{ key: 'prefixedKey' }, BASE_OPERATOR.space, BASE_OPERATOR.gt, BASE_OPERATOR.space, { key: 'prefixedKey', value: 'PREFIX#value' }]);
    });
  });

  describe('ge', () => {
    test('Should push greater than or equal expression', async () => {
      const condition = MockEntity.condition();
      condition['ge'](condition['operators'], 'key', 'value');

      expect(condition['operators']).toEqual([{ key: 'key' }, BASE_OPERATOR.space, BASE_OPERATOR.ge, BASE_OPERATOR.space, { key: 'key', value: 'value' }]);
    });

    test('Should push greater than or equal expression with prefix', async () => {
      const condition = MockEntity.condition();
      condition['ge'](condition['operators'], 'prefixedKey', 'value');

      expect(condition['operators']).toEqual([{ key: 'prefixedKey' }, BASE_OPERATOR.space, BASE_OPERATOR.ge, BASE_OPERATOR.space, { key: 'prefixedKey', value: 'PREFIX#value' }]);
    });
  });

  describe('beginsWith', () => {
    test('Should push begins with expression', async () => {
      const condition = MockEntity.condition();
      condition['beginsWith'](condition['operators'], 'key', 'value');

      expect(condition['operators']).toEqual([...OPERATORS.beginsWith('key', 'value')]);
    });

    test('Should push begins with expression with prefix', async () => {
      const condition = MockEntity.condition();
      condition['beginsWith'](condition['operators'], 'prefixedKey', 'value');

      expect(condition['operators']).toEqual([...OPERATORS.beginsWith('prefixedKey', 'PREFIX#value')]);
    });
  });

  describe('between', () => {
    test('Should push begins with expression', async () => {
      const condition = MockEntity.condition();
      condition['between'](condition['operators'], 'key', 'value1', 'value2');

      expect(condition['operators']).toEqual([...OPERATORS.between('key', 'value1', 'value2')]);
    });

    test('Should push begins with expression with prefix', async () => {
      const condition = MockEntity.condition();
      condition['between'](condition['operators'], 'prefixedKey', 'value1', 'value2');

      expect(condition['operators']).toEqual([...OPERATORS.between('prefixedKey', 'PREFIX#value1', 'PREFIX#value2')]);
    });
  });

  describe('maybePushOperator', () => {
    test('Should push a logical operator if operators are not empty', async () => {
      const condition = MockEntity.condition();
      condition['operators'].push(BASE_OPERATOR.add);
      condition['maybePushLogicalOperator']();

      expect(condition['operators']).toEqual([BASE_OPERATOR.add, BASE_OPERATOR.space, BASE_OPERATOR.and, BASE_OPERATOR.space]);
    });

    test('Should not push a logical operator if operators are empty', async () => {
      const condition = MockEntity.condition();
      condition['maybePushLogicalOperator']();

      expect(condition['operators']).toEqual([]);
    });

    test('Should change to "AND" logical operator after use', async () => {
      const condition = MockEntity.condition();
      condition['logicalOperator'] = BASE_OPERATOR.or;

      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.or);
      condition['maybePushLogicalOperator']();
      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.and);

      condition['logicalOperator'] = BASE_OPERATOR.and;
      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.and);
      condition['maybePushLogicalOperator']();
      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.and);
    });
  });
});
