import { describe, it, expect } from 'vitest';
import { VersionService } from '../services/versionService';

describe('Version & Staleness Service', () => {
  it('should generate deterministic sha256 hashes', () => {
    const text1 = 'Proton Exchange Membrane Electrolyzer';
    const text2 = 'Proton Exchange Membrane Electrolyzer';
    const text3 = 'Proton Exchange Membrane Electrolyzer (Modified)';

    const hash1 = VersionService.generateHash(text1);
    const hash2 = VersionService.generateHash(text2);
    const hash3 = VersionService.generateHash(text3);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).toHaveLength(64);
  });
});
