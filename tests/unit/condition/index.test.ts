import { beforeEach, describe, expect, test, vi } from 'vitest';

import Condition from '@lib/condition';
import { AttributeType } from '@lib/condition/types';
import { BASE_OPERATOR, OPERATORS, ValidationError } from '@lib/utils';

import { MockEntity, MockEntityManager } from '../../fixtures';

describe('Condition', () => {
  let condition = MockEntityManager.condition();

  beforeEach(() => {
    condition = MockEntityManager.condition();
  });

  test('Should be able to initialize condition', async () => {
    const condition1 = MockEntityManager.condition();
    expect(condition1['operators']).toEqual([]);
    expect(condition1['entity']).toEqual(MockEntity);
    expect(condition1['logicalOperator']).toEqual(BASE_OPERATOR.and);

    const condition2 = new Condition(MockEntity);
    expect(condition2['operators']).toEqual([]);
    expect(condition2['entity']).toEqual(MockEntity);
    expect(condition2['logicalOperator']).toEqual(BASE_OPERATOR.and);
  });

  describe('attribute', () => {
    test('Should call maybePushLogicalOperator on each use', async () => {
      const maybePushLogicalOperatorSpy = vi.spyOn(condition, 'maybePushLogicalOperator' as any);

      condition.attribute('partitionKey');
      expect(maybePushLogicalOperatorSpy).toBeCalled();
    });

    describe('Methods', () => {
      describe('eq', () => {
        test('Should call Condition.eq', async () => {
          const eqSpy = vi.spyOn(condition, 'eq' as any);
          condition.attribute('partitionKey').eq('value');
          expect(eqSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
        });
      });

      describe('ne', () => {
        test('Should call Condition.ne', async () => {
          const neSpy = vi.spyOn(condition, 'ne' as any);
          condition.attribute('partitionKey').ne('value');
          expect(neSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
        });
      });

      describe('lt', () => {
        test('Should call Condition.lt', async () => {
          const ltSpy = vi.spyOn(condition, 'lt' as any);
          condition.attribute('partitionKey').lt('value');
          expect(ltSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
        });
      });

      describe('le', () => {
        test('Should call Condition.le', async () => {
          const leSpy = vi.spyOn(condition, 'le' as any);
          condition.attribute('partitionKey').le('value');
          expect(leSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
        });
      });

      describe('gt', () => {
        test('Should call Condition.gt', async () => {
          const gtSpy = vi.spyOn(condition, 'gt' as any);
          condition.attribute('partitionKey').gt('value');
          expect(gtSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
        });
      });

      describe('ge', () => {
        test('Should call Condition.ge', async () => {
          const geSpy = vi.spyOn(condition, 'ge' as any);
          condition.attribute('partitionKey').ge('value');
          expect(geSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
        });
      });

      describe('beginsWith', () => {
        test('Should call Condition.beginsWith', async () => {
          const beginsWithSpy = vi.spyOn(condition, 'beginsWith' as any);
          condition.attribute('partitionKey').beginsWith('value');
          expect(beginsWithSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
        });
      });

      describe('between', () => {
        test('Should call Condition.between', async () => {
          const betweenSpy = vi.spyOn(condition, 'between' as any);
          condition.attribute('partitionKey').between('value1', 'value2');
          expect(betweenSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value1', 'value2');
        });
      });

      describe('contains', () => {
        test('Should push contains expression', async () => {
          condition.attribute('partitionKey').contains('value');

          expect(condition['operators']).toEqual([...OPERATORS.contains('partitionKey', 'prefix#value')]);
        });

        test('Should push contains expression without prefix', async () => {
          condition.attribute('string').contains('value');

          expect(condition['operators']).toEqual([...OPERATORS.contains('string', 'value')]);
        });

        test('Should push expression only for one value from set', async () => {
          condition.attribute('set').contains(new Set(['1']));

          expect(condition['operators']).toEqual([...OPERATORS.contains('set', '1')]);
        });

        test('Should push expression only for one value from array', async () => {
          condition.attribute('array').contains(['1']);

          expect(condition['operators']).toEqual([...OPERATORS.contains('array', '1')]);
        });

        test('Should throw an error for set and array with more than one value', async () => {
          expect(() => condition.attribute('set').contains(new Set(['1', '2']))).toThrow(ValidationError);
          expect(() => condition.attribute('array').contains(['1', '2'])).toThrow(ValidationError);
        });
      });

      describe('in', () => {
        test('Should push an impossible condition for an empty array', async () => {
          condition.attribute('partitionKey').in([]);

          expect(condition['operators']).toEqual([...OPERATORS.impossibleCondition('partitionKey')]);
        });

        test('Should push in expression', async () => {
          condition.attribute('partitionKey').in(['value1', 'value2']);

          expect(condition['operators']).toEqual([...OPERATORS.in('partitionKey', ['prefix#value1', 'prefix#value2'])]);
        });

        test('Should push in expression without prefix', async () => {
          condition.attribute('string').in(['value1', 'value2']);

          expect(condition['operators']).toEqual([...OPERATORS.in('string', ['value1', 'value2'])]);
        });
      });

      describe('type', () => {
        test('Should push attributeType expression', async () => {
          condition.attribute('partitionKey').type(AttributeType.String);

          expect(condition['operators']).toEqual([...OPERATORS.attributeType('partitionKey', 'S')]);
        });
      });

      describe('exists', () => {
        test('Should push attributeExists expression', async () => {
          condition.attribute('partitionKey').exists();

          expect(condition['operators']).toEqual([...OPERATORS.attributeExists('partitionKey')]);
        });
      });

      describe('size', () => {
        describe('eq', () => {
          test('Should push size equality expression', async () => {
            condition.attribute('partitionKey').size().eq(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeEq('partitionKey', 100)]);
          });
        });

        describe('ne', () => {
          test('Should push size negated equality expression', async () => {
            condition.attribute('partitionKey').size().ne(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeNe('partitionKey', 100)]);
          });
        });

        describe('lt', () => {
          test('Should push size less than expression', async () => {
            condition.attribute('partitionKey').size().lt(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeLt('partitionKey', 100)]);
          });
        });

        describe('le', () => {
          test('Should push size less than or equal expression', async () => {
            condition.attribute('partitionKey').size().le(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeLe('partitionKey', 100)]);
          });
        });

        describe('gt', () => {
          test('Should push size greater than expression', async () => {
            condition.attribute('partitionKey').size().gt(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeGt('partitionKey', 100)]);
          });
        });

        describe('ge', () => {
          test('Should push size greater than or equal expression', async () => {
            condition.attribute('partitionKey').size().ge(100);

            expect(condition['operators']).toEqual([...OPERATORS.sizeGe('partitionKey', 100)]);
          });
        });
      });

      describe('not', () => {
        describe('eq', () => {
          test('Should call Condition.not().ne', async () => {
            const neSpy = vi.spyOn(condition, 'ne' as any);

            condition.attribute('partitionKey').not().eq('value');
            expect(neSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
          });
        });

        describe('ne', () => {
          test('Should call Condition.not().ne', async () => {
            const eqSpy = vi.spyOn(condition, 'eq' as any);

            condition.attribute('partitionKey').not().ne('value');
            expect(eqSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
          });
        });

        describe('lt', () => {
          test('Should call Condition.not().lt', async () => {
            const geSpy = vi.spyOn(condition, 'ge' as any);

            condition.attribute('partitionKey').not().lt('value');
            expect(geSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
          });
        });

        describe('le', () => {
          test('Should call Condition.not().le', async () => {
            const gtSpy = vi.spyOn(condition, 'gt' as any);

            condition.attribute('partitionKey').not().le('value');
            expect(gtSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
          });
        });

        describe('gt', () => {
          test('Should call Condition.not().gt', async () => {
            const leSpy = vi.spyOn(condition, 'le' as any);

            condition.attribute('partitionKey').not().gt('value');
            expect(leSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
          });
        });

        describe('ge', () => {
          test('Should call Condition.not().ge', async () => {
            const ltSpy = vi.spyOn(condition, 'lt' as any);

            condition.attribute('partitionKey').not().ge('value');
            expect(ltSpy).toBeCalledWith(condition['operators'], 'partitionKey', 'value');
          });
        });

        describe('contains', () => {
          test('Should push contains expression', async () => {
            condition.attribute('partitionKey').not().contains('value');

            expect(condition['operators']).toEqual([...OPERATORS.notContains('partitionKey', 'prefix#value')]);
          });

          test('Should push contains expression without prefix', async () => {
            condition.attribute('string').not().contains('value');

            expect(condition['operators']).toEqual([...OPERATORS.notContains('string', 'value')]);
          });

          test('Should push expression only for one value from set', async () => {
            condition
              .attribute('set')
              .not()
              .contains(new Set(['1']));

            expect(condition['operators']).toEqual([...OPERATORS.notContains('set', '1')]);
          });

          test('Should push expression only for one value from array', async () => {
            condition.attribute('array').not().contains(['1']);

            expect(condition['operators']).toEqual([...OPERATORS.notContains('array', '1')]);
          });

          test('Should throw an error for set and array with more than one value', async () => {
            expect(() =>
              condition
                .attribute('set')
                .not()
                .contains(new Set(['1', '2'])),
            ).toThrow(ValidationError);
            expect(() => condition.attribute('array').not().contains(['1', '2'])).toThrow(ValidationError);
          });
        });

        describe('in', () => {
          test('Should not push in expression for en empty array', async () => {
            condition.attribute('partitionKey').not().in([]);

            expect(condition['operators']).toEqual([]);
          });

          test('Should push in expression', async () => {
            condition.attribute('partitionKey').not().in(['value1', 'value2']);

            expect(condition['operators']).toEqual([
              ...OPERATORS.notIn('partitionKey', ['prefix#value1', 'prefix#value2']),
            ]);
          });

          test('Should push in expression without prefix', async () => {
            condition.attribute('string').not().in(['value1', 'value2']);

            expect(condition['operators']).toEqual([...OPERATORS.notIn('string', ['value1', 'value2'])]);
          });
        });

        describe('exists', () => {
          test('Should push attributeExists expression', async () => {
            condition.attribute('partitionKey').not().exists();

            expect(condition['operators']).toEqual([...OPERATORS.attributeNotExists('partitionKey')]);
          });
        });
      });
    });
  });

  describe('parenthesis', () => {
    test('Should not add parenthesis if undefined condition is passed as argument', async () => {
      condition.parenthesis(undefined);

      expect(condition['operators']).toEqual([]);
    });

    test('Should add parenthesis if defined condition is passed as argument', async () => {
      const innerCondition = MockEntityManager.condition();

      innerCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.parenthesis(innerCondition);
      expect(condition['operators']).toEqual([
        BASE_OPERATOR.leftParenthesis,
        ...innerCondition['operators'],
        BASE_OPERATOR.rightParenthesis,
      ]);
    });

    test('Should add parenthesis if defined condition is passed as argument + should add logical operator', async () => {
      const innerCondition = MockEntityManager.condition();

      condition['operators'].push(BASE_OPERATOR.contains);
      innerCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.parenthesis(innerCondition);
      expect(condition['operators']).toEqual([
        BASE_OPERATOR.contains,
        BASE_OPERATOR.space,
        BASE_OPERATOR.and,
        BASE_OPERATOR.space,
        BASE_OPERATOR.leftParenthesis,
        ...innerCondition['operators'],
        BASE_OPERATOR.rightParenthesis,
      ]);
    });
  });

  describe('group', () => {
    test('Should not add parenthesis if undefined condition is passed as argument', async () => {
      condition.group(undefined);

      expect(condition['operators']).toEqual([]);
    });

    test('Should add parenthesis if defined condition is passed as argument', async () => {
      const innerCondition = MockEntityManager.condition();

      innerCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.group(innerCondition);
      expect(condition['operators']).toEqual([
        BASE_OPERATOR.leftParenthesis,
        ...innerCondition['operators'],
        BASE_OPERATOR.rightParenthesis,
      ]);
    });

    test('Should add parenthesis if defined condition is passed as argument + should add logical operator', async () => {
      const innerCondition = MockEntityManager.condition();

      condition['operators'].push(BASE_OPERATOR.contains);
      innerCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.group(innerCondition);
      expect(condition['operators']).toEqual([
        BASE_OPERATOR.contains,
        BASE_OPERATOR.space,
        BASE_OPERATOR.and,
        BASE_OPERATOR.space,
        BASE_OPERATOR.leftParenthesis,
        ...innerCondition['operators'],
        BASE_OPERATOR.rightParenthesis,
      ]);
    });
  });

  describe('condition', () => {
    test('Should not join conditions if undefined condition is passed as argument', async () => {
      condition.group(undefined);

      expect(condition['operators']).toEqual([]);
    });

    test('Should join conditions if defined condition is passed as argument', async () => {
      const otherCondition = MockEntityManager.condition();

      otherCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.condition(otherCondition);
      expect(condition['operators']).toEqual([...otherCondition['operators']]);
    });

    test('Should join conditions if defined condition is passed as argument + should add logical operator', async () => {
      const otherCondition = MockEntityManager.condition();

      condition['operators'].push(BASE_OPERATOR.contains);
      otherCondition['operators'].push(BASE_OPERATOR.attributeExists);

      condition.condition(otherCondition);
      expect(condition['operators']).toEqual([
        BASE_OPERATOR.contains,
        BASE_OPERATOR.space,
        BASE_OPERATOR.and,
        BASE_OPERATOR.space,
        ...otherCondition['operators'],
      ]);
    });
  });

  describe('and', () => {
    test('Should set logicalOperator to "AND"', async () => {
      condition['logicalOperator'] = BASE_OPERATOR.or;

      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.or);
      condition.and;
      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.and);
    });
  });

  describe('or', () => {
    test('Should set logicalOperator to "OR"', async () => {
      condition['logicalOperator'] = BASE_OPERATOR.and;

      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.and);
      condition.or;
      expect(condition['logicalOperator']).toEqual(BASE_OPERATOR.or);
    });
  });

  describe('eq', () => {
    test('Should push equality expression', async () => {
      condition['eq'](condition['operators'], 'partitionKey', 'value');

      expect(condition['operators']).toEqual([
        { key: 'partitionKey' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.eq,
        BASE_OPERATOR.space,
        { key: 'partitionKey', value: 'prefix#value' },
      ]);
    });

    test('Should push equality expression without prefix', async () => {
      condition['eq'](condition['operators'], 'string', 'value');

      expect(condition['operators']).toEqual([
        { key: 'string' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.eq,
        BASE_OPERATOR.space,
        { key: 'string', value: 'value' },
      ]);
    });
  });

  describe('ne', () => {
    test('Should push negated equality expression', async () => {
      condition['ne'](condition['operators'], 'partitionKey', 'value');

      expect(condition['operators']).toEqual([
        { key: 'partitionKey' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.ne,
        BASE_OPERATOR.space,
        { key: 'partitionKey', value: 'prefix#value' },
      ]);
    });

    test('Should push negated equality expression without prefix', async () => {
      condition['ne'](condition['operators'], 'string', 'value');

      expect(condition['operators']).toEqual([
        { key: 'string' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.ne,
        BASE_OPERATOR.space,
        { key: 'string', value: 'value' },
      ]);
    });
  });

  describe('lt', () => {
    test('Should push less than expression', async () => {
      condition['lt'](condition['operators'], 'partitionKey', 'value');

      expect(condition['operators']).toEqual([
        { key: 'partitionKey' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.lt,
        BASE_OPERATOR.space,
        { key: 'partitionKey', value: 'prefix#value' },
      ]);
    });

    test('Should push less than expression without prefix', async () => {
      condition['lt'](condition['operators'], 'string', 'value');

      expect(condition['operators']).toEqual([
        { key: 'string' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.lt,
        BASE_OPERATOR.space,
        { key: 'string', value: 'value' },
      ]);
    });
  });

  describe('le', () => {
    test('Should push less than or equal expression', async () => {
      condition['le'](condition['operators'], 'partitionKey', 'value');

      expect(condition['operators']).toEqual([
        { key: 'partitionKey' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.le,
        BASE_OPERATOR.space,
        { key: 'partitionKey', value: 'prefix#value' },
      ]);
    });

    test('Should push less than or equal expression without prefix', async () => {
      condition['le'](condition['operators'], 'string', 'value');

      expect(condition['operators']).toEqual([
        { key: 'string' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.le,
        BASE_OPERATOR.space,
        { key: 'string', value: 'value' },
      ]);
    });
  });

  describe('gt', () => {
    test('Should push greater than expression', async () => {
      condition['gt'](condition['operators'], 'partitionKey', 'value');

      expect(condition['operators']).toEqual([
        { key: 'partitionKey' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.gt,
        BASE_OPERATOR.space,
        { key: 'partitionKey', value: 'prefix#value' },
      ]);
    });

    test('Should push greater than expression without prefix', async () => {
      condition['gt'](condition['operators'], 'string', 'value');

      expect(condition['operators']).toEqual([
        { key: 'string' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.gt,
        BASE_OPERATOR.space,
        { key: 'string', value: 'value' },
      ]);
    });
  });

  describe('ge', () => {
    test('Should push greater than or equal expression', async () => {
      condition['ge'](condition['operators'], 'partitionKey', 'value');

      expect(condition['operators']).toEqual([
        { key: 'partitionKey' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.ge,
        BASE_OPERATOR.space,
        { key: 'partitionKey', value: 'prefix#value' },
      ]);
    });

    test('Should push greater than or equal expression without prefix', async () => {
      condition['ge'](condition['operators'], 'string', 'value');

      expect(condition['operators']).toEqual([
        { key: 'string' },
        BASE_OPERATOR.space,
        BASE_OPERATOR.ge,
        BASE_OPERATOR.space,
        { key: 'string', value: 'value' },
      ]);
    });
  });

  describe('beginsWith', () => {
    test('Should push begins with expression', async () => {
      condition['beginsWith'](condition['operators'], 'partitionKey', 'value');

      expect(condition['operators']).toEqual([...OPERATORS.beginsWith('partitionKey', 'prefix#value')]);
    });

    test('Should push begins with expression without prefix', async () => {
      condition['beginsWith'](condition['operators'], 'string', 'value');

      expect(condition['operators']).toEqual([...OPERATORS.beginsWith('string', 'value')]);
    });
  });

  describe('between', () => {
    test('Should push between with expression', async () => {
      condition['between'](condition['operators'], 'partitionKey', 'value1', 'value2');

      expect(condition['operators']).toEqual([...OPERATORS.between('partitionKey', 'prefix#value1', 'prefix#value2')]);
    });

    test('Should push between with expression without prefix', async () => {
      condition['between'](condition['operators'], 'string', 'value1', 'value2');

      expect(condition['operators']).toEqual([...OPERATORS.between('string', 'value1', 'value2')]);
    });
  });

  describe('maybePushOperator', () => {
    test('Should push a logical operator if operators are not empty', async () => {
      condition['operators'].push(BASE_OPERATOR.add);
      condition['maybePushLogicalOperator']();

      expect(condition['operators']).toEqual([
        BASE_OPERATOR.add,
        BASE_OPERATOR.space,
        BASE_OPERATOR.and,
        BASE_OPERATOR.space,
      ]);
    });

    test('Should not push a logical operator if operators are empty', async () => {
      condition['maybePushLogicalOperator']();

      expect(condition['operators']).toEqual([]);
    });

    test('Should change to "AND" logical operator after use', async () => {
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
