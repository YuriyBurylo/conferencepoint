const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

for (const file of [
    'docker-compose.yml',
    '.dockerignore',
    '.env.docker.example',
    'client/Dockerfile',
    'client/nginx.conf',
    'server/Dockerfile'
]) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
}

const compose = read('docker-compose.yml');
assert.match(compose, /services:\s*[\s\S]*db:/, 'compose must define db service');
assert.match(compose, /services:\s*[\s\S]*backend:/, 'compose must define backend service');
assert.match(compose, /services:\s*[\s\S]*frontend:/, 'compose must define frontend service');
assert.match(compose, /postgres:16-alpine/, 'db must use a pinned Postgres image');
assert.match(compose, /server\/database\.sql/, 'db must initialize from database.sql');
assert.match(compose, /condition: service_healthy/, 'backend must wait for healthy database');
assert.match(compose, /8080:80/, 'frontend must publish port 8080');
assert.match(compose, /CLIENT_ORIGINS:[^\n]*https:\/\/conferencepoint\.online/, 'backend must allow the production origin');
assert.match(compose, /SITE_URL:[^\n]*https:\/\/conferencepoint\.online/, 'backend must default to the production site URL');

const backendDockerfile = read('server/Dockerfile');
assert.match(backendDockerfile, /FROM node:24-alpine AS client-build/, 'backend image must build frontend assets for SEO injection');
assert.match(backendDockerfile, /npm ci --omit=dev/, 'backend image must install production dependencies');
assert.match(backendDockerfile, /npm run migrate && node index\.js/, 'backend must migrate before startup');

const frontendDockerfile = read('client/Dockerfile');
assert.match(frontendDockerfile, /FROM node:24-alpine AS build/, 'frontend image must build Vite app');
assert.match(frontendDockerfile, /FROM nginx:[\w.-]+-alpine/, 'frontend image must serve through nginx');

const nginx = read('client/nginx.conf');
assert.match(nginx, /proxy_pass http:\/\/backend:3000\/api\//, 'nginx must proxy API calls to backend');
assert.match(nginx, /try_files \$uri \$uri\/ \/index\.html;/, 'nginx must support SPA routes');

const dockerignore = read('.dockerignore');
assert.match(dockerignore, /server\/\.env/, 'docker build context must not include server .env');
assert.match(dockerignore, /\*\*\/node_modules/, 'docker build context must not include node_modules');

console.log('docker config tests passed');
