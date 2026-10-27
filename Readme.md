# PropertyIQ (Next.js + Gemini RAG)

Create a property, upload its documents, chat with answers grounded in those documents. History is saved..

## Run
    npm install
    npm run dev        # http://localhost:3000
Your key goes in `.env.local` (GEMINI_API_KEY=...).

## How it works
- `lib/gemini.js`  Gemini calls: embeddings + answer generation
- `lib/rag.js`     chunking + similarity search
- `lib/db.js`      saves everything to data/db.json
- `app/api/upload` file -> text -> chunks -> embeddings -> saved
- `app/api/chat`   question -> top 5 chunks -> Gemini answer with [S1] citations -> saved to history
- `app/page.js`, `app/property/[id]/page.js`  the UI
