import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as decorateAttribute from '@lib/decorators/helpers/decorateAttribute';
import { array, binary, boolean, map, number, object, set, string } from '@lib/decorators/helpers/other';

describe('Decorators', () => {
  let decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');

  beforeEach(() => {
    decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');
    decorateAttributeSpy.mockReturnValue(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('string', async () => {
    test('Should call decorateAttribute with String attribute type + options', async () => {
      string();
      string({ prefix: 'PREFIX', suffix: 'SUFFIX' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, String, 'attribute', undefined);
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(2, String, 'attribute', {
        prefix: 'PREFIX',
        suffix: 'SUFFIX',
      });
    });
  });

  describe('number', async () => {
    test('Should call decorateAttribute with Number attribute type', async () => {
      number();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Number, 'attribute');
    });
  });

  describe('boolean', async () => {
    test('Should call decorateAttribute with Boolean attribute type', async () => {
      boolean();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Boolean, 'attribute');
    });
  });

  describe('object', async () => {
    test('Should call decorateAttribute with Object attribute type', async () => {
      object();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Object, 'attribute');
    });
  });

  describe('array', async () => {
    test('Should call decorateAttribute with Array attribute type', async () => {
      array();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Array, 'attribute');
    });
  });

  describe('set', async () => {
    test('Should call decorateAttribute with Set attribute type', async () => {
      set();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Set, 'attribute');
    });
  });

  describe('map', async () => {
    test('Should call decorateAttribute with Map attribute type', async () => {
      map();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Map, 'attribute');
    });
  });

  describe('binary', async () => {
    test('Should call decorateAttribute with Uint8Array attribute type', async () => {
      binary();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Uint8Array, 'attribute');
    });
  });
});
