# Profilia Starter

Prototype Next.js pour un outil d'analyse de personnalité à partir d'exports de conversations.

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvre http://localhost:3000

## Ce que contient la V1

- landing page
- page upload
- API `/api/analyze`
- page de résultats avec portrait, dimensions et camembert
- moteur local de secours si `OPENAI_API_KEY` n'est pas renseignée

## Comment tester vite

1. Va sur `/upload`
2. colle un long texte ou importe un `.txt` / `.json`
3. clique sur **Analyser mes conversations**
4. tu seras redirigé vers `/results`

## Si tu veux brancher OpenAI plus tard

1. crée un fichier `.env.local`
2. ajoute :

```bash
OPENAI_API_KEY=ton_api_key
```

Le projet fonctionne déjà sans cette clé grâce à une analyse heuristique locale.

## Arborescence

- `app/` : pages et route API
- `components/` : cartes, camembert, barre d'analyse
- `lib/analysis.ts` : schéma de sortie + analyse heuristique
- `lib/storage.ts` : stockage session côté navigateur



## Import de l’export ChatGPT
- Tu peux maintenant déposer directement le zip d’export OpenAI.
- Le parseur lit automatiquement les fichiers conversations-000.json à conversations-999.json.
- Si aucun zip n’est fourni, tu peux aussi charger un .json unique, du .txt, du .md ou du .html.
