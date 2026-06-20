export type NoteRecord = {
  id: string;
  content: string;
  updatedAt: string;
};

export type NoteResponse = NoteRecord;

export type SaveNoteRequest = {
  id: string;
  content: string;
};
