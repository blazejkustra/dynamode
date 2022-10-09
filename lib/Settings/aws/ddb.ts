import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { getDynamodeStorage } from '@lib/Storage';

export interface DDBInterface {
  (): DynamoDB;
  set: (ddb: DynamoDB) => void;
  local: (endpoint?: string) => void;
}

export default function (): DDBInterface {
  let ddb = new DynamoDB({});
  const func = () => {
    getDynamodeStorage().setDynamoInstance(ddb);
    return ddb;
  };

  func.set = (customDdb: DynamoDB): void => {
    ddb = customDdb;
  };
  func.local = (endpoint = 'http://localhost:8000'): void => {
    func.set(
      new DynamoDB({
        endpoint,
      }),
    );
  };

  return func;
}
