# Vercel-only deployment

This project can be deployed entirely on Vercel:
- Frontend: React app from `client`
- Backend: Serverless API from `api/index.js`
- Database: MongoDB Atlas

## One-time setup required from you

1. Create a Vercel account and connect this GitHub repository.
2. Create a MongoDB Atlas cluster and get the connection string.
3. Add these environment variables in Vercel:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy.

## Paths in the repo that matter

- `vercel.json` - Vercel build and routing config
- `api/index.js` - serverless backend entrypoint
- `server/src/app.js` - Express app
- `client/` - React frontend
- `package.json` - workspace scripts

## Vercel project settings

- Project root: repository root
- Build command: `npm run build --workspace client`
- Output directory: `client/dist`
- Install command: leave default or use `npm install`

## After deploy

Your app will automatically redeploy on every push to `main`.

Test the API after deploy:

- `https://<your-vercel-domain>/api/health` should return `{"status":"ok"}`
- Sign in with the seeded admin account (see README)

## Login troubleshooting

If the site loads but sign-in fails or you see **504 FUNCTION_INVOCATION_TIMEOUT**:

1. Confirm `MONGODB_URI` and `JWT_SECRET` are set for **Production** in Vercel (Settings → Environment Variables → redeploy after saving).
2. Use a **MongoDB Atlas** connection string (`mongodb+srv://...`), not `mongodb://127.0.0.1`.
3. In Atlas → **Network Access**, add `0.0.0.0/0` (allow from anywhere) so Vercel can connect.
4. In Atlas → **Database Access**, ensure the database user password matches the URI (special characters must be URL-encoded).
5. Test without the database: `https://<your-app>/api/health` should return `{"status":"ok"}` immediately.
6. If health works but login returns 503, the API cannot reach MongoDB — fix the URI or Atlas network rules, then redeploy.
7. Default seeded credentials: username `admin`, password `<seeded-password>`.

## Important note

Fully zero-maintenance hosting is not realistic because Vercel and MongoDB still require:
- account access
- environment variable management
- occasional dependency updates
- database credential rotation if needed

The deployment itself, however, is fully automated after the initial setup.
