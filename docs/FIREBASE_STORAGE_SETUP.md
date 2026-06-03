# Storing uploaded media in Firebase Storage

By default, images uploaded through the admin are saved on the server's local
disk. On Render's free tier that disk is **ephemeral** — files disappear on every
redeploy/restart. To keep uploads permanently, store them in **Firebase Storage**
(which is Google Cloud Storage under the hood, so Django uses
`django-storages[google]`).

> Imported news images are NOT affected — they are hot-linked from the publishers
> (`image_url`), so they are never uploaded anywhere. This only changes where
> **admin-uploaded** article images go.

The code is already wired up — you only need to do the setup below and add two
environment variables on Render.

---

## Step 1 — Create a Firebase project & Storage bucket
1. Go to <https://console.firebase.google.com> → **Add project** (or pick one).
2. In the left menu open **Build → Storage → Get started** (accept defaults).
3. Copy the **bucket name** shown at the top, e.g.
   `your-project-id.appspot.com` or `your-project-id.firebasestorage.app`.

## Step 2 — Create a service account key (credentials)
1. Firebase Console → **⚙ Project settings → Service accounts**.
2. Click **Generate new private key** → confirm → a **JSON file** downloads.
3. **Keep it secret. Never commit it to GitHub.**

## Step 3 — Give the service account Storage permission
1. Go to <https://console.cloud.google.com> (same Google project).
2. **IAM & Admin → IAM** → find your service account (the email from the JSON).
3. **Edit → Add role → "Storage Object Admin"** → Save.

## Step 4 — Make the bucket's files publicly readable
News images need public URLs that don't expire. With uniform bucket-level access
(Firebase default) you make the **bucket** public:
1. Cloud Console → **Cloud Storage → Buckets →** your bucket → **Permissions**.
2. **Grant access** → New principals: `allUsers` → Role: **Storage Object Viewer**
   → Save → confirm "Allow public access".

(Our settings already use `querystring_auth=False`, so Django serves plain
`https://storage.googleapis.com/<bucket>/<file>` URLs once the bucket is public.)

## Step 5 — Add the environment variables on Render
Render Dashboard → **hot-news-backend** service → **Environment** → add:

```text
GS_BUCKET_NAME      = your-project-id.firebasestorage.app
GS_CREDENTIALS_JSON = { ...paste the ENTIRE service-account JSON on one line... }
```

Optional:
```text
GS_LOCATION = media     # store everything under a "media/" folder in the bucket
```

Save → Render redeploys automatically.

## Step 6 — Verify
1. After deploy, open the **admin** → create/edit an article and **upload an image**.
2. Open the article on the site. The image should load.
3. Right-click the image → **Copy image address** — the URL should start with
   `https://storage.googleapis.com/your-bucket/...` (i.e. it's served from Firebase).

---

## How it works in code (already implemented)
`backend/backend/settings.py`:

```python
GS_BUCKET_NAME = os.environ.get("GS_BUCKET_NAME")
if GS_BUCKET_NAME:                       # only switches on when the env var is set
    storage_options = {
        "bucket_name": GS_BUCKET_NAME,
        "querystring_auth": False,       # public, non-expiring URLs
        "location": os.environ.get("GS_LOCATION", ""),
    }
    credentials_json = os.environ.get("GS_CREDENTIALS_JSON")
    if credentials_json:
        storage_options["credentials"] = service_account.Credentials \
            .from_service_account_info(json.loads(credentials_json))
    STORAGES["default"] = {
        "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
        "OPTIONS": storage_options,
    }
```

- **No `GS_BUCKET_NAME`** → Django uses local-disk storage (current behaviour).
- **`GS_BUCKET_NAME` set** → all model `ImageField`/`FileField` uploads go to
  Firebase/GCS automatically. No model or view changes needed.

## Local development (optional)
You usually don't need Firebase locally. If you want to test it:
```bash
pip install "django-storages[google]"
# PowerShell (one session):
$env:GS_BUCKET_NAME = "your-project-id.firebasestorage.app"
$env:GS_CREDENTIALS_JSON = (Get-Content path\to\service-account.json -Raw)
python manage.py runserver
```

## Security reminders
- The service-account JSON is a **secret** — only paste it into Render env vars,
  never into git.
- Making the bucket public exposes **uploaded files** to anyone with the URL
  (expected for public news images). Do not upload private files to this bucket.
