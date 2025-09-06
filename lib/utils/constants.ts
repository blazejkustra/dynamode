import { AttributeType } from '@lib/dynamode/storage/types';
import { insertBetween } from '@lib/utils';

/**
 * Core constants for Dynamode operations.
 */

/**
 * The property name used to identify Dynamode entities.
 * This is automatically added to all entity instances.
 */
export const DYNAMODE_ENTITY = 'dynamodeEntity';

/**
 * Mapping of JavaScript types to DynamoDB attribute types for keys.
 * Only String and Number types are allowed for partition and sort keys.
 */
export const DYNAMODE_DYNAMO_KEY_TYPE_MAP = new Map<AttributeType, 'S' | 'N'>([
  [String, 'S'],
  [Number, 'N'],
]);

/**
 * Array of attribute types that are allowed for DynamoDB keys.
 * DynamoDB only supports String and Number types for partition and sort keys.
 */
export const DYNAMODE_ALLOWED_KEY_TYPES: AttributeType[] = [String, Number];

/**
 * Set of reserved words that cannot be used as attribute names in DynamoDB.
 *
 * These are SQL and DynamoDB reserved words that would cause conflicts
 * if used as attribute names in expressions. Dynamode automatically
 * handles these by using expression attribute names when needed.
 *
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html} for complete list of reserved words
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html} for expression attribute names
 */
export const RESERVED_WORDS = new Set([
  'ABORT',
  'ABSOLUTE',
  'ACTION',
  'ADD',
  'AFTER',
  'AGENT',
  'AGGREGATE',
  'ALL',
  'ALLOCATE',
  'ALTER',
  'ANALYZE',
  'AND',
  'ANY',
  'ARCHIVE',
  'ARE',
  'ARRAY',
  'AS',
  'ASC',
  'ASCII',
  'ASENSITIVE',
  'ASSERTION',
  'ASYMMETRIC',
  'AT',
  'ATOMIC',
  'ATTACH',
  'ATTRIBUTE',
  'AUTH',
  'AUTHORIZATION',
  'AUTHORIZE',
  'AUTO',
  'AVG',
  'BACK',
  'BACKUP',
  'BASE',
  'BATCH',
  'BEFORE',
  'BEGIN',
  'BETWEEN',
  'BIGINT',
  'BINARY',
  'BIT',
  'BLOB',
  'BLOCK',
  'BOOLEAN',
  'BOTH',
  'BREADTH',
  'BUCKET',
  'BULK',
  'BY',
  'BYTE',
  'CALL',
  'CALLED',
  'CALLING',
  'CAPACITY',
  'CASCADE',
  'CASCADED',
  'CASE',
  'CAST',
  'CATALOG',
  'CHAR',
  'CHARACTER',
  'CHECK',
  'CLASS',
  'CLOB',
  'CLOSE',
  'CLUSTER',
  'CLUSTERED',
  'CLUSTERING',
  'CLUSTERS',
  'COALESCE',
  'COLLATE',
  'COLLATION',
  'COLLECTION',
  'COLUMN',
  'COLUMNS',
  'COMBINE',
  'COMMENT',
  'COMMIT',
  'COMPACT',
  'COMPILE',
  'COMPRESS',
  'CONDITION',
  'CONFLICT',
  'CONNECT',
  'CONNECTION',
  'CONSISTENCY',
  'CONSISTENT',
  'CONSTRAINT',
  'CONSTRAINTS',
  'CONSTRUCTOR',
  'CONSUMED',
  'CONTINUE',
  'CONVERT',
  'COPY',
  'CORRESPONDING',
  'COUNT',
  'COUNTER',
  'CREATE',
  'CROSS',
  'CUBE',
  'CURRENT',
  'CURSOR',
  'CYCLE',
  'DATA',
  'DATABASE',
  'DATE',
  'DATETIME',
  'DAY',
  'DEALLOCATE',
  'DEC',
  'DECIMAL',
  'DECLARE',
  'DEFAULT',
  'DEFERRABLE',
  'DEFERRED',
  'DEFINE',
  'DEFINED',
  'DEFINITION',
  'DELETE',
  'DELIMITED',
  'DEPTH',
  'DEREF',
  'DESC',
  'DESCRIBE',
  'DESCRIPTOR',
  'DETACH',
  'DETERMINISTIC',
  'DIAGNOSTICS',
  'DIRECTORIES',
  'DISABLE',
  'DISCONNECT',
  'DISTINCT',
  'DISTRIBUTE',
  'DO',
  'DOMAIN',
  'DOUBLE',
  'DROP',
  'DUMP',
  'DURATION',
  'DYNAMIC',
  'EACH',
  'ELEMENT',
  'ELSE',
  'ELSEIF',
  'EMPTY',
  'ENABLE',
  'END',
  'EQUAL',
  'EQUALS',
  'ERROR',
  'ESCAPE',
  'ESCAPED',
  'EVAL',
  'EVALUATE',
  'EXCEEDED',
  'EXCEPT',
  'EXCEPTION',
  'EXCEPTIONS',
  'EXCLUSIVE',
  'EXEC',
  'EXECUTE',
  'EXISTS',
  'EXIT',
  'EXPLAIN',
  'EXPLODE',
  'EXPORT',
  'EXPRESSION',
  'EXTENDED',
  'EXTERNAL',
  'EXTRACT',
  'FAIL',
  'FALSE',
  'FAMILY',
  'FETCH',
  'FIELDS',
  'FILE',
  'FILTER',
  'FILTERING',
  'FINAL',
  'FINISH',
  'FIRST',
  'FIXED',
  'FLATTERN',
  'FLOAT',
  'FOR',
  'FORCE',
  'FOREIGN',
  'FORMAT',
  'FORWARD',
  'FOUND',
  'FREE',
  'FROM',
  'FULL',
  'FUNCTION',
  'FUNCTIONS',
  'GENERAL',
  'GENERATE',
  'GET',
  'GLOB',
  'GLOBAL',
  'GO',
  'GOTO',
  'GRANT',
  'GREATER',
  'GROUP',
  'GROUPING',
  'HANDLER',
  'HASH',
  'HAVE',
  'HAVING',
  'HEAP',
  'HIDDEN',
  'HOLD',
  'HOUR',
  'IDENTIFIED',
  'IDENTITY',
  'IF',
  'IGNORE',
  'IMMEDIATE',
  'IMPORT',
  'IN',
  'INCLUDING',
  'INCLUSIVE',
  'INCREMENT',
  'INCREMENTAL',
  'INDEX',
  'INDEXED',
  'INDEXES',
  'INDICATOR',
  'INFINITE',
  'INITIALLY',
  'INLINE',
  'INNER',
  'INNTER',
  'INOUT',
  'INPUT',
  'INSENSITIVE',
  'INSERT',
  'INSTEAD',
  'INT',
  'INTEGER',
  'INTERSECT',
  'INTERVAL',
  'INTO',
  'INVALIDATE',
  'IS',
  'ISOLATION',
  'ITEM',
  'ITEMS',
  'ITERATE',
  'JOIN',
  'KEY',
  'KEYS',
  'LAG',
  'LANGUAGE',
  'LARGE',
  'LAST',
  'LATERAL',
  'LEAD',
  'LEADING',
  'LEAVE',
  'LEFT',
  'LENGTH',
  'LESS',
  'LEVEL',
  'LIKE',
  'LIMIT',
  'LIMITED',
  'LINES',
  'LIST',
  'LOAD',
  'LOCAL',
  'LOCALTIME',
  'LOCALTIMESTAMP',
  'LOCATION',
  'LOCATOR',
  'LOCK',
  'LOCKS',
  'LOG',
  'LOGED',
  'LONG',
  'LOOP',
  'LOWER',
  'MAP',
  'MATCH',
  'MATERIALIZED',
  'MAX',
  'MAXLEN',
  'MEMBER',
  'MERGE',
  'METHOD',
  'METRICS',
  'MIN',
  'MINUS',
  'MINUTE',
  'MISSING',
  'MOD',
  'MODE',
  'MODIFIES',
  'MODIFY',
  'MODULE',
  'MONTH',
  'MULTI',
  'MULTISET',
  'NAME',
  'NAMES',
  'NATIONAL',
  'NATURAL',
  'NCHAR',
  'NCLOB',
  'NEW',
  'NEXT',
  'NO',
  'NONE',
  'NOT',
  'NULL',
  'NULLIF',
  'NUMBER',
  'NUMERIC',
  'OBJECT',
  'OF',
  'OFFLINE',
  'OFFSET',
  'OLD',
  'ON',
  'ONLINE',
  'ONLY',
  'OPAQUE',
  'OPEN',
  'OPERATOR',
  'OPTION',
  'OR',
  'ORDER',
  'ORDINALITY',
  'OTHER',
  'OTHERS',
  'OUT',
  'OUTER',
  'OUTPUT',
  'OVER',
  'OVERLAPS',
  'OVERRIDE',
  'OWNER',
  'PAD',
  'PARALLEL',
  'PARAMETER',
  'PARAMETERS',
  'PARTIAL',
  'PARTITION',
  'PARTITIONED',
  'PARTITIONS',
  'PATH',
  'PERCENT',
  'PERCENTILE',
  'PERMISSION',
  'PERMISSIONS',
  'PIPE',
  'PIPELINED',
  'PLAN',
  'POOL',
  'POSITION',
  'PRECISION',
  'PREPARE',
  'PRESERVE',
  'PRIMARY',
  'PRIOR',
  'PRIVATE',
  'PRIVILEGES',
  'PROCEDURE',
  'PROCESSED',
  'PROJECT',
  'PROJECTION',
  'PROPERTY',
  'PROVISIONING',
  'PUBLIC',
  'PUT',
  'QUERY',
  'QUIT',
  'QUORUM',
  'RAISE',
  'RANDOM',
  'RANGE',
  'RANK',
  'RAW',
  'READ',
  'READS',
  'REAL',
  'REBUILD',
  'RECORD',
  'RECURSIVE',
  'REDUCE',
  'REF',
  'REFERENCE',
  'REFERENCES',
  'REFERENCING',
  'REGEXP',
  'REGION',
  'REINDEX',
  'RELATIVE',
  'RELEASE',
  'REMAINDER',
  'RENAME',
  'REPEAT',
  'REPLACE',
  'REQUEST',
  'RESET',
  'RESIGNAL',
  'RESOURCE',
  'RESPONSE',
  'RESTORE',
  'RESTRICT',
  'RESULT',
  'RETURN',
  'RETURNING',
  'RETURNS',
  'REVERSE',
  'REVOKE',
  'RIGHT',
  'ROLE',
  'ROLES',
  'ROLLBACK',
  'ROLLUP',
  'ROUTINE',
  'ROW',
  'ROWS',
  'RULE',
  'RULES',
  'SAMPLE',
  'SATISFIES',
  'SAVE',
  'SAVEPOINT',
  'SCAN',
  'SCHEMA',
  'SCOPE',
  'SCROLL',
  'SEARCH',
  'SECOND',
  'SECTION',
  'SEGMENT',
  'SEGMENTS',
  'SELECT',
  'SELF',
  'SEMI',
  'SENSITIVE',
  'SEPARATE',
  'SEQUENCE',
  'SERIALIZABLE',
  'SESSION',
  'SET',
  'SETS',
  'SHARD',
  'SHARE',
  'SHARED',
  'SHORT',
  'SHOW',
  'SIGNAL',
  'SIMILAR',
  'SIZE',
  'SKEWED',
  'SMALLINT',
  'SNAPSHOT',
  'SOME',
  'SOURCE',
  'SPACE',
  'SPACES',
  'SPARSE',
  'SPECIFIC',
  'SPECIFICTYPE',
  'SPLIT',
  'SQL',
  'SQLCODE',
  'SQLERROR',
  'SQLEXCEPTION',
  'SQLSTATE',
  'SQLWARNING',
  'START',
  'STATE',
  'STATIC',
  'STATUS',
  'STORAGE',
  'STORE',
  'STORED',
  'STREAM',
  'STRING',
  'STRUCT',
  'STYLE',
  'SUB',
  'SUBMULTISET',
  'SUBPARTITION',
  'SUBSTRING',
  'SUBTYPE',
  'SUM',
  'SUPER',
  'SYMMETRIC',
  'SYNONYM',
  'SYSTEM',
  'TABLE',
  'TABLESAMPLE',
  'TEMP',
  'TEMPORARY',
  'TERMINATED',
  'TEXT',
  'THAN',
  'THEN',
  'THROUGHPUT',
  'TIME',
  'TIMESTAMP',
  'TIMEZONE',
  'TINYINT',
  'TO',
  'TOKEN',
  'TOTAL',
  'TOUCH',
  'TRAILING',
  'TRANSACTION',
  'TRANSFORM',
  'TRANSLATE',
  'TRANSLATION',
  'TREAT',
  'TRIGGER',
  'TRIM',
  'TRUE',
  'TRUNCATE',
  'TTL',
  'TUPLE',
  'TYPE',
  'UNDER',
  'UNDO',
  'UNION',
  'UNIQUE',
  'UNIT',
  'UNKNOWN',
  'UNLOGGED',
  'UNNEST',
  'UNPROCESSED',
  'UNSIGNED',
  'UNTIL',
  'UPDATE',
  'UPPER',
  'URL',
  'USAGE',
  'USE',
  'USER',
  'USERS',
  'USING',
  'UUID',
  'VACUUM',
  'VALUE',
  'VALUED',
  'VALUES',
  'VARCHAR',
  'VARIABLE',
  'VARIANCE',
  'VARINT',
  'VARYING',
  'VIEW',
  'VIEWS',
  'VIRTUAL',
  'VOID',
  'WAIT',
  'WHEN',
  'WHENEVER',
  'WHERE',
  'WHILE',
  'WINDOW',
  'WITH',
  'WITHIN',
  'WITHOUT',
  'WORK',
  'WRAPPED',
  'WRITE',
  'YEAR',
  'ZONE',
]);

/**
 * Expression operator types for building DynamoDB expressions.
 */

/**
 * Literal key type for building DynamoDB expressions.
 */
export type LiteralKey = string | number | symbol;

/**
 * Represents a literal expression string in an operator chain.
 */
export type OperatorExpression = { expression: string };

/**
 * Represents an attribute name reference in an operator chain.
 */
export type OperatorKey = { key: LiteralKey };

/**
 * Represents an attribute value with its corresponding key in an operator chain.
 */
export type OperatorValue = { value: unknown; key: LiteralKey };

/**
 * Union type for all possible operator elements in an expression.
 */
export type Operators = Array<OperatorExpression | OperatorKey | OperatorValue>;

/**
 * Base operators for building DynamoDB expressions.
 *
 * These are the fundamental building blocks for constructing
 * condition expressions, update expressions, and other DynamoDB
 * expression types.
 */
export const BASE_OPERATOR = {
  /** Space character */
  space: { expression: ' ' },
  /** Comma separator */
  comma: { expression: ',' },

  /** Left parenthesis */
  leftParenthesis: { expression: '(' },
  /** Right parenthesis */
  rightParenthesis: { expression: ')' },

  /** Plus operator */
  plus: { expression: '+' },
  /** Minus operator */
  minus: { expression: '-' },

  /** NOT logical operator */
  not: { expression: 'NOT' },

  /** AND logical operator */
  and: { expression: 'AND' },
  /** OR logical operator */
  or: { expression: 'OR' },
  /** Equal comparison operator */
  eq: { expression: '=' },
  /** Not equal comparison operator */
  ne: { expression: '<>' },
  /** Less than comparison operator */
  lt: { expression: '<' },
  /** Less than or equal comparison operator */
  le: { expression: '<=' },
  /** Greater than comparison operator */
  gt: { expression: '>' },
  /** Greater than or equal comparison operator */
  ge: { expression: '>=' },

  /** attribute_exists function */
  attributeExists: { expression: 'attribute_exists' },
  /** contains function */
  contains: { expression: 'contains' },
  /** IN operator */
  in: { expression: 'IN' },
  /** BETWEEN operator */
  between: { expression: 'BETWEEN' },
  /** attribute_type function */
  attributeType: { expression: 'attribute_type' },
  /** begins_with function */
  beginsWith: { expression: 'begins_with' },
  /** attribute_not_exists function */
  attributeNotExists: { expression: 'attribute_not_exists' },
  /** size function */
  size: { expression: 'size' },
  /** if_not_exists function */
  ifNotExists: { expression: 'if_not_exists' },
  /** list_append function */
  listAppend: { expression: 'list_append' },

  /** SET update action */
  set: { expression: 'SET' },
  /** ADD update action */
  add: { expression: 'ADD' },
  /** REMOVE update action */
  remove: { expression: 'REMOVE' },
  /** DELETE update action */
  delete: { expression: 'DELETE' },
} as const;

/**
 * Condition operators for building DynamoDB condition expressions.
 *
 * These operators construct complex condition expressions by combining
 * attribute names, values, and comparison operators. Each operator
 * returns an array of operator elements that can be processed to
 * generate the final expression string.
 */
export const OPERATORS = {
  /**
   * Wraps an operator structure in parentheses.
   *
   * @param operatorStructure - The operators to wrap in parentheses
   * @returns Operators wrapped in parentheses
   */
  parenthesis: (operatorStructure: Operators): Operators => [
    BASE_OPERATOR.leftParenthesis,
    ...operatorStructure,
    BASE_OPERATOR.rightParenthesis,
  ],

  /**
   * Creates an equality comparison: $K = $V
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for equality comparison
   */
  eq: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.eq,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a not equal comparison: $K <> $V
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for not equal comparison
   */
  ne: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.ne,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a less than comparison: $K < $V
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for less than comparison
   */
  lt: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.lt,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a less than or equal comparison: $K <= $V
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for less than or equal comparison
   */
  le: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.le,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a greater than comparison: $K > $V
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for greater than comparison
   */
  gt: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.gt,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a greater than or equal comparison: $K >= $V
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for greater than or equal comparison
   */
  ge: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.ge,
    BASE_OPERATOR.space,
    { value, key },
  ],

  /**
   * Creates an attribute_exists function: attribute_exists($K)
   *
   * @param key - The attribute name to check for existence
   * @returns Operators for attribute_exists function
   */
  attributeExists: (key: LiteralKey): Operators => [BASE_OPERATOR.attributeExists, ...OPERATORS.parenthesis([{ key }])],
  /**
   * Creates a contains function: contains($K, $V)
   *
   * @param key - The attribute name
   * @param value - The value to check if the attribute contains
   * @returns Operators for contains function
   */
  contains: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.contains,
    ...OPERATORS.parenthesis([{ key }, BASE_OPERATOR.comma, BASE_OPERATOR.space, { value, key }]),
  ],
  /**
   * Creates an IN operator: $K IN ($V, $V, $V)
   *
   * @param key - The attribute name
   * @param values - Array of values to check against
   * @returns Operators for IN comparison
   */
  in: (key: LiteralKey, values: unknown[]): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.in,
    BASE_OPERATOR.space,
    BASE_OPERATOR.leftParenthesis,
    ...insertBetween<OperatorExpression | OperatorValue>(
      values.map((value) => ({ value, key })),
      [BASE_OPERATOR.comma, BASE_OPERATOR.space],
    ),
    BASE_OPERATOR.rightParenthesis,
  ],
  /**
   * Creates a BETWEEN operator: $K BETWEEN $V AND $V
   *
   * @param key - The attribute name
   * @param value1 - The lower bound value
   * @param value2 - The upper bound value
   * @returns Operators for BETWEEN comparison
   */
  between: (key: LiteralKey, value1: unknown, value2: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.between,
    BASE_OPERATOR.space,
    { value: value1, key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.and,
    BASE_OPERATOR.space,
    { value: value2, key },
  ],
  /**
   * Creates an attribute_type function: attribute_type($K, $V)
   *
   * @param key - The attribute name
   * @param value - The expected attribute type
   * @returns Operators for attribute_type function
   */
  attributeType: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.attributeType,
    ...OPERATORS.parenthesis([{ key }, BASE_OPERATOR.comma, BASE_OPERATOR.space, { value, key }]),
  ],
  /**
   * Creates a begins_with function: begins_with($K, $V)
   *
   * @param key - The attribute name
   * @param value - The prefix to check for
   * @returns Operators for begins_with function
   */
  beginsWith: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.beginsWith,
    ...OPERATORS.parenthesis([{ key }, BASE_OPERATOR.comma, BASE_OPERATOR.space, { value, key }]),
  ],

  /**
   * Creates an attribute_not_exists function: attribute_not_exists($K)
   *
   * @param key - The attribute name to check for non-existence
   * @returns Operators for attribute_not_exists function
   */
  attributeNotExists: (key: LiteralKey): Operators => [
    BASE_OPERATOR.attributeNotExists,
    ...OPERATORS.parenthesis([{ key }]),
  ],
  /**
   * Creates a NOT contains function: NOT contains($K, $V)
   *
   * @param key - The attribute name
   * @param value - The value to check if the attribute does not contain
   * @returns Operators for NOT contains function
   */
  notContains: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.not,
    BASE_OPERATOR.space,
    ...OPERATORS.contains(key, value),
  ],
  /**
   * Creates a NOT IN operator: NOT ($K IN $V, $V, $V)
   *
   * @param key - The attribute name
   * @param values - Array of values to check against
   * @returns Operators for NOT IN comparison
   */
  notIn: (key: LiteralKey, values: unknown[]): Operators => [
    BASE_OPERATOR.not,
    BASE_OPERATOR.space,
    ...OPERATORS.parenthesis(OPERATORS.in(key, values)),
  ],
  /**
   * Creates a NOT equal comparison: NOT $K = $V (equivalent to $K <> $V)
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for NOT equal comparison
   */
  notEq: (key: LiteralKey, value: unknown): Operators => OPERATORS.ne(key, value),
  /**
   * Creates a NOT not equal comparison: NOT $K <> $V (equivalent to $K = $V)
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for NOT not equal comparison
   */
  notNe: (key: LiteralKey, value: unknown): Operators => OPERATORS.eq(key, value),
  /**
   * Creates a NOT less than comparison: NOT $K < $V (equivalent to $K >= $V)
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for NOT less than comparison
   */
  notLt: (key: LiteralKey, value: unknown): Operators => OPERATORS.ge(key, value),
  /**
   * Creates a NOT less than or equal comparison: NOT $K <= $V (equivalent to $K > $V)
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for NOT less than or equal comparison
   */
  notLe: (key: LiteralKey, value: unknown): Operators => OPERATORS.gt(key, value),
  /**
   * Creates a NOT greater than comparison: NOT $K > $V (equivalent to $K <= $V)
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for NOT greater than comparison
   */
  notGt: (key: LiteralKey, value: unknown): Operators => OPERATORS.le(key, value),
  /**
   * Creates a NOT greater than or equal comparison: NOT $K >= $V (equivalent to $K < $V)
   *
   * @param key - The attribute name
   * @param value - The value to compare against
   * @returns Operators for NOT greater than or equal comparison
   */
  notGe: (key: LiteralKey, value: unknown): Operators => OPERATORS.lt(key, value),

  /**
   * Creates a size function with equality: size($K) = $V
   *
   * @param key - The attribute name
   * @param value - The size value to compare against
   * @returns Operators for size equality comparison
   */
  sizeEq: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.size,
    ...OPERATORS.parenthesis([{ key }]),
    BASE_OPERATOR.space,
    BASE_OPERATOR.eq,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a size function with not equal: size($K) <> $V
   *
   * @param key - The attribute name
   * @param value - The size value to compare against
   * @returns Operators for size not equal comparison
   */
  sizeNe: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.size,
    ...OPERATORS.parenthesis([{ key }]),
    BASE_OPERATOR.space,
    BASE_OPERATOR.ne,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a size function with less than: size($K) < $V
   *
   * @param key - The attribute name
   * @param value - The size value to compare against
   * @returns Operators for size less than comparison
   */
  sizeLt: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.size,
    ...OPERATORS.parenthesis([{ key }]),
    BASE_OPERATOR.space,
    BASE_OPERATOR.lt,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a size function with less than or equal: size($K) <= $V
   *
   * @param key - The attribute name
   * @param value - The size value to compare against
   * @returns Operators for size less than or equal comparison
   */
  sizeLe: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.size,
    ...OPERATORS.parenthesis([{ key }]),
    BASE_OPERATOR.space,
    BASE_OPERATOR.le,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a size function with greater than: size($K) > $V
   *
   * @param key - The attribute name
   * @param value - The size value to compare against
   * @returns Operators for size greater than comparison
   */
  sizeGt: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.size,
    ...OPERATORS.parenthesis([{ key }]),
    BASE_OPERATOR.space,
    BASE_OPERATOR.gt,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a size function with greater than or equal: size($K) >= $V
   *
   * @param key - The attribute name
   * @param value - The size value to compare against
   * @returns Operators for size greater than or equal comparison
   */
  sizeGe: (key: LiteralKey, value: unknown): Operators => [
    BASE_OPERATOR.size,
    ...OPERATORS.parenthesis([{ key }]),
    BASE_OPERATOR.space,
    BASE_OPERATOR.ge,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates an impossible condition: attribute_exists($K) AND attribute_not_exists($K)
   *
   * This creates a condition that can never be true, useful for testing
   * or creating conditions that should always fail.
   *
   * @param key - The attribute name
   * @returns Operators for impossible condition
   */
  impossibleCondition: (key: LiteralKey): Operators => [
    ...OPERATORS.attributeExists(key),
    BASE_OPERATOR.space,
    BASE_OPERATOR.and,
    BASE_OPERATOR.space,
    ...OPERATORS.attributeNotExists(key),
  ],
};

/**
 * Update operators for building DynamoDB update expressions.
 *
 * These operators construct update expressions for DynamoDB UpdateItem
 * operations, including SET, ADD, REMOVE, and DELETE actions.
 */
export const UPDATE_OPERATORS = {
  /**
   * Creates a SET operation: $K = $V
   *
   * @param key - The attribute name to set
   * @param value - The value to set
   * @returns Operators for SET operation
   */
  set: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.eq,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a SET operation with if_not_exists: $K = if_not_exists($K, $V)
   *
   * @param key - The attribute name to set
   * @param value - The default value if attribute doesn't exist
   * @returns Operators for SET if_not_exists operation
   */
  setIfNotExists: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.eq,
    BASE_OPERATOR.space,
    BASE_OPERATOR.ifNotExists,
    ...OPERATORS.parenthesis([{ key }, BASE_OPERATOR.comma, BASE_OPERATOR.space, { value, key }]),
  ],
  /**
   * Creates a SET operation with list_append: $K = list_append($K, $V)
   *
   * @param key - The list attribute name
   * @param value - The list to append
   * @returns Operators for SET list_append operation
   */
  listAppend: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.eq,
    BASE_OPERATOR.space,
    BASE_OPERATOR.listAppend,
    ...OPERATORS.parenthesis([{ key }, BASE_OPERATOR.comma, BASE_OPERATOR.space, { value, key }]),
  ],
  /**
   * Creates a SET operation with increment: $K = $K + $V
   *
   * @param key - The numeric attribute name
   * @param value - The value to add
   * @returns Operators for SET increment operation
   */
  increment: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.eq,
    BASE_OPERATOR.space,
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.plus,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates a SET operation with decrement: $K = $K - $V
   *
   * @param key - The numeric attribute name
   * @param value - The value to subtract
   * @returns Operators for SET decrement operation
   */
  decrement: (key: LiteralKey, value: unknown): Operators => [
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.eq,
    BASE_OPERATOR.space,
    { key },
    BASE_OPERATOR.space,
    BASE_OPERATOR.minus,
    BASE_OPERATOR.space,
    { value, key },
  ],
  /**
   * Creates an ADD operation: $K $V
   *
   * @param key - The attribute name
   * @param value - The value to add (for numbers or sets)
   * @returns Operators for ADD operation
   */
  add: (key: LiteralKey, value: unknown): Operators => [{ key }, BASE_OPERATOR.space, { value, key }],
  /**
   * Creates a DELETE operation: $K $V
   *
   * @param key - The set attribute name
   * @param value - The set elements to delete
   * @returns Operators for DELETE operation
   */
  delete: (key: LiteralKey, value: unknown): Operators => [{ key }, BASE_OPERATOR.space, { value, key }],
  /**
   * Creates a REMOVE operation: $K
   *
   * @param key - The attribute name to remove
   * @returns Operators for REMOVE operation
   */
  remove: (key: LiteralKey): Operators => [{ key }],
};
