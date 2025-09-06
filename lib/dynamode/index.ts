import converter from '@lib/dynamode/converter';
import DDB, { DDBType } from '@lib/dynamode/ddb';
import separator, { SeparatorType } from '@lib/dynamode/separator';
import DynamodeStorage from '@lib/dynamode/storage';

/**
 * Main Dynamode class that provides access to all core functionality.
 *
 * This class serves as the central hub for Dynamode operations, providing
 * access to DynamoDB client, storage management, data conversion, and
 * separator utilities. It follows a singleton pattern with a default instance.
 *
 * @example
 * ```typescript
 * import Dynamode from 'dynamode';
 *
 * // Configure Dynamode
 * Dynamode.configure({
 *   region: 'us-east-1',
 *   endpoint: 'http://localhost:8000' // for local development
 * });
 *
 * // Access DynamoDB client
 * const ddb = Dynamode.ddb.get();
 *
 * // Access storage for entity management
 * const entityClass = Dynamode.storage.getEntityClass('User');
 *
 * // Use converter for data transformation
 * const converted = Dynamode.converter.toDynamo({ id: '123', name: 'John' });
 *
 * // Use separator for key operations
 * const key = Dynamode.separator.join(['user', '123']);
 * ```
 */
class Dynamode {
  /** Default singleton instance of Dynamode */
  static default: Dynamode = new Dynamode();

  /** DynamoDB client wrapper for AWS SDK operations */
  public ddb: DDBType;
  /** Storage manager for entity and table metadata */
  public storage: DynamodeStorage;
  /** Data converter for DynamoDB attribute value transformations */
  public converter: typeof converter;
  /** Separator utility for key operations and data separation */
  public separator: SeparatorType;

  /**
   * Creates a new Dynamode instance.
   *
   * Initializes all core components including the DynamoDB client,
   * storage manager, converter, and separator utilities.
   *
   * @example
   * ```typescript
   * // Create a new instance (usually not needed)
   * const dynamode = new Dynamode();
   *
   * // Use the default singleton instance (recommended)
   * const dynamode = Dynamode.default;
   * ```
   */
  constructor() {
    this.ddb = DDB();
    this.storage = new DynamodeStorage();
    this.converter = converter;
    this.separator = separator;
  }
}

/**
 * Default Dynamode instance.
 *
 * This is the singleton instance that should be used throughout
 * the application for all Dynamode operations.
 */
export default Dynamode.default;
