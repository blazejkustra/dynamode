import { ScanCommandOutput, ScanInput } from '@aws-sdk/client-dynamodb';
import { Entity, EntityIndexNames } from '@lib/entity/types';
import RetrieverBase from '@lib/retriever';
import { BuildScanConditionExpression, ScanRunOptions, ScanRunOutput } from '@lib/scan/types';
import { AttributeMap, buildExpression, isNotEmpty } from '@lib/utils';

export default class Scan<T extends Entity<T>> extends RetrieverBase<T> {
  protected input: ScanInput;

  constructor(entity: T) {
    super(entity);
  }

  public run(): Promise<ScanRunOutput<T>>;
  public run(options: Omit<ScanRunOptions, 'return'>): Promise<ScanRunOutput<T>>;
  public run(options: ScanRunOptions & { return: 'default' }): Promise<ScanRunOutput<T>>;
  public run(options: ScanRunOptions & { return: 'output' }): Promise<ScanCommandOutput>;
  public run(options: ScanRunOptions & { return: 'input' }): ScanInput;
  public run(options?: ScanRunOptions): Promise<ScanRunOutput<T> | ScanCommandOutput> | ScanInput {
    this.buildScanInput(options?.extraInput);
    this.validateScanInput();

    if (options?.return === 'input') {
      return this.input;
    }

    return (async () => {
      const result = await this.entity.ddb.scan(this.input);

      if (options?.return === 'output') {
        return result;
      }

      const items = result.Items || [];

      return {
        items: items.map((item) => this.entity.convertAttributeMapToEntity(item)),
        count: result.Count || 0,
        scannedCount: result.ScannedCount || 0,
        lastKey: result.LastEvaluatedKey ? this.entity.convertAttributeMapToPrimaryKey(result.LastEvaluatedKey) : undefined,
      };
    })();
  }

  public indexName(name: EntityIndexNames<T>) {
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

  private buildScanInput(input?: Partial<ScanInput>) {
    const { conditionExpression, attributeNames, attributeValues } = this.buildScanConditionExpression();

    if (conditionExpression) {
      this.input.FilterExpression = conditionExpression;
    }

    if (isNotEmpty(attributeNames)) {
      this.input.ExpressionAttributeNames = attributeNames;
    }

    if (isNotEmpty(attributeValues)) {
      this.input.ExpressionAttributeValues = attributeValues;
    }

    this.input = { ...this.input, ...input };
  }

  //TODO: Implement validation
  private validateScanInput() {
    console.log('validateScanInput');
  }

  private buildScanConditionExpression(): BuildScanConditionExpression {
    const attributeNames: Record<string, string> = {};
    const attributeValues: AttributeMap = {};

    return {
      attributeNames,
      attributeValues,
      conditionExpression: buildExpression(this.conditions, attributeNames, attributeValues),
    };
  }
}
