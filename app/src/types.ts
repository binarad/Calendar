export type SelectedEvent = {
  id: number;
  title: string;
  description?: string | null;
  startTime: string;
  endTime?: string | null;
};

export type Reminder = {
  id?: number;
  eventId: number;
  minutesBefore: number;
};

export type UpcomingEvent = {
  eventId: number;
  title: string;
  startTime: string;
};
