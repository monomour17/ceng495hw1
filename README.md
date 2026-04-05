# EloB2B Market — CENG 495 Take Home Exam 1

An e-commerce web application built with **Next.js 16** and **MongoDB Atlas**, deployed on **Vercel**.

##  Live Deployment

**Vercel URL:** `https://<your-vercel-url>.vercel.app`

>  Replace the URL above with your actual Vercel deployment URL before submission.

---

##  How to Use the Application

### First-Time Setup (Seeding the Database)

Before using the application, the database must be populated with sample data. Visit the following URL once after deployment:

```
https://<your-vercel-url>.vercel.app/api/seed
```

This will create **8 items** (across all 5 required categories), **3 regular users**, and **1 admin user**, with every user rating and reviewing every item.

>  Calling `/api/seed` resets the entire database. Only run it once, or to reset demo data.

---

### Logging In

Navigate to the home page and click **"Giriş Yap"** (Login).

#### Admin Account

| Field    | Value  |
|----------|--------|
| Username | `elo`  |
| Password | `elo1` |

After logging in as admin, a **" Admin Paneli"** button appears in the navigation bar, linking to the admin dashboard at `/admin`.

#### Regular User Accounts

| Username | Password |
|----------|----------|
| `user1`  | `user1`  |
| `user2`  | `user2`  |
| `user3`  | `user3`  |

After logging in as a regular user, clicking your **username** in the navbar takes you to your profile page at `/profile`.

---

##  Features

### Home Page (`/`)
- Lists all items for sale with product cards (image, name, category, price, rating)
- **Category filter** buttons for: Vinyls, Antique Furniture, GPS Sport Watches, Running Shoes, Camping Tents
- Navigation shows login button (unauthenticated), or username/admin panel link + logout (authenticated)

### Item Detail Page (`/items/[id]`)
- Displays all item attributes (name, description, price, seller, condition, rating)
- Shows **category-specific fields**: battery life (watches), age (furniture/vinyls), size (shoes), material (furniture/shoes)
- **Rating form** (1–5 stars, interactive hover) — visible to logged-in regular users only
- **Review form** — visible to logged-in regular users only; updates append `"Edit: "` prefix to original
- Full **reviews list** with reviewer names and dates
- Unauthenticated users see a prompt to log in

### Admin Panel (`/admin`) — Admin Only
- **Add Item**: Form with all required fields; category-specific fields appear dynamically
- **Remove Item**: Lists all items with a delete button; deletion cascades to remove user ratings/reviews and recalculates averages
- **Add User**: Creates a new user with username, password, and role
- **Remove User**: Lists all non-admin users; deletion cascades to remove their contributions from all items and recalculates item averages

### User Profile (`/profile`) — Authenticated Regular Users Only
- Displays username, average rating given, total review count
- Lists all ratings given (with links to items)
- Lists all reviews written (with links to items)
- Redirects to login page if not authenticated

---

##  Architecture & Design Decisions

### Programming Language & Framework

**TypeScript + Next.js 16 (App Router)**

- **TypeScript** provides type safety across the entire codebase (shared `types/item.d.ts` and `types/user.d.ts` definitions used by both frontend and API routes).
- **Next.js App Router** was chosen for its unified full-stack capability — API routes and server-side rendered pages coexist in a single project, eliminating the need for a separate backend server. This greatly simplifies deployment on Vercel.
- **Server Components** are used for data-fetching pages (`/`, `/items/[id]`, `/admin`, `/profile`) to read cookies and query MongoDB server-side, avoiding client-side data exposure.
- **Client Components** (`RateForm.tsx`, `ReviewForm.tsx`, `AdminItemForm.tsx`, etc.) are used only where interactivity is needed.

### Database Design

**MongoDB Atlas (single collection approach)**

The application uses **two collections** to satisfy the NoSQL flexibility requirement while minimizing collection count:

#### `items` collection
Each document embeds the full `ratings` and `reviews` arrays directly, enabling fast reads of all item data in a single query. Category-specific fields (`batteryLife`, `age`, `size`, `material`) are optional — they simply don't appear in documents where they're not applicable, leveraging MongoDB's dynamic schema.

```json
{
  "name": "...", "description": "...", "price": 1500,
  "seller": "...", "image": "...", "category": "Vinyls",
  "condition": "used", "age": 60, "rating": 3.7,
  "ratings": [{ "userId": "...", "username": "...", "value": 4 }],
  "reviews": [{ "userId": "...", "username": "...", "text": "...", "createdAt": "..." }]
}
```

#### `users` collection
Each document stores a **denormalized snapshot** of the user's activity (their given ratings and reviews), enabling fast profile reads without joins. This trades some write complexity (updating two documents on rate/review) for fast profile page loads.

```json
{
  "username": "user1", "password": "user1", "role": "user",
  "averageRating": 3.2,
  "givenRatings": [{ "itemId": "...", "itemName": "...", "value": 4 }],
  "reviews": [{ "itemId": "...", "itemName": "...", "text": "..." }]
}
```

### Authentication

Cookie-based session authentication (no third-party auth library):
- On login, a `httpOnly` cookie named `elob2bauth` is set containing a JSON payload `{ _id, username, role }`.
- Server components and API routes read this cookie directly using Next.js `cookies()` to determine the current user and their role.
- Passwords are stored in plain text for simplicity (acceptable for an academic assignment; `bcrypt` integration was scaffolded but bypassed).

### Cascading Deletes

When an **item is deleted**:
1. All users' `givenRatings` and `reviews` arrays are updated to remove references to that item.
2. Each affected user's `averageRating` is recalculated.

When a **user is deleted**:
1. All items' `ratings` and `reviews` arrays are updated to remove that user's contributions.
2. Each item's `rating` average is recalculated.

### Deployment

The application is deployed to **Vercel** directly from a private GitHub repository. The `MONGODB_URI` environment variable is configured in Vercel's project settings, pointing to a MongoDB Atlas cluster configured to accept connections from any IP address (`0.0.0.0/0`).

---

##  Project Structure

```
elob2bapp/
├── app/
│   ├── page.tsx                    # Home page (item listing + category filter)
│   ├── login/page.tsx              # Login page
│   ├── profile/page.tsx            # User profile page
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── AdminItemForm.tsx       # Add item form (client component)
│   │   ├── AdminUserForm.tsx       # Add user form (client component)
│   │   └── AdminDeleteButtons.tsx  # Delete buttons (client component)
│   ├── items/[id]/
│   │   ├── page.tsx                # Item detail page
│   │   ├── RateForm.tsx            # Star rating form (client component)
│   │   └── ReviewForm.tsx          # Review form (client component)
│   └── api/
│       ├── auth/login/route.ts     # POST /api/auth/login
│       ├── auth/logout/route.ts    # GET  /api/auth/logout
│       ├── seed/route.ts           # GET  /api/seed (database seeding)
│       ├── items/[id]/
│       │   ├── rate/route.ts       # POST /api/items/[id]/rate
│       │   └── review/route.ts     # POST /api/items/[id]/review
│       └── admin/
│           ├── items/route.ts      # POST /api/admin/items
│           ├── items/[id]/route.ts # DELETE /api/admin/items/[id]
│           ├── users/route.ts      # POST /api/admin/users
│           └── users/[id]/route.ts # DELETE /api/admin/users/[id]
├── lib/mongodb.ts                  # MongoDB client singleton
├── types/
│   ├── item.d.ts                   # Item & related types
│   └── user.d.ts                   # User & related types
└── .env                            # MONGODB_URI (not committed to git)
```

---

##  Running Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)
6. Seed the database by visiting [http://localhost:3000/api/seed](http://localhost:3000/api/seed)

---

## Item Categories & Sample Data

| Category | Items in DB | Category-Specific Fields |
|----------|-------------|--------------------------|
| Vinyls | 2 | Age |
| Antique Furniture | 2 | Age, Material |
| GPS Sport Watches | 2 | Battery Life |
| Running Shoes | 1 | Size, Material |
| Camping Tents | 1 | — |

**Total: 8 items, 4 users (1 admin + 3 regular), every user has rated and reviewed every item.**
