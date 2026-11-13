# GraphQL Notes Backend: Complete Architectural Walkthrough

This document breaks down the entire Spring Boot + GraphQL architecture built for the Notes application. It connects conceptual understanding to the exact files on disk, detailing how each component works, why it exists, and how data flows through the system.

---

## Table of Contents
1. [Technologies Used & Why](#1-technologies-used--why)
2. [End-to-End Request & Response Cycle](#2-end-to-end-request--response-cycle)
3. [Deep Dive: One File from Each Layer](#3-deep-dive-one-file-from-each-layer)
   - [Resources: schema.graphqls & application.properties](#a-resources)
   - [Controller: NoteController.java](#b-controller)
   - [DTO: CreateNoteInput.java](#c-dto-data-transfer-object)
   - [Entity: Note.java](#d-entity)
   - [Exception: GraphQLExceptionHandler.java & NoteNotFoundException.java](#e-exception)
   - [Repository: NoteRepository.java](#f-repository)
   - [Service: NoteService.java](#g-service)
4. [Core GraphQL Rules & Mental Models to Remember](#4-core-graphql-rules--mental-models-to-remember)

---

## 1. Technologies Used & Why

| Technology | Role in Project | Python / FastAPI Equivalent | Why We Use It |
|---|---|---|---|
| **Java 17** | Core programming language | Python 3.10+ | Modern LTS release of Java with records, pattern matching, strong typing, and performance. |
| **Spring Boot 4.1.x** | Application framework | FastAPI + Uvicorn | Handles dependency injection, auto-configuration, embedded HTTP web server (Tomcat), and lifecycle management. |
| **Spring for GraphQL** | GraphQL runtime integration | Strawberry GraphQL / Ariadne | Connects the GraphQL engine (`graphql-java`) with Spring MVC controllers, argument binding, and exception handlers. |
| **Spring Data JPA & Hibernate** | Object-Relational Mapping (ORM) & persistence | SQLAlchemy / SQLModel | Automatically generates SQL queries, manages DB connections, entity life cycles, and table relationships. |
| **H2 Database** | Embedded relational SQL database | SQLite (`sqlite:///:memory:`) | In-memory database that starts and stops with the app. Zero setup required, ideal for testing and development. |
| **GraphiQL** | Interactive browser UI | Swagger UI (`/docs`) | In-browser GraphQL IDE with syntax highlighting, autocomplete, and schema exploration via introspection. |
| **Maven** | Build & dependency manager | Poetry / Pipenv / pip | Manages external libraries, compilation, packaging, and execution via [`pom.xml`](file:///Users/imran/Workplace/Cognitree/graphql/notes/pom.xml). |

---

## 2. End-to-End Request & Response Cycle

Unlike REST where every resource has its own URL path (e.g. `GET /notes`, `POST /notes`, `DELETE /notes/1`), GraphQL exposes **exactly one HTTP endpoint**: `POST /graphql`.

### Sequence Diagram: Reading a Note with Tags

```
Client                  Spring Boot (HTTP)      GraphQL Engine         NoteController          NoteService          NoteRepository          H2 Database
  |                            |                      |                      |                      |                     |                      |
  |-- POST /graphql ---------->|                      |                      |                      |                     |                      |
  |   { query { note(id:1)     |                      |                      |                      |                     |                      |
  |     { title tags{name} }}} |                      |                      |                      |                     |                      |
  |                            |-- Parse & Validate ->|                      |                      |                     |                      |
  |                            |   vs schema.graphqls |                      |                      |                     |                      |
  |                            |                      |-- invoke note(id) -->|                      |                     |                      |
  |                            |                      |                      |-- getNoteById(1) --->|                     |                      |
  |                            |                      |                      |                      |-- findById(1) ----->|                      |
  |                            |                      |                      |                      |                     |-- SELECT FROM note ->|
  |                            |                      |                      |                      |                     |<-- Note record ------|
  |                            |                      |                      |                      |<-- Note entity -----|                      |
  |                            |                      |                      |<-- Note entity ------|                     |                      |
  |                            |                      |<-- Note object ------|                                            |                      |
  |                            |                      |                                                                   |                      |
  |                            |                      |-- Field: title -> Note.getTitle() [No DB hit]                     |                      |
  |                            |                      |-- Field: tags  -> calls tags(note) or Note.getTags()              |                      |
  |                            |                      |                   |                                               |                      |
  |                            |                      |                   |-- Hibernate triggers lazy load -------------->|-- SELECT FROM tag ---|
  |                            |                      |                   |<-- List<Tag> entities ------------------------|<-- JOIN note_tags ---|
  |                            |                      |<-- List<Tag> -----|                                                                      |
  |                            |                      |                                                                                          |
  |                            |                      |-- Shape JSON: omit 'content', 'createdAt' (client didn't ask)                            |
  |                            |<-- { data: {...} } --|                                                                                          |
  |<-- HTTP 200 OK ------------|                                                                                                                 |
  |    { "data": { ... } }     |                                                                                                                 |
```

### Step-by-Step Breakdown:
1. **HTTP Arrival**: The client issues an HTTP `POST` to `/graphql` with a JSON payload containing `"query"`.
2. **Schema Validation**: Spring passes the payload to `graphql-java`. The engine validates the query text against [`schema.graphqls`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/resources/graphql/schema.graphqls). If a field doesn't exist or syntax is wrong, it rejects the request immediately before touching Java code.
3. **Root Query Resolution**: The engine sees `note(id: 1)` in `type Query`. It scans the Spring application context for a `@Controller` having `@QueryMapping public Note note(@Argument Long id)` — matching [`NoteController.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/controller/NoteController.java#L34).
4. **Service & Database Query**: [`NoteController`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/controller/NoteController.java) delegates to [`NoteService.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/service/NoteService.java#L31), which calls [`NoteRepository.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/repository/NoteRepository.java). Hibernate issues `SELECT ... FROM note WHERE id = 1`.
5. **Demand-Driven Field Resolution**:
   - The engine examines which subfields the client requested under `note`:
   - `title`: Extracted in-memory via `note.getTitle()`.
   - `content`: **Omitted completely** from serialization because the query didn't ask for it.
   - `tags`: Triggers either the field resolver [`NoteController.tags(note)`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/controller/NoteController.java#L104) or `note.getTags()`. Because `tags` is `FetchType.LAZY`, Hibernate fires the `SELECT FROM tag ...` query **only because the client asked for it**.
6. **Error Interception (if any)**: If `getNoteById(id)` cannot find the note, it throws [`NoteNotFoundException`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/exception/NoteNotFoundException.java). [`GraphQLExceptionHandler.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/exception/GraphQLExceptionHandler.java) intercepts this exception, formats a GraphQL error object with path and classification, sets `data.note = null`, and lets sibling fields continue.
7. **Response Packaging**: The engine wraps the output in `{ "data": { ... } }` (and optionally `{ "errors": [ ... ] }`) and returns an **HTTP 200 OK**.

---

## 3. Deep Dive: One File from Each Layer

### A. Resources

#### 1. [`schema.graphqls`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/resources/graphql/schema.graphqls)
- **What it is**: The single source of truth and contract for the API, written in GraphQL Schema Definition Language (SDL).
- **Key Syntax**:
  - `type Note { ... }`: An object type describing what can be **read**.
  - `input CreateNoteInput { ... }`: A write-only structure passed as an argument to mutations.
  - `!`: Marks a field or argument as mandatory / non-null.
  - `type Query`: Root read entry point.
  - `type Mutation`: Root write entry point.
- **When it is invoked**: Loaded at server startup by Spring for GraphQL. Every incoming request is parsed and validated against this schema before any Java method runs.
- **Why it is necessary**: Without this file, GraphQL does not know what types, operations, or fields exist. It replaces OpenAPI / Swagger specifications by being natively enforced by the engine.

#### 2. [`application.properties`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/resources/application.properties)
- **What it is**: Spring Boot's central configuration file.
- **Key Settings**:
  - `spring.graphql.graphiql.enabled=true`: Exposes the web UI at `/graphiql`.
  - `spring.datasource.url=jdbc:h2:mem:notesdb`: Creates an in-memory SQL database.
  - `spring.jpa.hibernate.ddl-auto=create-drop`: Instructs Hibernate to automatically generate SQL tables from `@Entity` classes when the app starts, and drop them on shutdown.
  - `spring.jpa.show-sql=true`: Prints generated SQL statements to the console so you can see demand-driven execution in real time.
- **When it is invoked**: Read once during Spring Boot bootstrap.
- **Why it is necessary**: Connects the Spring application to infrastructure (database, GraphQL engine, logging).

---

### B. Controller

#### [`NoteController.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/controller/NoteController.java)
- **What it is**: The GraphQL Resolver class. In REST you would have `@RestController` with `@GetMapping("/notes")`. In Spring for GraphQL, you use `@Controller` with mapping annotations.
- **Key Syntax**:
  ```java
  @Controller
  public class NoteController {
      @QueryMapping
      public List<Note> notes() { ... }

      @QueryMapping
      public Note note(@Argument Long id) { ... }

      @MutationMapping
      public Note createNote(@Argument CreateNoteInput input) { ... }

      @SchemaMapping(typeName = "Note", field = "tags")
      public List<Tag> tags(Note note) { ... }
  }
  ```
  - `@Controller`: Registers the bean as a web handler.
  - `@QueryMapping`: Binds the method to a field of the same name inside `type Query` in SDL.
  - `@MutationMapping`: Binds to a field in `type Mutation`.
  - `@Argument`: Extracts a named argument from the GraphQL query and converts it to a Java type (`Long`, `String`, or DTO).
  - `@SchemaMapping(typeName = "Note", field = "tags")`: A field-level resolver. It is called **only** when a client query requests the `tags` field on a `Note`. The argument `Note note` represents the parent note.
- **When it is invoked**: The GraphQL engine invokes specific methods on this class as it traverses the fields of a query.
- **Why it is necessary**: It acts as the bridge between GraphQL schema operations and internal Java business services.

---

### C. DTO (Data Transfer Object)

#### [`CreateNoteInput.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/dto/CreateNoteInput.java)
- **What it is**: A plain Java POJO that mirrors `input CreateNoteInput` from the schema.
- **Key Syntax**:
  ```java
  public class CreateNoteInput {
      private String title;
      private String content;
      private List<Long> tagIds;
      // standard getters and setters
  }
  ```
- **When it is invoked**: When a `createNote(input: {...})` mutation arrives, Jackson and Spring for GraphQL deserialize the JSON input argument into this object and inject it into the controller's `@Argument CreateNoteInput input` parameter.
- **Why it is necessary**:
  1. Decouples the API write contract from the internal database entity.
  2. The database entity [`Note`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/entity/Note.java) expects a `List<Tag>` objects, but the client only submits `List<Long> tagIds`. The DTO cleanly captures what the client sent before conversion.

---

### D. Entity

#### [`Note.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/entity/Note.java)
- **What it is**: A JPA Entity that represents the relational table `note` in the database.
- **Key Syntax**:
  - `@Entity` & `@Table(name = "note")`: Tells Hibernate to map this class to a relational table.
  - `@Id` & `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Marks `id` as an auto-incrementing primary key.
  - `@ManyToMany(fetch = FetchType.LAZY)`: Connects `Note` to `Tag` via a join table `note_tags`. `LAZY` ensures tags are not queried from SQL until explicitly requested.
  - `@PrePersist void onCreate()`: Lifecycle hook that sets `createdAt` right before inserting into the database.
  - `getCreatedAt()`: Formats the internal `LocalDateTime` into an ISO-style `String`, matching the schema's `createdAt: String`.
- **When it is invoked**: Managed by Hibernate when reading from or writing to the database.
- **Why it is necessary**: Represents the persistence model. In Spring for GraphQL, returning this entity from a resolver allows GraphQL to automatically read properties (`getTitle()`, `getId()`) to satisfy query fields.

---

### E. Exception

#### 1. [`NoteNotFoundException.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/exception/NoteNotFoundException.java)
- **What it is**: A domain-level runtime exception.
- **Why it is necessary**: Thrown when business logic cannot find a requested resource. It is completely unaware of GraphQL or HTTP status codes, keeping domain logic clean.

#### 2. [`GraphQLExceptionHandler.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/exception/GraphQLExceptionHandler.java)
- **What it is**: A custom exception resolver extending `DataFetcherExceptionResolverAdapter`.
- **Key Syntax**:
  ```java
  @Component
  public class GraphQLExceptionHandler extends DataFetcherExceptionResolverAdapter {
      @Override
      protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
          if (ex instanceof NoteNotFoundException notFoundEx) {
              return GraphqlErrorBuilder.newError()
                      .message(notFoundEx.getMessage())
                      .errorType(ErrorType.NOT_FOUND)
                      .path(env.getExecutionStepInfo().getPath())
                      .location(env.getField().getSourceLocation())
                      .build();
          }
          return null; // Fallback to default handler
      }
  }
  ```
- **When it is invoked**: Whenever any resolver or service method throws an exception while processing a GraphQL query or mutation.
- **Why it is necessary**: In GraphQL, unhandled exceptions produce opaque `INTERNAL_ERROR` messages to avoid leaking stack traces. This handler intercepts `NoteNotFoundException` and transforms it into a standard GraphQL error payload with message, path, query line numbers, and classification.

---

### F. Repository

#### [`NoteRepository.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/repository/NoteRepository.java)
- **What it is**: A Spring Data JPA repository interface.
- **Key Syntax**:
  ```java
  public interface NoteRepository extends JpaRepository<Note, Long> {
  }
  ```
- **When it is invoked**: Called by [`NoteService`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/service/NoteService.java) to execute SQL queries.
- **Why it is necessary**: Spring Data generates implementation code at runtime for common database operations: `findAll()`, `findById()`, `save()`, `deleteById()`, and `existsById()`. Zero manual SQL or boilerplate implementation needed.

---

### G. Service

#### [`NoteService.java`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/java/com/cognitree/notes/service/NoteService.java)
- **What it is**: Business logic layer.
- **Key Syntax**:
  - `@Service`: Marks this class as a Spring business service.
  - `@Transactional`: Wraps methods in database transactions so operations either commit completely or roll back on error.
  - Handles PATCH/partial update semantics:
    ```java
    if (input.getTitle() != null) note.setTitle(input.getTitle());
    if (input.getContent() != null) note.setContent(input.getContent());
    if (tags != null) note.setTags(tags);
    ```
- **When it is invoked**: Called by controller resolvers to execute business logic.
- **Why it is necessary**: Keeps controllers thin and focused strictly on GraphQL wiring. The service can be reused across different protocols (e.g. REST, CLI, message queues) without changing database or business logic.

---

## 4. Core GraphQL Rules & Mental Models to Remember

### 1. Schema-First Development
Always edit [`schema.graphqls`](file:///Users/imran/Workplace/Cognitree/graphql/notes/src/main/resources/graphql/schema.graphqls) first. The schema is the strict contract. If a field is not declared in the schema, it does not exist to the outside world, even if your Java entity has that getter.

### 2. Entity ≠ GraphQL Type
- **JPA Entity** = How data is stored in tables (SQL columns, foreign keys).
- **GraphQL Type** = What the API client is allowed to query.
- Keeping them separate prevents accidental data leakage (e.g., exposing password hashes or internal IDs).

### 3. Demand-Driven Execution
In REST, returning relationships requires either pre-joined SQL or multiple HTTP endpoints. In GraphQL:
- Resolvers only run if the field appears in the query.
- With JPA `FetchType.LAZY`, querying `{ notes { title } }` executes **one** SQL statement.
- Querying `{ notes { title tags { name } } }` dynamically executes additional SQL to fetch the tags.

### 4. HTTP 200 Always
GraphQL almost never uses HTTP `404`, `400`, or `500`. The HTTP status code represents the transport status (whether the `/graphql` endpoint was reachable). Business or resolution errors are returned in the JSON payload:
```json
{
  "errors": [
    {
      "message": "Note not found: 99",
      "path": ["note"],
      "extensions": { "classification": "NOT_FOUND" }
    }
  ],
  "data": {
    "note": null
  }
}
```

### 5. Partial Success & Null Bubbling
- In a query requesting multiple fields, if one field errors out, the rest of the query can still succeed and return data.
- If a field is marked **nullable** in the schema (`note(id: ID!): Note`), an error on that note simply sets `data.note = null` while preserving sibling queries.
- If it were marked **non-null** (`Note!`), the error would "bubble up" to the parent, turning the entire parent `null`.

### 6. Query vs Mutation
- **Queries** run in parallel and cannot cause side effects.
- **Mutations** run sequentially and represent writes/updates.
- Unlike REST `POST` or `DELETE`, GraphQL mutations can return data immediately in any shape requested by the caller.

---

## Quick Reference: Project File Map

```
/Users/imran/Workplace/Cognitree/graphql/notes/
├── pom.xml                                                      <- Maven dependencies
└── src/main/
    ├── resources/
    │   ├── application.properties                               <- App & DB config
    │   └── graphql/
    │       └── schema.graphqls                                  <- GraphQL API Schema (SDL)
    └── java/com/cognitree/notes/
        ├── NotesApplication.java                                <- Main Spring Boot Entrypoint
        ├── controller/
        │   ├── NoteController.java                              <- Resolvers for Note queries, mutations, & tags
        │   └── TagController.java                               <- Resolvers for Tag queries & mutations
        ├── dto/
        │   ├── CreateNoteInput.java                             <- Mutation input DTO
        │   └── UpdateNoteInput.java                             <- Mutation input DTO
        ├── entity/
        │   ├── Note.java                                        <- JPA Note Entity
        │   └── Tag.java                                         <- JPA Tag Entity
        ├── repository/
        │   ├── NoteRepository.java                              <- Spring Data JPA Repository
        │   └── TagRepository.java                               <- Spring Data JPA Repository
        ├── service/
        │   ├── NoteService.java                                 <- Business logic for Notes
        │   └── TagService.java                                  <- Business logic for Tags
        └── exception/
            ├── NoteNotFoundException.java                       <- Custom domain exception
            └── GraphQLExceptionHandler.java                    <- Maps exceptions to GraphQL errors
```

