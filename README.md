# Brewlytics — Specialty Coffee Intelligence

> **Turn café data into smarter decisions.**

Brewlytics is a production-grade specialty coffee business intelligence and financial analytics platform. It converts raw point-of-sale transactions, product recipes, patron records, and operating expenses into real gross/net profit margins, menu engineering insights, and conversational AI recommendations.

---

## ☕ Why Brewlytics?

Independent café owners and specialty roasters regularly review daily revenue numbers, but struggle to answer critical operational questions:
- *Which drinks drive real margin versus ingredient waste?*
- *Why did net profit decline even when gross sales increased?*
- *Which operating expense categories (dairy, green coffee, rent, payroll) are spiking?*
- *What products are critically low in stock?*
- *What items should be featured on the weekend menu to maximize gross margin?*

Brewlytics computes all metrics directly from a relational **PostgreSQL** database and uses **Google Gemini 2.5** to provide plain-language, data-grounded business intelligence without hallucinations.

---

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide React
- **Backend**: Node.js, Express.js REST APIs, JWT authentication, bcryptjs, Firebase Admin
- **Database**: Relational PostgreSQL (Google Cloud SQL) managed with Drizzle ORM
- **AI Engine**: Google Gemini API (`@google/genai` with `gemini-2.5-flash`)
- **Authentication**: Dual-path authentication:
  - Email & Password with salt-hashed bcrypt and signed JWT tokens
  - Google Sign-In via Firebase Auth & OAuth 2.0

---

## 📂 Project Structure

```
├── backend/
│   ├── database.sql           # Reference raw SQL schema with foreign keys
│   └── seed.js                # Standalone CLI demo seed script
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx      # Login, registration & Google sign-in modal
│   │   ├── DemoDataModal.tsx  # Dataset manager (load sample demo or reset)
│   │   ├── Sidebar.tsx        # Responsive coffee-themed navigation
│   │   ├── StatCard.tsx       # KPI card with empty-state indicators
│   │   └── TopHeader.tsx      # Date filters, greetings, and quick actions
│   ├── context/
│   │   └── AuthContext.tsx    # User session, JWT tokens & Firebase auth state
│   ├── db/
│   │   ├── drizzle.config.ts  # Drizzle Kit admin configuration
│   │   ├── index.ts           # pg connection pool & Drizzle instance
│   │   └── schema.ts          # PostgreSQL tables & relationship definitions
│   ├── lib/
│   │   ├── firebase.ts        # Client Firebase Auth initialization
│   │   └── firebase-admin.ts  # Server Firebase Admin token verifier
│   ├── middleware/
│   │   └── auth.ts            # Bearer JWT & Firebase ID token middleware
│   ├── pages/
│   │   ├── AiAnalystPage.tsx  # Conversational AI Business Analyst interface
│   │   ├── AnalyticsPage.tsx  # Financial velocity, margin & expense reports
│   │   ├── CustomersPage.tsx  # Patron accounts & purchase histories
│   │   ├── ExpensesPage.tsx   # Categorized overhead tracking
│   │   ├── LandingPage.tsx    # Specialty coffee SaaS landing page
│   │   ├── OverviewPage.tsx   # Dashboard with live SQL KPIs & charts
│   │   ├── ProductsPage.tsx   # Menu catalog, recipe costs & margin %
│   │   ├── SalesPage.tsx      # Real-time ticket recorder & inventory decrement
│   │   └── SettingsPage.tsx   # Café branding, currency & security settings
│   ├── services/
│   │   └── api.ts             # Typed REST API client
│   ├── server/
│   │   ├── routes/
│   │   │   ├── ai.ts          # Gemini chat & conversation history endpoints
│   │   │   ├── analytics.ts   # SQL aggregation endpoints
│   │   │   ├── auth.ts        # Register, login, profile & password routes
│   │   │   ├── customers.ts   # Customer CRUD routes
│   │   │   ├── demo.ts        # Demo dataset seed & clear endpoints
│   │   │   ├── expenses.ts    # Overhead expenses CRUD routes
│   │   │   ├── products.ts    # Catalog & unit cost CRUD routes
│   │   │   └── sales.ts       # Ticket orders & stock management routes
│   │   └── services/
│   │       ├── aiService.ts   # Gemini LLM grounder & system prompt
│   │       └── analyticsService.ts # PostgreSQL metrics calculation engine
│   ├── App.tsx                # App root & view routing
│   ├── index.css              # Custom coffee palette & typography
│   └── main.tsx               # React client entry point
├── index.html                 # App HTML shell with Space Grotesk font
├── metadata.json              # AI Studio applet metadata
├── package.json               # Full-stack dependencies & scripts
├── server.ts                  # Express full-stack server & Vite middleware
└── tsconfig.json              # TypeScript compilation config
```

---

## 🗄 Database Architecture

All business metrics are persisted in PostgreSQL:
1. `users`: Authentication identities, roastery branding, currency, and timezone.
2. `products`: Menu items, recipe cost, selling price, and stock levels.
3. `customers`: Customer name, contact info, and lifetime purchase association.
4. `sales`: Ticket timestamp, payment method, total amount, customer link, and user isolation.
5. `sale_items`: Itemized lines (product ID, quantity, unit price, total price).
6. `expenses`: Operating costs categorized into Rent, Ingredients, Utilities, Marketing, Staff, Equipment, and Other.
7. `chat_messages`: Multi-turn conversational history with the AI Analyst.

---

## 🔒 Security & Data Isolation

- Every SQL query enforces `WHERE user_id = $userId`. No user can access another café's records.
- Passwords are encrypted with `bcryptjs` using 10 salt rounds.
- All protected endpoints require a valid `Authorization: Bearer <token>` header.
- Dynamic prices: The frontend does NOT dictate total sale amounts; the backend queries actual database product prices and computes totals on the server.
- Database credentials and Gemini API keys are never exposed to the client.

---

## 🚀 Running the Application

### 1. Installation
```bash
npm install
```

### 2. Environment Variables (`.env`)
Configure the following in your `.env`:
```env
# AI Studio automatically provides Cloud SQL environment variables at runtime:
# SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB_NAME, SQL_ADMIN_USER, SQL_ADMIN_PASSWORD

# Gemini API Key for AI Analyst
GEMINI_API_KEY="your-gemini-api-key"

# JWT Secret for signing session tokens
JWT_SECRET="brewlytics-secret-key-change-in-production"
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://0.0.0.0:3000` serving both the Express REST APIs and the Vite frontend.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🤖 How the AI Analyst Works

When you ask the AI Business Analyst a question:
1. The backend authenticates your request and identifies your `userId`.
2. `analyticsService.ts` executes SQL aggregations across your `sales`, `products`, and `expenses`.
3. Structured JSON metrics (total revenue, gross profit, margin %, top items, low stock warnings, and expense shares) are packaged into the context.
4. Google Gemini (`gemini-2.5-flash`) reasons over this context using a strict system instruction:
   > *"Answer questions using ONLY the business data provided in the context. Never invent sales, revenue, expenses, customers, products or financial metrics."*
5. Gemini generates a natural-language executive summary, which is saved to `chat_messages` in PostgreSQL and returned to the UI.

---

## 🧪 Testing with Empty vs Demo Data

- **Pristine Empty State**: New accounts start with zero sales, zero products, and zero expenses. The dashboard displays the custom welcome screen with empty state guidance.
- **Optional Demo Dataset**: Click **"Dataset"** or **"Demo Data / Reset"** in the sidebar/settings to populate 12 specialty coffee items, 15 realistic orders, 5 customers, and 7 categorized overhead records.
- **Instant Reset**: You can clear all test records at any time to return to a completely empty state.
