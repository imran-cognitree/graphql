import { gql } from '@apollo/client/core';
import type { TypedDocumentNode } from '@apollo/client/core';
import type { Note, Tag, CreateNoteInput, UpdateNoteInput } from '../types/note';

export const CREATE_NOTE: TypedDocumentNode<
  { createNote: Note },
  { input: CreateNoteInput }
> = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      title
      content
      createdAt
      tags {
        id
        name
      }
    }
  }
`;

export const UPDATE_NOTE: TypedDocumentNode<
  { updateNote: Note },
  { id: string; input: UpdateNoteInput }
> = gql`
  mutation UpdateNote($id: ID!, $input: UpdateNoteInput!) {
    updateNote(id: $id, input: $input) {
      id
      title
      content
      createdAt
      tags {
        id
        name
      }
    }
  }
`;

export const DELETE_NOTE: TypedDocumentNode<
  { deleteNote: boolean },
  { id: string }
> = gql`
  mutation DeleteNote($id: ID!) {
    deleteNote(id: $id)
  }
`;

export const CREATE_TAG: TypedDocumentNode<
  { createTag: Tag },
  { name: string }
> = gql`
  mutation CreateTag($name: String!) {
    createTag(name: $name) {
      id
      name
    }
  }
`;
