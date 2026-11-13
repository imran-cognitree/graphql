## GraphQL
- A query language
- A server-side runtime

## Primary Problems GraphQL Solves
- Overfetching
- Under-fetching

## Example Query
```graphql
query {
    note(id: 1) {
        title
        content

        tags {
            name
        }

        author {
            name
            email
        }
    }
}
```
**Client** mentions:
- What operation it wanted to perform
- Which note it wanted
- Which fields it wanted in the response.

## API Contract
- Which object exists
- What fields those object contain
- Which operations can the client perform
- What arguments those operations accept
- What data are expected and returned

## Workflow
- CLient makes the request over http to `/graphql`
- Spring GraphQL parses and validates the request against the Schema, and identifies:
    - Operation type
    - Root field
    - Args
    - Requested fields
- GraphQL engine executes the query
- Resolver (Controller) -> Service Layer -> Repository
- JSON response travels to the client

## Operations
- **Query (READ)**
- **Mutation (WRITE / UPDATE /DELETE)**
```graphql
mutation CreateNote {
    createNote(
        input: {
            title: "Note One!"
            content: "We don't require the commas"
        }
    ) {
        id
        title
        content
    }
}
```
- **Subscription (Receive updates when events occur. REAL-TIME)**

```plaintext
NOTE: resolvers are field-level, not endpoint-level. The title field has a resolver, the tags field has a resolver, they're independent. If the client doesn't ask for tags, the tags resolver never runs.
```

## Later
- Challenges of GraphQL
