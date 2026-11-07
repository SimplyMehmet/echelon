import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of } from 'rxjs';

export type RequestState<T> =
  { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' };

export function toRequestState<T>(source: Observable<T>): Signal<RequestState<T>> {
  return toSignal(
    source.pipe(
      map((data): RequestState<T> => ({ status: 'ready', data })),
      catchError(() => of<RequestState<T>>({ status: 'error' })),
    ),
    { initialValue: { status: 'loading' } as RequestState<T> },
  );
}
