# NoteGenius AI

An AI-powered mobile app that transforms study notes into smart learning materials — summaries, MCQs, flashcards, and viva questions — in seconds.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/notegenius run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` (auto-set via Replit AI Integrations)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native), expo-router, @tanstack/react-query
- API: Express 5
- AI: OpenAI GPT-5.4 via Replit AI Integrations
- Storage: AsyncStorage (device-local note persistence)
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Mobile app: `artifacts/notegenius/`
- API server: `artifacts/api-server/`
- AI route: `artifacts/api-server/src/routes/ai.ts`
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/index.ts`
- Note context + types: `artifacts/notegenius/context/NotesContext.tsx`
- Colors/theme: `artifacts/notegenius/constants/colors.ts`

## Architecture decisions

- All note data is stored locally in AsyncStorage (offline-first); no user database needed
- Single AI endpoint (`POST /api/ai/process`) generates all content types in one call (summary, MCQs, flashcards, viva)
- GPT-5.4 with JSON-mode output generates structured study materials
- Dark-first color theme (#0B0B1A background) with indigo/violet primary (#6C63FF) and teal accent (#00C9A7)
- Expo Router file-based navigation with 4 bottom tabs + stack screens for each AI output type

## Product

- **Home**: Dashboard with streak, quick upload CTA, recent notes, AI tools grid, subject categories
- **Upload**: Paste text or capture image; select subject; AI processes into all materials at once
- **Summary**: 4 view modes (bullets, exam notes, simple explanation, keywords)
- **MCQ Practice**: Filterable by difficulty; score tracking; answer explanations
- **Flashcards**: Flip animation; swipe-style known/unknown tracking
- **Viva Questions**: Expandable Q&A; level filter (beginner/intermediate/advanced)
- **Notes**: Searchable, filterable list of all saved notes
- **Profile**: Stats, study streak, data management

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`
- The AI processing call can take 10-20 seconds; the upload screen shows an animated progress UI
- Expo runs on web via preview pane — safe area insets differ from native device
- `response_format` JSON mode prompt: system prompt must explicitly request raw JSON with no markdown

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile architecture patterns
