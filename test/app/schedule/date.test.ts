import { describe, it, expect } from 'vitest';
import {
  startOfWeek,
  addDays,
  toISODate,
  buildWeek,
  fmtDay,
} from '../../../src/app/schedule/date';

describe('date utilities', () => {
  describe('startOfWeek', () => {
    it('should return Monday for any day in the week', () => {
      // Test with a Wednesday (2024-01-17 is a Wednesday)
      const wednesday = new Date('2024-01-17T12:00:00Z');
      const start = startOfWeek(wednesday);
      expect(start.getDay()).toBe(1); // Monday
      expect(toISODate(start)).toBe('2024-01-14'); // Monday of that week
    });

    it('should return Monday for Sunday', () => {
      // Test with a Sunday (2024-01-21 is a Sunday)
      const sunday = new Date('2024-01-21T12:00:00Z');
      const start = startOfWeek(sunday);
      expect(start.getDay()).toBe(1); // Monday
      expect(toISODate(start)).toBe('2024-01-14'); // Monday of that week
    });

    it('should return Monday for Monday', () => {
      // Test with a Monday (2024-01-15 is a Monday)
      const monday = new Date('2024-01-15T12:00:00Z');
      const start = startOfWeek(monday);
      expect(start.getDay()).toBe(1); // Monday
      expect(toISODate(start)).toBe('2024-01-14'); // Same Monday
    });

    it('should set time to start of day', () => {
      const date = new Date('2024-01-17T14:30:45.123Z');
      const start = startOfWeek(date);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);
    });
  });

  describe('addDays', () => {
    it('should add positive days correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = addDays(date, 3);
      expect(toISODate(result)).toBe('2024-01-18');
    });

    it('should subtract days correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = addDays(date, -3);
      expect(toISODate(result)).toBe('2024-01-12');
    });

    it('should handle month boundaries', () => {
      const date = new Date('2024-01-31T12:00:00Z');
      const result = addDays(date, 1);
      expect(toISODate(result)).toBe('2024-02-01');
    });

    it('should handle year boundaries', () => {
      const date = new Date('2024-12-31T12:00:00Z');
      const result = addDays(date, 1);
      expect(toISODate(result)).toBe('2025-01-01');
    });

    it('should not mutate the original date', () => {
      const original = new Date('2024-01-15T12:00:00Z');
      const originalISO = toISODate(original);
      addDays(original, 5);
      expect(toISODate(original)).toBe(originalISO);
    });
  });

  describe('toISODate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      expect(toISODate(date)).toBe('2024-01-15');
    });

    it('should handle different timezones correctly', () => {
      const date = new Date('2024-01-15T23:59:59.999Z');
      expect(toISODate(date)).toBe('2024-01-15');
    });
  });

  describe('buildWeek', () => {
    it('should build a week starting from Monday', () => {
      const wednesday = new Date('2024-01-17T12:00:00Z'); // Wednesday
      const week = buildWeek(wednesday);

      expect(week.start.getDay()).toBe(1); // Monday
      expect(week.days).toHaveLength(7);
      expect(toISODate(week.start)).toBe('2024-01-14'); // Monday
      expect(toISODate(week.end)).toBe('2024-01-21'); // Next Monday
    });

    it('should include all 7 days of the week', () => {
      const week = buildWeek(new Date('2024-01-17T12:00:00Z'));
      const dayNames = week.days.map(d => d.getDay());
      expect(dayNames).toEqual([1, 2, 3, 4, 5, 6, 0]); // Mon, Tue, Wed, Thu, Fri, Sat, Sun
    });

    it('should have correct date sequence', () => {
      const week = buildWeek(new Date('2024-01-17T12:00:00Z'));
      const dates = week.days.map(toISODate);
      expect(dates).toEqual([
        '2024-01-14', // Monday
        '2024-01-15', // Tuesday
        '2024-01-16', // Wednesday
        '2024-01-17', // Thursday
        '2024-01-18', // Friday
        '2024-01-19', // Saturday
        '2024-01-20', // Sunday
      ]);
    });
  });

  describe('fmtDay', () => {
    it('should format day with weekday, month, and day', () => {
      const date = new Date('2024-01-15'); // Monday
      const formatted = fmtDay(date);
      expect(formatted).toMatch(/^Mon, Jan \d+$/);
    });

    it('should handle different months', () => {
      const date = new Date('2024-12-25'); // Christmas
      const formatted = fmtDay(date);
      expect(formatted).toMatch(/^Wed, Dec \d+$/);
    });
  });
});
