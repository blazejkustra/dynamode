import { DynamoDB } from '@aws-sdk/client-dynamodb';

export interface DDBType {
  DynamoDB: typeof DynamoDB;
  get: () => DynamoDB;
  set: (ddb: DynamoDB) => void;
  local: (endpoint?: string) => DynamoDB;
}

export default function (): DDBType {
  let ddbInstance = new DynamoDB({});

  const get = () => {
    return ddbInstance;
  };

  const set = (ddb: DynamoDB): void => {
    ddbInstance = ddb;
  };

  const local = (endpoint = 'http://localhost:8000'): DynamoDB => {
    set(
      new DynamoDB({
        endpoint,
      }),
    );
    return get();
  };

  return {
    get,
    set,
    local,
    DynamoDB,
  };
}
