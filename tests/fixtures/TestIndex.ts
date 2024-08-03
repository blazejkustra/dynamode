import { vi } from 'vitest';

import attribute, { entity } from '@lib/decorators';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import TableManager from '@lib/table';

vi.useFakeTimers();

export const mockDate = new Date(1000000000000);
vi.setSystemTime(mockDate);

Dynamode.ddb.local();
export const ddb = Dynamode.ddb.get();

export class TestIndex extends Entity {
  @attribute.partitionKey.number()
  partitionKey: number;

  @attribute.sortKey.number()
  sortKey: number;

  constructor(props: { partitionKey: number; sortKey: number }) {
    super();

    this.partitionKey = props.partitionKey;
    this.sortKey = props.sortKey;
  }
}

@entity.customName('TEST_INDEX_GSI')
export class TestIndexWithGSI extends TestIndex {
  // TODO: Make it so that partitionKey decorator is not required for a second time
  @attribute.partitionKey.number()
  @attribute.gsi.partitionKey.number({ indexName: 'index-normal' })
  partitionKey!: number;

  @attribute.sortKey.number()
  @attribute.gsi.sortKey.number({ indexName: 'index-normal' })
  sortKey!: number;

  constructor(props: { partitionKey: number; sortKey: number }) {
    super(props);
  }
}

export const TestIndexWithGSIManager = new TableManager(TestIndexWithGSI, {
  tableName: 'TestIndexWithGSI',
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    'index-normal': {
      partitionKey: 'partitionKey',
      sortKey: 'sortKey',
    },
  },
});

export const TestIndexWithGSIEntityManager = TestIndexWithGSIManager.entityManager();

export class TestIndexInverse extends TestIndex {
  @attribute.partitionKey.number()
  @attribute.gsi.sortKey.number({ indexName: 'index-inverse' })
  partitionKey!: number;

  @attribute.sortKey.number()
  @attribute.gsi.partitionKey.number({ indexName: 'index-inverse' })
  sortKey!: number;

  constructor(props: { partitionKey: number; sortKey: number }) {
    super(props);
  }
}

export const TestIndexInverseManager = new TableManager(TestIndexInverse, {
  tableName: 'TestIndexInverse',
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    'index-inverse': {
      partitionKey: 'sortKey',
      sortKey: 'partitionKey',
    },
  },
});

export const TestIndexInverseEntityManager = TestIndexInverseManager.entityManager();

export class TestIndexLSI extends TestIndex {
  @attribute.sortKey.number()
  @attribute.lsi.sortKey.number({ indexName: 'index-lsi' })
  sortKey!: number;

  @attribute.lsi.sortKey.string({ indexName: 'index-lsi2' })
  otherKey: string;

  constructor(props: { partitionKey: number; sortKey: number; otherKey: string }) {
    super(props);

    this.otherKey = props.otherKey;
  }
}

export const TestIndexLSIManager = new TableManager(TestIndexLSI, {
  tableName: 'TestIndexLSI',
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    'index-lsi': {
      sortKey: 'sortKey',
    },
    'index-lsi2': {
      sortKey: 'otherKey',
    },
  },
});

export const TestIndexLSIEntityManager = TestIndexLSIManager.entityManager();

export class TestIndexMultipleGSI extends TestIndex {
  @attribute.gsi.partitionKey.string({ indexName: 'index-1' })
  gsi_1_pk?: string;

  @attribute.gsi.partitionKey.number({ indexName: 'index-2' })
  @attribute.gsi.partitionKey.number({ indexName: 'index-3' })
  @attribute.gsi.partitionKey.number({ indexName: 'index-4' })
  gsi_2_3_4_pk?: number;

  @attribute.gsi.sortKey.number({ indexName: 'index-1' })
  @attribute.gsi.sortKey.number({ indexName: 'index-2' })
  gsi_1_2_sk?: number;

  @attribute.gsi.sortKey.string({ indexName: 'index-3' })
  gsi_3_sk?: string;

  constructor(props: {
    partitionKey: number;
    sortKey: number;
    gsi_1_pk?: string;
    gsi_2_3_4_pk?: number;
    gsi_1_2_sk?: number;
    gsi_3_sk?: string;
  }) {
    super(props);

    this.gsi_1_pk = props.gsi_1_pk;
    this.gsi_2_3_4_pk = props.gsi_2_3_4_pk;
    this.gsi_1_2_sk = props.gsi_1_2_sk;
    this.gsi_3_sk = props.gsi_3_sk;
  }
}

export const TestIndexMultipleGSIManager = new TableManager(TestIndexMultipleGSI, {
  tableName: 'TestIndexMultipleGSI',
  partitionKey: 'partitionKey',
  sortKey: 'sortKey',
  indexes: {
    'index-1': {
      partitionKey: 'gsi_1_pk',
      sortKey: 'gsi_1_2_sk',
    },
    'index-2': {
      partitionKey: 'gsi_2_3_4_pk',
      sortKey: 'gsi_1_2_sk',
    },
    'index-3': {
      partitionKey: 'gsi_2_3_4_pk',
      sortKey: 'gsi_3_sk',
    },
    'index-4': {
      partitionKey: 'gsi_2_3_4_pk',
    },
  },
});

export const TestIndexMultipleGSIEntityManager = TestIndexMultipleGSIManager.entityManager();
