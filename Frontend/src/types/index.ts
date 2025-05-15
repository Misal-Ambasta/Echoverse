export interface TimeCapsuleMode {
  enabled: boolean;
  contentVisibleAfter: Date | null;
}

export interface User {
  _id: string;
  email: string;
  timeCapsuleMode: TimeCapsuleMode;
  createdAt: string;
  updatedAt: string;
}

export interface Timeline {
  _id: string;
  title: string;
  mood: string;
  audioUrl: string;
  createdAt: string;
  unlockAt: string;
  user: string;
  isNotified: boolean;
}
