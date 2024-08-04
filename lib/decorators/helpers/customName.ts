import Dynamode from '@lib/dynamode/index';

function customName(newNameEntity: string): ClassDecorator {
  return (entity: any) => {
    const oldNameEntity = entity.name;
    Object.defineProperty(entity, 'name', {
      writable: true,
      value: newNameEntity,
    });
    Dynamode.storage.transferMetadata(oldNameEntity, newNameEntity);
  };
}

export default customName;
