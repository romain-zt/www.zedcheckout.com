/** A contiguous time window within a single day. Times in HH:mm format (tenant tz). */
export interface TimeWindow {
  startTime: string;
  endTime: string;
}
