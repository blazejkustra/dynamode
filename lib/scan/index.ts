import { ScanCommandOutput, ScanInput } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity, convertAttributeValuesToPrimaryKey } from '@lib/entity/helpers/convert';
import RetrieverBase from '@lib/retriever';
import type { ScanRunOptions, ScanRunOutput } from '@lib/scan/types';
import { Metadata, TableIndexNames } from '@lib/table/types';
import { isNotEmptyString } from '@lib/utils';

import { ExpressionBuilder } from './../utils/ExpressionBuilder';

export default class Scan<M extends Metadata<E>, E extends typeof Entity> extends RetrieverBase<M, E> {
  protected declare input: ScanInput;

  constructor(entity: E) {
    super(entity);
  }

  public run(options?: ScanRunOptions & { return?: 'default' }): Promise<ScanRunOutput<E>>;
  public run(options: ScanRunOptions & { return: 'output' }): Promise<ScanCommandOutput>;
  public run(options: ScanRunOptions & { return: 'input' }): ScanInput;
  public run(options?: ScanRunOptions): Promise<ScanRunOutput<E> | ScanCommandOutput> | ScanInput {
    this.buildScanInput(options?.extraInput);
    this.validateScanInput();

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
          ? convertAttributeValuesToPrimaryKey(this.entity, result.LastEvaluatedKey)
          : undefined,
      };
    })();
  }

  public indexName(name: TableIndexNames<M, E>) {
    this.input.IndexName = String(name);
    return this;
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

  //TODO: Implement validation
  private validateScanInput() {
    console.log('validateScanInput');
  }
}
