# TIQS

Tipping and review platform: a rewrite of the CodeIgniter 3 app (`/var/www/html/tips`).

| Part | Stack | Folder | Local URL |
|---|---|---|---|
| API | Laravel 13 · PHP 8.5 · Sanctum | `backend/` | http://localhost:8000 |
| Web app (all pages, including admin) | Next.js 16 · React 19 · Tailwind 4 · TypeScript | `frontend/` | http://localhost:3000 |
| Database | MySQL 8.0 locally (8.4/9.7 LTS in production) | | `tiqs_upgrade` |

Deployment: Laravel Forge. The frontend runs on the main domain and the API on `api.` subdomain.

## Local setup

The server's default `php` is 8.1. `bin/` holds wrappers that run PHP 8.5 and Composer 2.10, so put it first on your PATH:

```bash
export PATH="$PWD/bin:$PATH"
```

**Backend**
```bash
cd backend
composer install
cp .env.example .env && php artisan key:generate   # then set the DB_* values
php artisan migrate --seed
php artisan serve
```

**Frontend** (Node 26 is pinned in `.nvmrc`)
```bash
cd frontend
nvm use
npm install
npm run dev
```

**Everything at once:** after the installs above, `bin/dev` starts the API (port 8000), a queue worker for emails and text messages, and the website (port 3000). `bin/dev seed` first resets the database with demo data, `bin/dev start` runs a production build, and `bin/dev stop` stops it all. Logs go to `backend/storage/logs/dev-*.log`.

## Languages

The site speaks the old app's 80+ languages; English texts are the translation keys. Pick a language with the menu on any page (old `/swicthlang/nl` links still work). Arabic, Hebrew, Persian, Urdu, Pashto, Sindhi and Uyghur are shown right to left.

- After changing texts in the frontend, run `npm run texts` (in `frontend/`) and commit `backend/database/seeders/data/ui-texts.json`.
- On every deploy run `php artisan tiqs:sync-ui-texts`: it adds new texts and the bundled Dutch translations without touching texts admins edited.
- Admins translate under Admin › Translations. With `GOOGLE_TRANSLATE_KEY` set, missing translations are filled in automatically in the background, as the old app did.

## Databases

| Database | Purpose |
|---|---|
| `tiqs_upgrade` | The new app's database, built with migrations and seeders |
| `tiqs_legacy` | Copy of the old CodeIgniter data. Only ever read. Locally the merged itsmycontactinfo + old site data is in `tiqs_legacy_merged` (`LEGACY_DB_DATABASE=tiqs_legacy_merged`) |
| `tiqs_upgrade_test` / `tiqs_legacy_test` | Used by the test suite (`php artisan test`) |

**Seeding (Forge):** `php artisan migrate --force && php artisan db:seed --force` fills a new database with all real data: the customer data from `database/seeders/data/customer-data.enc` (same ids, so printed QR codes keep working), the app settings and the translations. The file is encrypted: set `SEED_DATA_KEY` on the server to the value in the `backend/.env` that exported it. Seeding never touches a database that already has users.

**Updating the seed files:** after the data changed here (for example a new import), run `php artisan tiqs:export-seed-data` and commit `customer-data.enc` and `translations.json`.

**Demo data** (local only): `php artisan migrate:fresh --seed` without `SEED_DATA_KEY` creates `admin@`, `business@`, `waiter@` and `legacy@tiqs.test`. Every password is `password`. Demo accounts are never added to a database with customers.

**Real data:** `php artisan tiqs:import-legacy --fresh --legacy-path=/var/www/html/tips` rebuilds the database and copies everything from `tiqs_legacy`. It ends with a per-table summary and a list of every data problem it fixed or skipped. It refuses to run on a database that already has users unless `--fresh` is given.

**Old photos:** the database keeps the old image file names. The old app's `assets/images` folder is committed at `backend/public/assets/images` and deployed with the code (Forge); set `LEGACY_ASSETS_URL=https://<api domain>/assets`. `php artisan tiqs:import-images` would instead convert them to WebP and rename them in the database; it is not used.

Legacy passwords are unsalted md5. They're imported as-is and replaced with a modern hash the first time each user logs in.

## Optional services

Each is off until its settings are filled in `backend/.env`; the site works without them.

| Service | Settings | What it does |
|---|---|---|
| Pay.nl | `PAYNL_*` | Tip and plan payments |
| SMS | `SMS_*` | Verification codes and reset links by text message |
| Google / Apple Wallet | `GOOGLE_WALLET_*`, `APPLE_WALLET_*` | Business card wallet passes |
| Google Translate | `GOOGLE_TRANSLATE_KEY` | Fills in missing translations |
| Sumsub | `SUMSUB_*` (webhook: `POST /api/v1/webhooks/sumsub`) | Identity verification |
| Web Push | `WEBPUSH_*` (make keys with `php artisan tiqs:webpush-keys`) | Browser push notifications |
