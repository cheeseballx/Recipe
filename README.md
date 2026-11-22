# Recipe – Rezepte-API

REST-API für Rezepte mit Texten und Bildern.
**Node.js + Express + SQLite** – keine externe Datenbank nötig, die Daten liegen in einer Datei.

## Starten

Voraussetzung: Node.js ≥ 22.13 (nutzt das eingebaute `node:sqlite`).

```bash
cd server
npm install
npm start        # oder: npm run dev (Neustart bei Codeänderungen)
npm test         # API-Tests
```

Die API läuft dann auf `http://localhost:3002/api`.
Datenbank und Bilder landen in `server/data/` (`recipes.db`, `uploads/`).

| Umgebungsvariable | Standard | Bedeutung |
|---|---|---|
| `PORT` | `3002` | Port |
| `DB_FILE` | `server/data/recipes.db` | SQLite-Datei |
| `UPLOAD_DIR` | `server/data/uploads` | Ordner für Bilder |
| `MAX_IMAGE_MB` | `10` | Max. Größe pro Bild |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Erlaubte Frontend-Origins (`*` = alle) |

## API-Beschreibung (OpenAPI 3.1)

Die vollständige Beschreibung aller Endpunkte, Felder und Fehler steht in
[`server/openapi.yaml`](server/openapi.yaml). Der laufende Server liefert sie aus unter:

- `http://localhost:3002/api/openapi.yaml`
- `http://localhost:3002/api/openapi.json`

Die Datei lässt sich z. B. in Postman, Insomnia oder https://editor.swagger.io importieren
oder zum Generieren eines Clients verwenden. Die Tests (`test/openapi.test.js`) prüfen jede
Antwort der API gegen die Schemas in der YAML. Wenn sich die API ändert, muss die YAML
mitgeändert werden, sonst schlagen die Tests fehl.

## Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/recipes` | Liste. Query: `q` (Suche), `tag`, `sort` (`newest`, `oldest`, `updated`, `title`), `limit`, `offset` |
| `POST` | `/api/recipes` | Rezept anlegen |
| `GET` | `/api/recipes/:id` | Rezept mit Zutaten, Schritten, Bildern |
| `PUT` | `/api/recipes/:id` | Komplett ersetzen (fehlende Felder werden geleert) |
| `PATCH` | `/api/recipes/:id` | Nur übergebene Felder ändern |
| `DELETE` | `/api/recipes/:id` | Rezept inkl. Bilddateien löschen |
| `GET` | `/api/recipes/:id/images` | Bilder eines Rezepts |
| `POST` | `/api/recipes/:id/images` | Bild(er) hochladen (multipart, Feld `image`, optional `caption`) |
| `GET` | `/api/recipes/:id/images/:imageId` | Bild-Metadaten |
| `PATCH` | `/api/recipes/:id/images/:imageId` | `caption` / `position` (Reihenfolge) ändern |
| `DELETE` | `/api/recipes/:id/images/:imageId` | Bild löschen |
| `GET` | `/uploads/:datei` | Die eigentliche Bilddatei (= `url` eines Bildes) |
| `GET` | `/api/tags` | Alle Tags mit Anzahl |
| `GET` | `/api/openapi.yaml` | OpenAPI-3.1-Beschreibung als YAML |
| `GET` | `/api/openapi.json` | Dieselbe Beschreibung als JSON |

### Rezept-Objekt

```json
{
  "title": "Pfannkuchen",
  "subtitle": "Wie bei Oma",
  "description": "Dünn und goldbraun.",
  "servings": 2,
  "prepMinutes": 15,
  "waitMinutes": 10,
  "tags": ["Frühstück", "Süß"],
  "ingredients": [
    { "name": "Mehl", "amount": 200, "unit": "g" },
    { "name": "Milch", "amount": 300, "unit": "ml", "note": "zimmerwarm" },
    "Prise Salz"
  ],
  "steps": [
    { "title": "Teig", "text": "Alles glatt verrühren und 10 Minuten quellen lassen." },
    "In der Pfanne von beiden Seiten ausbacken."
  ],
  "coverImageId": null
}
```

- Nur `title` ist Pflicht. Zutaten und Schritte dürfen als einfacher Text angegeben werden.
- `tags`, `ingredients` und `steps` werden bei `PUT`/`PATCH` immer als ganze Liste ersetzt.
- Antworten enthalten zusätzlich `id`, `totalMinutes`, `images`, `coverImage`, `createdAt`, `updatedAt`.
- `coverImage` ist das Bild aus `coverImageId` oder sonst das erste Bild.

### Beispiele

```bash
# Anlegen
curl -X POST localhost:3002/api/recipes -H 'content-type: application/json' \
  -d '{"title":"Pfannkuchen","ingredients":["200 g Mehl"],"steps":["Verrühren","Ausbacken"]}'

# Bilder hochladen (auch mehrere auf einmal)
curl -F image=@foto1.jpg -F image=@foto2.jpg -F caption="Fertig" localhost:3002/api/recipes/1/images

# Titelbild setzen
curl -X PATCH localhost:3002/api/recipes/1 -H 'content-type: application/json' -d '{"coverImageId":2}'

# Bild an erste Stelle schieben
curl -X PATCH localhost:3002/api/recipes/1/images/2 -H 'content-type: application/json' -d '{"position":1}'

# Suchen
curl 'localhost:3002/api/recipes?q=mehl&tag=frühstück'
```

### Fehler

Alle Fehler haben dieselbe Form und passende Statuscodes (400, 404, 413, 415, 500):

```json
{ "error": { "code": "validation_error", "message": "Ungültige Eingabe",
             "details": [{ "field": "title", "message": "ist ein Pflichtfeld" }] } }
```

Bilder werden anhand ihres Inhalts geprüft (JPEG, PNG, WebP, GIF, AVIF) – der vom Client
gesendete Dateityp wird nicht geglaubt. Dateien bekommen zufällige Namen.

## Aufbau

```
server/
  src/
    index.js        Start (Port, DB öffnen)
    app.js          Express-App, CORS, Fehlerbehandlung
    config.js       Umgebungsvariablen
    db.js           SQLite-Schema
    repository.js   Datenzugriff (Rezepte, Zutaten, Schritte, Tags, Bilder)
    validation.js   Eingabeprüfung
    images.js       Speichern/Prüfen der Bilddateien
    openapi.js      Lädt openapi.yaml
    routes/         recipes.js, images.js
  test/
    api.test.js       Verhalten der API
    openapi.test.js   API-Antworten gegen openapi.yaml prüfen
  openapi.yaml      API-Beschreibung (OpenAPI 3.1)
```
