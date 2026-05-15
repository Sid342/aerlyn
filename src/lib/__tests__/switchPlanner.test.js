import { describe, it, expect } from 'vitest';
import { computeRoomPoints, recommendPlates } from '../switchPlanner.js';

describe('switchPlanner', () => {
  describe('computeRoomPoints', () => {
    it('empty devices → all zero totals', () => {
      const result = computeRoomPoints({ devices: [] });
      expect(result).toEqual({
        gang: 0, fan: 0, curtain: 0, socket: 0,
        total: 0,
        byType: { gang: 0, fan: 0, curtain: 0, socket: 0 },
      });
    });

    it('6×cob-downlight + 1×bldc-fan + 1×curtain + 2×usb-charger → gang=6, fan=1, curtain=1, socket=2, total=10', () => {
      const room = {
        devices: [
          { deviceId: 'cob-downlight', qty: 6 },
          { deviceId: 'bldc-fan', qty: 1 },
          { deviceId: 'curtain', qty: 1 },
          { deviceId: 'usb-charger', qty: 2 },
        ],
      };
      const result = computeRoomPoints(room);
      expect(result.gang).toBe(6);
      expect(result.fan).toBe(1);
      expect(result.curtain).toBe(1);
      expect(result.socket).toBe(2);
      expect(result.total).toBe(10);
    });

    it('devices without control field (camera, geyser) contribute 0', () => {
      const room = {
        devices: [
          { deviceId: 'camera', qty: 2 },
          { deviceId: 'geyser', qty: 1 },
        ],
      };
      const result = computeRoomPoints(room);
      expect(result.gang).toBe(0);
      expect(result.fan).toBe(0);
      expect(result.curtain).toBe(0);
      expect(result.socket).toBe(0);
      expect(result.total).toBe(0);
    });

    it('unknown deviceId is skipped silently (contributes 0)', () => {
      const room = {
        devices: [
          { deviceId: 'TOTALLY-FAKE-XYZ', qty: 5 },
        ],
      };
      const result = computeRoomPoints(room);
      expect(result.total).toBe(0);
    });
  });

  describe('recommendPlates', () => {
    it('recommendPlates(0) → empty plates, 0 spare', () => {
      expect(recommendPlates(0)).toEqual({ plates: [], spareModules: 0 });
    });

    it('recommendPlates(1) → [2], spareModules: 1', () => {
      expect(recommendPlates(1)).toEqual({ plates: [2], spareModules: 1 });
    });

    it('recommendPlates(2) → [2], spareModules: 0', () => {
      expect(recommendPlates(2)).toEqual({ plates: [2], spareModules: 0 });
    });

    it('recommendPlates(3) → [4], spareModules: 1', () => {
      expect(recommendPlates(3)).toEqual({ plates: [4], spareModules: 1 });
    });

    it('recommendPlates(5) → [6], spareModules: 1', () => {
      expect(recommendPlates(5)).toEqual({ plates: [6], spareModules: 1 });
    });

    it('recommendPlates(9) → [12], spareModules: 3', () => {
      expect(recommendPlates(9)).toEqual({ plates: [12], spareModules: 3 });
    });

    it('recommendPlates(10) → [12], spareModules: 2', () => {
      expect(recommendPlates(10)).toEqual({ plates: [12], spareModules: 2 });
    });

    it('recommendPlates(11) → [12], spareModules: 1', () => {
      expect(recommendPlates(11)).toEqual({ plates: [12], spareModules: 1 });
    });

    it('recommendPlates(13) → [12, 2], spareModules: 1', () => {
      expect(recommendPlates(13)).toEqual({ plates: [12, 2], spareModules: 1 });
    });

    it('recommendPlates(25) → [12, 12, 2], spareModules: 1', () => {
      expect(recommendPlates(25)).toEqual({ plates: [12, 12, 2], spareModules: 1 });
    });
  });
});
