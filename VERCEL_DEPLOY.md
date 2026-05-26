# Deploy on Vercel + MongoDB Atlas

## 1. MongoDB Atlas setup

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → Add user (e.g. `libraryadmin`) with a password. Save the password.
3. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).  
   Required so Vercel serverless functions can connect.
4. **Database** → **Connect** → **Drivers** → copy the connection string.  
   Example shape:
   ```
   mongodb+srv://libraryadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/library_management?retryWrites=true&w=majority
   ```
5. Replace `YOUR_PASSWORD` in the URI. If the password contains `@`, `#`, `/`, etc., [URL-encode](https://www.w3schools.com/tags/ref_urlencode.asp) it (`@` → `%40`).
6. Ensure the cluster is **not paused** (Atlas pauses inactive free clusters).

## 2. Vercel environment variables

Vercel project → **Settings** → **Environment Variables** → add for **Production** (and Preview if needed):

| Name | Value |
|------|--------|
| `MONGODB_URI` | Your full Atlas `mongodb+srv://...` string |
| `JWT_SECRET` | Long random string (32+ chars). Generate: `openssl rand -base64 48` |
| `NODE_ENV` | `production` (optional) |

Do **not** use `mongodb://127.0.0.1` on Vercel.

After saving variables, go to **Deployments** → **⋯** → **Redeploy** (required).

## 3. Deploy from GitHub

- Root directory: repository root
- Build: automatic from `vercel.json`
- Push to `main` to trigger deploy

## 4. Test after deploy

Replace `YOUR_APP` with your Vercel hostname (e.g. `bhaskarbookscorner.vercel.app`).

| URL | Expected |
|-----|----------|
| `https://YOUR_APP/api/health` | `{"status":"ok","service":"library-api"}` — instant, no database |
| `https://YOUR_APP/api/ready` | `{"status":"ready","database":"connected"}` — tests MongoDB |
| Login page | `BhaskarAdmin` / `<seeded-password>` |

If **health** works but **ready** returns 503, the problem is MongoDB (URI, password, or Atlas network access).

If **ready** works but login fails, check Vercel function logs for auth errors.

## 5. Default login

| Role | Username | Password |
|------|----------|----------|
| Admin | `BhaskarAdmin` | `<seeded-password>` |
| User | `user` | `<seeded-password>` |

## 6. Common errors

| Symptom | Fix |
|---------|-----|
| 504 timeout on login | `MONGODB_URI` wrong or Atlas blocks Vercel → fix URI, allow `0.0.0.0/0`, redeploy |
| 503 “MongoDB connection timed out” | Same as above |
| 500 “JWT_SECRET is not set” | Add `JWT_SECRET` in Vercel, redeploy |
| 401 invalid password | Use `BhaskarAdmin` / `<seeded-password>` after `/api/ready` succeeds |
