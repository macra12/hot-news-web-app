# Deploy to Render + Firebase Storage

Use Render native services first. You do not need Docker for this project.

## 1. Push to GitHub

```bash
git add .
git commit -m "Prepare app for Render deployment"
git push origin main
```

If your branch is not `main`, push your current branch and select it in Render.

## 2. Create Firebase Storage

Only do this if you want uploaded media files stored outside Render.

1. Open Firebase Console and create/select your project.
2. Enable Storage.
3. Copy your bucket name, usually like `your-project-id.appspot.com` or `your-project-id.firebasestorage.app`.
4. Go to Project settings -> Service accounts -> Generate new private key.
5. Keep the JSON private. Never commit it to GitHub.

## 3. Deploy from Render Blueprint

1. Open Render Dashboard.
2. Click New -> Blueprint.
3. Connect your GitHub repo.
4. Render will read `render.yaml`.
5. It will create:
   - `hot-news-backend` for Django API
   - `hot-news-frontend` for Next.js
   - `hot-news-db` for PostgreSQL
   - `hot-news-importer` worker for fresh news imports

Important: the importer worker uses a paid `starter` plan because Render does not run workers on the free web plan. If you do not want that cost, delete the `hot-news-importer` service from `render.yaml` before deploying. Without the worker, your stored DB news can become old.

## 4. Fill secret environment variables

Render will ask for variables marked `sync: false`.

Backend and importer:

```text
NEWSDATA_KEY=your_newsdata_api_key
GS_BUCKET_NAME=your_firebase_storage_bucket
GS_CREDENTIALS_JSON=paste_the_full_service_account_json
```

Frontend:

```text
NEWSDATA_KEY=your_newsdata_api_key
```

If you do not use Firebase Storage yet, leave `GS_BUCKET_NAME` and `GS_CREDENTIALS_JSON` empty.

## 5. If you rename services

If you change Render service names, update these values:

```text
Backend DJANGO_ALLOWED_HOSTS=your-backend.onrender.com
Backend DJANGO_CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
Backend DJANGO_CSRF_TRUSTED_ORIGINS=https://your-backend.onrender.com,https://your-frontend.onrender.com
Frontend NEXT_PUBLIC_API_BASE=https://your-backend.onrender.com/api
```

## 6. Check the deploy

After Render finishes:

1. Open `https://hot-news-backend.onrender.com/api/news/latest/`
2. Open `https://hot-news-frontend.onrender.com`
3. Check the importer logs. You should see `News importer started`.

## 7. Create an admin account

Open the backend service shell on Render and run:

```bash
python manage.py create_superadmin --username admin --email admin@example.com --password "change-this-password"
```

Then log in through your admin page.

## Quick answer

- Use GitHub for source code.
- Use Render for frontend, backend, PostgreSQL, and the importer worker.
- Use Firebase Storage only for uploaded media files.
- Do not use Docker first; native Render deploy is simpler here.
