require('dotenv').config();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const router = require('./routes/index');
const express = require('express');
const db = require('./db');
const {
  MAX_JSON_BODY,
  MAX_UPLOAD_BYTES,
  createCorsOptions,
  getJwtSecret,
  securityHeaders
} = require('./utils/security');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_DIST_DIR = process.env.CLIENT_DIST_DIR || path.resolve(__dirname, '../client/dist');
const CLIENT_INDEX_PATH = path.join(CLIENT_DIST_DIR, 'index.html');

const {
  buildBreadcrumbJsonLd,
  buildConferenceItemListJsonLd,
  buildConferencePageSeo,
  buildOrganizationJsonLd,
  buildRobotsTxt,
  buildSitemapXml,
  buildWebsiteJsonLd,
  getPublicRouteSeo,
  injectSeoIntoHtml,
  normalizeCanonicalPath
} = require('./utils/seo');

const toLastmod = (timing) => {
  if (!timing) return undefined;
  const date = timing instanceof Date ? timing : new Date(timing);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
};

const buildStaticRouteJsonLd = async (route) => {
  if (route.path === '/') {
    return [buildOrganizationJsonLd(), buildWebsiteJsonLd()];
  }

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: 'Головна', path: '/' },
    { name: route.title, path: route.path }
  ]);

  if (route.path === '/newconferences') {
    const conferences = await db.query('SELECT conference_id, title FROM new_conferences ORDER BY timing DESC');
    return [
      breadcrumbs,
      buildConferenceItemListJsonLd({ conferences: conferences.rows, pathPrefix: '/newconferences' })
    ];
  }

  if (route.path === '/pastconferences') {
    const conferences = await db.query('SELECT conference_id, title FROM archive_conferences WHERE is_published = true ORDER BY timing DESC');
    return [
      breadcrumbs,
      buildConferenceItemListJsonLd({ conferences: conferences.rows, pathPrefix: '/pastconferences' })
    ];
  }

  return breadcrumbs;
};

const resolveSeoForPath = async (pathname) => {
  const canonicalPath = normalizeCanonicalPath(pathname);
  const staticRoute = getPublicRouteSeo(canonicalPath);
  if (staticRoute) {
    return {
      ...staticRoute,
      jsonLd: await buildStaticRouteJsonLd(staticRoute)
    };
  }

  const newConferenceMatch = canonicalPath.match(/^\/newconferences\/(\d+)$/);
  if (newConferenceMatch) {
    const conference = await db.query(
      'SELECT conference_id, conference_status, title, venue, country, timing FROM new_conferences WHERE conference_id = $1',
      [newConferenceMatch[1]]
    );
    if (!conference.rows[0]) return null;
    return buildConferencePageSeo({
      conference: conference.rows[0],
      path: canonicalPath,
      sectionName: 'Актуальні конференції',
      sectionPath: '/newconferences'
    });
  }

  const archiveConferenceMatch = canonicalPath.match(/^\/pastconferences\/(\d+)$/);
  if (archiveConferenceMatch) {
    const conference = await db.query(
      'SELECT conference_id, conference_status, title, venue, country, timing FROM archive_conferences WHERE conference_id = $1 AND is_published = true',
      [archiveConferenceMatch[1]]
    );
    if (!conference.rows[0]) return null;
    return buildConferencePageSeo({
      conference: conference.rows[0],
      path: canonicalPath,
      sectionName: 'Архів конференцій',
      sectionPath: '/pastconferences',
      eventStatus: 'https://schema.org/EventCompleted'
    });
  }

  return null;
};

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(buildRobotsTxt());
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const [newConferences, archiveConferences] = await Promise.all([
      db.query('SELECT conference_id, timing FROM new_conferences ORDER BY timing DESC'),
      db.query('SELECT conference_id, timing FROM archive_conferences WHERE is_published = true ORDER BY timing DESC')
    ]);

    const conferenceRoutes = [
      ...newConferences.rows.map(conference => ({
        path: `/newconferences/${conference.conference_id}`,
        lastmod: toLastmod(conference.timing),
        changefreq: 'weekly',
        priority: '0.8'
      })),
      ...archiveConferences.rows.map(conference => ({
        path: `/pastconferences/${conference.conference_id}`,
        lastmod: toLastmod(conference.timing),
        changefreq: 'monthly',
        priority: '0.7'
      }))
    ];

    res.type('application/xml').send(buildSitemapXml(conferenceRoutes));
  } catch (error) {
    console.error('Error generating sitemap:', error.message);
    res.type('application/xml').send(buildSitemapXml());
  }
});

app.use(securityHeaders);
app.use(cors(createCorsOptions()));
app.use(express.json({ limit: MAX_JSON_BODY }));
app.use(express.static(path.resolve(__dirname, 'static')));
app.get(/^\/(?:newconferences(?:\/\d+)?|pastconferences(?:\/\d+)?|requirements|fees)?\/?$/, async (req, res, next) => {
  if (!fs.existsSync(CLIENT_INDEX_PATH)) {
    return next();
  }

  try {
    const seo = await resolveSeoForPath(req.path);
    if (!seo) return next();

    const html = await fs.promises.readFile(CLIENT_INDEX_PATH, 'utf8');
    return res.type('html').send(injectSeoIntoHtml(html, seo));
  } catch (error) {
    return next(error);
  }
});
if (fs.existsSync(CLIENT_DIST_DIR)) {
  app.use(express.static(CLIENT_DIST_DIR));
}
app.use(fileUpload({
  defCharset: 'utf8',
  defParamCharset: 'utf8',
  limits: { fileSize: MAX_UPLOAD_BYTES },
  abortOnLimit: true,
  responseOnLimit: 'Файл перевищує дозволений розмір'
}));
app.use('/api', router);


const start = async () => {
  try {
    getJwtSecret();
    await app.listen(PORT);
    console.log(`Server started at port: ${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
