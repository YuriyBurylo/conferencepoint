FROM node:24-alpine AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client ./

ARG VITE_API_BASE_URL=/
ARG VITE_SITE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL

RUN npm run build

FROM node:24-alpine

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=3000
ENV CLIENT_DIST_DIR=/app/client-dist

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server ./
COPY --from=client-build /app/client/dist /app/client-dist

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate && node index.js"]
