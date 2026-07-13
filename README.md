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

Planning and system design.

## License

This project is intended for academic use.
