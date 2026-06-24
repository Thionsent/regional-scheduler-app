FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
RUN DIRECT_URL=postgresql://build:build@localhost:5432/build npx prisma generate
EXPOSE 4000
CMD ["sh", "-c", "npm run prisma:deploy && npm start"]
