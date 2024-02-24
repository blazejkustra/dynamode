import attribute from '../decorators';
import Entity from '../entity';
import { TableManager } from '..';

import Stream from './index';

const records = [
  {
    eventID: 'ca6a812bf1908f4820269358fa157bda',
    eventName: 'INSERT',
    eventVersion: '1.1',
    eventSource: 'aws:dynamodb',
    awsRegion: 'us-east-1',
    dynamodb: {
      ApproximateCreationDateTime: 1708735536,
      Keys: {
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
      },
      NewImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'unchecked',
        },
        updatedAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
      },
      SequenceNumber: '992535500000000087823192043',
      SizeBytes: 407,
      StreamViewType: 'NEW_AND_OLD_IMAGES',
    },
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:801505813432:table/user-staging/stream/2024-02-18T15:03:34.944',
  },
  {
    eventID: 'be98329ce0a43b28af8ab25aaa37b723',
    eventName: 'MODIFY',
    eventVersion: '1.1',
    eventSource: 'aws:dynamodb',
    awsRegion: 'us-east-1',
    dynamodb: {
      ApproximateCreationDateTime: 1708735537,
      Keys: {
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
      },
      NewImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'checked',
        },
        updatedAt: {
          S: '2024-02-24T00:45:37.965Z',
        },
      },
      OldImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'unchecked',
        },
        updatedAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
      },
      SequenceNumber: '992535600000000087823194345',
      SizeBytes: 731,
      StreamViewType: 'NEW_AND_OLD_IMAGES',
    },
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:801505813432:table/user-staging/stream/2024-02-18T15:03:34.944',
  },
  {
    eventID: '8b80b2d721f1d4c12896be60cb759cc9',
    eventName: 'MODIFY',
    eventVersion: '1.1',
    eventSource: 'aws:dynamodb',
    awsRegion: 'us-east-1',
    dynamodb: {
      ApproximateCreationDateTime: 1708735539,
      Keys: {
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
      },
      NewImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'unchecked',
        },
        updatedAt: {
          S: '2024-02-24T00:45:39.453Z',
        },
      },
      OldImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'checked',
        },
        updatedAt: {
          S: '2024-02-24T00:45:37.965Z',
        },
      },
      SequenceNumber: '992535700000000087823196343',
      SizeBytes: 731,
      StreamViewType: 'NEW_AND_OLD_IMAGES',
    },
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:801505813432:table/user-staging/stream/2024-02-18T15:03:34.944',
  },
  {
    eventID: 'f61f60150300a8880c096071006558de',
    eventName: 'MODIFY',
    eventVersion: '1.1',
    eventSource: 'aws:dynamodb',
    awsRegion: 'us-east-1',
    dynamodb: {
      ApproximateCreationDateTime: 1708735541,
      Keys: {
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
      },
      NewImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'unavailable',
        },
        updatedAt: {
          S: '2024-02-24T00:45:41.540Z',
        },
      },
      OldImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'unchecked',
        },
        updatedAt: {
          S: '2024-02-24T00:45:39.453Z',
        },
      },
      SequenceNumber: '992535800000000087823199153',
      SizeBytes: 735,
      StreamViewType: 'NEW_AND_OLD_IMAGES',
    },
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:801505813432:table/user-staging/stream/2024-02-18T15:03:34.944',
  },
  {
    eventID: '45c119d39dbd147303b6ac05951321ef',
    eventName: 'MODIFY',
    eventVersion: '1.1',
    eventSource: 'aws:dynamodb',
    awsRegion: 'us-east-1',
    dynamodb: {
      ApproximateCreationDateTime: 1708735543,
      Keys: {
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
      },
      NewImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'unchecked',
        },
        updatedAt: {
          S: '2024-02-24T00:45:43.407Z',
        },
      },
      OldImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'unavailable',
        },
        updatedAt: {
          S: '2024-02-24T00:45:41.540Z',
        },
      },
      SequenceNumber: '992535900000000087823201609',
      SizeBytes: 735,
      StreamViewType: 'NEW_AND_OLD_IMAGES',
    },
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:801505813432:table/user-staging/stream/2024-02-18T15:03:34.944',
  },
  {
    eventID: 'dad72d74ec1d37eec6735bd405675f65',
    eventName: 'MODIFY',
    eventVersion: '1.1',
    eventSource: 'aws:dynamodb',
    awsRegion: 'us-east-1',
    dynamodb: {
      ApproximateCreationDateTime: 1708735545,
      Keys: {
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
      },
      NewImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'unavailable',
        },
        updatedAt: {
          S: '2024-02-24T00:45:45.406Z',
        },
      },
      OldImage: {
        listId: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        createdAt: {
          S: '2024-02-24T00:45:36.238Z',
        },
        itemId: {
          S: '020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        dynamodeEntity: {
          S: 'Item',
        },
        quantity: {
          N: '1',
        },
        name: {
          S: 'New',
        },
        sk: {
          S: 'Item#020386ca-64c9-4c2f-9756-a201e9fd7282',
        },
        pk: {
          S: '355303f9-9dd3-4a2d-a5b1-c98d8c4d7e23',
        },
        category: {
          S: 'other',
        },
        gsi_sk_1: {
          S: '2024-02-24T00:45:36.238Z',
        },
        status: {
          S: 'unchecked',
        },
        updatedAt: {
          S: '2024-02-24T00:45:43.407Z',
        },
      },
      SequenceNumber: '992536000000000087823204212',
      SizeBytes: 735,
      StreamViewType: 'NEW_AND_OLD_IMAGES',
    },
    eventSourceARN: 'arn:aws:dynamodb:us-east-1:801505813432:table/user-staging/stream/2024-02-18T15:03:34.944',
  },
] as const;

type UserTablePrimaryKey = {
  pk: string;
  sk: string;
};

type UserTableProps = UserTablePrimaryKey & {
  createdAt?: Date;
  updatedAt?: Date;

  gsi_pk_2?: string;
  gsi_sk_2?: string;

  gsi_pk_3?: string;
  gsi_sk_3?: string;
};

const DYNAMODE_INDEX = 'dynamode-index';
const GSI_2_INDEX = 'GSI_2_INDEX';
const GSI_3_INDEX = 'GSI_3_INDEX';

class UserTable extends Entity {
  @attribute.partitionKey.string()
  pk: string;

  @attribute.sortKey.string()
  sk: string;

  @attribute.gsi.partitionKey.string({ indexName: DYNAMODE_INDEX })
  dynamodeEntity!: string;

  @attribute.gsi.sortKey.string({ indexName: DYNAMODE_INDEX })
  gsi_sk_1: string;

  @attribute.gsi.partitionKey.string({ indexName: GSI_2_INDEX })
  gsi_pk_2?: string;

  @attribute.gsi.sortKey.string({ indexName: GSI_2_INDEX })
  gsi_sk_2?: string;

  @attribute.gsi.partitionKey.string({ indexName: GSI_3_INDEX })
  gsi_pk_3?: string;

  @attribute.gsi.sortKey.string({ indexName: GSI_3_INDEX })
  gsi_sk_3?: string;

  @attribute.date.string()
  createdAt: Date;

  @attribute.date.string()
  updatedAt: Date;

  constructor(props: UserTableProps) {
    super(props);

    this.pk = props.pk;
    this.sk = props.sk;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.gsi_sk_1 = this.createdAt.toISOString();
    this.gsi_pk_2 = props.gsi_pk_2;
    this.gsi_sk_2 = props.gsi_sk_2;
    this.gsi_pk_3 = props.gsi_pk_3;
    this.gsi_sk_3 = props.gsi_sk_3;
  }
}

type Status = 'checked' | 'unchecked' | 'unavailable';
type ItemProps = UserTableProps & {
  name: string;
  quantity: number;
  category: string;
  status: Status;
};

class Item extends UserTable {
  @attribute.sortKey.string({ prefix: Item.name })
  sk!: string;

  @attribute.string()
  listId: string;

  @attribute.string()
  itemId: string;

  @attribute.string()
  name: string;

  @attribute.number()
  quantity: number;

  @attribute.string()
  category: string;

  @attribute.string()
  status: Status;

  constructor(props: ItemProps) {
    super(props);

    this.listId = props.pk;
    this.itemId = props.sk;
    this.name = props.name;
    this.quantity = props.quantity;
    this.category = props.category;
    this.status = props.status;
  }

  static getPrimaryKey(listId: string, itemId: string): UserTablePrimaryKey {
    return {
      pk: listId,
      sk: itemId,
    };
  }
}

const UserTableManager = new TableManager(UserTable, {
  tableName: 'USER_TABLE_NAME',
  partitionKey: 'pk',
  sortKey: 'sk',
  indexes: {
    [DYNAMODE_INDEX]: {
      partitionKey: 'dynamodeEntity',
      sortKey: 'gsi_sk_1',
    },
    [GSI_2_INDEX]: {
      partitionKey: 'gsi_pk_2',
      sortKey: 'gsi_sk_2',
    },
    [GSI_3_INDEX]: {
      partitionKey: 'gsi_pk_3',
      sortKey: 'gsi_sk_3',
    },
  },
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

const ItemManager = UserTableManager.entityManager(Item);

records
  .map((record) => new Stream(record))
  .forEach((stream) => {
    if (ItemManager.stream.check(stream) && stream.operation === 'modify') {
      console.log(`DynamodeStorage = `, stream);
    }
  });

// new DynamodeStream(record, Item)
