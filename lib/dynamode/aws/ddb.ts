import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { getDynamodeStorage } from '@lib/storage';

export interface DDBType {
  DynamoDB: typeof DynamoDB;
  get: () => DynamoDB;
  set: (ddb: DynamoDB) => void;
  local: (endpoint?: string) => DynamoDB;
}

export default function (): DDBType {
  let ddb = new DynamoDB({});

  const get = () => {
    getDynamodeStorage().setDynamoInstance(ddb);
    return ddb;
  };

  const set = (customDdb: DynamoDB): void => {
    ddb = customDdb;
    getDynamodeStorage().setDynamoInstance(ddb);
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

new DynamoDB({
  credentials: {
    accessKeyId: 'key-id',
    secretAccessKey: 'secret',
  },
  region: 'region',
});
