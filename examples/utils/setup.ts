import { DynamoDB } from '@aws-sdk/client-dynamodb';

import { Settings } from '../../dist';

const x = new DynamoDB({});

Settings.ddb.local();

export const ddb = Settings.ddb();
