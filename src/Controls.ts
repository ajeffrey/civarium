import * as Rx from 'rxjs';
import { scan } from 'rxjs/operators';

export interface IKeyChangeEvent {
  key: number;
  pressed: boolean;
}

export interface IKeyboardStateEvent {
  [key: number]: boolean;
}

export const scroll$ = new Rx.Observable<number>(observer => {
  window.addEventListener('mousewheel', evt => {
    observer.next(evt.wheelDelta > 0 ? 1 : -1);
  });
});

export const keys$ = (() => {
  const changes$ = new Rx.Observable<IKeyChangeEvent>(observer => {
    window.addEventListener('keyup', evt => {
      observer.next({ key: evt.keyCode, pressed: false });
    });
    window.addEventListener('keydown', evt => {
      observer.next({ key: evt.keyCode, pressed: true });
    });
  });

  const state$: Rx.Observable<IKeyboardStateEvent> = changes$.pipe(
    scan((acc, { key, pressed }: IKeyChangeEvent): IKeyboardStateEvent => ({ ...acc, [key]: pressed }), {})
  );

  return state$;
})();