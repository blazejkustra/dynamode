import dynamode from '../../dist';

dynamode.settings.ddb.local();
export const ddb = dynamode.settings.ddb();
