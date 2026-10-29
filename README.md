# Mössmer Pakete – Redesign

Statisches, modernes Redesign der Startseite von https://www.moessmer-pakete.de/.

- `index.html` – Startseite (Hero, Ablauf, Vorteile, Preise inkl. Kostenrechner, Filiale, FAQ)
- `assets/styles.css` – Design-System & Layout (responsive, ohne Framework)
- `assets/app.js` – Live-Öffnungsstatus (Europe/Berlin), Preis-Tabs, Kostenrechner, Login-Dialog, Karte per Klick

Lokal ansehen: `index.html` im Browser öffnen oder `python3 -m http.server`.

Das Login-Formular sendet wie bisher an `https://www.moessmer-pakete.de/` (Felder `txtemail`, `txtupass`, `btn-login`);
Registrierung, Passwort vergessen, AGB, Datenschutz und Impressum verlinken auf die bestehenden Seiten.
