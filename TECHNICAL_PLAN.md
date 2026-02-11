# Takunda — Technical Plan & Implementation Roadmap

**Social Study Platform: Quizlet + Kahoot + Social Network**

**Document Version:** 1.0  
**Last Updated:** February 10, 2025  
**Role:** Senior Frontend Architect

---

## Executive Summary

This document outlines the front-end architecture, component hierarchy, routing strategy, state management approach, and phased implementation plan for **Takunda** — a social study platform combining flashcards (Quizlet), live trivia (Kahoot), and social discovery features.

---

## Technical Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14 (App Router) | Server Components, streaming, API routes, file-based routing |
| **Language** | TypeScript | Type safety, better DX, easier refactoring |
| **Styling** | Tailwind CSS | Utility-first, rapid prototyping, consistent design system |
| **UI Components** | Shadcn/ui | Accessible, customizable, copy-paste (no lock-in) |
| **Forms** | React Hook Form + Zod | Performant validation, type-safe schemas |
| **Auth** | NextAuth.js (or Clerk/Supabase Auth) | Industry standard, session management, OAuth providers |
| **State** | Zustand + React Query | Lightweight global state + server state caching |
| **Animations** | Framer Motion | Flashcard flips, transitions, swipe gestures |

---

## 1. Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Auth-specific layout (centered, minimal)
│   │
│   ├── (marketing)/              # Public marketing route group
│   │   ├── page.tsx              # Landing page
│   │   └── layout.tsx            # Marketing layout (header, footer, CTA)
│   │
│   ├── (app)/                    # Protected app route group
│   │   ├── layout.tsx            # Main app shell (sidebar, nav)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx          # Current user profile
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Other user profiles
│   │   ├── find/
│   │   │   └── page.tsx          # Social discovery
│   │   ├── classes/
│   │   │   ├── page.tsx          # My classes list
│   │   │   └── [classId]/
│   │   │       └── page.tsx      # Class detail
│   │   ├── study/
│   │   │   ├── page.tsx          # Study decks list
│   │   │   ├── [deckId]/
│   │   │   │   ├── page.tsx      # Deck overview
│   │   │   │   └── learn/
│   │   │   │       └── page.tsx  # Flashcard study mode
│   │   │   └── create/
│   │   │       └── page.tsx      # Create flashcard deck
│   │   └── trivia/
│   │       ├── page.tsx          # Trivia lobby / join
│   │       ├── host/
│   │       │   └── [gameId]/
│   │       │       └── page.tsx  # Host trivia game
│   │       ├── play/
│   │       │   └── [gameId]/
│   │       │       └── page.tsx  # Player trivia interface
│   │       └── results/
│   │           └── [gameId]/
│   │               └── page.tsx  # Leaderboard / results
│   │
│   ├── onboarding/
│   │   └── page.tsx              # Profile setup wizard
│   │
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── ui/                       # Shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   ├── app-shell.tsx
│   │   └── marketing-nav.tsx
│   │
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── auth-provider.tsx
│   │   └── protected-route.tsx
│   │
│   ├── profile/
│   │   ├── profile-card.tsx
│   │   ├── profile-header.tsx
│   │   ├── profile-edit-modal.tsx
│   │   ├── class-badge.tsx
│   │   └── my-classes-section.tsx
│   │
│   ├── social/
│   │   ├── user-search.tsx
│   │   ├── user-result-card.tsx
│   │   ├── class-filter.tsx
│   │   └── connection-request-button.tsx
│   │
│   ├── study/
│   │   ├── flashcard.tsx
│   │   ├── flashcard-stack.tsx
│   │   ├── flashcard-swipe-navigation.tsx
│   │   ├── deck-card.tsx
│   │   ├── deck-creation-form.tsx
│   │   ├── card-editor.tsx
│   │   └── study-progress-bar.tsx
│   │
│   ├── trivia/
│   │   ├── trivia-question.tsx
│   │   ├── trivia-options.tsx
│   │   ├── trivia-timer.tsx
│   │   ├── trivia-scoreboard.tsx
│   │   ├── trivia-lobby.tsx
│   │   ├── trivia-host-controls.tsx
│   │   └── trivia-join-modal.tsx
│   │
│   └── shared/
│       ├── avatar.tsx
│       ├── empty-state.tsx
│       ├── loading-skeleton.tsx
│       ├── error-boundary.tsx
│       └── page-header.tsx
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-flashcard-session.ts
│   ├── use-trivia-game.ts
│   ├── use-user-search.ts
│   └── use-media-query.ts
│
├── lib/
│   ├── api/                      # API client functions
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── classes.ts
│   │   ├── decks.ts
│   │   └── trivia.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── format.ts
│   └── validators/
│       ├── auth.ts
│       ├── profile.ts
│       └── deck.ts
│
├── stores/
│   ├── auth-store.ts
│   ├── study-session-store.ts
│   ├── trivia-game-store.ts
│   └── ui-store.ts
│
├── types/
│   ├── user.ts
│   ├── class.ts
│   ├── deck.ts
│   ├── trivia.ts
│   └── api.ts
│
└── config/
    ├── site.ts
    └── auth.ts
```

---

## 2. Route Map

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page (hero, CTA) |
| `/login` | Public | Email/phone login |
| `/signup` | Public | Registration |
| `/onboarding` | Protected | Profile setup wizard |
| `/dashboard` | Protected | Main hub after login |
| `/profile` | Protected | Current user profile |
| `/profile/[id]` | Protected | View other user's profile |
| `/find` | Protected | Social discovery — search by class |
| `/classes` | Protected | My enrolled classes |
| `/classes/[classId]` | Protected | Class detail, members, shared decks |
| `/study` | Protected | List of flashcard decks |
| `/study/create` | Protected | Create new deck |
| `/study/[deckId]` | Protected | Deck overview, edit, start study |
| `/study/[deckId]/learn` | Protected | Flashcard study mode |
| `/trivia` | Protected | Join or host trivia lobby |
| `/trivia/host/[gameId]` | Protected | Host controls, question flow |
| `/trivia/play/[gameId]` | Protected | Player trivia interface |
| `/trivia/results/[gameId]` | Protected | Post-game leaderboard |

**Route Groups:**
- `(marketing)` — public, SEO-focused layout
- `(auth)` — centered auth forms, redirect if logged in
- `(app)` — full app shell, redirect to login if not authenticated

---

## 3. Component Hierarchy

### 3.1 Layout Components

```
RootLayout
├── AuthProvider
└── Children (route-specific layout)

MarketingLayout
├── MarketingNav (logo, Login, Sign Up)
├── Children
└── Footer ( links, CTA )

AppLayout (sidebar + main)
├── Sidebar
│   ├── NavLink (Dashboard, Find, Study, Trivia)
│   └── ProfileSummary
└── MainContent
    └── PageHeader (optional)
    └── Children
```

### 3.2 Landing Page

```
LandingPage
├── HeroSection
│   ├── Headline
│   ├── Subheadline
│   ├── CTAButton (Sign Up Free)
│   └── HeroVisual (illustration or product mockup)
├── FeaturesSection
│   └── FeatureCard[] (Flashcards, Trivia, Social)
├── SocialProofSection (optional)
└── FinalCTA
```

### 3.3 Profile Components

```
ProfilePage
├── ProfileHeader
│   ├── Avatar
│   ├── Name
│   ├── Contact (email/phone if self)
│   └── EditProfileButton (if self)
├── MyClassesSection
│   ├── SectionTitle
│   └── ClassBadge[] (each class)
└── StatsSection (optional: decks created, games played)

ProfileCard (reusable for search results)
├── Avatar
├── Name
├── School/Major
└── ClassBadge[] (preview)
```

### 3.4 Social Discovery (Find)

```
FindPage
├── UserSearch
│   ├── SearchInput
│   └── ClassFilter (multi-select)
├── SearchResults
│   └── UserResultCard[]
│       ├── ProfileCard
│       └── ViewProfileButton
└── EmptyState (when no results)
```

### 3.5 Study / Flashcards

```
StudyPage (deck list)
├── DeckCard[] (grid)
│   ├── DeckTitle
│   ├── CardCount
│   └── StudyButton
└── CreateDeckButton

FlashcardStudyMode
├── StudyProgressBar
├── FlashcardStack
│   └── Flashcard (flip animation)
│       ├── Front (question)
│       └── Back (answer)
└── FlashcardSwipeNavigation
    ├── PrevButton
    ├── NextButton
    └── Know/Don't Know (optional)
```

### 3.6 Trivia Mode

```
TriviaLobby
├── CreateGameButton
├── JoinGameInput (code)
└── ActiveGamesList (optional)

TriviaHostView
├── TriviaHostControls (next question, end game)
├── TriviaQuestion (display current question)
├── TriviaTimer (countdown)
└── TriviaScoreboard (live)

TriviaPlayerView
├── TriviaQuestion
├── TriviaOptions (A, B, C, D — clickable)
├── TriviaTimer
└── Feedback (correct/incorrect after submit)

TriviaResultsPage
├── TriviaScoreboard (final rankings)
├── ShareButton
└── PlayAgainButton
```

---

## 4. State Management Strategy

### 4.1 Overview

| Data Type | Solution | Rationale |
|-----------|----------|-----------|
| **Auth / User** | NextAuth session + Zustand (optional cache) | Server session is source of truth; Zustand for Client Component access |
| **Server Data** | React Query (TanStack Query) | Caching, refetch, optimistic updates |
| **Study Session** | Zustand (`study-session-store`) | Local, ephemeral, doesn't need persistence |
| **Trivia Game** | Zustand + WebSocket/SSE | Real-time sync; Zustand for local UI state |
| **UI State** | Zustand (`ui-store`) | Modals, sidebar open/close, theme |

### 4.2 Auth Flow

```
User logs in → NextAuth session created → Session available in getServerSession()
→ AuthProvider wraps app → useSession() in Client Components
→ Protected routes check session, redirect if null
```

### 4.3 Study Session State (Zustand)

```typescript
// study-session-store.ts
interface StudySessionState {
  deckId: string;
  cards: Card[];
  currentIndex: number;
  knownCards: Set<string>;
  unknownCards: Set<string>;
  isFlipped: boolean;
  actions: {
    flip: () => void;
    next: () => void;
    prev: () => void;
    markKnown: (cardId: string) => void;
    markUnknown: (cardId: string) => void;
    reset: () => void;
  };
}
```

### 4.4 Trivia Game State (Zustand + Real-time)

```
Host: Starts game → Broadcasts question via WebSocket/SSE
Players: Subscribe to game channel → Receive question, submit answer
Zustand: currentQuestion, timeRemaining, myScore, leaderboard
```

### 4.5 Data Fetching (React Query)

- **Users:** `useQuery(['user', id])` for profile data
- **Classes:** `useQuery(['user-classes'])` for enrolled classes
- **Decks:** `useQuery(['decks']), useMutation()` for create/update
- **Trivia:** `useQuery(['trivia-game', gameId])` + real-time subscription

---

## 5. Step-by-Step Implementation Phase List

### Phase 1: Foundation & Setup (Week 1)

- [ ] **1.1** Verify Next.js 14, TypeScript, Tailwind are configured
- [ ] **1.2** Install and configure Shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] **1.3** Add core UI primitives: Button, Input, Card, Dialog, Tabs
- [ ] **1.4** Create `lib/utils/cn.ts` and base Tailwind design tokens
- [ ] **1.5** Set up folder structure: `components/`, `hooks/`, `lib/`, `stores/`, `types/`
- [ ] **1.6** Create `config/site.ts` (app name, metadata)
- [ ] **1.7** Add shared components: `Avatar`, `EmptyState`, `LoadingSkeleton`, `PageHeader`

### Phase 2: Landing Page & Marketing (Week 1–2)

- [ ] **2.1** Create `(marketing)` route group with layout
- [ ] **2.2** Build `MarketingNav` (logo, Login, Sign Up links)
- [ ] **2.3** Build `HeroSection` with headline, subheadline, CTA
- [ ] **2.4** Add `FeaturesSection` with 3 feature cards (Flashcards, Trivia, Social)
- [ ] **2.5** Add `Footer` with links and secondary CTA
- [ ] **2.6** Implement responsive design and polish
- [ ] **2.7** Connect CTA buttons to `/signup`

### Phase 3: Authentication & Onboarding (Week 2–3)

- [ ] **3.1** Install and configure NextAuth.js (or Clerk/Supabase Auth)
- [ ] **3.2** Set up email/password and phone auth providers
- [ ] **3.3** Create `(auth)` route group layout
- [ ] **3.4** Build `LoginForm` (email, password, validation)
- [ ] **3.5** Build `SignupForm` (email, phone, password)
- [ ] **3.6** Create `AuthProvider` and `ProtectedRoute` wrapper
- [ ] **3.7** Build onboarding wizard: `/onboarding` (photo upload, major, school)
- [ ] **3.8** Redirect logic: logged-in users away from auth pages; new users to onboarding

### Phase 4: App Shell & Dashboard (Week 3)

- [ ] **4.1** Create `(app)` route group layout
- [ ] **4.2** Build `Sidebar` with nav links (Dashboard, Find, Study, Trivia)
- [ ] **4.3** Build `AppShell` (sidebar + main content area)
- [ ] **4.4** Implement `Dashboard` page (welcome message, quick actions)
- [ ] **4.5** Add logout and profile link in sidebar

### Phase 5: User Profiles (Week 4)

- [ ] **5.1** Define `User` and `Class` types
- [ ] **5.2** Build `ProfileHeader` (avatar, name, contact)
- [ ] **5.3** Build `ClassBadge` component
- [ ] **5.4** Build `MyClassesSection` for profile
- [ ] **5.5** Create `/profile` page (current user)
- [ ] **5.6** Create `/profile/[id]` page (other users)
- [ ] **5.7** Add profile edit modal (photo, major, school)
- [ ] **5.8** Wire up API/mock data for profile and classes

### Phase 6: Social Discovery — Find (Week 5)

- [ ] **6.1** Define search API shape (users by class)
- [ ] **6.2** Build `UserSearch` (input + class filter)
- [ ] **6.3** Build `UserResultCard` and `ProfileCard`
- [ ] **6.4** Create `/find` page with search and results
- [ ] **6.5** Add `useUserSearch` hook for debounced search
- [ ] **6.6** Link results to `/profile/[id]`

### Phase 7: Study Tools — Flashcards (Week 6–7)

- [ ] **7.1** Define `Deck` and `Card` types
- [ ] **7.2** Build `DeckCard` (deck preview)
- [ ] **7.3** Create `/study` page (deck list)
- [ ] **7.4** Build `DeckCreationForm` and `CardEditor`
- [ ] **7.5** Create `/study/create` page
- [ ] **7.6** Create `/study/[deckId]` page (overview, edit, start)
- [ ] **7.7** Build `Flashcard` component with flip animation (Framer Motion)
- [ ] **7.8** Build `FlashcardStack` and `FlashcardSwipeNavigation`
- [ ] **7.9** Create `/study/[deckId]/learn` page
- [ ] **7.10** Implement `useFlashcardSession` and `study-session-store`
- [ ] **7.11** Add `StudyProgressBar`

### Phase 8: Trivia / Game Mode (Week 8–9)

- [ ] **8.1** Define `TriviaGame`, `Question`, `PlayerScore` types
- [ ] **8.2** Build `TriviaLobby` (create game, join by code)
- [ ] **8.3** Create `/trivia` page
- [ ] **8.4** Build `TriviaQuestion`, `TriviaOptions`, `TriviaTimer`
- [ ] **8.5** Build `TriviaHostControls` and host flow
- [ ] **8.6** Create `/trivia/host/[gameId]` page
- [ ] **8.7** Build `TriviaPlayerView` (answer submission)
- [ ] **8.8** Create `/trivia/play/[gameId]` page
- [ ] **8.9** Build `TriviaScoreboard` (live leaderboard)
- [ ] **8.10** Create `/trivia/results/[gameId]` page
- [ ] **8.11** Implement real-time sync (WebSocket, SSE, or polling for MVP)
- [ ] **8.12** Implement `trivia-game-store`

### Phase 9: Polish & MVP Launch (Week 10)

- [ ] **9.1** Add error boundaries and loading states
- [ ] **9.2** Implement 404 and error pages
- [ ] **9.3** Accessibility audit (keyboard nav, ARIA, contrast)
- [ ] **9.4** Mobile responsiveness sweep
- [ ] **9.5** Performance: lazy load heavy components, optimize images
- [ ] **9.6** Add analytics (optional)
- [ ] **9.7** Deploy to Vercel (or chosen platform)

---

## Appendix A: Recommended Package Additions

```bash
# UI & Forms
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install react-hook-form @hookform/resolvers zod

# Auth
npm install next-auth

# State & Data
npm install @tanstack/react-query zustand

# Animations
npm install framer-motion

# Icons (optional)
npm install lucide-react
```

---

## Appendix B: Key Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| App Router | Yes | Future-proof, RSC, streaming |
| Route Groups | Yes | Clean layout separation, no URL impact |
| Shadcn over other UI libs | Yes | Own the code, no vendor lock-in |
| Zustand over Redux | Yes | Simpler, less boilerplate for this scale |
| React Query | Yes | De facto for server state in React |
| Real-time for Trivia | WebSocket/SSE | Needed for live multiplayer; polling acceptable for MVP |

---

## Appendix C: Future Considerations

- **Classes CRUD:** Admin/instructor flows for creating classes
- **Deck Sharing:** Share decks with class or friends
- **Notifications:** In-app + push for trivia invites, study reminders
- **Offline Study:** PWA + service worker for offline flashcard study
- **Analytics Dashboard:** Study stats, streaks, progress over time

---

*End of Technical Plan*
