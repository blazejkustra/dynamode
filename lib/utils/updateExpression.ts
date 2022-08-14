import { Model } from '@lib/Model';
import { UpdateProps } from '@lib/Model/types';
import { isEmpty } from '@lib/utils';
import { ConditionExpression } from '@lib/utils/substituteConditions';

export function buildUpdateConditions<M extends Model>(props: UpdateProps<M>): ConditionExpression[] {
  const { set, setIfNotExists, listAppend, increment, decrement, add, delete: deleteOp, remove } = props;
  const conditions: ConditionExpression[] = [];

  const setKeys: string[] = [];
  const setValues: unknown[] = [];
  const setExpr: string[] = [];

  if (set && !isEmpty(set)) {
    setKeys.push(...Object.keys(set));
    setValues.push(...Object.values(set));
    setExpr.push(...Object.keys(set).map(() => '$K = $V'));
  }

  if (setIfNotExists && !isEmpty(setIfNotExists)) {
    setKeys.push(...Object.keys(setIfNotExists).flatMap((k) => [k, k]));
    setValues.push(...Object.values(setIfNotExists));
    setExpr.push(...Object.keys(setIfNotExists).map(() => '$K = if_not_exists($K, $V)'));
  }

  if (listAppend && !isEmpty(listAppend)) {
    setKeys.push(...Object.keys(listAppend).flatMap((k) => [k, k]));
    setValues.push(...Object.values(listAppend));
    setExpr.push(...Object.keys(listAppend).map(() => '$K = list_append($K, $V)'));
  }

  if (increment && !isEmpty(increment)) {
    setKeys.push(...Object.keys(increment).flatMap((k) => [k, k]));
    setValues.push(...Object.values(increment));
    setExpr.push(...Object.keys(increment).map(() => '$K = $K + $V'));
  }

  if (decrement && !isEmpty(decrement)) {
    setKeys.push(...Object.keys(decrement).flatMap((k) => [k, k]));
    setValues.push(...Object.values(decrement));
    setExpr.push(...Object.keys(decrement).map(() => '$K = $K - $V'));
  }

  if (setExpr.length > 0) {
    conditions.push({ expr: 'SET' }, { keys: setKeys, values: setValues, expr: setExpr.join(', ') });
  }

  if (add && !isEmpty(add)) {
    conditions.push(
      { expr: 'ADD' },
      {
        keys: Object.keys(add),
        values: Object.values(add),
        expr: Object.keys(add)
          .map(() => '$K $V')
          .join(', '),
      },
    );
  }

  if (deleteOp && !isEmpty(deleteOp)) {
    conditions.push(
      { expr: 'DELETE' },
      {
        keys: Object.keys(deleteOp),
        values: Object.values(deleteOp),
        expr: Object.keys(deleteOp)
          .map(() => '$K $V')
          .join(', '),
      },
    );
  }

  if (remove && remove.length > 0) {
    conditions.push({ expr: 'REMOVE' }, { keys: remove.map((key) => `${key}`), expr: remove.map(() => '$K').join(', ') });
  }

  return conditions;
}
