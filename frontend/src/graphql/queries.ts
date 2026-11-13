import { gql } from '@apollo/client/core';
import type { TypedDocumentNode } from '@apollo/client/core';
import type { Note, Tag } from '../types/note';

export const GET_NOTES: TypedDocumentNode<{ notes: Note[] }> = gql`
  query GetNotes {
    notes {
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

export const GET_TAGS: TypedDocumentNode<{ tags: Tag[] }> = gql`
  query GetTags {
    tags {
      id
      name
    }
  }
`;
