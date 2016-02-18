Einleitung
==========

Überblick
---------

In den Quellcode eines fremden Projektes gedanklich einzusteigen ist schwierig - besonders, wenn Programmiersprachen und Tools zum einsatz kommen, die man selbst zuvor noch nicht oder nur wenig benutzt hat.

Hiermit soll ein Überblick über die konkrete Projektstruktur gegeben werden, um einen Ausgangspunkt zu bieten, von dem aus man sich durch das Projekt hangeln kann, ohne sich zu verlaufen.


Projekt Anforderungen
---------------------

Kern dieses Projekts ist eine Reihe Anwendungen zum Bearbeiten und Vorführen von Thematiken der Technischen Informatik.

Beispielsweise ein Werkzeug zum bearbeiten von KV-Diagrammen oder ein Editor zur Eingabe und Auswertung von Logischen Ausdrücken.

Alle Anwendungen laufen als Webanwendungen im Browser und funktionieren so auf verschiedenen Geräten vom Desktop- bis zum Tablet-Computer.

Dabei ist kein Webserver für die Ausführung der Anwendungen nötig. 
Es können also alle Anwendungen auch offline benutzt werden.


Das JavaScript Ecosystem
------------------------

### ES2015

JavaScript ist die einzige Programmiersprache, die von allen modernen Browsern und Geräten unterstützt wird. 
Entsprechend ist dieses Projekt in JavaScript geschrieben.

JavaScript ist eine Programmiersprache mit vielen eigenheiten und semantischen unschönheiten, die es sehr schwierig, umfangreichere Projekte umzusetzen. Beispielsweise untersütze JavaScript bisher keine Definition von Modulen, wodurch die Strukturierung des Quelltext immens erschwert wird. Auch das dynamisch Typsystem sorgt mit seinen inkonsistenten impliziten Typumwandlungen sorgt schnell für fehlerhaften Code.

Um diese Probleme zu lösen, wurden in den letzten Jahren viele verschiedene Programmiersprachen entwickelt, die als Alternative zu JavaScript verwendet werden können. Da die Browser natürlich weiterhin nur JavaScript Code ausführen können, sind diese Sprachen daraus ausgelegt zu JavaScript compiliert werden zu können.
Somit ist es Möglich eine Anwendung in einer Sprache zu schreiben, die JavaScript in vielerlei hinsicht überlegt ist, am ende jedoch zu JavaScript umgewandelt werden kann, sodss die Anwendung in allen Browsers ausgeführt werden kann.

Außerdem wird aber auch JavaScript selbst vom EcmaScript-Committee weiterentwickelt, sodass viel der Probleme, die JavaScript derzeit hat, in zukünftigen Versionen behoben werden sein.
Es wird allerdings noch einige Zeit dauern, bis alle Browser die neuen JavaScript unterstützen und auch auch alle Benutzer ihren Browser dann auf die nötige Version aktualisiert haben.

Um auch heute schon Features von zukünftigen JavaScript Versionen benutzen zu können, wie beispielsweise die Definition von Modulen, gibt es auch hierfür Compiler, die neuartigen JavaScript Quelltext in klassischen JavaScript-Quelltext umwandeln können, sodass dieser von allen Browsern verstanden wird.
Der weitverbreitetste dieser Compiler ist [Babel](http://babeljs.io/).

In diesem Projekt wird Babel verwendet. Der gesamte JavaScript-Quelltext dieses Projektes ist also in ECMA-Script 2015 geschrieben und muss bevor er vom Browser ausgeführt werden kann, zum klassichen JavaScript-Code compiliert werden. 

### Package Manager und NodeJS

In diesem Projekt wird NodeJS und NPM verwendet.


Seit einigen Jahren wird JavaScript auch außerhalb des Webbrowsers für serverseitige Netzwerkprogrammierung verwendet. Die selbe Sprache für die clientseitige Programmierung im Browser wie für die Programmierung der serverseitigen Logik zu verwenden, ermöglicht es teile des Quelltextes widerzuverwenden und verringert das Umdenken beim Arbeiten in verschiedenen Teilen eines Projekts.

Ermöglicht wurde die JavaScript-Programmierung außerhalb des Browsers erst durch [NodeJS](https://nodejs.org/en/). NodeJS ist eine JavaScript Laufzeitumgebung, die auf der V8 JavaScript-Engine  aufsetzt, die auch vom Chrome-Browser für die JavaScript-Ausführung verwendet wird. NodeJS bringt einen eigenen Packagemanager namens [NPM (Node Package Manager)](https://www.npmjs.com/) mit, der für die Installation und Verwaltung zusätzlicher JavaScript-Bibliotheken verwendet wird.

Im Vergleich zu anderen Programmiersprachen, wie beispielsweise Java oder Python, bietet JavaScript keine eigene umfangreiche Standard-Library, auf die zurückgegriffen werden kann. JavaScript selbst beinhaltet lediglich die Datentypen Number, Boolean, String, Object und Array sowie ein paar duzend Methoden um mit diesen zu arbeiten.

Die JavaScript Community hat allerdings in den vergangenen Jahren eine fülle an Bibliotheken entwickelt, die sich mit Hilfe von NPM installieren und verwenden lassen.
Babel, der Compiler, der in diesem Projekt verwendet wird um modernen JavaScript-Code in klassichen kompatiblen JS-Code zu verwandelt ist selbst in JavaScript programmiert und als NPM Package frei verfügbar.

Alle Bibliotheken, die in diesem Projekt verwendet werden, sind als NPM-Abhängigkeiten definiert. Es wird also lediglich NPM benötigt um alle Abhängigkeiten zu installieren und dieses Projekt zum Laufen zu bekommen.

### Webpack

Jede Internetseite bzw Webanwendung besteht aus einer vielzahl an Dateien: HTML-Dateien, JavaScript-Dateien in denen die Logik definiert ist, CSS-Dateien in denen das Layout und die Farben definiert sind, Bildern, Icons und einigen mehr.

Da all diese Dateien über das Netzwerk an den Client bzw an den Browser gesendet werden sollen, ist es von Vorteil die Datengröße dieser Dateien möglichst klein und deren Anzahl möglichst gering zu halten. Um einen um die Ladezeiten so niedrig wie möglich zu halten und zum anderen um nicht unnötig Bandbreite zu verbrauchen.

Andererseits ist es besonders in der Entwicklung und Wartung des Projekts von Vorteil die Dateien möglichst sinnvoll und verständlich zu strukturieren, um den Überblick zu behalten.
Anstatt eine einzige sehr eng geschriebene JavaScript Datei zu schreiben, ist es sinnvoller diese in mehre Module und somit in mehrere Dateien oder gar auf mehrere Ordnr aufzuteilen.

Auch wäre es schwachsinnig beim Vergeben von Variablennamen darauf zu achten, diese so kurz wie möglich zu wählen, um die zum Browser zu sendenen Daten gering zu halten. Denn den so entstehenden Quelltext könnte später niemand mehr verstehen.

Um bei diesem Problem so wenig Kompromisse wie möglich eingehen zu müssen, gibt es verschiedene Compiler, die in der Lage sind, Quelltext, der über mehrere Dateien verstreut ist, einzusammeln, in möglichst wenige Dateien zusammenzufassen und dabei so gut es geht zu kürzen: Variablennamen kürzen, unnötige Leerzeichen entfernen, unbenutzte Funktionen entfernen...

In diesem Projekt wird hierfür [Webpack](https://webpack.github.io/) verwendet. Webpack ist ebenfalls ein NPM Package.
Webpack ist ein Module-Bundler, der sich mit verschiedenen Plugins erweitern und konfigurieren lässt.

Da in diesem Projekt Babel verwendet wird, um modernen JavaScript-Code in browserkompatiblen Code umzuwandelt, ist sowieso ein Konvertierungsschritt nötig, um dies Anwendung im Browser zum Laufen zu bekommen.

Webpack stellt das Grundgerüst für diese Konvertierung bereit, indem es die verschiedenen Konvertierungen nacheinander vornimmt:
Zuerst wird der JavaScript-Code auf grobe Fehler überprüft, dann wird er mithilfe von Babel umgewandelt, dann werden die verschiedenen Dateien und Module zu einer Datei zusammen gefasst, als nächstes wird diese Datei so gut es geht komprimiert.

Das genaue Verhalten von Webpack ist in der entsprechenden Konfigurationsdatei im /webpack/ Ordner definiert.

Da es nicht besonders praktisch ist, diesen Umwandlungsschritt während der Entwicklung andauernd manuell durchzuführen, bietet ein Webpack-Plugin auch einen Modus an, der das Dateisystem auf Änderungen überwacht und gegebenenfalls automatisch eine erneute Compilierung auslöst.
In diesem Modus wird ein lokaler Webserver gestartet über den die Anwendung dann im Browser aufgerufen werden kann. Damit ist es möglich auch dem Browser mitzuteilen, dass sich das JavaScript-Code  (oder CSS, HTML, Bilder...) geändert hat.

Webpackt bildet also das Herz der Entwicklungsumgebug diess Projekts.

### ESLint

ESLint ist ein Tool, welches den Stil von JavaScript-Code bewertet. Es wird in diesem Projekt verwendet, um den Stil des JavaScript-Codes konsistent zu halten.
Es ist als Plugin für Webpack konfiguriert, sodass die Überprüfung vor jedem Build stattfindet.

Verwendete Bibliotheken
-----------------------

### Stylus

In diesem Projekt wird [Stylus](http://stylus-lang.com/) verwendet.
Stylus ist eine CSS-ähnliche Sprache, die zu CSS kompiliert werden kann.
Neben einer vereinfachten Syntax bietet Stylus viele Features, die von CSS selbst nicht unterstützt werden wie beispielsweise die Definition von Variablen und Funktionen. Somit vereinfacht Stylus das schreiben von Umfangreichem CSS-Code.

### ImmutableJS

In diesem Projekt wird [ImmutableJS](https://facebook.github.io/immutable-js/) verwendet.
ImmutableJS ist eine JavaScript-Bibliothek, die eine vielzahl von Unveränderlichen Datenstrukturen anbietet: Linked-Lists, HashMaps, Sets...

Da in diesem Projekt sehr stark auf funktionale Programmierung gesetzt wird, ist ImmutableJS besonders nützlich.

### RxJS / CycleJS

In diesem Projekt wird die [ReactiveX](http://reactivex.io/) Bibliothek [RxJS](https://github.com/Reactive-Extensions/RxJS) verwendet.

RxJS Definiert eine Datenstruktur, die Obserable genannt wird. Ein Observable modelliert einen diskreten Datenstrom über die zeit und stellt dabei eine Collection-ähnliche API zur vefügung:
Mit `map()`, `filter()`, `scan()` (=fold bzw reduce), `flatMap()`, `concat()`, `merge()` und weiteren Operatoren, können Datenströme auf deklarative Art und Weise umgewandelt oder kombiniert werden.

Datenströme bzw Observables sind hierbei meistens Benutzerinteraktionen oder andere Ergeignisse wie Network requests. 

[CycleJS](http://cycle.js.org/) ist eine Bibliothek, die auf dem RxJS Observable aufbaut und ein Entwurfsmuster beschreibt mit Hilfe dessen sich komplexe interaktive Anwendungen aus so genannten Dataflow-Components zusammen setzen lassen, indem Observables auf bestimmte Art und weise kombiniert werden.
Die Kernidee dabei ist es, mehrere Observables zu einem zyklischen Datenstrom zusammen zusetzen und somit die Interaktion zwischen dem Benutzer und der Anwendung zu modellieren. 

Der "Observable" Datentyp und das CycleJS Entwurfsmuster bilden die Grundlage der Komponenten dieses Projekts.

### Virtual DOM

In diesem Projekt wird [Virtual-DOM](https://github.com/Matt-Esch/virtual-dom) verwendet.

Virtual-DOM ist eine Bibliothek, die einen Adapter mit einem funktionalen API zu dem eigentlich Prozeduralen DOM des Browsers anbietet.

Das Document Object Model (DOM) ist die Schnittstelle des Browsers mit der sich die Inhalte einer Webpage programmatisch verändern lassen.

Dabei ist die gesamte Webpage als ein riesiger Baum repräsentiert, dessen Knoten die einzelnen Inhalte (Texte, Bilder, Buttons...) darstellen.
Diese Knoten können mit Hilfe von von Methoden verändert (entfernt, hinzugefügt...) werden.
Nach Änderung des Dokumentenbaumes muss der Browser den Baum durchlaufen und eine neue graphische Darstellung für den Benutzer berechnen.
Daher können Änderungen an dem Dokumentenbaum aus sicht der Leistung sehr kostspielig sein.
Besonders in komplexen Anwendungen ist es sehr schwierig eine Änderung an den Model-Daten in eine performante Änderung des Dokumentenbaumes zu überführen.

Die Virtual-DOM Bibliothen bietet hier eine Abstraktion-Schicht, die es erlaubt, zu jedem Zeitpunkt einen vollständigen, komplett neuen Dokumentenbaum zu generieren, diesen mit dem alten Dokumentenbaum zu vergleichen und dann nur die minimal nötigen Änderungen zu übernehmen und auf den vorhandenen Baum anzuwenden.

CycleJS macht gebraucht von Virtual-DOM, um Observable-Datenströme mit dem DOM zu verbinden.

Ordner und Dateien im Projekt
-----------------------------

### Projekt-Verzeichnis

* /
* /app/           Enthält alle JS-Dateien, Styles, Bilder...
* /docs/          Enthält Dokumentation zu dem Projekt
* /webpack/       Enthält Konfigurations-Dateien für Webpack
* .editorconfig   Definiert grobe Coding-Styles(Indentation, Trailingspaces...)
* .eslintignore   Liste mit Ordnern, in denen keine ESLint-Prüfung stattfinden soll
* .eslintrc       Definiert JavaScript Coding-Styles
* .gitignore      List mit Dateien, die nicht in Git eingecheckt werden sollen
* package.json    NPM Konfigurations-Datei, in der alle Abhängigkeiten definiert sind
* testem.json     (Derzeit nicht verwendet) Config-Datei für Unittests

#### Weitere Dateien

* Dockerfile
* Vagrantfile
* README.md
* LICENSE.md
* CHANGELOG.md

### der /app/ Ordner

* assets/
  Enthält Bilder und Icons

* components/
  Enthält CycleJS Komponenten

* drivers/
  Enthält CycleJS Treiber

* lib/
  Enthält Funktionen, die in mehreren Komponenten verwendet werden

* pages/
  Enthält die einzelnen (HTML-)Seiten, die vom Benutzer direkt aufgerufen werden können.

* static/
  Enthält sonstige Dateien (derzeit nicht verwendet)

* styles/
  Enthält Komponentenübergreifende Style-Definitionen

Projekt compilieren und starten
-------------------------------

Wie oben erklärt macht dieses Projekt bebrauch von NodeJS und NPM.
Entsprechend muss NodeJS auf dem Rechner installiert sein. NodeJS kann von https://nodejs.org/en/ heruntergeladen werden.

Wenn NodeJS installiert ist, können durch Ausführen des Shell-Befehls `npm install` innerhalb des Projektordners alle benötigten Abhängigkeiten (die in der package.json Datei deklariert sind) installiert werden.
Alle Abhängigkeiten werden in den Ordner `node_modules` innerhalb des Projektordners installiert. Entsprechend können auch alle installierten Abhängigkeiten durch einfaches Löschen dieses Ordners wieder entfernt werden. Es werden keine globalen Änderungen am System durchgeführt.

Zum compilieren des Projektes wird wie zuvor beschrieben Webpack verwendet. Webpack ist als Abhängigkeit in der package.json Datei angegeben und wurde entsprechnend in den node_modules Ordner installiert. 
Theoretisch kann Webpack mit dem Shellbefehl `./node_modules/.bin/webpack` ausgeführt werden. Allerdings erwartet Webpack einige Konfigurationsparameter und der Pfad `node_modules/.bin/webpack` ist nicht besonders gut zu merken.
Darum wird in diesem Projekt NPM als Proxy zum ausführen von Shellbefehlen verwendet:
In der package.json Datei sind unter dem Abschnitt `scripts` eine Reihe von Shellbefehlen definiert, die mit Hilfe von NPM ausgeführt werden können. NPM kümmert sich dabei darum, dass alle Umgebungsvariablen richtig gesetzt werden, sodass alle Dateipfade richtig aufgelöst werden können.
Beispielsweise ist in der der package.json Datei folgender `script` Eintrag definiert:
```json
{
...
"start": "webpack-dev-server --config webpack/dev.config.babel.js --progress --inline --hot --host 0.0.0.0",
}
```
Mit dieser Zeile wird ein Scriptmit dem Namen `start` definiert, welches den Befehl `webpack-dev-server` ausführen und eine Reihe an Parametern mitgeben soll. `webpack-dev-server` ist die ausführbare Datei des Webpack-Plugins, welches eine Webserver mit automatischer Code-Regenerierung bereitstellt. `webpack-dev-server` liegt entspreched ebenfalls innerhalb des `node_modules` Ordners und wird von NPM automatisch gefunden.
`webpack-dev-server` ohne NPM und ohne vollständigen Pfad in der Shell auszuführen ist nicht möglich, da die Shell ohne NPM nicht weiss wo `webpack-dev-server` zu finden ist.

Alle Shellbefehle, die in diesem Projekt benötigt werden, sind also in der package.json definiert.

Die in der package.json definierten Befehle können auf der Shell mithilfe von NPM ausgeführt werden:
```shell
$ npm run [Name des Befehls]
```
Beispielweise, um den Development-Server zu starten:
```shell
$ npm run start
```
oder um das Projekt in komprimierte Dateien zu kompilieren:
```shell
$ npm run compile
```
