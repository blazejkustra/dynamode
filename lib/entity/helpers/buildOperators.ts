import Dynamode from '@lib/dynamode';
import Entity from '@lib/entity';
import { transformValue } from '@lib/entity/helpers/transformValues';
import { EntityKey, UpdateProps } from '@lib/entity/types';
import {
  BASE_OPERATOR,
  duplicatesInArray,
  DYNAMODE_ENTITY,
  insertBetween,
  InvalidParameter,
  isNotEmpty,
  isNotEmptyArray,
  Operators,
  UPDATE_OPERATORS,
} from '@lib/utils';

export function buildProjectionOperators<E extends typeof Entity>(attributes: Array<EntityKey<E>>): Operators {
  if (duplicatesInArray(attributes)) {
    throw new InvalidParameter('Projection attributes must be unique');
  }

  const uniqueAttributes = Array.from(new Set([...attributes, DYNAMODE_ENTITY]));
  const operators: Operators = uniqueAttributes.map((key) => ({
    key,
  }));

  return insertBetween(operators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]);
}

export function buildUpdateOperators<E extends typeof Entity>(entity: E, props: UpdateProps<E>): Operators {
  const operators: Operators = [];
  const updatedAt = Dynamode.storage.getEntityMetadata(entity.name).updatedAt as string | undefined;
  const extendedSet = updatedAt ? { [updatedAt]: new Date(), ...props.set } : props.set;

  if (
    isNotEmpty({
      ...(extendedSet || {}),
      ...(props.setIfNotExists || {}),
      ...(props.listAppend || {}),
      ...(props.increment || {}),
      ...(props.decrement || {}),
    })
  ) {
    const setOperators: Operators[] = [
      ...Object.entries(extendedSet || {}).map(([key, value]) =>
        UPDATE_OPERATORS.set(key, transformValue(entity, key, value)),
      ),
      ...Object.entries(props.setIfNotExists || {}).map(([key, value]) =>
        UPDATE_OPERATORS.setIfNotExists(key, transformValue(entity, key, value)),
      ),
      ...Object.entries(props.listAppend || {}).map(([key, value]) =>
        UPDATE_OPERATORS.listAppend(key, transformValue(entity, key, value)),
      ),
      ...Object.entries(props.increment || {}).map(([key, value]) =>
        UPDATE_OPERATORS.increment(key, transformValue(entity, key, value)),
      ),
      ...Object.entries(props.decrement || {}).map(([key, value]) =>
        UPDATE_OPERATORS.decrement(key, transformValue(entity, key, value)),
      ),
    ];

    operators.push(
      BASE_OPERATOR.set,
      BASE_OPERATOR.space,
      ...insertBetween(setOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]).flatMap((operators) => operators),
    );
  }

  if (props.add && isNotEmpty(props.add)) {
    const addOperators: Operators[] = Object.entries(props.add).map(([key, value]) =>
      UPDATE_OPERATORS.add(key, transformValue(entity, key, value)),
    );

    if (operators.length) {
      operators.push(BASE_OPERATOR.space);
    }

    operators.push(
      BASE_OPERATOR.add,
      BASE_OPERATOR.space,
      ...insertBetween(addOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]).flatMap((operators) => operators),
    );
  }

  if (props.delete && isNotEmpty(props.delete)) {
    const deleteOperators: Operators[] = Object.entries(props.delete).map(([key, value]) =>
      UPDATE_OPERATORS.delete(key, transformValue(entity, key, value)),
    );

    if (operators.length) {
      operators.push(BASE_OPERATOR.space);
    }

    operators.push(
      BASE_OPERATOR.delete,
      BASE_OPERATOR.space,
      ...insertBetween(deleteOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]).flatMap((operators) => operators),
    );
  }

  if (isNotEmptyArray(props.remove)) {
    const removeOperators: Operators[] = props.remove.map((key) => UPDATE_OPERATORS.remove(key));

    if (operators.length) {
      operators.push(BASE_OPERATOR.space);
    }

    operators.push(
      BASE_OPERATOR.remove,
      BASE_OPERATOR.space,
      ...insertBetween(removeOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]).flatMap((operators) => operators),
    );
  }

  return operators;
}
