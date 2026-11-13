package com.cognitree.notes.exception;

import org.springframework.graphql.execution.ErrorType;
import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.stereotype.Component;

/**
 * Translates Java exceptions into structured GraphQL errors.
 *
 * How it fits in the lifecycle:
 *   1. A resolver method throws an exception
 *   2. GraphQL's execution engine catches it
 *   3. It walks the registered DataFetcherExceptionResolvers
 *   4. The first one that returns non-null wins
 *   5. That GraphQLError goes into the response's "errors" array
 *
 * DataFetcherExceptionResolverAdapter is Spring's base class for this.
 * Override resolveToSingleError() for one error per exception,
 * or resolveToMultipleErrors() if one exception maps to many errors.
 *
 * IMPORTANT: If you return null here, Spring falls through to its
 * default handler, which wraps the exception as a generic INTERNAL_ERROR
 * and hides the message (for security). Always handle known exceptions
 * explicitly and return null for unknown ones (let the default hide them).
 */
@Component
public class GraphQLExceptionHandler extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {

        if (ex instanceof NoteNotFoundException notFoundEx) {
            return GraphqlErrorBuilder.newError()
                    .message(notFoundEx.getMessage())          // "Note not found: 999"
                    .errorType(ErrorType.NOT_FOUND)            // → extensions.classification = "NOT_FOUND"
                    .path(env.getExecutionStepInfo().getPath()) // which field caused this
                    .location(env.getField().getSourceLocation()) // line/column in the query
                    .build();
        }

        // Unknown exceptions → return null → default handler takes over
        // Default hides the message and returns INTERNAL_ERROR (safe for production)
        return null;
    }
}

