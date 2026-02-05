import { describe, expect, it } from 'vitest';
import { boolAttr } from './bool-attr';
import { extract } from './extract';

describe('utils', () => {
  describe('extract', () => {
    it('should return direct values', () => {
      expect(extract(1)).toBe(1);
      expect(extract('a')).toBe('a');
    });

    it('should call getter values', () => {
      expect(extract(() => 2)).toBe(2);
    });
  });

  describe('boolAttr', () => {
    it('should parse typical boolean attribute values', () => {
      expect(boolAttr('')).toBe(true);
      expect(boolAttr(true)).toBe(true);
      expect(boolAttr('true')).toBe(true);
      expect(boolAttr('1')).toBe(true);
      expect(boolAttr('on')).toBe(true);

      expect(boolAttr(undefined)).toBe(false);
      expect(boolAttr(null)).toBe(false);
      expect(boolAttr(false)).toBe(false);
      expect(boolAttr('false')).toBe(false);
      expect(boolAttr('0')).toBe(false);
      expect(boolAttr('off')).toBe(false);
    });
  });
});

