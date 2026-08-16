# DESIGN.md – Designsystem Koni-Notiz

Verbindliche Design-Referenz fuer den einen Screen dieser App.
Leitidee: **Ruhe, Klarheit, Tempo.** Die App wird oft in Eile gezueckt ("Idee
festhalten in unter 10 Sekunden") – das Design darf nicht ablenken. Eine
Buehne, eine Karte, ein Akzent, keine Spielerei.

---

## 1. Grundprinzipien

1. **Eine Buehne, eine Karte.** Kuehler Hellgrau-Hintergrund, das Textfeld
   liegt als reinweisse Karte darauf. Kein Verschachteln von Karten.
2. **Ein Akzent, sparsam eingesetzt.** Die Brand-Farbe erscheint nur beim
   Senden-Button, beim Fokus-Rahmen und bei aktiven Auswahl-Elementen. Nie
   flaechig.
3. **Nichts lenkt vom Eintippen ab.** Das Textfeld ist das groesste Element
   auf dem Screen und bekommt sofort den Fokus.
4. **Viel Weissraum, aber kein Scrollen.** Der ganze Screen muss auf
   390x844 ohne Scrollen bedienbar bleiben (siehe Abschnitt 5).

---

## 2. Design-Tokens (CSS Custom Properties)

Alle Farben/Groessen nur ueber diese Variablen verwenden.

```css
:root {
  /* Buehne & Flaechen */
  --bg:            #F1F2F4;   /* App-Hintergrund, kuehles Hellgrau */
  --surface:       #FFFFFF;   /* Textfeld-Karte, Dialog */
  --surface-2:     #E9EAEE;   /* Select-Feld, Foto-Button */
  --line:          #E3E5E9;   /* Hairline-Trenner, Rahmen */

  /* Text */
  --ink:           #1B1E23;   /* Ueberschrift, Eingabetext */
  --ink-soft:      #5B6472;   /* Labels, Platzhalter */
  --ink-faint:     #9AA1AC;   /* inaktive Icons */

  /* Brand */
  --brand:         #0E4749;   /* Dunkles Petrol, siehe farben-vorschau.html */
  --brand-ink:     #FFFFFF;   /* Text auf Brand */

  /* Semantik */
  --ok:            #2F7D4F;
  --ok-soft:       #E8F2EC;
  --err:           #B3372B;
  --err-soft:      #F8ECEA;

  /* Form */
  --radius-card:   18px;
  --radius-ctl:    12px;      /* Buttons, Inputs */
  --shadow-card:   0 1px 2px rgba(20,24,32,.05), 0 4px 16px rgba(20,24,32,.06);

  /* Abstaende (4er-Raster) */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px;  --sp-4: 16px;
  --sp-5: 20px; --sp-6: 24px;

  /* Seiten-Padding */
  --pad-page:      16px;      /* einziges Mass fuer den seitlichen Abstand
                                  zum Screenrand. Kopf, Textfeld-Karte und
                                  Fussbereich haengen alle direkt am Body
                                  und erben dieses Padding, damit ihre
                                  rechten Kanten (Zahnrad, Kamera-Button,
                                  Select, Senden-Button) fluchten. */

  /* Textur */
  --dot-grid:      #E8EAEC;   /* Punktraster auf der Textfeld-Karte */
}
```

---

## 3. Typografie

- **Nur System-Font-Stack**, kein Nachladen von Webfonts: `-apple-system,
  "Segoe UI", Roboto, sans-serif`. Grund: PWA soll auch im Funkloch sofort
  nutzbar sein, kein Font-Request bremst den ersten Tastendruck.
- App-Titel: 17px / 600.
- Eingabetext (Textarea): 19px / 1.4 – gross genug fuers Diktieren/Tippen
  unterwegs, das wichtigste Element auf dem Screen.
- Label/Select/Button: 15-16px / 500-600.
- Status-Zeile (Meldungen): 14px / 500.

---

## 4. Komponenten

**Kopf** – schlank, kein Kartenrahmen, verschmilzt mit der Buehne. Links das
Marken-Icon (siehe unten) plus Titel, rechts das Zahnrad-Icon in
`--ink-faint`. Alle vier Eckpunkte des Screens (Zahnrad rechts oben,
Kamera-Button rechts, Select/Senden rechts unten) fluchten auf derselben
Kante, definiert durch `--pad-page`.

**Marken-Icon** – Stiftspitze mit Funke, zwei flache Formen (`fill`, keine
Outline), Farbe `--brand`. Einzige Ausnahme von der Outline-Icon-Regel: das
Marken-Icon ist ein Logo/Icon-Zeichen, kein Funktions-Icon.

**Textfeld-Karte** – `--surface`, `--radius-card`, `--shadow-card`,
Innenabstand `--sp-4`. Nimmt den gesamten verfuegbaren Platz ein (flex: 1).
Hintergrund traegt ein sehr dezentes Punktraster (`radial-gradient`,
`--dot-grid`, Abstand 24px) fuer eine leichte Notizbuch-Anmutung – bewusst
so hell, dass es den Eingabetext nie stoert. Fokus: 2px Rahmen in `--brand`.
Randlos innen, kein zusaetzlicher Inner-Rahmen.

**Foto-Button** – Quadrat 48px, `--surface-2`, `--radius-ctl`, Icon in
`--ink`. Gleiche Flaeche wie das Textfeld, steht daneben.

**Kategorie-Auswahl (Select)** – `--surface-2`, `--radius-ctl`, Text
`--ink`, volle Breite. Kein natives Systemgrau – bewusst an die Tokens
angeglichen.

**Primaer-Button (Senden)** – Flaeche `--brand`, Text `--brand-ink`,
`--radius-ctl`, Hoehe 52px, Gewicht 600. Der einzige Primaer-Button im
Screen. Deaktiviert: Opazitaet 0.5.

**Status-Zeile** – kein Badge, schlichter Text unter dem Senden-Button:
Erfolg in `--ok`, Fehler in `--err`. Erscheint/verschwindet ohne Layout-
Sprung (feste Mindesthoehe reserviert).

**Einstellungen-Dialog** – `--surface`, `--radius-card`, gleiche Input- und
Button-Optik wie im Hauptscreen (Konsistenz statt eigener Dialog-Sprache).

**Icons** – Outline-Stil, keine Emoji als UI-Icons (aktuell Emoji im Code;
im Zuge dieser Ueberarbeitung durch einfache Inline-SVGs ersetzen).

**App-Icon** – abgerundetes Quadrat in `--brand`, zentriert ein weisses
Notizblatt mit umgeschlagener Ecke (Fold-Flap in `#CBD8D6`) und dem Funke-
Motiv des Marken-Icons darauf. Flat Design, keine Verlaeufe/Schatten.
Quelle: `icon-design.svg`. Daraus erzeugt: `icon-192.png`, `icon-512.png`
(normale Icons, Ecken werden vom OS gerundet/maskiert) und
`icon-maskable-512.png` (Hintergrund randlos bis zum Rand, Motiv auf ca.
60% der Flaeche verkleinert fuer Androids Safe-Zone). `favicon.svg`
verwendet nur das Funke-Motiv auf `--brand`, da das Notizblatt bei 16-32px
nicht mehr lesbar waere.

---

## 5. Layout-Regel: kein Scrollen auf 390x844

Der Body ist ein Flex-Container ueber die volle Hoehe:

```css
html, body { height: 100%; }
body {
  min-height: 100svh; /* modern */
  min-height: 100dvh;
  min-height: 100vh;  /* Fallback fuer sehr alte Browser */
  display: flex; flex-direction: column;
}
```

- Kopf: fixe Hoehe, `flex: none`.
- Textfeld-Karte: `flex: 1 1 auto`, `min-height: 0` (sonst sprengt eine lange
  Notiz die Karte statt intern zu scrollen).
- Fussbereich (Kategorie-Select + Senden-Button + Status-Zeile): `flex: none`,
  immer am unteren Rand sichtbar, ausserhalb jedes Scrollbereichs.
- Falls Text im Textfeld ueberlaeuft: die Textarea selbst scrollt intern
  (`overflow-y: auto`), der aeussere Screen nie.
- Status-Zeile hat eine reservierte Mindesthoehe, damit das Einblenden einer
  Meldung den Fussbereich nicht nach unten aus dem Viewport schiebt.

---

## 6. Motion

Sparsam: 150ms ease-out fuer Fokus-Rahmen und Button-Press (kein Anheben,
keine Schatten-Animation). `@media (prefers-reduced-motion: reduce)` → aus.

---

## 7. Do / Don't

- **Do:** eine Karte, ein Akzent, sofortiger Fokus im Textfeld, Status ohne
  Layout-Sprung.
- **Don't:** Verlaeufe als Deko, zweiter Akzent, Emoji-Icons, Scrollen auf
  Mobile, Webfont-Nachladen.
