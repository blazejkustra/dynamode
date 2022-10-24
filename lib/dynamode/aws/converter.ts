import { convertToAttr, convertToNative, marshall, unmarshall } from '@aws-sdk/util-dynamodb';

type ConverterType = {
  marshall: typeof marshall;
  unmarshall: typeof unmarshall;
  convertToAttr: typeof convertToAttr;
  convertToNative: typeof convertToNative;
};

const defaultConverter: ConverterType = {
  marshall,
  unmarshall,
  convertToAttr,
  convertToNative,
};

let customConverter: ConverterType | undefined;
const get = (): ConverterType => customConverter || defaultConverter;
const set = (converter: ConverterType | undefined): void => {
  customConverter = converter;
};

export default {
  get,
  set,
};
