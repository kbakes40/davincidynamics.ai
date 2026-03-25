/**
 * Next.js App Router placeholder — this repository does not run Next.
 *
 * **Actual handler:** `POST /api/leo-chat` is registered in Express:
 * - `server/chat/openclawLeoRoute.ts` → `registerOpenclawLeoRoute`
 * - Wired in `server/_core/createApp.ts`
 *
 * **OpenClaw integration:** `server/chat/openclawGateway.ts` (WebSocket first; HTTP: POST `/v1/responses` with fallback POST `/v1/chat/completions`; GET `/v1/models` is not used as a health gate).
 *
 * If you add Next.js later, port the Express handler and env usage from those files into a real `POST` here.
 */
export {};
