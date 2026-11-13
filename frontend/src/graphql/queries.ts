import { gql } from '@apollo/client/core';

export const GET_NOTES = gql`
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

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
    }
  }
`;
