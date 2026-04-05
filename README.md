# EloB2B Market — CENG 495 Take Home Exam 1

An e-commerce web application built with Next.js 16 and MongoDB Atlas, deployed on Vercel.

---

## Live Deployment

Vercel URL:
https://2589117ceng495hw1.vercel.app/

---

## How to Use the Application

### First-Time Setup (Seeding the Database)

After deployment, the database can be populated by visiting:

```
https://2589117ceng495hw1.vercel.app/api/seed
```

This creates 8 items (covering all required categories), 3 regular users, and 1 admin user. All users rate and review all items.

Calling `/api/seed` resets the database.

---

### Login Information

Admin account:

* Username: elo
* Password: elo1

Regular users:

* user1 / user1
* user2 / user2
* user3 / user3

---

## Features

### Home Page

* Lists all items
* Category filtering is available
* Categories: Vinyls, Antique Furniture, GPS Sport Watches, Running Shoes, Camping Tents

---

### Item Detail Page

* Displays all item attributes
* Shows category-specific fields
* Users can rate items (1–5)
* Users can write and update reviews
* Reviews are listed with usernames

---

### Admin Panel

* Add item
* Remove item
* Add user
* Remove user

Deleting items or users updates related ratings and reviews.

---

### User Profile

* Displays username
* Shows average rating given by the user
* Lists all ratings and reviews
* Only accessible when logged in

---

## Architecture and Design Decisions

### Technologies

* Next.js 16 (App Router)
* TypeScript
* MongoDB Atlas
* Vercel

### Architecture

The application is implemented as a full-stack Next.js project. Both frontend and backend logic are handled within the same project using API routes.

Server components are used for data fetching and authentication checks, while client components are used for interactive parts such as forms.

---

### Database Design

The application uses two collections:

* items
* users

Items store ratings and reviews as embedded arrays. Users store their given ratings and reviews as well. This design avoids joins and improves read performance.

Category-specific fields are optional and only included when needed.

---

### Authentication

Authentication is implemented using cookies. A httpOnly cookie stores user information after login.

User roles are used to restrict access to admin features.

---

### Cascading Updates

When an item is deleted, all related ratings and reviews are removed from users.

When a user is deleted, their ratings and reviews are removed from all items.

---

## Deployment

The application is deployed on Vercel. MongoDB Atlas is used as the database and is configured to accept connections from any IP address.

---

## Project Structure

```
app/
  page.tsx
  login/
  profile/
  admin/
  items/[id]/
  api/
lib/
types/
```

---

## Running Locally

```
npm install
npm run dev
```

Then visit:

```
http://localhost:3000/api/seed
```

---

## Data Summary

* 8 items
* 5 categories covered
* 4 users (1 admin + 3 regular)
* all items have ratings and reviews

---

## Notes

This project was developed for academic purposes. Passwords are stored in plain text for simplicity.
