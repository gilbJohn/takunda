# Backend Transition Guide

This app is designed to switch from mock data to a real backend with minimal code changes.

## Quick Start

1. Create your backend API (Node, Python, etc.).
2. Set the environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.com
   ```
3. Implement the API endpoints listed below.
4. (Optional) Update the study store to fetch decks from the API on load.

---

## API Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | When set, all API calls use your backend. When unset, mock data is used. |

---

## Expected API Endpoints

### Auth

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/login` | `{ email, password }` | `{ user: User, token: string }` |
| POST | `/auth/signup` | `{ email, password, name }` | `{ user: User, token: string }` |

The frontend sends `Authorization: Bearer <token>` on subsequent requests when a token is returned. Store the token in `localStorage` under key `takunda-auth-token`.

### Users

| Method | Endpoint | Query Params | Response |
|--------|----------|--------------|----------|
| GET | `/users` | - | `User[]` |
| GET | `/users/:id` | - | `User` |
| GET | `/users/search` | `q`, `classIds`, `exclude` | `User[]` |

### Classes

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/classes` | `Class[]` |

### Decks

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/decks` | - | `Deck[]` |
| GET | `/decks/:id` | - | `Deck` |
| POST | `/decks` | `{ title, cards }` | `Deck` |

---

## Type Definitions

See `src/types/` for the exact interfaces:

- `User` – id, name, email, avatar?, school?, major?, classIds[]
- `Class` – id, name, code?
- `Deck` – id, title, cards[] (each card: id, front, back)

---

## Implementation Notes

1. **Auth token**: The API client (`src/lib/api/client.ts`) reads `takunda-auth-token` from localStorage and sends it as the `Authorization` header.

2. **Study store**: In mock mode, decks are persisted in localStorage via Zustand. When using a real API, `loadDecks()` is automatically called on app load to fetch decks from `GET /decks`. The Zustand persist is ignored when the API is enabled.

3. **CORS**: Ensure your backend allows requests from your frontend origin.
