/* eslint-disable @typescript-eslint/no-explicit-any */
import { PostgrestError } from '@supabase/supabase-js';

export class DatabaseError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const handleSupabaseError = (error: any): DatabaseError => {
  if (!error) {
    return new DatabaseError('Unknown error occurred');
  }

  // PostgreSQL error
  if (error.message) {
    // Auth errors
    if (error.message.includes('Invalid login credentials')) {
      return new DatabaseError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS', error);
    }

    // Unique constraint violations
    if (error.message.includes('duplicate key value')) {
      return new DatabaseError('This record already exists', 'UNIQUE_VIOLATION', error);
    }

    // Foreign key violations
    if (error.message.includes('violates foreign key constraint')) {
      return new DatabaseError('Referenced record does not exist', 'FK_VIOLATION', error);
    }

    // RLS policy violations
    if (error.message.includes('new row violates row-level security policy')) {
      return new DatabaseError('You do not have permission to perform this action', 'RLS_VIOLATION', error);
    }

    return new DatabaseError(error.message, error.code, error);
  }

  return new DatabaseError('An unexpected database error occurred', 'UNKNOWN', error);
};

export const getErrorMessage = (error: any): string => {
  if (error instanceof DatabaseError) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const logError = (context: string, error: any, userId?: string) => {
  const dbError = error instanceof DatabaseError ? error : handleSupabaseError(error);

  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    userId,
    code: dbError.code,
    message: dbError.message,
    originalError: process.env.NODE_ENV === 'development' ? dbError.originalError : undefined,
  };

  console.error('[DATABASE_ERROR]', errorLog);

  // TODO: Send to external logging service (Sentry, LogRocket, etc)
  // Sentry.captureException(dbError, { contexts: { database: errorLog } });
};
