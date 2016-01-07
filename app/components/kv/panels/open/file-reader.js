import {Observable as O, Disposable} from 'rx';

export default (file) => O.create((observer) => {
  const reader = new FileReader();

  const onLoad = (readerEvent) => {
    observer.onNext(readerEvent.target.result);
    observer.onCompleted();
  };

  const onError = (readerEvent) => {
    observer.onError(readerEvent.target.error);
  };

  reader.addEventListener('load', onLoad, false);
  reader.addEventListener('error', onError, false);

  reader.readAsText(file);

  return Disposable.create(() => {
    if (reader.readyState === FileReader.LOADING) {
      reader.abort();
    }
    reader.removeEventListener('load', onLoad, false);
    reader.removeEventListener('error', onError, false);
  });
})
;
