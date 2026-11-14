// Static Pages has no runtime environment. Generate its PUBLIC deployment config
// from environment variables; never put a personal/admin API key here.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const token = process.env.POSTHOG_PROJECT_TOKEN;
const host = process.env.POSTHOG_HOST;
if (token && host) {
    fs.writeFileSync(path.join(root, 'analytics-config.json'), JSON.stringify({
        POSTHOG_PROJECT_TOKEN: token, POSTHOG_HOST: host
    }, null, 2) + '\n');
} else {
    console.warn('POSTHOG_PROJECT_TOKEN / POSTHOG_HOST missing: existing deployment config retained.');
}
fs.mkdirSync(path.join(root, 'vendor'), { recursive: true });
fs.copyFileSync(require.resolve('posthog-js/dist/array.no-external.js'), path.join(root, 'vendor/posthog.js'));
fs.copyFileSync(path.join(path.dirname(require.resolve('posthog-js/package.json')), 'LICENSE'), path.join(root, 'vendor/POSTHOG-LICENSE'));
