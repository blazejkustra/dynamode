import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { Model } from '@lib/Model';
import { Table } from '@lib/Table';

export function prefixPk(value: string) {
  return <M extends typeof Model>(Class: M) => {
    Class.prefixPk = value;
    return Class;
  };
}

export function prefixSk(value: string) {
  return <M extends typeof Model>(Class: M) => {
    Class.prefixSk = value;
    return Class;
  };
}

export function prefix(value: string) {
  return <M extends typeof Model>(Class: M) => {
    Class.prefixPk = value;
    Class.prefixSk = value;
    return Class;
  };
}

export function suffixPk(value: string) {
  return <M extends typeof Model>(Class: M) => {
    Class.suffixPk = value;
    return Class;
  };
}

export function suffixSk(value: string) {
  return <M extends typeof Model>(Class: M) => {
    Class.suffixSk = value;
    return Class;
  };
}

export function suffix(value: string) {
  return <M extends typeof Model>(Class: M) => {
    Class.suffixPk = value;
    Class.suffixSk = value;
    return Class;
  };
}

export function table(value: typeof Table) {
  return <M extends typeof Model>(Class: M) => {
    Class.table = value;
    return Class;
  };
}

export function dynamo(value: DynamoDB) {
  return <M extends typeof Model>(Class: M) => {
    Class.ddb = value;
    return Class;
  };
}
