# Mössmer Pakete – Redesign

Statisches, modernes Redesign der Startseite von https://www.moessmer-pakete.de/.

- `index.html` – Startseite (Hero, Ablauf, Vorteile, Preise inkl. Kostenrechner, Filiale, FAQ)
- `assets/styles.css` – Design-System & Layout (responsive, ohne Framework)
- `agb.html`, `datenschutz.html`, `impressum.html` – Rechtstexte der bestehenden Seite im neuen Design
- `login.html`, `registrieren.html`, `passwort.html` – Kundenbereich (Formulare senden an das bestehende System)
- `assets/app.js` – Live-Öffnungsstatus (Europe/Berlin), Preis-Tabs, Kostenrechner, Login-Dialog, Karte per Klick

Lokal ansehen: `index.html` im Browser öffnen oder `python3 -m http.server`.

Das Login-Formular sendet wie bisher an `https://www.moessmer-pakete.de/` (Felder `txtemail`, `txtupass`, `btn-login`);
Registrierung (`/signup`, inkl. Captcha) und Passwort vergessen (`/fpass`) senden ebenfalls an das bestehende System.

GitHub Pages: Settings → Pages → „Deploy from a branch“ → `main` / `(root)`.
