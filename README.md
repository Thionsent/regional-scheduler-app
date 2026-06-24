# Regional Scheduler

Regional Scheduler is a mobile-first personal and collaborative calendar. A user can manage their agenda in the Expo app or create events from a WhatsApp message. Chama groups add invitations, shared meetings, and contribution tracking.

## Local development

1. Copy `backend/.env.example` to `backend/.env` and provide database URLs plus distinct 32+ character access-token, refresh-token, and OTP secrets.
2. Run `npm install` in both `backend` and `client`.
3. Run `npm run prisma:generate` and `npm run prisma:deploy` in `backend`.
4. Start the API with `npm run dev` in `backend`.
5. Copy `client/.env.example` to `client/.env`, setting a reachable API URL.
6. Start Expo with `npm start` in `client`.

For Android emulator use `http://10.0.2.2:4000`; on a physical device use your computer's LAN IP over HTTPS for production-like testing.

The architecture, schema, endpoint contract, and deployment plan are in [docs/architecture.md](docs/architecture.md).

## Railway deployment

The API includes a Dockerfile and `railway.json`. Create separate Railway services for staging and production, connect each to its Git branch, then configure the variables listed in `backend/.env.staging.example` or `backend/.env.production.example`. Use Supabase's transaction pooler URL for `DATABASE_URL` and its direct/session pooler URL for `DIRECT_URL`. Railway runs `prisma migrate deploy` before starting the API and uses `/ready` as its readiness probe.

Do not copy any `.env` file into Railway or Git. Add each secret in Railway's Variables panel and set `CORS_ORIGINS` to the exact deployed web origin(s).

The active staging API is `https://regional-scheduler-app-staging.up.railway.app`. To test it from Expo, copy `client/.env.staging.example` to `client/.env` and restart Expo with `npx expo start --clear`.
