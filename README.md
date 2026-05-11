# ChromaUI

A web-based admin UI for managing [ChromaDB](https://github.com/chroma-core/chroma) vector database instances. ChromaUI lets you connect to a local Chroma server or to Chroma Cloud, browse and manage your collections, inspect and edit records, and run text, regex, and semantic searches against your data — all from a modern browser interface.

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

