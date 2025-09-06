/**
 * DynamoDB attribute types enumeration.
 *
 * These correspond to the attribute types used in DynamoDB operations
 * and condition expressions.
 */
export enum AttributeType {
  /** String attribute type */
  String = 'S',
  /** String set attribute type */
  StringSet = 'SS',
  /** Number attribute type */
  Number = 'N',
  /** Number set attribute type */
  NumberSet = 'NS',
  /** Binary attribute type */
  Binary = 'B',
  /** Binary set attribute type */
  BinarySet = 'BS',
  /** Boolean attribute type */
  Boolean = 'BOOL',
  /** Null attribute type */
  Null = 'NULL',
  /** List attribute type */
  List = 'L',
  /** Map attribute type */
  Map = 'M',
}
