import * as Rx from 'rxjs';

export default (framerate: number) => {
  return new Rx.Observable(observer => {
    let time = Date.now();
    setInterval(() => {
      let nextTime = Date.now();
      observer.next(nextTime - time);
      time = nextTime;
    }, framerate);
  });
};