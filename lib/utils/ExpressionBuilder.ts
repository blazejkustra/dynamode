import {
  AttributeNames,
  AttributeValues,
  InvalidParameter,
  isNotEmpty,
  Operators,
  RESERVED_WORDS,
  splitListPathReference,
  valueToDynamo,
} from '@lib/utils';

type ExpressionBuilderProps = {
  attributeNames?: AttributeNames;
  attributeValues?: AttributeValues;
};

export class ExpressionBuilder {
  private _attributeNames: AttributeNames;
  private _attributeValues: AttributeValues;

  constructor(props?: ExpressionBuilderProps) {
    this._attributeNames = props?.attributeNames || {};
    this._attributeValues = props?.attributeValues || {};
  }

  get attributeNames() {
    return isNotEmpty(this._attributeNames) ? this._attributeNames : undefined;
  }

  get attributeValues() {
    return isNotEmpty(this._attributeValues) ? this._attributeValues : undefined;
  }

  public run(operators: Operators): string {
    return operators
      .map((operator) => {
        if ('expression' in operator) {
          return operator.expression;
        }

        if ('value' in operator) {
          return this.substituteValue(operator.key, operator.value);
        }

        if ('key' in operator) {
          return this.substituteName(operator.key);
        }
      })
      .join('');
  }

  public substituteName(key: string): string {
    return key
      .split('.')
      .map((key) => {
        const [keyPart, listReferencePart] = splitListPathReference(key);

        if (RESERVED_WORDS.has(keyPart.toUpperCase())) {
          const substituteKey = `#${keyPart}`;
          this._attributeNames[substituteKey] = keyPart;
          return substituteKey + listReferencePart;
        }

        return keyPart + listReferencePart;
      })
      .join('.');
  }

  public substituteValue(key: string, value: unknown): string {
    const valueName = key.replace(/\[/g, '_index').replace(/\]/g, '').split('.').join('_');

    for (let i = 0; i < 1000; i++) {
      const suffix = i ? `__${i}` : '';
      const substituteValueName = `:${valueName}${suffix}`;
      if (!this._attributeValues[substituteValueName]) {
        this._attributeValues[substituteValueName] = valueToDynamo(value);
        return substituteValueName;
      }
    }

    throw new InvalidParameter(`Couldn't substitute a value for key: ${key}. Value key out of range`);
  }
}
