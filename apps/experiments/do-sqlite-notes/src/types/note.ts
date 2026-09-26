export type NoteRecord = {
  id: string;
  content: string;
  updatedAt: string;
};

export type SaveNoteRequest = {
  userId?: string;
  id?: string;
  content?: string;
};
