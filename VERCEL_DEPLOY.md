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

If the site loads but sign-in fails:

1. Confirm `MONGODB_URI` and `JWT_SECRET` are set for **Production** in Vercel.
2. In MongoDB Atlas, allow access from anywhere (`0.0.0.0/0`) so Vercel serverless functions can connect.
3. Open `/api/health` on your deployment. If it returns 500, check Vercel function logs for database or env errors.
4. Default seeded credentials: username `admin`, password `<seeded-password>`.

## Important note

Fully zero-maintenance hosting is not realistic because Vercel and MongoDB still require:
- account access
- environment variable management
- occasional dependency updates
- database credential rotation if needed

The deployment itself, however, is fully automated after the initial setup.
