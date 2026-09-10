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
- Pay through a sandbox payment gateway.
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

## Proposed Credit Packages

| Package | Credits | Purpose |
| --- | ---: | --- |
| Free | 2 | Included after registration |
| Basic | 10 | Suitable for occasional use |
| Standard | 25 | Suitable for active job seekers |

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

### Implemented so far

Authentication is built and working. It uses SQLite through Prisma rather than
PostgreSQL, so the project runs with no database server to install — moving to
PostgreSQL later means changing the `provider` in `prisma/schema.prisma` and
pointing `DATABASE_URL` at the new server. Sessions are custom JWTs in an
httpOnly cookie instead of Auth.js, because the verification and reset flows
need their own single-use token handling either way.

Transactional email is sent through **Brevo**.

## Getting Started

```bash
npm install            # also runs `prisma generate`
cp .env.example .env   # then fill in the values below
npm run db:migrate     # creates dev.db and applies migrations
npm run dev
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file location, e.g. `file:./dev.db` |
| `AUTH_SECRET` | Signing key for session JWTs. Generate with `openssl rand -base64 32`. Rotating it logs everyone out. |
| `BREVO_API_KEY` | Brevo API key. Leave it unset in development to print emails to the server console instead of sending them. |
| `BREVO_SENDER_EMAIL` | Sender address. Must be a verified sender or an authenticated domain in Brevo. |
| `BREVO_SENDER_NAME` | Display name on outgoing email. |
| `APP_URL` | Base URL used to build links inside emails. |

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

## Main Database Entities

| Entity | Purpose |
| --- | --- |
| User | Stores account details, role, and credit balance |
| CoverLetter | Stores input information and generated cover letters |
| CreditPackage | Stores purchasable credit packages and prices |
| Payment | Stores payment amount, gateway reference, and status |
| CreditTransaction | Records every credit addition and deduction |

## Non-Functional Requirements

- Passwords must be stored securely using hashing.
- Private routes must require authentication.
- User and administrator permissions must be separated.
- Form input must be validated on both client and server.
- Payment callbacks must be verified before credits are added.
- AI and payment API keys must be stored in environment variables.
- The interface must be responsive on desktop and mobile devices.
- Errors must be handled without exposing sensitive information.

## Suggested Pages

- Home page
- Register page
- Login page
- Forgot password page
- User dashboard
- Generate cover letter page
- Saved cover letters page
- Cover letter details and editor page
- Credit packages and checkout page
- Payment status page
- Payment history page
- Admin dashboard

## Project Scope

The project focuses only on generating and managing cover letters. Résumé building, job searching, interview preparation, and recruitment management are outside the initial scope.

## Project Status

Authentication is implemented and tested end to end. Cover letter generation,
credits and payments are still to be built.

## License

This project is intended for academic use.
