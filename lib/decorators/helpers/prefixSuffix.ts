import Dynamode from '@lib/dynamode/index';

export function prefix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const entityName = Entity.constructor.name;
    Dynamode.storage.updateAttributePrefix(entityName, propertyName, value);
  };
}

export function suffix(value: string) {
  return <T extends Partial<Record<K, string>>, K extends string>(Entity: T, propertyName: K) => {
    const entityName = Entity.constructor.name;
    Dynamode.storage.updateAttributeSuffix(entityName, propertyName, value);
  };
}
