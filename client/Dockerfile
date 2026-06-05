FROM node:24-alpine AS build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client ./

ARG VITE_API_BASE_URL=/
ARG VITE_SITE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL

RUN npm run build

FROM nginx:1.29-alpine

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80
