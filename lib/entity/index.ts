import Dynamode from '@lib/dynamode/index';
import { DYNAMODE_ENTITY } from '@lib/utils';

/**
 * Base class for all Dynamode entities.
 *
 * This class serves as the foundation for all entity classes in Dynamode.
 * It automatically registers the entity with the Dynamode storage system
 * and provides a unique identifier for each entity instance.
 *
 * @example
 * ```typescript
 * class User extends Entity {
 *   @attribute.partitionKey.string()
 *   id: string;
 *
 *   @attribute.string()
 *   name: string;
 *
 *   constructor(props: { id: string; name: string }) {
 *     super();
 *     this.id = props.id;
 *     this.name = props.name;
 *   }
 * }
 * ```
 *
 * @see {@link https://blazejkustra.github.io/dynamode/docs/getting_started/introduction} for more information
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-general-nosql-design.html} for DynamoDB data modeling best practices
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-modeling-nosql.html} for NoSQL data modeling concepts
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html} for DynamoDB core components
 */
export default class Entity {
  /**
   * Unique identifier for the entity type.
   * This is automatically set to the constructor's name.
   *
   * @readonly
   * @example
   * ```typescript
   * const user = new User({ id: '1', name: 'John' });
   * console.log(user.dynamodeEntity); // "User"
   *
   * You can also use the `@entity.customName` decorator to change the name of the entity.
   * @entity.customName('CustomName')
   * ```
   */
  public readonly dynamodeEntity!: string;

  /**
   * Creates a new Entity instance.
   *
   * @param args - Variable arguments (currently unused but reserved for future use)
   *
   * @example
   * ```typescript
   * class Product extends Entity {
   *   @attribute.partitionKey.string()
   *   id: string;
   *
   *   constructor(props: { id: string }) {
   *     super(); // Always call super() first
   *     this.id = props.id;
   *   }
   * }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  constructor(...args: unknown[]) {
    this.dynamodeEntity = this.constructor.name;
  }
}

Dynamode.storage.registerAttribute(Entity.name, DYNAMODE_ENTITY, {
  propertyName: DYNAMODE_ENTITY,
  type: String,
  role: DYNAMODE_ENTITY,
});
