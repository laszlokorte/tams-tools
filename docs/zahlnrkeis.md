# Zahlenkreis in CycleJS

Im Folgenen soll gezeigt werden, wie sich mit CycleJS sehr einfach ein eine interaktive Komponente entwickeln lässt.
Dies wird am Beispiel der Erstellung eines Zahlenkreises gezeigt, der die Addition, die Subtraktion und den Überlauf von Binärkodierten Ganzzahlen darstellen soll.

## Neue Seite anlegen

Zunächst muss eine neue Seite angelegt werden, auf der der Zahlenrkeis dargestellt werden soll.

### JavaScript-Datei erzeugen

Hierzu wird, wie schon in der Projekteinleitung beschrieben, in dem `/app/pages/` Ordner ein neues Unterverzeichnis namens `number-circle` angelegt und darin dann eine leere Datei `index.js` erstellt.

### Einsteigspunkt deklarieren

Wie ebenfalls schon in der Einleitung erklärt, muss diese neue JavaScript-Datei nun in der Webpack-Konfiguration als Einstiegspunkt deklariert werden. Dafür wird die `/webpack/common.config.babel.js` Datei entsprechend bearbeitet:


```diff
// in /webpack/common.config.babel.js

//...
module.exports = {
  target: "web",
  entry: {
//...
    ledEditor: "./app/pages/led-editor/index.js",
    fsmEditor: "./app/pages/fsm-editor/index.js",
    // Deklaration des Einstiegspunktes
+   numberCircle: "./app/pages/number-circle/index.js",
    vendor: require("../app/vendor.js"),
  },
//...
  plugins: [

//...
// Deklaration einer neuen HTML-Seite,
// die den neuen Einstiegspunkt verwendet.
+   new HtmlWebpackPlugin({
+     title: 'Number circle',
+     minify: htmlMinifyOptions,
+     chunks: ['numberCircle', 'vendor'],
+     template: './app/index.html',
+     filename: 'number-circle.html',
+   }),
//...
```

Nachdem die Webpack-Konfiguration bearbeitet wurde, muss der Webpack-Development-Server neugestartet werden, falls er zuvor schon gestartet wurde.

### Link auf Startseite hinzufügen

Damit sich die neue Seite bequem aufrufen lässt, soll noch ein entsprechender Link auf die Startseite hinzugefügt werden. Dafür wird die `/app/pages/home/index.js` Datei bearbeitet:


```diff
// in /app/pages/home/index.js
//...
const home = (sources) => {
  const {
  } = sources;

  const components = [
    //...
+   {
+     name: 'Number circle',
+     url: './number-circle.html',
+   },
  ];
//...
```

Nun lässt sich die Zahlenkreis-Seite über die direkte URL http://localhost:3000/number-circle.html oder über den Link von http://localhost:3000 aus erreichen.

## CycleJS Initialisieren

Nun wurde zwar eine neue Seite angelegt und diese kann auch aufgerufen werden, allerdings ist sie noch vollkommen leer. Dies soll sich nun ändern.

Im nächsten Schritt wird CycleJS verwendet um einen einfachen Text auf der Seite darzustellen. Dafür wird die `/app/pages/number-circle/index.js` wie folgt geändert:

```js
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div} from '@cycle/dom';

// Die Funktion, die den Zahlenrkeis erzeugt
const numberCircleApp = (sources) => {
  return {
    DOM: O.just(
      div("Hello world")
    ),
  };
};

// Die Treiber, die verwendet werden soll
const drivers = {
  DOM: makeDOMDriver('#app'),
};

// führt die Funktion numberCircleApp als CycleJS
// Anwendung aus und verwendet dafür die in drivers
// definierten Treiber.
Cycle.run(numberCircleApp, drivers);
```

Die Zentrale Idee von CycleJS ist, dass die Anwendung als Funktion modelliert wird, die Eingaben in Ausgaben umwandelt. Auch wenn JavaScript keine funktionale Programmiersprache ist, soll sich eine CycleJS Anwendung per Konvention an das Prinzip der Referenzielle Transparenz halten.
Das bedeutet, dass die Funktion auf keinen globalen Zustand zugreifen darf, sondern nur auf Daten, die an sie per Parameter übergeben wurden. Ihr Rückgabe Wert kann dem entsprechend nur von Parametern abhängen.

Konkret bedeutet dies beispeilweise, dass eine solche Funktion weder EvenListener an DOM Elemente binden darf, noch den DOM in anderer Art und Weise Manipulieren darf.

Stattdessen bekommt eine CycleJS Anwendung die Benutzereingaben bzw DOM-Events als Parameter übergeben und gibt den gesamten daraus entstehenden DOM-Baum als Ergebnisobjekt zurück.

CycleJS nimmt den Rückgabewert der Anwendung entgegen und sorgt dafür, dass der tatsächliche DOM-Baum entsprechend verändert wird, sodass er dem Rückgabewert der Anwendung entspricht.
Dies passiert allerdings außerhalb der Anwendung selbst - in einem sogenannten Treiber - sodass sich die Anwendungslogik nicht mit dem verwalten globaler Zustände in die Quere kommt.

Nun soll ja allerdings eine interaktive Anwendung gebaut werden. Dafür genügt es natürlich nicht nur einmal einen DOM-Baum zu generieren. Der DOM-Baum muss während der Laufzeit fortlaufen aktualisiert und an die vom Benutzer getätigten Aktionen angepasst werden. Auch treten Benutzeraktionen nicht nur einmal auf, sondern die gesamte Laufzeit über.

Darum werden die Parameter und Rückgabewerte einer CycleJS Anwendung als Datenströme (Streams) modelliert. Hierfür wird der Observable Datentyp aus der ReactiveExtension Bibliothek verwendet.
Ein Observable ist ein Stream, der sich zahlreiche Arten transformieren lässt und sich dabei sehr ähnlich einem Array bzw einer Liste verhält.
Auch lässt sich ein Observable als ein asynchroner Iterator verstehen.

Mit einem Observable ist es möglich die Veränderung eines Wertes über eine Zeitspanne zu modellieren wie beispielsweise den Zustand des DOM-Baumes über die Laufzeit der Anwendung.

Die bisherige `numberCircleApp` Funktion gibt ein Observable mit nur einem festen Wert `div("Hello world")` zurück. Es wird als nur eine statische Seite erzeugt, mit der der Benutzer nicht interagieren kann. Das wird sich aber bald ändern.

## SVG erzeugen

Als nächstes soll anstelle eines einfachen Textes eine Graphik angezeigt werden, die den Zahlenkreis darstellt. Hierfür wird das SVG-Format verwendet, welches sich direkt in den DOM-Baum einbetten lässt:

```diff
// in /app/pages/number-circle/index.js

 import {Observable as O} from 'rx';
 import Cycle from '@cycle/core';
 import {makeDOMDriver} from '@cycle/dom';
-import {div} from '@cycle/dom';
+import {div,svg} from '@cycle/dom';

 // Die Funktion, die den Zahlenrkeis erzeugt
 const numberCircleApp = (sources) => {
   return {
     DOM: O.just(
-      div("Hello world")
+      div([
+        svg('svg', {
+          attributes: {
+            width: 200,
+            height: 200,
+            class: 'graphics-root',
+            viewBox: `0 0 500 500`,
+            preserveAspectRatio: 'xMidYMid meet',
+          },
+        }, [
+          svg('circle', {
+            cx: 50,
+            cy: 50,
+            r: 50,
+          }),
+        ]),
+      ])
     ),
   };
 };
//...
```

Zum erzeugen von SVG-Elementen, wird die `svg` Funktion verwendet, die der DOM-Treiber zur Verfügung stellt. Die Funktion erwartet 3 Parameter:
Den Namen des SVG-Elements, ein Objekt mit Schlüssel-Werte-Paaren, die als Eigenschaften gesetzt werden sollen und als optionalen dritten Parameter ein Array mit Kindelementen.

Statt des Textes wird nun eine Vektorgraphik eines kleinen Kreises dargestellt.

## Mehrere Kreise malen

Der Zahlenkreis soll natürlich nicht nur aus einem kleinen Kreis bestehen, sondern aus vielen kleinen Kreisen, die zusammen einen großen Kreis bilden.

Der kleine Kreis soll also vervielfältigt werden.
Im Sinne der Funktionalen Programmierung wird hierfür aber keine Schleife verwendet, sondern die Array-Transformation `map`.

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

// Die Funktion, die den Zahlenrkeis erzeugt
const numberCircleApp = (sources) => {
  return {
-    DOM: O.just(
+    DOM: O.just([
+    // Die Winkel in denen die kleinen Kreise angeordnet sein sollen.
+      0,
+      Math.PI / 2,
+      Math.PI,
+      Math.PI * 3 / 2,
+    ]).map((angles) =>
      div([
        svg('svg', {
          attributes: {
            width: 200,
            height: 200,
            class: 'graphics-root',
            viewBox: `0 0 500 500`,
            preserveAspectRatio: 'xMidYMid meet',
          },
-        }, [
+        }, angles.map((angle) =>
           svg('circle', {
-            cx: 50,
-            cy: 50,
+            cx: 250 + Math.sin(angle) * 200,
+            cy: 250 + Math.cos(angle) * 200,
             r: 50,
-          }),
+          }))
-        ]),
+        ),
      ])
    ),
  };
};

//...
```

Hier sieht man nun schon die erste Transformation eines `Observable`. Anstatt direkt ein Stream zu erzeugen, welcher einen DOM-Baum enthält, wird zunächst ein Stream erzeugt, der ein Array an Winkeln enthält.
Dieser "Winkel-Stream" wird dann mittels der `map` Transformation in einen DOM-Stream transformiert.

Vorsicht: Die Methode `map` wird hier zwei mal verwendet. Zum einen um, wie eben beschrieben, einen Stream(Observable) in einen anderen zu transformieren. 
Zum anderen um das Array aus Winkeln in ein Array aus SVG-Elemente zu transformieren.
Es handelt sich hierbei um zwei verschiedene `map` Methoden (`Array#map` und `Observable#map`), die nicht zu verwechseln sind, sich aber analog zu einander verhalten.

## Winkel dynamisch erzeugen

Im vorherigen Schritt wurden 4 Winkel fest in den Quelltext kodiert. Später soll der Zahlenkreis allerdings in verschiedenen Größen generiert werden können. Daher sollen die Winkel im nächsten Schritt dynamisch berechnet werden:

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

+// Erzeugt ein Array in gewünschter Größe
+const arrayOfSize(size) => 
+  Array.apply(Array, {length: size})
+;

// Die Funktion, die den Zahlenrkeis erzeugt
const numberCircleApp = (sources) => {
  return {
-    DOM: O.just([
-    // Die Winkel in denen die kleinen Kreise angeordnet sein sollen.
-      0,
-      Math.PI / 2,
-      Math.PI,
-      Math.PI * 3 / 2,
+    DOM:
+    // Die Anzahl der Kreise, die gemalt werden sollen
+    O.just(3)
+    // Die Anzahl der Kreise in ein Array aus Winkeln umwandeln
+    .map((bits) =>
+      arrayOfSize(Math.pow(2, size))
+      // Leeres Array in Array aus Winkeln
+      // umwandeln
+      .map((_, index, {length}) => 
+         2 * Math.PI * index / length
+      )
+    )
-    ]).map((angles) =>
+    .map((angles) =>
      div([
        svg('svg', {
          attributes: {
            width: 200,
            height: 200,
            class: 'graphics-root',
            viewBox: `0 0 500 500`,
            preserveAspectRatio: 'xMidYMid meet',
          },
        }, angles.map((angle) =>
           svg('circle', {
             cx: 250 + Math.sin(angle) * 200,
             cy: 250 + Math.cos(angle) * 200,
             r: 50,
           }))
        ),
      ])
    ),
  };
};

//...
```

Da JavaScript keine einfache Funktion anbietet um ein Array mit einer gegebenen Größe zu erzeugen, wurde die Funktion `arrayOfSize` definiert.

Als Größe des Zahlenkreis wurde `3` angegeben. Da der Zahlenkreis zur veranschaulichung von Binärzahlen gedacht ist, ist mit dieser `3` die Anzahl der Bit's gemeint, was bedeutet, dass der Zahlenkreis `2^3`, also 8 Einträge haben soll.

Darum wird die `3` in ein Array der größe `Math.pow(2, size)` transformiert, welches dann selbst in ein Array aus gleichmäßig über 360° (2π) verteilten Winkeln transformiert wird.

Im Ergebnis ist nun also ein aus 8 kleinen Kreise gebildeter größerer kreis zu sehen.


## Code strukturieren

Da die `numberCircleApp` Funktion nun schon eine gewisse Größe eingenommen hat und nicht mehr besonders übersichtlich ist, soll sie nun in kleinere Funktionen geteilt werden (Funktionale Dekomposition).

Die Erzeugng des SVG-Baumes hat nicht sonderlich viel mit der Berechung der Winkel zu tun. Daher ist es hier eine Trennung vorzunehmen.

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

//...

+// Array aus Winkel in SVG umwandeln
+const render = (angles) =>
+  div([
+    svg('svg', {
+      attributes: {
+        width: 200,
+        height: 200,
+        class: 'graphics-root',
+        viewBox: `0 0 500 500`,
+        preserveAspectRatio: 'xMidYMid meet',
+      },
+    }, angles.map((angle) =>
+       svg('circle', {
+         cx: 250 + Math.sin(angle) * 200,
+         cy: 250 + Math.cos(angle) * 200,
+         r: 50,
+       }))
+    ),
+  ])
+;
+

const numberCircleApp = (sources) => {
+  const state$ = O.just(3)
+    .map((bits) =>
+      arrayOfSize(Math.pow(2, size))
+      .map((_, index, {length}) => 
+         2 * Math.PI * index / length
+      )
+    )
+  ;
+
+  return {
+    DOM: state$.map(render),
+  };
-  return {
-    DOM:
-    // Die Anzahl der Kreise, die gemalt werden sollen
-    O.just(3)
-    // Die Anzahl der Kreise in ein Array aus Winkeln umwandeln
-    .map((bits) =>
-      arrayOfSize(Math.pow(2, size))
-      // Leeres Array in Array aus Winkeln
-      // umwandeln
-      .map((_, index, {length}) => 
-         2 * Math.PI * index / length
-      )
-    )
-    .map((angles) =>
-      div([
-        svg('svg', {
-          attributes: {
-            width: 200,
-            height: 200,
-            class: 'graphics-root',
-            viewBox: `0 0 500 500`,
-            preserveAspectRatio: 'xMidYMid meet',
-          },
-        }, angles.map((angle) =>
-           svg('circle', {
-             cx: 250 + Math.sin(angle) * 200,
-             cy: 250 + Math.cos(angle) * 200,
-             r: 50,
-           }))
-        ),
-      ])
-    ),
-  };
};

//...
```

Die Erzeugung des SVG-Baumes wurde nun also in eine neues Funktion namens `render` verschoben und für den Stream, der die berechneten Winkel enthält, wurde eine Konstate mit dem Namen `state$` angelegt.

### $-Notation

In der CycleJS und RxJS Community hat sich die Konvention etabliert Konstanten und Variablen die einen Stream Enthalten mit einem `$` Postfix zu versehen.
Besonders in JavaScript als nicht statisch typisierte Sprache macht diese Art der ungarischen Notation den Quelltext leserlicher und verständlicher.
Das `$` soll hierbei ein an `S` erinnern, wie es auch bei der Benennung von Variablen, die Sammlungen wie Listen oder Arrays enthalten verwendet wird, um den Plural auszurücken (`users`, `pictures`...)

## MV Zerlegung

Die `numberCircleApp` Funktion lässt sich noch weiter zerlegen. Da die Anwendung komplett Funktional Programmiert wurde und sich vollständig an das Prinzip der Referenziellen Transparanz hält, lässt sie sich per Funktionaler Dekomposition mühelos in beliebig kleinere Teile zerlegen.


### MVI
CycleJS schlägt eine Strukturierung nach dem MVI Entwurfsmuster vor. MVI steht für *Model*, *View*, *Intent*. Inhaltlich sinnvoller wäre aber wohl die Reihenfolge *Intent*, *Model*, *View*, denn bei diesem Entwurfsmuster geht es darum eine Anwendung grob in 3 Unterfunktionen zu Teilen:

* Die Intent Funktion, bekommt Event-Streams (Klicks, Tastendrücke...) als Parameter und transformiert diese in Aktions-Streams (Löschen-Aktion, Auswahl-Aktion...), hierzu später mehr.

* Die Model Funktion bekommt als Parameter die Aktions-Streams, die von der Intent-Funktion erzeugt wurden, und transformiert diese in einen Zustands-Stream, der die verschiedenen Aktionen zu einem Ergebnis-Zustand akkumuliert.

* Die View Funktion bekommt den Stream der Zustände und transformiert diesen in einen Stream aus DOM-Bäumen, die die jeweiligen Zustände repräsentieren.

Dieses Entwurfsmuster erinnert zuerseinmal - auch des Namens wegen - an das Model-View-Controller (MVC) Muster.
*MVI* ist allerdings um einiges einfacher, da es lediglich beschreibt, in welches Teile eine Funktion mittels Funktionaler Dekomposition erlegt werden kann und sollte.

### MVI Anwenden

Bisher findet in der Zahlenkreis-Anwendung keine Benutzer interaktion statt. Daher kann die `intent` Funktion zunächst ignoriert werden.
Die Transformation des `state$` Streams kann jedoch in eine `view` Funktion ausgelagert werden und die Erzeugung des Winkel-Arrays lässt sich der Model-Funktion zuordnen:

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

//...

// Array aus Winkel in SVG umwandeln
const render = (angles) =>
  div([
    svg('svg', {
      attributes: {
        width: 200,
        height: 200,
        class: 'graphics-root',
        viewBox: `0 0 500 500`,
        preserveAspectRatio: 'xMidYMid meet',
      },
    }, angles.map((angle) =>
       svg('circle', {
         cx: 250 + Math.sin(angle) * 200,
         cy: 250 + Math.cos(angle) * 200,
         r: 50,
       }))
    ),
  ])
;

+const model = (bitCount) => 
+  O.just(bitCount)
+    .map((bits) =>
+      arrayOfSize(Math.pow(2, size))
+      .map((_, index, {length}) => 
+         2 * Math.PI * index / length
+      )
+    )
+  ;
+
+const view = (state$) =>
+  state$.map(render)
+;
+
const numberCircleApp = (sources) => {
-  const state$ = O.just(3)
-    .map((bits) =>
-      arrayOfSize(Math.pow(2, size))
-      .map((_, index, {length}) => 
-         2 * Math.PI * index / length
-      )
-    )
-  ;
+  const state$ = model(3); 
+  const vtree$ = view(state$);

  return {
-   DOM: state$.map(render),
+   DOM: vtree$,
  };
};

//...
```

Die `numberCircleApp` Funktion besteht nun nur noch aus 3 Zeilen. Die `model` Funktion wird verwendet um die Darzustellenden Daten zu erzeugen und die `view` Funktion transformiert diese Daten in ein DOM-Baum.

### Virtual-DOM

Die Konstante die das Ergebnis der `view` Transformation beinhaltet wurde `vtree$` genannt. Was hat es mit diesem Namen auf sich?

Das `$` kennzeichnet wie schon zuvor erklärt, dass es sich um einen Stream bzw einen Observable-Datentyp handelt.

`vtree` steht für *Virtual DOM Tree* also einen Virtuellen DOM-Baum.

Dass die `view` Funktionen einen DOM-Baum erzeugt, der dargestellt werden soll ist klar, aber was bedeutet das `virtual`?

Wie schon Anfangs erklärt, darf die `numberCircleApp` Funktion den echten DOM nicht selbst manipulieren, sondern nur einen gewünschten DOM-Baum zurückgeben.
Der CycleJS DOM-Treiber vergleicht den von `numberCircleApp` erzeugten Baum mit dem tatsächlichen DOM um dann die Änderungen am tatsächlichen DOM vorzunehmen, die nötig sind, um den von der `numberCircleApp` Funktion gewünschten Zustand zu erreichen.

Insofern ist der von `numberCircleApp` erzeugte DOM-Baum eben kein echter DOM-Baum, sondern nur das Abbild eines Baumes, welches vom DOM-Treiber interpretiert wird. Die Objekte die mit Hilfe der `div` und `svg` Funktionn erzeugt werden sind auch keine echten DOM-Objekte, also keine Exemplare der DOM-Klassen des Browsers, sondern einfache JavaScript Objekte.

## Weitere Unterteilungen

Zuletzt soll auch noch die `render` Funktion aufgeteilt werden. Die erzeugung des SVG-Baumes wird ausgelagert:

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

//...

+const renderCircle = (angles) =>
+    svg('svg', {
+      attributes: {
+        width: 200,
+        height: 200,
+        class: 'graphics-root',
+        viewBox: `0 0 500 500`,
+        preserveAspectRatio: 'xMidYMid meet',
+      },
+    }, angles.map((angle) =>
+       svg('circle', {
+         cx: 250 + Math.sin(angle) * 200,
+         cy: 250 + Math.cos(angle) * 200,
+         r: 50,
+       }))
+    )
+;

// Array aus Winkel in SVG umwandeln
const render = (angles) =>
  div([
+    renderCircle(angles)
-    svg('svg', {
-      attributes: {
-        width: 200,
-        height: 200,
-        class: 'graphics-root',
-        viewBox: `0 0 500 500`,
-        preserveAspectRatio: 'xMidYMid meet',
-      },
-    }, angles.map((angle) =>
-       svg('circle', {
-         cx: 250 + Math.sin(angle) * 200,
-         cy: 250 + Math.cos(angle) * 200,
-         r: 50,
-       }))
-    ),
  ])
;

//...
```

## Anzahl der Bits Anzeigen

Anstatt nur die Kreise darzustellen, soll nun auch die Anzahl der Bits angezeigt werden, die zu diesem Kreis geführt haben. Aktuell ist die Anzahl von 3 Bits zwar fest im Quelltext verankert, allerdings soll diese Zahl ja später vom Benutzer geändert werden können und so ist es sinnvoll zunächst mal sehen zu können wieviele Bit's der Zahlenkreis derzeit darstellt.

Derzeit beinhaltet der Zustandstands-Stream (`state$`) nur das Array mit den Winkeln. Die Anzahl der Bits steht der `view` und  `render` Funktion also gar nicht zur Verfügung. Sie könnte zwar über den Logerithmus der Länge des Arrays ermitteln werden, allerdings wäre das ein Unnötiger Aufwand für die `view` Funktion, wenn es doch auch Möglich wäre ihr die Anzahl der Bits direkt mitzuteilen.

Der `state$` Stream soll nun also nicht nur das Winkel-Array, sondern auch die Anzahl der Bits beinhalten. Dafür wird der Inhalt des `state$` Streams durch ein Objekt mit zwei Eigenschaften ersetzt: `bitCount` und `angles`:

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

//...

// Array aus Winkel in SVG umwandeln
-const render = (angles) =>
+const render = (state) =>
  div([
+   div(['Number of bits:', state.bitCount]),
-   renderCircle(angles)
+   renderCircle(state.angles)
  ])
;

+const angleArray = (bits) => 
+  arrayOfSize(Math.pow(2, bits))
+  .map((_, index, {length}) => 
+    2 * Math.PI * index / length
+  )
+;

const model = (bitCount) => 
  O.just(bitCount)
-   .map((bits) =>
-     arrayOfSize(Math.pow(2, size))
-     .map((_, index, {length}) => 
-        2 * Math.PI * index / length
-     )
-   )
+  .map((bitCount) => ({
+    bitCount,
+    angles: angleArray(bitCount),
+  }))
 ;

//...
```

Die Erzeugung des Winkel-Arrays wurde in eine eigene Funktion `angleArray` verschoben. Die `model` Funktion wandelt die Anzahl der Bits nun in einen Stream um, der ein Objekt des Formats `{bitCount, angles}` um.

Die `render` Funktion bekommt nun dieses Objekt als Parameter, gibt weiterhin das Winkel-Array an die `renderCircle` Funktion und erzeugt einen `div`, der den `bitCount` Wert beinhaltet.

## Zahlenkreis beschriften

Der Zahlenkreis besteht nur zwar aus 8 kleineren Kreisen und zeigt auch die Anzahl der Bits an, die ihm zu Grunde liegen, doch die Beschriftung der einzelnen Kreise fehlt noch. Dies soll sich nun ändern.

Zu jedem der Winkel soll nun noch ein Zahlenwert berechnet werden, der an der entsprechenden Stelle dargestellt wird.

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

//...

-const renderCircle = (angles) =>
+const renderDots = (dots) =>
    svg('svg', {
      attributes: {
        width: 200,
        height: 200,
        class: 'graphics-root',
        viewBox: `0 0 500 500`,
        preserveAspectRatio: 'xMidYMid meet',
      },
-   }, angles.map((angle) =>
+   }, dots.map((dot) => [
       svg('circle', {
-        cx: 250 + Math.sin(angle) * 200,
-        cy: 250 + Math.cos(angle) * 200,
+        cx: 250 + Math.sin(dot.angle) * 200,
+        cy: 250 + Math.cos(dot.angle) * 200,
+        fill: '#444',
         r: 50,
-      }))
-    )
+    }),
+    svg('text', {
+      x: 250 + Math.sin(dot.angle) * 200,
+      y: 250 - Math.cos(dot.angle) * 200,
+      fill: '#fff',
+      'font-size': '50px',
+      'text-anchor': 'middle',
+      'dominant-baseline': 'central',
+    }, dot.value.toString()),
+ ]))
;

// Array aus Winkel in SVG umwandeln
const render = (state) =>
  div([
   div(['Number of bits:', state.bitCount]),
-  renderCircle(state.angles),
+  renderDots(state.dots),
  ])
;

-const angleArray = (bits) => 
+const dotArray = (bits) => 
  arrayOfSize(Math.pow(2, bits))
- .map((_, index, {length}) => 
-   2 * Math.PI * index / length
- )
+ .map((_, index, {length}) => ({
+   angle: 2 * Math.PI * index / length,
+   value: index,
+ }))
;

const model = (bitCount) => 
  O.just(bitCount)
  .map((bitCount) => ({
    bitCount,
-   angles: angleArray(bitCount),
+   dots: dotArray(bitCount),
  }))
 ;

//...
```

Die Funktion `angleArray` wurde umbenannt in `dotArray` und liefert nun kein einfaches Array aus Winkeln mehr zurück, sondern ein Array aus Objekten mit den Attributen `angle` und `value`.

Die `renderCircle` Funktion wurde entsprechend in `renderDots` umbenannt und erzeugt jetzt zu jedem `circle` Elemente zusätzlich ein `text` Element, welches den jeweiligen `value` Wert darstellt.

## Benutzerinteraktion vorbereiten

Nun da der Zahlenkreis einigermaßen sinnvoll dargestellt wird, soll es dem Benutzer ermöglicht werden die Anzahl der Bits zu verändern.

Die Anzahl der Bit's soll mit zwei Buttons jeweils um eines veringert oder um eines erhöht werden.

Zunächst werden dafür zwei Buttons gebraucht, die in diesem Schritt hinzugefügt werden:

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
-import {div, svg} from '@cycle/dom';
+import {div, button, svg} from '@cycle/dom';

//...
 
+const renderButtons = (state) => div([
+  button({
+    attributes: {
+      'data-action': 'add-bit',
+    },
+  }, 'Add Bit'),
+
+  button({
+    attributes: {
+      'data-action': 'remove-bit',
+    },
+  }, 'Remove Bit'),
+]);

// Array aus Winkel in SVG umwandeln
const render = (state) =>
  div([
    div(['Number of bits:', state.bitCount]),
+   renderButtons(state),
    renderDots(state.dots),
  ])
;

const dotArray = (bits) => 
  arrayOfSize(Math.pow(2, bits))
  .map((_, index, {length}) => ({
    angle: 2 * Math.PI * index / length,
    value: index,
  }))
;

const model = (bitCount) => 
  O.just(bitCount)
  .map((bitCount) => ({
    bitCount,
    dots: dotArray(bitCount),
  }))
 ;

//...
```

Um die Buttons zu erzeugen muss die `button` Funktion aus der `cycle/dom` Bibliothek importiert werden.

Für die Erzegung der beiden Buttons wird eine neue `renderButtons` Funktion definiert, die dann von der `render` Funktion aufgerufen wird.

Die Buttons bekommen jeweils ein `data-action` Attribute gesetzt mit den Werten `add-bit` bzw `remove-bit` gesetzt, damit später unterschieden werden kann, welcher Button gedrückt wurde.

## Auf die Events der Buttons reagieren

Die zwei Buttons werden nun zwar oberhalb des Zahlenkreises dargestellt, allerdings passiert nichts, wenn der Benutzer drauf klickt.

Dies soll sich nun ändern. Damit die Anwendung auf die Klicks der Buttons reagieren kann, braucht sie einen Stream, der die Klick-Ereignisse enthält. Diesen Stream aus Ereignissen kann die Anwendung dann in den `state$` Stream transformieren, welcher dann wie bisher von der `view` Funktion in den `vtree$` Stream Transformiert und dann vom Treiber genommen und angezeigt wird.

### Woher bekommt die Anwendung den Ereignis-Stream?

Die `numberCircleApp` Funktion hat - wie jede CycleJS Anwendung - einen `sources` Parameter. Bisher wurde dieser nicht verwendet, doch über ihn wird ein Objekt übergeben, welches all die Streams enthält, welche von Treibern zur Verfügung gestellt werden.

Der DOM-Treiber stellt eine Sammlung von Streams für alle möglichen DOM Ereignisse bereit. Per `sources.DOM` kann auf die vom DOM-Treiber bereitgestellten Daten zugegriffen werden.

Um einen Stream der Klick-Ereignisse, die von den Buttons ausgelöst werden, zu erhalten, können die `select` und `events` Methoden, des `DOM` Objektes verwendet werden:

```js
const click$ = sources.DOM.select('button').events('click')
```

Mit diesem Aufruf wird der DOM-Treiber nach dem Stream aller Ereignisse (`events`) gefragt, die an Elementen des Typs `button` auftreten.
Anstelle von `'button'` akzeptiert die `select` Methode alle gültigen CSS-Selektoren wie beispielsweise `'.eine-klasse'`, `'#eineId'`, `'[einAttribute="einWert"]'`.
Entsprechend Akzeptiert die `events` Methode alle Namen von DOM-Ereignissen wie `click`, `mousemove`, `submit`, `keydown` etc...

Der `click$` Stream kann selbstverständlich wie alle anderen Streams transformiert werden:

```
const rightClick$ = click$.filter((event) => event.which === 2);

const clickedElement$ = click$.map((event) => event.target);

const clickCount$ = click$.scan((sum, event) => sum + 1, 0);
```

In diesem Beispiel enthält der `rightClick$` Stream nur die Click-Ereignisse, bei deren die rechte Maustaste gedrückt waren. `clickedElement$` ist ein Stream der nicht mehr die Klickereignisobjekte selbst entält, sondern die Elemente, die geklickt wurden.
Der `clickCount$` Stream enthält die Anzahl aller Klicks.

#### `scan` Operator

Der `scan` Operator ist für diese - sowie für die meisten CycleJS Anwendungen - von Zentraler Bedeutung, da er es ermöglicht die Daten eines Streams die über die Zeit verteilt entstehen in einen resultierenden akkumulierten Zustand zusammen zutragen.

Der `scan` Operator ähnelt sehr stark dem `reduce` oder `fold` Operator mit dem in der Funktionalen Programmierung Listen von Werten auf einen einzelnen Wert reduziert werden können.

Im Bezug auf Streams bzw den Observable Datentyp transformiert der `scan` Operator einen Stream aber nicht in einen einzigen Wert, sondern in einen weiteren Stream, der jeweils alle zwischen Ergebnisse Enthält.
Wenn `scan` auf einen Stream aus drei wie folgt über die Zeit verteilten Klick-Ereignisse angewendet wird, ergibt sich folgender Stream:

```rx
click$:
|-----[Click]-----[Click]--[Click]----->

clickCount$: (click$.scan((sum) => sum + 1, 0))
|-----[1]---------[2]------[2]--------->
(Zeitachse links nach rechts)
```

Nach dem ersten Klick ergibt sich für den `clickCount$` Stream der Wert 0, nach dem zweiten Klick ergibt sich für den `clickCount$` Stream der Wert 2 und nach dem dritten Klick der Wert 3.
So Enthält der `clickCount$` also zu jedem Zeitpunkt die Anzahl der Klicks.

### Ereignise-Streams verwenden

Nun sollen also die DOM-Klickereignis-Streams verwendet werden, um die Anzahl der Bits zu verändern:

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';

//...

+const intent = (DOM) => {
+  return {
+    addBit$: DOM.select('[data-action="add-bit"]').events('click'),
+    removeBit$: DOM.select('[data-action="remove-bit"]').events('click'),
+  };
+};

-const model = (bitCount) => 
-  O.just(bitCount)
-  .map((bitCount) => ({
-    bitCount,
-    dots: dotArray(bitCount),
-  }))
- ;

+const model = (initialBitCount, actions) => {
+  const modifierFunction$ = O.merge([
+    actions.addBit$.map(() => (state) =>
+      ({bitCount: state.bitCount + 1})
+    ),
+    actions.removeBit$.map(() => (state) =>
+      ({bitCount: state.bitCount - 1})
+    ),
+  ]);
+
+  return modifierFunction$
+  .startWith({bitCount: initialBitCount})
+  .scan((state, modifierFunction) => 
+    modifierFunction(state)
+  )
+  .map(({bitCount}) => ({
+     bitCount,
+     dots: dotArray(bitCount),
+  }));
+};

const numberCircleApp = (sources) => {
+ const actions = intent(DOM);
- const state$ = model(3); 
+ const state$ = model(3, actions); 
  const vtree$ = view(state$);

 return {
   DOM: vtree$,
 };
};

//...
```

Es wurde eine `intent` Funktion definiert. `intent` bekommt das `DOM` Objekt als Parameter und extrahiert daraus die DOM-Ereignis-Streams, die für die Anwendung von Interesse sind. In diesem Fall `DOM.select('[data-action="add-bit"]').events('click')` und `DOM.select('[data-action="remove-bit"]').events('click')`, also den Stream der Klicks auf den einen und den anderen Button.

Als Ergebnis liefert die `intent` Funktion ein Objekt mit den Eigenschaften `addBit$` und `removeBit$` welche die jeweiligen Streams beinhalten.

Die `intent` Funktion transformiert also die DOM-Ereignis-Streams in Domänenbezogene Streams - sogenannte actions - um die DOM spezifische Details wegzuabstrahieren.

Die `numberCircleApp` gibt das von `intent` gelieferte und in der Konstante `actions` abgelegte Objekte an die `model` Funktion.

Die `model` Funktion hat nun einen zweiten Parameter `actions` bekommen, um auf die Aktionen des Benutzers reagieren zu können.

Bisher hatte die `model` Funktion via `O.just(3)` einen Konstanten Stream erzeugt und diesen dann in den Zustands-Stream transformiert, welcher ein Objekt mit dem Winkel-Array enthielt.

Nun erzeugt die `model` Funktion aus den beiden `action` Streams `addBit$` und `removeBit$` einen `modifierFunction$` Stream.

Dieser Schritt stellt das Herzstück der Benutzerinteraktion in der Anwendung dar, doch ist im ersten Moment vielleicht nicht von alleine zu verstehen, obwohl die zugrundeliegende Idee recht einfach ist.

Jeder der `action` Streams (`addBit$` und `removeBit$`) wird per `map` zunächst in einen Stream aus Funktionen transformiert.

Jedes Ereignis-Objekt in dem `addBit$` Stream wird in eine Funktion Transformiert. Der dadurch erzeugte Stream enthält also Funktionen (nicht das Ergebnis eines Funktionsaufrufes, sondern die Funktion bzw "den function pointer").

`(state) => ({bitCount: state.bitCount + 1})` ist die Definition der Funktion, die der transformierte `addBit$` Stream enthält. Eine Funktion, die als Parameter ein `state` Objekt erhält und als Ergebnis ein Objekt mit der Eigenschaft `bitCount` liefert, deren Werte um eines größer ist als der Werte des `bitCount` Eigenschaft des `state` Parameters.

Analog dazu wird der `removeBit$` Stream in einen Stream Transformiert, der für jedes Klick-Ereignis folgende Funktion enthält:

`(state) => ({bitCount: state.bitCount - 1})`
Der bitCount wird um `1` verringert.

Diese beiden resultierenden Streams, die jeweils Funktionen der Form `state -> state` enthalten werden dann per `merge` zu einem einzigen Stream zusammengefasst.

`merge(A,B)` Funktioniert analog zu dem `merge` zweier Listen so, dass der Ergebnis Stream alle Daten aus Stream A und alle Daten aus Stream B enthält und die zeitliche Sortierung erhalten bleibt:

```rx
A:
|----P----Q----R-S---->
B:
|-X----Y-----Z-----W-->
merge(A,B):
|-X--P-Y--Q--Z-R-S-W-->
(Zeitachse von links nach rechts)
```

In diesem Fall werden also die beiden Streams, die jeweils die Funktion zum Veringern und Erhöhen des Bitcounts enthalten zu einem gemeinsamen Stream `modifierFunction$` zusammen gefügt, der beide Funktion enthält. 

```rx
addBit$:
|--[click]----[click]----------[click]---->
addBit$.map(toFunction):
|--[s->s]-----[s->s]-----------[s->s]----->

removeBit$:
|----------------------[click]------------>
removeBit$.map(toFunction):
|----------------------[s->s]------------->

merged:
|--[s->s]-----[s->s]---[s->s]--[s->s]----->
(Zeitachse links nach rechts)
```

Anschließend wird der `modifierFunction$` Stream in den `state$` transformiert, indem der `scan` Operator verwendet wird, um die Funktionen des `modiferFunction$` Streams nacheinander auf das `state` Objekt `{bitCount: 3}` anzuwenden.

Zuletzt wird der Stream noch ein weiteres mal transformiert, um das `state` Objekt in das bisherige Format `{dots, bitCount}` zu bringen, welches von der `view` bzw `render` Funktion erwartet wird.

Wenn der Benutzer nun einen der beiden Buttons anklickt, wird das Ereignis-Objekt als neuer Wert durch den `addBit$` oder den `removeBit$` Stream geschickt, in die entsprechenden Funktion umgewandelt, welche dann vom `scan` Operator auf den akkumulierten `state` angewendet wird. Diese Funktion liefert als Ergebnis ein neues Objekt zurück, welches den neuen Zustand mit erhöhter oder veringerter Bitanzahl darstellt.
Dieses Ergebnis wird vom `scan` Operator als neuer Akkumulator verwendet und außerdem in ein neues dotArray umgewandelt.
Das neue dotArray wird von der `view` bzw `render` Funktion in einen neuen virtuellen DOM-Baum umgewandelt, welcher dann vm DOM-Treiber dargestellt wird.

Bei den darauffolgenden Klicks passiert das gleiche, nur dass der `scan` Operator sich jeweils das letzte Ergebnis (den letzten `state` Wert) merkt, sodass die `modifierFunction` immer den aktuellen Zustand mit der Anzahl der Bits als Parameter bekommt.

## Nur gewisse Anzahl von Bits erlauben

Nun kann der Benutzer die Anzahl der Bits beliebig erhöhen oder verringern. Sinnvoll dargestellt werden kann der Zahlenkreis aber nur für ungefähr 5 Bits. Außerdem ergibt es keinen Sinn eine negative Zahl an Bits zu erlauben. Auch für 0 Bits kann kein sinnvoller Kreis dargestellt werden.

Darum sollen die Buttons nun deaktiviert werden, wenn ein Hinzufügen oder Entfernen von Bits nicht sinnvoll ist.

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';

//...
 
 const renderButtons = (state) => div([
   button({
     attributes: {
       'data-action': 'add-bit',
     },
+    disabled: state.canAddBits ? void 0 : 'true',
   }, 'Add Bit'),
 
   button({
     attributes: {
       'data-action': 'remove-bit',
     },
+    disabled: state.canRemoveBits ? void 0 : 'true',
   }, 'Remove Bit'),
 ]);

 //...

const model = (initialBitCount, actions) => {
  const modifierFunction$ = O.merge([
    actions.addBit$.map(() => (state) =>
      ({bitCount: state.bitCount + 1})
    ),
    actions.removeBit$.map(() => (state) =>
      ({bitCount: state.bitCount - 1})
    ),
  ]);

  return modifierFunction$
  .startWith({bitCount: initialBitCount})
  .scan((state, modifierFunction) => 
    modifierFunction(state)
  )
  .map(({bitCount}) => ({
     bitCount,
     dots: dotArray(bitCount),
+    canAddBits: bitCount < 5,
+    canRemoveBits: bitCount > 1,
  }));
};

const numberCircleApp = (sources) => {
  const actions = intent(DOM);
  const state$ = model(3, actions); 
  const vtree$ = view(state$);

 return {
   DOM: vtree$,
 };
};

//...
```

Dem von der `model` Funktion erzeugten Zustandsobjekt wurden zwei boolsche Eigenschaften `canAddBits` und `canRemoveBits` hinzugefügt, um festzulegen ob die Anzahl der Bits verringert oder erhöht werden kann.

Die `renderButtons` Funktion macht gebrauch dieser beiden Eigenschaften um Abhängig davon die `disabled` Eigenschaft an dem jeweiligen Button zu setzen.

Nun ist die Anzahl der Bits auf Zahlen zwischen inklusive 1 und inklusive 5 beschränkt.

## Die Größe des Kreises justieren

Die `renderDots` Funktion war darauf ausgelegt einen Zahlenkreis aus 8 Kreises darzustellen. Wird die Bitanzahl auf 5 erhöht, kommt es zu unschönen Überschneidungen. Dies soll nun korrigiert werden:

 ```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';

//...

-const renderDots = (dots) =>
+const renderDots = (dots) => {
+   const dotRadius = 50;
+   const radius = 150 * Math.sqrt(dots.length);
+   const size = 2 * (radius + dotRadius);
+   const center = size / 2;
    svg('svg', {
      attributes: {
-       width: 200,
-       height: 200,
+       width: 500,
+       height: 500,
        class: 'graphics-root',
-       viewBox: `0 0 500 500`,
+       viewBox: `0 0 ${size} ${size}`,
        preserveAspectRatio: 'xMidYMid meet',
      },
    }, dots.map((dot) => [
       svg('circle', {
-        cx: 250 + Math.sin(dot.angle) * 200,
-        cy: 250 - Math.cos(dot.angle) * 200,
+        cx: center + Math.sin(dot.angle) * radius,
+        cy: center - Math.cos(dot.angle) * radius,
         fill: '#444',
         r: 50,
    }),
    svg('text', {
-     x: 250 + Math.sin(dot.angle) * 200,
-     y: 250 - Math.cos(dot.angle) * 200,
+     x: center + Math.sin(dot.angle) * radius,
+     y: center - Math.cos(dot.angle) * radius,
      fill: '#fff',
      'font-size': '50px',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
    }, dot.value.toString()),
-  ]))
-;
+  ]));
+};

//...
```

Der `radius` des Kreises wird Abhängig von der Anzahl der `dots` berechnet, sodass bei enr größeren Anzahl an `dots` bzw Bits auch ein größerer Kreis entsteht.
Die SVG `viewBox` wird entsprechend angepasst, sodass der gesamte Kreis immer im sichtbaren Bereich liegt.

## Beschriftung korrigieren

Zuvor wurden die kleinen Kreise einfach im Uhrzeigersinn von `0` bis `(2^bitCount)-1` nummeriert und beschriftet.
Der eigentliche Zweck des Zahlenkreises soll es jedoch sein, die Kodierung negativer Ganzzahlen im Dualsystem zu veranschaulichen. Entsprechend soll die linke Hälfte des Kreises eigentlich die negativen Zahlen darstellen. Die Berechnung des der `value` Eigenschaft der `dot` Objekte muss also korrigiert werden.

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';

//...

const dotArray = (bits) => 
  arrayOfSize(Math.pow(2, bits))
  .map((_, index, {length}) => ({
    angle: 2 * Math.PI * index / length,
-   value: index,
+    value: index >= all.length / 2 ? index - all.length : index,
  }))
;

//...

```

Die linke Hälfte des Kreises stellt nun negative Zahlen dar. An dem untersten Punkt des Kreises treffen die größe positive und die im Betrag größte negative Zahl aufeinander.

## Zahlenwerte Klickbar machen

Es soll nicht nur die größe des Zahlenkreises vom Benutzer verändert werden können. Der Benutzer soll auch Werte im Zahlenkreis auswählen können, um später Werte miteinander addieren und subtrahieren zu können.
Zuersteinmal soll ein Wert durch einfaches anklicken ausgewählt und dadurch farblich hervorgehoben werden können.

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';

//...

-const renderDots = (dots) => {
+const renderDots = (dots, selected) => {
   const dotRadius = 50;
   const radius = 150 * Math.sqrt(dots.length);
   const size = 2 * (radius + dotRadius);
   const center = size / 2;
    svg('svg', {
      attributes: {
        width: 500,
        height: 500,
        class: 'graphics-root',
        viewBox: `0 0 ${size} ${size}`,
        preserveAspectRatio: 'xMidYMid meet',
      },
-   }, dots.map((dot) => [
+   }, dots.map((dot, dotIndex) => svg('g', {
+     attributes: {
+       'data-dot-index': dotIndex,
+     },
+   }, [
      svg('circle', {
        cx: center + Math.sin(dot.angle) * radius,
        cy: center - Math.cos(dot.angle) * radius,
-       fill: '#444',
+       fill: selected === dotIndex ? 'green' : '#444',
        r: 50,
      }),
      svg('text', {
        x: center + Math.sin(dot.angle) * radius,
        y: center - Math.cos(dot.angle) * radius,
        fill: '#fff',
        'font-size': '50px',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      }, dot.value.toString()),
-  ]));
+  ])));
};

const render = (state) =>
  div([
    div(['Number of bits:', state.bitCount]),
    renderButtons(state),
-   renderDots(state.dots),
+   renderDots(state.dots, state.selected),
  ])
;

const intent = (DOM) => {
  return {
    addBit$: DOM.select('[data-action="add-bit"]').events('click'),
    removeBit$: DOM.select('[data-action="remove-bit"]').events('click'),
+   selectDot$: DOM.select('[data-dot-index]')
+      .events('click').map(
+        (evt) => parseInt(evt.ownerTarget.getAttribute('data-dot-index'), 10)
+      ),
  };
};

const model = (initialBitCount, actions) => {
  const modifierFunction$ = O.merge([
    actions.addBit$.map(() => (state) =>
-     ({bitCount: state.bitCount + 1})
+     ({bitCount: state.bitCount + 1, selected: null})
    ),
    actions.removeBit$.map(() => (state) =>
-     ({bitCount: state.bitCount - 1})
+     ({bitCount: state.bitCount - 1, selected: null})
    ),
+   actions.selectDot$.map((bitIndex) => (state) =>
+     ({bitCount: state.bitCount, selected: bitIndex})
+   ),
  ]);

  return modifierFunction$
- .startWith({bitCount: initialBitCount})
+ .startWith({bitCount: initialBitCount, selected: null})
  .scan((state, modifierFunction) => 
    modifierFunction(state)
  )
  .map(({bitCount, selected}) => ({
     bitCount,
     dots: dotArray(bitCount),
+    selected,
     canAddBits: bitCount < 5,
     canRemoveBits: bitCount > 1,
  }));
};

const numberCircleApp = (sources) => {
  const actions = intent(DOM);
  const state$ = model(3, actions); 
  const vtree$ = view(state$);

 return {
   DOM: vtree$,
 };
};

//...
```

Zunächst wurde das `state` Objekt in der `model` Funktion um die Eigenschaft `selected` erweitert. Sie soll den Index des ausgewählten Punktes beinhalten und wird auf den Wert `null` initialisiert, sodass zu Beginn kein Punkt ausgewählt ist.

Die `render` Funktion gibt nun den Wert der `selected` Eigenschaft als zweiten Parameter an die `renderDots` Funktion.

Die `renderDots` setzt nun das `fill` Attribut der kleinen Kreise abhängig von dem Wert des `selected` Parameters und Gruppiert die `circle` und `text` SVG-Elemente jeweils in eine  SVG-Gruppe `g`, die das Attribut `data-dot-index` auf den den Index des jeweiligen "Dots" gesetzt bekommt.

Die `intent` Funktion erzeugt nun einen dritten Aktions-Stream `selectDot$`, indem sie den Stream der Klick-Ereignisse auf Elemente, die das `data-dot-index` Attribut gesetzt haben - also Mouseklicks auf die kleinen Kreise des Zahlenkreises - in einen Stream der Werte des Attributes transformiert. Der `selectDot$` Stream enthält also die Indizes der angeklickten Zahlen. 

In der `model` Funktion wiederum wird dieser `selectDot$` Stream dann in einen Stream aus Funktionen transformiert, die einen `state` mit dem entsprechenden `selected` Wert erzeugen. Dieser neue Stream aus Funktionen wird ebenfalls per `merge` mit den anderen `action` Streams in den `modifierFunction$` Stream verschmolzen.

## Einen Kreisbogen zeichen

Nun soll nicht nur die Ausgewählte zahl farbig hervorgehoben werden, sondern es soll auch ein Kreisbogen zwischen der 0 der der Ausgewählten Zahl gezeichnet werden, um den Betrag der Zahl visuell hervorzuheben. Hierbei handelt es sich lediglich um eine Änderung in der Darstellung. Daher muss nur die `render` Funktion verändert werden: 

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';
+import {IF} from '../../lib/h-helper';

//...

+const renderArc = (dots, selected, size, radius) =>
+  IF(selected !== null, () => {
+    const dot = dots[selected];
+    const angle = dot.angle;
+    const x = Math.sin(angle) * radius;
+    const y = -Math.cos(angle) * radius;
+    const center = size / 2;
+    const mid = angle > Math.PI;
+
+    return svg('path', {
+      d: `M ${center} ${center - radius}
+          A ${radius} ${radius} 0
+          ${mid ? 1 : 0} 1
+          ${x + center} ${y + center}`,
+      fill: 'none',
+      'stroke-width': 10,
+      stroke: 'green',
+    });
+  })
+;

 const renderDots = (dots, selected) => {
   const dotRadius = 50;
   const radius = 150 * Math.sqrt(dots.length);
   const size = 2 * (radius + dotRadius);
   const center = size / 2;
    svg('svg', {
      attributes: {
        width: 500,
        height: 500,
        class: 'graphics-root',
        viewBox: `0 0 ${size} ${size}`,
        preserveAspectRatio: 'xMidYMid meet',
      },
-   }, dots.map((dot, dotIndex) => svg('g', {
+   }, [
+   ...dots.map((dot, dotIndex) => svg('g', {
      attributes: {
        'data-dot-index': dotIndex,
      },
    }, [
      svg('circle', {
        cx: center + Math.sin(dot.angle) * radius,
        cy: center - Math.cos(dot.angle) * radius,
        fill: selected === dotIndex ? 'green' : '#444',
        r: 50,
      }),
      svg('text', {
        x: center + Math.sin(dot.angle) * radius,
        y: center - Math.cos(dot.angle) * radius,
        fill: '#fff',
        'font-size': '50px',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      }, dot.value.toString()),
-  ])));
+  ])),
+  renderArc(dots, selected, size, radius - dotRadius * 1.5),
+  ]);
};

//...
```

Für die Erzeugung des Kreisbogens wurde eine neue Funktion `renderArc` definiert. Die `renderDots` Funktion ruft die `renderArc` Funktion auf, um den Kreisbogen zusätzlichen zu den erzeugten `circle` und `text` Elemente als Kind an das `svg` Element zu übergeben. Daher müssen das transformierte `dots` Array und das von `renderArc` Erzeugte Element zu einem neuen Array zusammen gefasst werden. Dies geschieht hier mithilfe des `...`-Spread-Operators. `[...dots, arc]` erzeugt ein Array, welches alle `dots` und als letztes element `arc` enthält.

`renderArc` erzeugt ein SVG `path` Element dessen Attribute entsprechend gesetzt werden.

`IF` mit allen Buchstaben großgeschrieben ist eine Helfer Funktion, die Analog zu JavaScript eigenen `if`-Anweisung funktioniert, allerdings als Funktion definiert ist, sodass sie als Ausdruck mit einem Rückgabewerte verwendet werden kann.
Sie Akzeptiet zwei Parameter: Einen boolschen Wert und eine Funktion. Wenn der boolsche Wert wahr ist, wird die Funktion ausgeführt und ihr Rückgabewerte zurückgegeben. Wenn der boolsche Werte falsch ist, wird `undefined` zurückgegeben.

In diesem Fall wird diese Funktion benutzt, um den Kreisbogen nur dann zu erzeugen, wenn der `selected` nicht `null` ist, also wenn eine Zahl ausgewählt ist.


## CSS bzw Stylus zum Gestalten verweden

Bis jetzt wurde das Aussehen der Schrift und der Buttons nicht weiter beachtet, sondern bei den Standardwerten des Browsers belassen. Die Farben der SVG-Elemente wurde als Attribute direkt an den Elementen gesetzt. Nun soll eine Gestaltung mit Hilfe von CSS-Klassen vorgenommen werden.

Anstelle von klassischem CSS soll jedoch die Sprache *Stylus* verwendet werden. Stylus ist eine Sprache, die CSS sehr ähnlich ist und letztendlich auch zu CSS kompiliert wird, allerdings eine leicht abgeänderte Syntax hat und einige zusätzliche Funktionen bietet. Beispielsweise lassen sich in *Stylus* Markos und Variablen definieren, sodass Style-Definition besser wiederverwendet werden können und sich umfangreiche Stylesheets einfacher Pflegen lassen.

Zunächst wird eine neue `.styl` Datei mit dem Namen `index.styl` im selben Ordner wo schon die `index.js` liegt angelegt:

* `index.styl` anelegen

```styl
// in /app/pages/number-circle/index.styl

@import '../../styles/app'

.number-circle-container
  position absolute
  top 0
  bottom 0
  right 0
  left 0

.number-circle
  width 100%
  height auto
  max-height 80%

.number-dot
  cursor pointer
  &.state-selected
    .number-dot-background
      fill color-focus

.number-dot-background
  fill #444

.number-dot-label
  font-family font-sans

.selection-arc
  stroke color-focus

.button-bar
  text-align center
  padding space(1)

.bit-button
  margin space(0.1)
  button(false, color-background-inverse)

  &:disabled
    opacity 0.8

.bit-count
  margin-top space(1)
  font-size font-size-big
  text-align center
```

Wie sich erkennen lässt müssen in *Stylus* im Vergleich zu *CSS* keine geschweiften Klammer `{}` geschrieben werden. Stattdessen werden die Eigenschaften gegenüber den Selektoren eingerückt.
Doppelpunkt `:` und Semikolon `;` zum Trennen der Eigenschaften und ihrer Werte sind ebenfalls nicht nötig.

Zu Beginn der `index.styl` Datei wird ein anderen Stylesheet `../../styles/app` importiert. In diesem sind schon einige Markos und und Farbkonstanten definiert - beispielsweise das `button` Makro, welches verwendet wird um den `.bit-button` Selektor zu definieren.

Als nächstes muss die `index.styl` noch geladen werden. Dafür wird der `index.js` eine entsprechende `import` Anweisung hinzugefügt. Webpack erkennt an der Dateiendung, dass es sich bei dem Import um keine JavaScript-Datei, sondern eine Stylus-Datei handelt und sorgt dafür, dass das Stylesheet in gültiges CSS umgewandelt und auf der Seite eingebunden wird.

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';
import {IF} from '../../lib/h-helper';

+import './index.styl';

//...

Nun da das Stylesheet erstellt und importiert wurde, müssen nur noch den Elementen die passenden Klassen hinzugefügt werden:

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';
import {IF} from '../../lib/h-helper';

import './index.styl';

//...

const renderArc = (dots, selected, size, radius) =>
  IF(selected !== null, () => {
    const dot = dots[selected];
    const angle = dot.angle;
    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius;
    const center = size / 2;
    const mid = angle > Math.PI;

    return svg('path', {
      d: `M ${center} ${center - radius}
          A ${radius} ${radius} 0
          ${mid ? 1 : 0} 1
          ${x + center} ${y + center}`,
      fill: 'none',
      'stroke-width': 10,
+     class: 'selection-arc',
-     stroke: 'green',
    });
  })
;

 const renderDots = (dots, selected) => {
   const dotRadius = 50;
   const radius = 150 * Math.sqrt(dots.length);
   const size = 2 * (radius + dotRadius);
   const center = size / 2;
    svg('svg', {
      attributes: {
        width: 500,
        height: 500,
-       class: 'graphics-root',
+       class: 'number-circle',
        viewBox: `0 0 ${size} ${size}`,
        preserveAspectRatio: 'xMidYMid meet',
      },
   }, [
   ...dots.map((dot, dotIndex) => svg('g', {
      attributes: {
+        class: 'number-dot' +
+          (selected === dotIndex ? ' state-selected' : ''),
        'data-dot-index': dotIndex,
      },
    }, [
      svg('circle', {
+       class: 'number-dot-background',
        cx: center + Math.sin(dot.angle) * radius,
        cy: center - Math.cos(dot.angle) * radius,
-       fill: selected === dotIndex ? 'green' : '#444',
        r: 50,
      }),
      svg('text', {
+       class: 'number-dot-label',
        x: center + Math.sin(dot.angle) * radius,
        y: center - Math.cos(dot.angle) * radius,
        fill: '#fff',
        'font-size': '50px',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      }, dot.value.toString()),
  ])),
  renderArc(dots, selected, size, radius - dotRadius * 1.5),
  ]);
};


-const renderButtons = (state) => div([
+const renderButtons = (state) => div('.button-bar', [
- button({
+ button('.bit-button', {
    attributes: {
     'data-action': 'add-bit',
    },
    disabled: state.canAddBits ? void 0 : 'true',
  }, 'Add Bit'),

- button({
+ button('.bit-button', {
    attributes: {
      'data-action': 'remove-bit',
    },
    disabled: state.canRemoveBits ? void 0 : 'true',
  }, 'Remove Bit'),
]);

const render = (state) =>
- div([
+ div('.number-circle-container', [
-   div(['Number of bits:', state.bitCount]),
+   div('.bit-count', ['Number of bits:', state.bitCount]),
    renderButtons(state),
    renderDots(state.dots, state.selected),
  ])
;

//...
```

Zu beachten ist, dass bei HTML-Elementen wie `div` oder `button` der Klassenname als CSS-Selektor im ersten Parameter angegeben werden kann (z.B. `button('.bit-button', ...)` bei SVG-Elementen jedoch als Attribut: `svg('g', {attributes: {class: 'number-dot'}})`. Das liegt daran, dass SVG-Elemente in älteren Browsern die `classList` Eigenschaft nicht vollsändig unterstützen, sondern die die API von SVG Elementen leicht von der HTML-DOM-API unterscheidet.


## Bitmuster anzeigen

Zusätzliche zu den Zahlenwerten soll nun auch noch das Bitmuster angezeigt werden, sodass sich erkennen lässt, dass bei den negativen Zahlen das vorderste Bit auf `1` gesetzt ist.

```diff
// in /app/pages/number-circle/index.js

import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';
import {IF} from '../../lib/h-helper';

import './index.styl';

//...

  
+const textAnchor = (angle) => {
+  const sin = Math.sin(angle);
+
+  if (sin > 0.01) {
+    return 'start';
+  } else if (sin < -0.01) {
+    return 'end';
+  } else {
+    return 'middle';
+  }
+};
+
+const baseLine = (angle) => {
+  const cos = -Math.cos(angle);
+
+  if (cos > 0.01) {
+    return 'text-before-edge';
+  } else if (cos < -0.01) {
+    return 'text-after-edge';
+  } else {
+    return 'central';
+  }
+};

 const renderDots = (dots, selected) => {
   const dotRadius = 50;
   const radius = 150 * Math.sqrt(dots.length);
   const size = 2 * (radius + dotRadius);
   const center = size / 2;
+  const padding = 100;

    svg('svg', {
      attributes: {
        width: 500,
        height: 500,
        class: 'number-circle',
-       viewBox: `0 0 ${size} ${size}`,
+       viewBox: `
+        ${-padding}
+        ${-padding}
+        ${size + 2 * padding}
+        ${size + 2 * padding}
+      `,
        preserveAspectRatio: 'xMidYMid meet',
      },
   }, [
   ...dots.map((dot, dotIndex) => svg('g', {
      attributes: {
        class: 'number-dot' +
          (selected === dotIndex ? ' state-selected' : ''),
        'data-dot-index': dotIndex,
      },
    }, [
      svg('circle', {
        class: 'number-dot-background',
        cx: center + Math.sin(dot.angle) * radius,
        cy: center - Math.cos(dot.angle) * radius,
        r: 50,
      }),
      svg('text', {
        class: 'number-dot-label',
        x: center + Math.sin(dot.angle) * radius,
        y: center - Math.cos(dot.angle) * radius,
        fill: '#fff',
        'font-size': '50px',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      }, dot.value.toString()),
+     svg('text', {
+       class: 'number-dot-pattern',
+       x: center + Math.sin(dot.angle) * (radius * 1 + 70),
+       y: center - Math.cos(dot.angle) * (radius * 1 + 70),
+       fill: '#000',
+       'font-size': '50px',
+       'text-anchor': textAnchor(dot.angle),
+       'dominant-baseline': baseLine(dot.angle),
+     }, dot.pattern.toString()),
  ])),
  renderArc(dots, selected, size, radius - dotRadius * 1.5),
  ]);
};

//...

+const bitPattern = (number, bitCount) =>
+  Array
+    .apply(Array, {length: bitCount})
+    .map((__, b) =>
+      (1 << (bitCount - b - 1)) & number ? 1 : 0
+    ).join('')
+;
+
+const intValue = (number, bitCountPow2) =>
+  number >= bitCountPow2 / 2 ? number - bitCountPow2 : number
+;

const dotArray = (bits) => 
  arrayOfSize(Math.pow(2, bits))
  .map((_, index, {length}) => ({
    angle: 2 * Math.PI * index / length,
-   value: index >= all.length / 2 ? index - all.length : index,
+   value: intValue(index, all.length),
+   pattern: bitPattern(index, bitCount),
  }))
;

//...
```

In der `dotArray` wird nun zusätzliche zu der `value` Eigenschaft noch ein `pattern` Wert berechnet. Für die Umwandlung einer Zahl in ein Bitpattern wurde die Funktion `bitPattern` definiert. Die Berechnung des `value` Wertes wurde ebenfalls in eine neue Funktion mit dem Namen `intValue` ausgelagert.

Die `renderDots` erzeugt nun ein zusätzliches SVG `text` Element welches den `pattern` Wert darstellt. Damit um den Zahlenkreis herum genügend Platz ist, sodass die `pattern` Werte vollständig dargestellt werden können, wurde die `viewBox` des `svg` Elementes vergrößert.

Das `text-anchor` Attribut des neuen `text` Elementes wird mithilfe der `textAnchor` Funktionen abhängig vom Winkel berechnet, sodass die Texte auf der linken Seite der Graphik rechtsbündig und die Texte auf der linken Seite linksbündig platziert werden. 
Analog dazu wird auch das `dominant-baseline` Attribut abhängig vom Winkel gesetzt, sodass auch vertikele Position der `pattern` Beschriftungen gleichmäßig ist.
