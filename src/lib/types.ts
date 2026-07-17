
export interface Reminder {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO String
  timezone: string;
  hostCountry: string;
  summary?: string;
  soundId: string;
  isActive: boolean;
}

export interface Participant {
  name: string;
  timezone: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
}
