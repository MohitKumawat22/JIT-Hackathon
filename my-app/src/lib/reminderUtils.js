/**
 * Calculate days of supply remaining
 * based on remaining quantity and daily tablet consumption
 */
export function daysOfSupplyLeft(reminder) {
  const dailyDoses = getDailyDoseCount(reminder.frequency);
  const dailyConsumption = dailyDoses * reminder.tabletsPerDose;
  if (dailyConsumption === 0) return Infinity;
  return Math.floor(reminder.remainingQuantity / dailyConsumption);
}

/**
 * How many times per day the medicine is taken
 */
export function getDailyDoseCount(frequency) {
  const map = {
    once_daily:      1,
    twice_daily:     2,
    thrice_daily:    3,
    every_4_hours:   6,
    every_6_hours:   4,
    every_8_hours:   3,
    once_weekly:     1 / 7,
    twice_weekly:    2 / 7,
    alternate_days:  1 / 2,
    custom:          1,
  };
  return map[frequency] ?? 1;
}

/**
 * Returns true if reminder needs refill alert
 */
export function needsRefillAlert(reminder) {
  return daysOfSupplyLeft(reminder) <= reminder.refillAlertDays;
}

/**
 * Human-readable frequency label
 */
export function frequencyLabel(frequency) {
  const labels = {
    once_daily:      "Once daily",
    twice_daily:     "Twice daily",
    thrice_daily:    "Three times daily",
    every_4_hours:   "Every 4 hours",
    every_6_hours:   "Every 6 hours",
    every_8_hours:   "Every 8 hours",
    once_weekly:     "Once a week",
    twice_weekly:    "Twice a week",
    alternate_days:  "Alternate days",
    custom:          "Custom schedule",
  };
  return labels[frequency] ?? frequency;
}

/**
 * Next dose time as a human string
 */
export function nextDoseIn(times) {
  if (!times || times.length === 0) return "not set";
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Sort times to ensure we find the correct next one
  const sortedTimes = [...times].sort((a, b) => {
    const [h1, m1] = a.split(":").map(Number);
    const [h2, m2] = b.split(":").map(Number);
    return (h1 * 60 + m1) - (h2 * 60 + m2);
  });

  for (const time of sortedTimes) {
    const [h, m] = time.split(":").map(Number);
    const doseMinutes = (h ?? 0) * 60 + (m ?? 0);
    if (doseMinutes > currentMinutes) {
      const diff = doseMinutes - currentMinutes;
      if (diff < 60) return `in ${diff} min`;
      return `in ${Math.floor(diff / 60)}h ${diff % 60}m`;
    }
  }
  return "tomorrow";
}

/**
 * Adherence percentage from taken log
 */
export function adherencePercent(reminder) {
  const total = reminder.takenLog.length;
  if (total === 0) return 100;
  const taken = reminder.takenLog.filter((l) => l.status === "taken").length;
  return Math.round((taken / total) * 100);
}
