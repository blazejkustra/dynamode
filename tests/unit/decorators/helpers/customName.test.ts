import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import customName from '@lib/decorators/helpers/customName';
import Dynamode from '@lib/dynamode/index';

describe('Decorators', () => {
  let transferMetadataSpy = vi.spyOn(Dynamode.storage, 'transferMetadata');

  beforeEach(() => {
    transferMetadataSpy = vi.spyOn(Dynamode.storage, 'transferMetadata');
    transferMetadataSpy.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('customName', async () => {
    test('Should call transfer metadata when renaming an entity', async () => {
      customName('NEW_NAME')(class OLD_NAME {});
      expect(transferMetadataSpy).toHaveBeenNthCalledWith(1, 'OLD_NAME', 'NEW_NAME');
    });

    test('Should call transfer metadata when renaming an entity with the same name', async () => {
      customName('OLD_NAME')(class OLD_NAME {});
      expect(transferMetadataSpy).toHaveBeenNthCalledWith(1, 'OLD_NAME', 'OLD_NAME');
    });
  });
});
