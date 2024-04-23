# React Notes

## Development

Install dependencies:

```sh
npm install
```

Start web app server:

```sh
npm start
```

Start JSON server:

```sh
npx json-server db.json --port 4000
```

Set initial `db.json`, for instance :

```json
{
  "notes": [
    {
      "id": "1",
      "title": "React",
      "content": "Bibliothèque de création d'interfaces réactives."
    },
    {
      "id": "2",
      "title": "Node.js",
      "content": "Environnement d'exécution JavaScript."
    }
  ],
  "profile": {
    "name": "Arnaud"
  }
}
```
