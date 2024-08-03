import Dynamode from '@lib/dynamode/index';

function customName(newName: string): ClassDecorator {
  return (entity: any) => {
    const oldName = entity.name;
    Object.defineProperty(entity, 'name', {
      writable: true,
      value: newName,
    });
    Dynamode.storage.renameEntity(oldName, newName);
  };
}

export default customName;
