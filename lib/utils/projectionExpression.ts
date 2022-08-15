import { Model } from '@lib/Model';
import { ModelKeys } from '@lib/Model/types';
import { isEmpty } from '@lib/utils';
import { substituteAttributeName } from '@lib/utils/substituteConditions';

interface BuildProjectionExpression {
  ExpressionAttributeNames?: Record<string, string>;
  ProjectionExpression?: string;
}

export function buildProjectionExpression<M extends typeof Model>(attributes?: Array<keyof ModelKeys<InstanceType<M>>>): BuildProjectionExpression {
  const attributeNames: Record<string, string> = {};
  const projectionExpression = attributes?.map((attr) => substituteAttributeName(attributeNames, `${attr}`)).join(', ');

  return {
    ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
    ...(projectionExpression ? { ProjectionExpression: projectionExpression } : {}),
  };
}
