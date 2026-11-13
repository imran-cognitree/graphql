export interface Tag {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string | null;
  createdAt: string | null;
  tags: Tag[];
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  tagIds?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tagIds?: string[];
}
