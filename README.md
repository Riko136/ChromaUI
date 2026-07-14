# ChromaUI

A web-based admin UI for managing [ChromaDB](https://github.com/chroma-core/chroma) vector database instances. ChromaUI lets you connect to a local Chroma server or to Chroma Cloud, browse and manage your collections, inspect and edit records, and run text, regex, and semantic searches against your data — all from a modern browser interface.

<img width="1913" height="1012" alt="Screenshot 2026-07-14 101644" src="https://github.com/user-attachments/assets/0d05525a-c862-4ca6-bb22-e5a66783936c" />

<img width="1919" height="1013" alt="Screenshot 2026-07-14 102020" src="https://github.com/user-attachments/assets/790eeed6-eb6b-4d6b-b48e-ddaafefbf2db" />



## Getting Started

### Prerequisites
- Node.js **>= 20**
- A running ChromaDB instance (local server or a Chroma Cloud account)

### Install

```bash
git clone https://github.com/Riko136/ChromaUI
cd ChromaUI
npm install
```

### Run in development

Starts the backend on `:3000` and the Vite dev server (with `/api` proxy) on its default port, in parallel:

```bash
npm run dev
```

Open the printed Vite URL in your browser, then fill out the connection form:
- **Self-hosted**: provide the Chroma URL (e.g. `http://localhost:8000`), tenant, and database.
- **Chroma Cloud**: tick *ChromaCloud?* and provide your API key, tenant, and database.

### Build for production

```bash
npm run build
```

This compiles the backend (`apps/backend/dist/`) and bundles the frontend (`apps/frontend/dist/`).

Then start the server:

```bash
npm start
```

The Express server serves both the API and the frontend on `:3000`. Open `http://localhost:3000` in your browser.

