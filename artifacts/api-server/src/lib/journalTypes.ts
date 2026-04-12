export interface PromptAnswer {
  promptId: string;
  promptText: string;
  answer: string;
}

export interface EntrySource {
  backend: "local" | "google-drive" | "mock";
  path?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  template: string;
  answers: PromptAnswer[];
  markdown: string;
  createdAt: string;
  updatedAt: string;
  source: EntrySource;
}

export interface JournalSummary {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  activeMonths: string[];
  averagePresenceScore: number;
}

export interface StorageSettings {
  backend: "local" | "google-drive" | "mock";
  localPath?: string;
  googleDriveFolderId?: string;
  personalValues?: string[];
}
