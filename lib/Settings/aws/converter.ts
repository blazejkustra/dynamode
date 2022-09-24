import * as DDBUtils from '@aws-sdk/util-dynamodb';

type ConverterType = {
  marshall: typeof DDBUtils.marshall;
  unmarshall: typeof DDBUtils.unmarshall;
  convertToAttr: typeof DDBUtils.convertToAttr;
  convertToNative: typeof DDBUtils.convertToNative;
};

let customConverter: ConverterType | undefined;
const defaultConverter: ConverterType = {
  marshall: DDBUtils.marshall,
  unmarshall: DDBUtils.unmarshall,
  convertToAttr: DDBUtils.convertToAttr,
  convertToNative: DDBUtils.convertToNative,
};

const Converter = (): ConverterType => customConverter || defaultConverter;

Converter.set = (converter: ConverterType): void => {
  customConverter = converter;
};
Converter.revert = (): void => {
  customConverter = undefined;
};

export default Converter;
