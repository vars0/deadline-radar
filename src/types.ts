export type ChecklistItem = { id: string; label: string; done: boolean };

export type Contest = {
  id: string;
  title: string;
  deadline: string;
  sourceText: string;
  snippet: string;
  sourceZone: string;
  notes: string[];
  checklist: ChecklistItem[];
};

export type ParsedAnnouncement = {
  title: string;
  deadline: string | null;
  snippet: string;
  sourceZone: string;
  notes: string[];
  requirements: string[];
};
