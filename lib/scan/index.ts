import { ScanCommandOutput, ScanInput } from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { convertAttributeValuesToEntity, convertAttributeValuesToLastKey } from '@lib/entity/helpers/converters';
import RetrieverBase from '@lib/retriever';
import type { ScanRunOptions, ScanRunOutput } from '@lib/scan/types';
import { Metadata } from '@lib/table/types';
import { ExpressionBuilder, isNotEmptyString } from '@lib/utils';

/**
 * Scan builder for DynamoDB scan operations.
 *
 * The Scan class provides a fluent interface for building and executing
 * DynamoDB scan operations. Scans examine every item in the table or index
 * and can be filtered using filter expressions.
 *
 * ⚠️ **Warning**: Scan operations are expensive and slow. They examine every
 * item in the table or index, which can consume significant read capacity.
 * Consider using Query operations instead when possible.
 *
 * @example
 * ```typescript
 * // Scan all items with a filter
 * const users = await UserManager.scan()
 *   .attribute('status').eq('active')
 *   .run();
 *
 * // Scan with pagination
 * const users = await UserManager.scan()
 *   .attribute('age').gt(18)
 *   .run({ all: false, max: 100 });
 *
 * // Scan with parallel segments
 * const users = await UserManager.scan()
 *   .segment(0)
 *   .totalSegments(4)
 *   .run();
 * ```
 *
 * @see {@link https://blazejkustra.github.io/dynamode/docs/guide/scan} for more information
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html} for DynamoDB Scan operations
 */
export default class Scan<M extends Metadata<E>, E extends typeof Entity> extends RetrieverBase<M, E> {
  /** The DynamoDB ScanInput object */
  declare protected input: ScanInput;

  /**
   * Creates a new Scan instance.
   *
   * @param entity - The entity class to scan
   */
  constructor(entity: E) {
    super(entity);
  }

  /**
   * Executes the scan operation.
   *
   * @param options - Optional configuration for the scan execution
   * @returns A promise that resolves to the scan results
   *
   * @example
   * ```typescript
   * // Execute scan and get all results
   * const result = await UserManager.scan()
   *   .attribute('status').eq('active')
   *   .run();
   *
   * // Execute scan with pagination
   * const result = await UserManager.scan()
   *   .attribute('age').gt(18)
   *   .run({ all: false, max: 100 });
   * ```
   */
  public run(options?: ScanRunOptions & { return?: 'default' }): Promise<ScanRunOutput<M, E>>;

  /**
   * Executes the scan operation, returning the raw AWS response.
   *
   * @param options - Configuration for the scan execution with return type 'output'
   * @returns A promise that resolves to the raw ScanCommandOutput
   */
  public run(options: ScanRunOptions & { return: 'output' }): Promise<ScanCommandOutput>;

  /**
   * Builds the Scan command input without executing it.
   *
   * @param options - Configuration for the scan execution with return type 'input'
   * @returns The ScanInput object
   */
  public run(options: ScanRunOptions & { return: 'input' }): ScanInput;

  /**
   * Executes the scan operation.
   *
   * @param options - Optional configuration for the scan execution
   * @returns A promise that resolves to the scan results, raw AWS response, or command input
   */
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

  /**
   * Sets the segment number for parallel scan operations.
   *
   * @param value - The segment number (0-based)
   * @returns The scan instance for method chaining
   *
   * @example
   * ```typescript
   * // Use segment 0 of 4 total segments
   * const users = await UserManager.scan()
   *   .segment(0)
   *   .totalSegments(4)
   *   .run();
   * ```
   */
  public segment(value: number) {
    this.input.Segment = value;
    return this;
  }

  /**
   * Sets the total number of segments for parallel scan operations.
   *
   * @param value - The total number of segments
   * @returns The scan instance for method chaining
   *
   * @example
   * ```typescript
   * // Use 4 parallel segments
   * const users = await UserManager.scan()
   *   .segment(0)
   *   .totalSegments(4)
   *   .run();
   * ```
   */
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
