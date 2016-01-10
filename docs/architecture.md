The application is split in multiple components which make use of each other.

Those components are defined inside app/components.

All components are built around the concept of Observables as defined by ReactiveX.

An Observable is a Stream of data that can be transformed (mapped, filtered, reduced, merged, concatinated).

One simple example for an Observable is the stream of mouseclick events triggered by the user.
An Observable can be used as abstraction over those events to simplify working with them.

To work with observables the components of this appliation depend on two libraries:

  * RXJS: a javascript library that defines the Observable type and a set of operators to work with it.

  * CycleJS: a small library built ontop of RXJS which takes care of some boilerplate when wiring up the Observables to the DOM

The components themself are structured after a pattern called intent-model-view which is suggested (but not required) by CycleJS.

The "intent-model-view" describes the flow and transformation of data/events from the input to the output of the component.

  * intent is a function that transforms streams of DOM events (click, change, mousemove...) into a streams of domain specific actions like (delete-item, rename-item, move-item)
  * model is a function that takes those streams produced by intent and transforms it into a single stream of state. Each item in the stream produced by the model function represents the state of the application at a point in time.
  * view is a function that takes the stream produced by model and maps it to a stream of (virtual) DOM nodes

That final stream of DOM nodes is than passed to a CycleJS driver which takes care of updating the DOM accordingly each time the stream emits a new item.

So each component is split into 3 functions which get called in a chain each of them transforming an input stream into an output stream.

Of course some components are slightly more complex and their function's are decomposed into many more smaller functions but viewed from above each component is split into those three parts.

