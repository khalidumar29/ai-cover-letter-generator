# AI Cover Letter Generator

## Project Description

AI Cover Letter Generator is a web application that helps users create personalized cover letters based on their professional information and a job description. Users can register, generate and manage cover letters, purchase generation credits through a payment gateway, and download completed letters as PDF files.

This project is being developed for the **Information System Design & Software Engineering Lab**.

## Objectives

- Reduce the time required to write a customized cover letter.
- Demonstrate practical AI integration in a web application.
- Implement secure authentication and authorization.
- Integrate an online payment gateway using a sandbox environment.
- Apply software engineering concepts such as requirement analysis, system design, database design, testing, and documentation.

## User Features

### Authentication

- Create an account using email and password.
- Log in and log out securely.
- Reset a forgotten password.
- Access protected pages only after authentication.
- Maintain separate user and administrator roles.

### AI Cover Letter Generation

- Enter personal and professional information.
- Enter the target job title and company name.
- Paste the job description.
- Add relevant skills and experience.
- Select a writing tone, such as professional, confident, or friendly.
- Generate a personalized cover letter using an AI API.
- Regenerate a cover letter when necessary.
- Deduct one credit for each successful generation.

### Cover Letter Management

- View all previously generated cover letters.
- Open and read a saved cover letter.
- Edit and update generated content.
- Delete unwanted cover letters.
- Copy a cover letter to the clipboard.
- Download a cover letter as a PDF.

### Credits and Payments

- Receive a limited number of free credits after registration.
- View the current credit balance.
- Select and purchase a credit package.
- Pay through Stripe Checkout.
- Handle successful, failed, and cancelled payments.
- Add credits only after the payment is verified.
- View payment and credit transaction history.

## Administrator Features

- Log in to a protected administrator dashboard.
- View registered users.
- View generated cover letter statistics.
- View payments and their statuses.
- View purchased and used credits.
- Manage available credit packages.

## Credit Packages

Seeded by `npm run db:seed`, and editable afterwards from the admin dashboard.

| Package | Credits | Price | Purpose |
| --- | ---: | ---: | --- |
| Free | 2 | — | Included after registration |
| Basic | 10 | $5 | Occasional use |
| Standard | 25 | $10 | An active job search |
| Pro | 60 | $20 | Applying at volume |

## Main Workflow

1. A user creates an account or logs in.
2. The user enters job and professional information.
3. The application sends the information to the AI service.
4. The AI service returns a personalized cover letter.
5. The application deducts one credit and saves the letter.
6. The user edits, copies, or downloads the letter as a PDF.
7. When the user has no credits, they purchase more through the payment gateway.
8. The application verifies the payment before adding credits.

## Proposed Technology Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes or Node.js with Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Auth.js or JWT-based authentication
- **AI:** OpenAI API or Google Gemini API
- **Payment Gateway:** SSLCommerz sandbox or Stripe test mode
- **PDF Generation:** React PDF or PDFKit

The final stack may be adjusted according to course requirements.

### Stack decisions

The plan above left several choices open. What the build settled on, and why:

| Area | Choice | Reason |
| --- | --- | --- |
| Database | SQLite via Prisma | Runs with no database server to install. Moving to PostgreSQL means changing `provider` in `prisma/schema.prisma` and pointing `DATABASE_URL` at the new server. |
| Auth | Custom JWT in an httpOnly cookie | The verification and reset flows need their own single-use token handling either way, so Auth.js would have added a dependency without removing work. |
| AI | DeepSeek (`deepseek-chat`) | OpenAI-compatible, so the client is one `fetch` in `lib/ai/deepseek.ts` and swapping providers is a change to that one file. |
| Email | Brevo | One REST call, no SDK. |
| Payments | Stripe Checkout | Hosted payment page, so card details never touch the application; confirmed by a signature-verified webhook. See [Payments](#payments). |
| PDF | `pdf-lib` | Its standard fonts are built into the PDF spec, so there are no font files to ship and nothing native to compile. |

## Getting Started

```bash
npm install            # also runs `prisma generate`
cp .env.example .env   # then fill in the values below
npm run db:migrate     # creates dev.db and applies migrations
npm run db:seed        # adds the starter credit packages
npm run dev
```

To reach the admin dashboard, sign up as normal and then promote that account:

```bash
npm run make-admin -- you@example.com
```

There is deliberately no way to do this from the interface.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file location, e.g. `file:./dev.db` |
| `AUTH_SECRET` | Signing key for session JWTs. Generate with `openssl rand -base64 32`. Rotating it logs everyone out. |
| `BREVO_API_KEY` | Brevo API key. Leave it unset in development to print emails to the server console instead of sending them. |
| `BREVO_SENDER_EMAIL` | Sender address. Must be a verified sender or an authenticated domain in Brevo. |
| `BREVO_SENDER_NAME` | Display name on outgoing email. |
| `APP_URL` | Base URL used to build links inside emails and checkout redirects. |
| `DEEPSEEK_API_KEY` | DeepSeek API key. Required for generation and rewrites. |
| `STRIPE_SECRET_KEY` | Stripe API key. A restricted key (`rk_…`) with write access to Checkout Sessions is preferred. Use a test-mode or sandbox key in development. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret (`whsec_…`) of the webhook endpoint for `/api/payments/webhook`. |

`.env` is gitignored and must never be committed.

## Authentication

### Flows

| Flow | Page | Endpoint |
| --- | --- | --- |
| Create account | `/signup` | `POST /api/auth/signup` |
| Log in | `/login` | `POST /api/auth/login` |
| Log out | header button | `POST /api/auth/logout` |
| Confirm email | `/verify-email` | `POST /api/auth/verify-email` |
| Resend confirmation | `/verify-email` | `POST /api/auth/resend-verification` |
| Forgot password | `/forgot-password` | `POST /api/auth/forgot-password` |
| Reset password | `/reset-password?token=…` | `POST /api/auth/reset-password` |
| Change password | `/account/password` | `POST /api/auth/change-password` |
| Current user | — | `GET /api/auth/me` |

A new account is signed in immediately but cannot reach the app until the email
address is confirmed; the protected layout redirects it to `/verify-email`,
which can resend the link.

### Emails

Three messages go out through Brevo, all built in `lib/email/templates.ts`:
confirmation, password reset, and a notification whenever a password changes.

### Security decisions

- Passwords are hashed with bcrypt at cost 12 and never logged.
- Verification and reset links are random 32-byte tokens. Only their SHA-256
  hash is stored, they are single-use, and issuing a new one invalidates the
  previous one. Confirmation links last 24 hours, reset links 1 hour.
- Changing or resetting a password stamps `passwordChangedAt`, which invalidates
  every session issued earlier — so a reset signs out an attacker who still
  holds a valid cookie.
- Login, password reset and resend answer identically for known and unknown
  addresses, and login spends the same bcrypt time either way, so none of them
  can be used to discover which addresses are registered.
- All auth endpoints are rate limited per IP, with a second per-account bucket
  on login, reset and resend. The limiter is in process memory, which is enough
  for a single server; a multi-instance deployment needs a shared store.
- `?next=` redirects are restricted to same-site paths to prevent open redirects.
- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.

### Route protection

`proxy.ts` (the Next.js 16 replacement for `middleware.ts`) runs on the Edge
runtime and checks only the session signature, since it has no database access.
The database-backed checks — the account still existing, and the email being
confirmed — happen in `app/(app)/layout.tsx`.

## Cover letters

| Action | Page | Endpoint |
| --- | --- | --- |
| Generate | `/letters/new` | `POST /api/cover-letters` |
| List and filter | `/letters` | — |
| Read and edit | `/letters/[id]` | `PATCH /api/cover-letters/[id]` |
| Rewrite a passage | editor selection | `POST /api/ai/rewrite` |
| Regenerate | editor | `POST /api/cover-letters/[id]/regenerate` |
| Download PDF | editor / row menu | `GET /api/cover-letters/[id]/pdf` |
| Delete | row menu | `DELETE /api/cover-letters/[id]` |

Generation is a single DeepSeek call that returns the letter *and* the job-match
summary as one JSON object, so a letter costs one credit and one round trip
rather than two of each. The prompt forbids inventing an employer, metric or
date that the user did not supply, and the result is stripped of markdown before
it is stored.

The brief is saved alongside the letter, which is what makes regeneration
possible without retyping it.

### Editing

The editor is a `contentEditable` document rather than a chat transcript.
Selecting any passage raises a contextual toolbar — rewrite, shorten, expand,
more professional, more confident, more natural, more specific, or a free-text
instruction. Rewrites replace the selection in place.

Rewrites are free. They refine a letter the user has already paid to generate,
so charging again would mean paying twice for one letter; the endpoint is rate
limited instead.

## Credits

One credit per generation or regeneration. Editing, rewriting, copying and
exporting are all free. New accounts get two credits.

Every movement is written to `CreditTransaction` with the balance it produced,
so `/credits/history` reconciles against the account balance without replaying
the ledger.

Two properties matter and are covered by the implementation:

- **A generation cannot overdraw an account.** The balance is decremented with a
  `where credits >= cost` guard rather than being read and then written, so
  concurrent requests cannot both pass the check. Firing three generations at a
  one-credit account yields one success and two `402`s.
- **A failed generation is not charged.** The credit is taken before the model
  call, because the alternative allows unlimited free generations under
  concurrency. If the call then fails, the credit is refunded and both entries
  appear in the ledger.

## Payments

Payments go through [Stripe Checkout](https://docs.stripe.com/payments/checkout):

1. `POST /api/checkout` records a `PENDING` payment, copying the package's
   price, credits and name onto it so a later edit to the package cannot change
   what the purchase was for. It then creates a Checkout Session and returns
   its URL.
2. The browser leaves the application for Stripe's hosted page. Card details
   never reach this server.
3. Stripe confirms the outcome through `POST /api/payments/webhook`, which
   verifies the `Stripe-Signature` header against the raw body before doing
   anything else. The result page (`/credits/result`) also retrieves the
   session from Stripe directly, so a buyer who lands there before the webhook
   still sees their credits.
4. `settleCheckoutSession` in `lib/payments/settle.ts` is the only place credits
   are added, and it requires all three of: a session that came from Stripe, a
   payment still in `PENDING`, and a charged amount matching the recorded one.
   The status transition is guarded with `updateMany ... where status =
   'PENDING'`, so a webhook delivered twice, or racing the result page, credits
   exactly once.

Cancelling on the Stripe page goes to `/api/checkout/cancel`, which expires the
session so it can no longer be paid. Abandoned sessions expire after an hour and
are marked cancelled by the `checkout.session.expired` webhook.

### Webhook setup

Subscribe the endpoint to `checkout.session.completed`,
`checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed` and `checkout.session.expired`.

Locally, forward events with the Stripe CLI and copy the `whsec_…` secret it
prints into `STRIPE_WEBHOOK_SECRET`:

```bash
npm run stripe:listen   # stripe listen --forward-to localhost:3000/api/payments/webhook
```

`STRIPE_SECRET_KEY` and the CLI must point at the same Stripe account, or the
forwarded events will not match the sessions the app created.

In test mode, pay with card `4242 4242 4242 4242`, any future expiry and any
CVC. `4000 0000 0000 0002` is declined.

## Administration

`/admin`, gated in the route group's layout so a new page added there is
protected by default. Non-admins are redirected rather than shown a 403, so the
area is not discoverable by probing.

| Screen | Purpose |
| --- | --- |
| Overview | Accounts, letters generated, revenue, credits sold and used |
| Users | Every account, with a credit adjustment that records a reason |
| Payments | Every checkout attempt, filterable by status |
| Packages | Create, edit, hide and remove credit packages |

Deleting a package that has already been bought retires it instead, so payment
history keeps pointing at something real.

## Main Database Entities

| Entity | Purpose |
| --- | --- |
| User | Stores account details, role, and credit balance |
| CoverLetter | Stores input information and generated cover letters |
| CreditPackage | Stores purchasable credit packages and prices |
| Payment | Stores payment amount, reference, Stripe session id, and status |
| CreditTransaction | Records every credit addition and deduction |

## Non-Functional Requirements

- Passwords must be stored securely using hashing.
- Private routes must require authentication.
- User and administrator permissions must be separated.
- Form input must be validated on both client and server.
- Payment webhooks must be verified before credits are added.
- AI and payment API keys must be stored in environment variables.
- The interface must be responsive on desktop and mobile devices.
- Errors must be handled without exposing sensitive information.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email` | Authentication |
| `/dashboard` | Balance, activity and recent letters |
| `/letters` | All cover letters, filterable by status |
| `/letters/new` | Generate a cover letter |
| `/letters/[id]` | Document editor with contextual AI actions |
| `/credits` | Credit packages |
| `/credits/result` | Payment outcome |
| `/credits/history` | Payments and the credit ledger |
| `/account/password` | Change password |
| `/admin`, `/admin/users`, `/admin/payments`, `/admin/packages` | Administration |

## Project Scope

The project focuses only on generating and managing cover letters. Résumé building, job searching, interview preparation, and recruitment management are outside the initial scope.

## Project Status

All planned features are implemented: authentication, AI cover letter
generation and editing, cover letter management with PDF export, credits, the
payment flow, and the administrator dashboard.

Known limits, all of them deliberate for a single-server academic build:

- The rate limiter lives in process memory. A multi-instance deployment needs a
  shared store.
- SQLite is a single file, so writes serialise. Fine for a demo, not for load.

## License

This project is intended for academic use.
