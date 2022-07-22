export enum KeyType {
  SIMPLE = 'simple',
  COMPOSITE = 'composite',
}

export interface CompositeKey {
  pk: string;
  sk: string;
}

export interface SimpleKey {
  pk: string;
}

export interface CompositePrimaryKey extends CompositeKey {
  keyType: KeyType.COMPOSITE;
}

export interface SimplePrimaryKey extends SimpleKey {
  keyType: KeyType.SIMPLE;
}

export type PrimaryKey = CompositePrimaryKey | SimplePrimaryKey;

export interface GlobalCompositeSecondaryIndex extends CompositeKey {
  name: string;
  keyType: KeyType.COMPOSITE;
}

export interface GlobalSimpleSecondaryIndex extends SimpleKey {
  name: string;
  keyType: KeyType.SIMPLE;
}

export type GlobalIndex = GlobalCompositeSecondaryIndex | GlobalSimpleSecondaryIndex;

export type LocalIndex = {
  name: string;
  sk: string;
};
