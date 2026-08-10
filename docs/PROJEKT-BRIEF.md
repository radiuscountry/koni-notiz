# Projekt-Brief: Koni-Notiz

## Ziel

Auf dem Android-Handy eine Notiz eintippen/diktieren (via Tastatur-Diktat),
"Senden" drücken → die Notiz landet als Markdown-Datei im Ordner `Inbox/` des
privaten Repos `radiuscountry/KoniVault` (Commit via GitHub REST API).

**Erfolgskriterium:** Idee festgehalten in unter 10 Sekunden ab Handy-in-der-Hand,
ohne nachzudenken. Daran richten sich alle UI-Entscheidungen aus.

## Entscheidungen

- **PWA statt nativer App** – kein App-Store-Prozess, sofortige Updates, ein Codebase.
- **Hosting: GitHub Pages** – kostenlos, kein eigener Server nötig.
- **Tastatur-Diktat statt eigener Spracherkennung in Etappe 1** – Gboard liefert das
  bereits zuverlässig, eigene Lösung wäre Aufwand ohne Mehrwert in V1.
- **Token in localStorage** – einfachste Lösung ohne Backend; Risiko und Gegenmassnahme
  siehe Annahmen.
- **Ablage via GitHub Contents API ins Vault-Repo** – Notizen landen direkt dort, wo sie
  langfristig verwaltet werden (Obsidian-Vault), kein Zwischenschritt nötig.

## Etappenplan

- **Etappe 1 (aktuell):** Steel Thread – Text eintippen/diktieren, senden, als
  Markdown-Datei im Vault-Repo ablegen.
- **Etappe 2:** Audio-Aufnahme in der App, Audiodatei wird mit abgelegt.
- **Etappe 3:** Whisper-Transkription über Serverless-Funktion (Vercel oder Cloudflare).
- **Etappe 4:** Komfort – Offline-Puffer, Verlauf.

## Annahmen

- Gboard-Diktat reicht für V1.
- Öffentliches App-Repo ist ok (kein Secret im Code).
- Token in localStorage = akzeptables Risiko. Massnahme bei Handyverlust: Token auf
  github.com widerrufen.
- Token-Ablauf: 90 Tage.

## Bewusst NICHT im Scope

- iOS
- Multi-User
- Notizen lesen/bearbeiten in der App (dafür ist Obsidian da)
- Eigene Spracherkennung in Etappe 1
- Etappe 1 ist bewusster Prototyp ohne Tests/CI

## Offene Punkte

- Offline-Puffer (Etappe 4, wichtig – Funkloch!)
- Whisper-Anbieter & Konto klären (Etappe 3)
- Vercel-Umzug prüfen (Etappe 3)
- Erinnerung Token-Erneuerung nach 90 Tagen
