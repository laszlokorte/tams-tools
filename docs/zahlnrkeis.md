# Zahlen Kreis in CycleJS

Im Folgenen soll gezeigt werden, wie sich mit CycleJS sehr einfach ein eine interaktive Komponente entwickeln lässt.
Dies wird am Beispiel der Erstellung eines Zahlenkreises gezeigt, der die Addition, die Subtraktion und den Überlauf von Binärkodierten Ganzzahlen darstellen soll.

## Neue Seite anlegen

Zunächst muss eine neue Seite angelegt werden, auf der der Zahlenrkeis dargestellt werden soll.

Hierzu wird, wie schon in der Projekteinleitung beschrieben, in dem `/app/pages/` Ordner ein neues Unterverzeichnis namens `number-circle` angelegt und diesem Unterverzeichnis dann eine leere Datei `index.js` erstellt.

* `/app/pages/number-circle/index.js` erzeugen

Wie ebenfalls schon in der Einleitung erklärt, muss diese neue JavaScript-Datei nun in der Webpack-Konfiguration als Einstiegspunkt deklariert werden. Dafür wird die `/webpack/common.config.babel.js` entsprechend bearbeitet:

* Webpack Konfiguration bearbeiten:

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

Damit sich die neue Seite bequem aufrufen lässt, soll noch ein entsprechender Link auf die Startseite hinzugefügt werden. Dafür wird die `/app/pages/home/index.js` Datei bearbeitet:

* Link auf der Startseite hinzufügen

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

* CycleJS in `/app/pages/number-circle/index.js` initialisieren

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