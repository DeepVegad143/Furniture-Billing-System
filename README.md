# Deep Furniture — Billing & Job Estimation System

A modern, mobile-friendly full-stack web application designed for **Deep Furniture** to streamline carpentry job-work billing, customer records, and rate quotation management.

---

## 🎯 Purpose of the Project

In traditional carpentry and custom interior fabrication, calculations for measurements, materials, and staged job payments are often recorded manually in notebooks or paper slips. This application was built to modernize and simplify daily workshop and on-site operations:

1. **Accurate Woodworking Calculations**: Automatically calculates areas and charges for square feet (inches × inches converted to sq.ft), running feet (R.F), unit counts (NOS), and laminate sheets with zero rounding discrepancies.
2. **Multi-Page Job Books**: Organizes carpentry projects room-by-room or section-by-section (e.g., Master Bedroom, Kitchen Cabinets, Living Room Partition) within a single customer job book.
3. **Payment & Balance Tracking**: Tracks advance deposits, periodic withdrawals, and outstanding balance dues across multi-phase interior work.
4. **Professional Vector PDF Invoices**: Instantly creates clean, publication-ready vector invoices and quotations branded with the business logo and contact information.
5. **Rate Quotation Sharing**: Allows estimating and generating quick job-work rate quotations that can be downloaded as PDF or shared directly to customers via WhatsApp.
6. **Bilingual Interface**: Offers full English and Gujarati language support across the user interface and document labels for effortless local usage.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React (Vite)
  - Tailwind CSS
  - Framer Motion (micro-interactions & animations)
  - Lucide React (icons)
  - `@react-pdf/renderer` (client-side high-resolution PDF generation)
  - `i18next` (bilingual English / Gujarati localization)

- **Backend**:
  - Node.js & Express
  - MongoDB with Mongoose ODM
  - JSON Web Tokens (JWT) & bcryptjs for secure authentication
  - Helmet & rate-limiting middleware for security
  - ExcelJS for complete spreadsheet backup exports

- **Shared Calculation Engine (`/calc`)**:
  - Independent, unit-tested pure mathematical module used across client and server to ensure identical total and area computation.

---

## 📂 Project Structure

```text
├── calc/               # Shared calculation library
│   └── index.js        # Core math & area computation functions
├── client/             # Frontend React application
│   ├── src/
│   │   ├── api/        # API client & endpoints
│   │   ├── components/ # Reusable UI components & layouts
│   │   ├── context/    # Authentication & global state
│   │   ├── i18n/       # English & Gujarati translations
│   │   ├── pages/      # Application views & pages
│   │   ├── pdf/        # PDF document templates
│   │   └── utils/      # Formatting & WhatsApp share helpers
│   └── vite.config.js  # Vite dev server & proxy configuration
├── server/             # Express API server
│   ├── seed/           # Standard catalog items & terms
│   └── src/
│       ├── config/     # Database & environment configuration
│       ├── controllers/# API route controllers
│       ├── middleware/ # Authentication & error handling
│       ├── models/     # Mongoose schemas
│       └── routes/     # Express route definitions
└── package.json        # Root scripts to orchestrate client & server
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Installation
Clone the repository and install dependencies in all packages:
```bash
# Root dependencies
npm install

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```


### 2. Start Development Servers
From the root folder, launch both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🔒 Security & Data Privacy

- Sensitive credentials, secret tokens, and environment variables are strictly excluded from version control via `.gitignore`.
- User data and customer records are isolated and protected by JWT authentication on all API routes.
