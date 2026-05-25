Hosting instructions — Render (backend) + Vercel (frontend) — or single Docker deploy

Overview
- This repo contains a React frontend (`client`) and Express backend (`server`).
- Two recommended options:
  1. Backend on Render (Docker or Node service) + Frontend on Vercel (static)
  2. Single Docker image (built with the provided `Dockerfile`) deployed to Render or any container host

What I prepared for you
- `Dockerfile` — multi-stage build that builds the client and packages it into the server image. The server will serve the SPA when `SERVE_CLIENT=true`.
- `.dockerignore` — excludes dev files from Docker context.
- Server static serving: `server/src/app.js` now serves `client/dist` when `SERVE_CLIENT=true`.

Credentials & inputs I will need from you to continue (pick one mode)

If you want me to finish deployment using Render + Vercel (safe, free tiers):
- Push this repo to GitHub and share the repository URL here.
- Create a MongoDB Atlas cluster and provide the connection URI (or set it yourself in Render). For security, do NOT paste the URI in public chat if you prefer — instead set it in Render's environment variables.
- Provide `JWT_SECRET` value (or set it yourself in Render's env vars).

If you want me to produce a Docker image and guide you to deploy it yourself:
- You only need to push the repo to GitHub (or provide private Docker registry credentials if you want me to push images).

Recommended steps you can perform now (quick deploy):
1. Push repo to GitHub.
2. Create MongoDB Atlas cluster; whitelist your host IP or 0.0.0.0/0 for testing.
3. Create accounts on Render (https://render.com) and Vercel (https://vercel.com).

Render (backend) using Dockerfile
- Connect GitHub repo in Render and create a new Web Service.
- Choose 'Docker' as the environment (it will use the `Dockerfile` at repo root).
- Set environment variables in Render dashboard (Environment > Environment Variables):
  - `MONGODB_URI` = <your atlas uri>
  - `JWT_SECRET` = <long-random-secret>
  - `PORT` = 5000 (optional)
- Deploy. Render will build the Docker image and run the server; it will serve the frontend as well.

Vercel (frontend) — optional alternative
- Connect GitHub repo in Vercel and set root directory to `/client`.
- Build command: `npm run build`
- Output directory: `dist`
- Add any environment variables your client needs (e.g. `VITE_API_URL`), if you will point API calls to the Render URL.

Domain & HTTPS
- On Vercel or Render, add your custom domain in the project settings; follow DNS instructions at your registrar.
- Both platforms provide automatic TLS via Let's Encrypt.

If you want me to continue and run deployments directly I will need either:
- An invite as a collaborator on your GitHub repo (recommended) and access to your Render/Vercel projects (invite me as a collaborator there), OR
- Service tokens (Render, Vercel) and GitHub Actions permissions so I can create a deploy pipeline. Note: do NOT paste secrets in public chat if you prefer — you can set env vars yourself in Render/Vercel.

What I can do next for you
- Create a `pm2` ecosystem file and a `Procfile` if you prefer process managers.
- Create a GitHub Actions workflow to build the client and push a Docker image to a container registry or trigger Render/Vercel deployments (will require repository access or tokens).

Which would you like next?
- I can generate a GitHub Actions workflow (requires repo URL or pushing a branch with the changes). If so, please confirm you want a Docker-based CI (push to Render) or Vercel-based CI (deploy client only).
- Or, I can provide step-by-step screenshots and exact env values to paste into Render and Vercel so you deploy yourself.
