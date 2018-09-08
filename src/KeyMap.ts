import { IKeyChangeEvent } from './KeyMap';
import * as Rx from 'rxjs';
import { scan } from 'rxjs/operators';
import { Scene, ActionManager, ExecuteCodeAction } from 'babylonjs';

export interface IKeyChangeEvent {
  type: 'up' | 'down';
  key: string;
}

export interface IKeyboardStateEvent {
  [key: string]: boolean;
}

export default (scene: Scene) => {
  const actionManager = scene.actionManager = new ActionManager(scene);

  const keyChange$ = new Rx.Observable<IKeyChangeEvent>(observer => {
    actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
      observer.next({ type: 'down', key: evt.sourceEvent.key });
    }));
    actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {								
      observer.next({ type: 'up', key: evt.sourceEvent.key });
    }));
  });

  const keyboardState$: Rx.Observable<IKeyboardStateEvent> = keyChange$.pipe(
    scan((acc: IKeyboardStateEvent, { type, key }: IKeyChangeEvent) => ({
      ...acc,
      [key]: (type === 'up')
    }), {})
  );

  return keyboardState$;
};