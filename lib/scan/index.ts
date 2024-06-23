import { ScanCommandOutput, ScanInput } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity, convertAttributeValuesToLastKey } from '@lib/entity/helpers/converters';
import RetrieverBase from '@lib/retriever';
import type { ScanRunOptions, ScanRunOutput } from '@lib/scan/types';
import { Metadata } from '@lib/table/types';
import { ExpressionBuilder, isNotEmptyString } from '@lib/utils';

export default class Scan<M extends Metadata<E>, E extends typeof Entity> extends RetrieverBase<M, E> {
  protected declare input: ScanInput;

  constructor(entity: E) {
    super(entity);
  }

  public run(options?: ScanRunOptions & { return?: 'default' }): Promise<ScanRunOutput<M, E>>;
  public run(options: ScanRunOptions & { return: 'output' }): Promise<ScanCommandOutput>;
  public run(options: ScanRunOptions & { return: 'input' }): ScanInput;
  public run(options?: ScanRunOptions): Promise<ScanRunOutput<M, E> | ScanCommandOutput> | ScanInput {
    this.buildScanInput(options?.extraInput);

    if (options?.return === 'input') {
      return this.input;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().scan(this.input);

      if (options?.return === 'output') {
        return result;
      }

      const items = result.Items || [];

      return {
        items: items.map((item) => convertAttributeValuesToEntity(this.entity, item)),
        count: result.Count || 0,
        scannedCount: result.ScannedCount || 0,
        lastKey: result.LastEvaluatedKey
          ? convertAttributeValuesToLastKey(this.entity, result.LastEvaluatedKey)
          : undefined,
      };
    })();
  }

  public segment(value: number) {
    this.input.Segment = value;
    return this;
  }

  public totalSegments(value: number) {
    this.input.TotalSegments = value;
    return this;
  }

  private buildScanInput(extraInput?: Partial<ScanInput>) {
    const expressionBuilder = new ExpressionBuilder({
      attributeNames: this.attributeNames,
      attributeValues: this.attributeValues,
    });
    const conditionExpression = expressionBuilder.run(this.operators);

    this.input = {
      ...this.input,
      FilterExpression: isNotEmptyString(conditionExpression) ? conditionExpression : undefined,
      ExpressionAttributeNames: expressionBuilder.attributeNames,
      ExpressionAttributeValues: expressionBuilder.attributeValues,
      ...extraInput,
    };
  }
}
