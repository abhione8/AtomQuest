import { Quarter } from '@prisma/client';
import { isWithinInterval } from 'date-fns';

export interface QuarterDateRange {
  startDate: Date;
  endDate: Date;
}

export function getQuarterDateRange(
  quarter: Quarter,
  cycleData: {
    q1StartDate?: Date | null;
    q1EndDate?: Date | null;
    q2StartDate?: Date | null;
    q2EndDate?: Date | null;
    q3StartDate?: Date | null;
    q3EndDate?: Date | null;
    q4StartDate?: Date | null;
    q4EndDate?: Date | null;
    startDate?: Date;
    endDate?: Date;
  }
): QuarterDateRange | null {
  switch (quarter) {
    case Quarter.Q1:
      if (cycleData.q1StartDate && cycleData.q1EndDate) {
        return {
          startDate: new Date(cycleData.q1StartDate),
          endDate: new Date(cycleData.q1EndDate),
        };
      }
      break;
    case Quarter.Q2:
      if (cycleData.q2StartDate && cycleData.q2EndDate) {
        return {
          startDate: new Date(cycleData.q2StartDate),
          endDate: new Date(cycleData.q2EndDate),
        };
      }
      break;
    case Quarter.Q3:
      if (cycleData.q3StartDate && cycleData.q3EndDate) {
        return {
          startDate: new Date(cycleData.q3StartDate),
          endDate: new Date(cycleData.q3EndDate),
        };
      }
      break;
    case Quarter.Q4:
      if (cycleData.q4StartDate && cycleData.q4EndDate) {
        return {
          startDate: new Date(cycleData.q4StartDate),
          endDate: new Date(cycleData.q4EndDate),
        };
      }
      break;
    case Quarter.ANNUAL:
      if (cycleData.startDate && cycleData.endDate) {
        return {
          startDate: new Date(cycleData.startDate),
          endDate: new Date(cycleData.endDate),
        };
      }
      break;
  }
  return null;
}

export function isInQuarterWindow(quarter: Quarter, dateRange: QuarterDateRange | null): boolean {
  if (!dateRange) return false;
  return isWithinInterval(new Date(), {
    start: dateRange.startDate,
    end: dateRange.endDate,
  });
}

export function getAvailableQuarters(): Quarter[] {
  return [Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4];
}

export function getCurrentQuarter(
  cycleData: {
    q1StartDate?: Date | null;
    q1EndDate?: Date | null;
    q2StartDate?: Date | null;
    q2EndDate?: Date | null;
    q3StartDate?: Date | null;
    q3EndDate?: Date | null;
    q4StartDate?: Date | null;
    q4EndDate?: Date | null;
    startDate?: Date;
    endDate?: Date;
  }
): Quarter | null {
  const today = new Date();

  const quarters: Quarter[] = [Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4];

  for (const quarter of quarters) {
    const range = getQuarterDateRange(quarter, cycleData);
    if (range && isInQuarterWindow(quarter, range)) {
      return quarter;
    }
  }

  return null;
}
