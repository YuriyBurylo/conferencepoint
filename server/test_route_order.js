const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, 'routes/articlesRouter.js'), 'utf8');

assert.ok(
    source.indexOf("articlesRouter.get('/download-all'") < source.indexOf("articlesRouter.get('/:id'"),
    'download-all route must be registered before /:id'
);

console.log('route order tests passed');
