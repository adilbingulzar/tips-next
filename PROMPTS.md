# AI Prompts Log: TIQS CodeIgniter → Laravel + Next.js

Technical prompts given to the AI assistant (Claude Code) for this project, in order.

---

## 2026-10-09

### 1. Review the existing application
```
Please read/review this folder in details
/var/www/html/tips/
```

### 2. Target stack
```
i need this in laravel+nextjs
backend in laravel, and front end in nextjs
```

### 3. Versions
```
now we need latest laravel, latest php, latest mysql and latest each and everything
```
```
yes we need latest and stable version
```

### 4. Infrastructure
```
we do not need docker
```
```
can we use mysql 8?
```

### 5. Conversion and deployment
```
we need to convert this codeigniter site into latest laravel and latest next version,
no docker, we will use laravel forge for deployment.
```

### 6. Project decisions
- **Mobile:** No mobile app, but this site will open on mobile devices, so the design should be responsive on all screens.
- **Domains:** Next.js frontend on the main domain, Laravel API on an `api.` subdomain.
- **Architecture:** Laravel is used only for backend APIs. All pages, including the admin panel, are built in Next.js.
- **Scope:** The complete project needs to be converted.
- **Design:** Keep the current look.
- **Database:** Use the best approach, but it must have Laravel migrations and seeders.
- **Languages:** Same languages as the old site.
- **Repository:** One repo with two folders (`backend/` and `frontend/`).

---

## 2026-10-12

### 7. New design
```
I need to change this project design, and want the design as /var/www/html/alfred/ main branch
```
- **Design:** The look of the Alfred back office (2026 screens) replaces the old orange theme: light and dark themes with a switch, Inter font, side panel and top bar, pill buttons, rounded cards and row tables. Public tip, review and business card pages keep each user's own branding.

---

## 2026-10-16

### 8. Real data from both old databases
```
The database we are currently using is new and its data is dummy.
We need to empty the complete database and get the data from somewhere else.
In the old CodeIgniter app we use the same code in two places, with two databases. We need to merge both databases.
If any user exists in both, let me know first.
```
```
Empty our database. We will use the itsmycontactinfo data + the data of the new users in this project.
```
- **Sources:** `itsmycontactinfo.sql` (base) and `old_site_customers.sql`. Both come from the same original database, so customers who are in both have the same ID and the same data.
- **Merge:** all data from itsmycontactinfo, plus the users who exist only in the old site database, with their profiles, business cards and notifications. IDs are kept, so printed QR codes keep working.
- **Conflicts:** where a user's password differs between the two databases, the old site's password is kept.
- **Excluded:** internal test accounts and their test tips, ratings and page visits.
- **Included:** every other user, including accounts that look like spam (they can be blocked later in the admin).
- **No demo data:** the database is rebuilt from the migrations, then filled only with the imported data and the website texts.

---

## 2026-10-19

### 9. Old images
```
The images will come. Keep their names from the database; we will upload the images folder directly to the server.
Don't delete any image from our database.
```
- **Images:** the database keeps the old image file names; no image is removed from it.
```
I will not upload the folder to the server; I will give it to you, put it where the images are kept now. Yes, we will use Forge.
```
- **Images in the repo:** the old `assets/images` folder is committed in the project (`backend/public/assets/images`) and reaches the server with each Forge deploy.

### 10. Accounts that share an email address
```
We will not change the tips.local functionality; we have to keep the same functionality.
The task was to move tips.local to Laravel + Next.js and change the design.
```
- **Same behaviour as the old app:** a few people have two accounts on one email address (one business card for Avantgarde and one for Authority). Both accounts are kept, each with its own card, photo, logo and link (for example `/vcards/lia85` and `/vcards/lia_auth01`).
- **Login:** as in the old app, the oldest account whose password matches is opened. Password recovery goes to the oldest account.
- **New accounts:** registering or changing to an email address that is already used is still not possible.

### 11. All data in seeders, for Forge
```
Add everything to the seeders, so we can take it to production with Forge.
```
- **Seeders:** `php artisan db:seed` now fills a new database with all real data (users, businesses, employees, spots, tips, business cards, settings, notifications, translations), with the same ids so printed QR codes keep working.
- **Customer data encrypted in git:** the customer data is committed as one encrypted file. The server needs the key `SEED_DATA_KEY` in its settings; without it, nobody who sees the code can read the data.
