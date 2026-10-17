import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const pageTitles = {
  'about.html': 'About | David KWIZERA Portfolio',
  'background.html': 'Background | David KWIZERA Portfolio',
  'skills.html': 'Skills | David KWIZERA Portfolio',
  'hobbies.html': 'Hobbies | David KWIZERA Portfolio',
  'document.html': 'Documents | David KWIZERA Portfolio',
  'contact.html': 'Contact | David KWIZERA Portfolio',
  'admin-login.html': 'Admin Login | Kade Portfolio',
  'admin.html': 'Portfolio Admin | Kade',
  'admin-downloads.html': 'Downloads | Portfolio Admin',
  'admin-homepage.html': 'Landing Page | Portfolio Admin',
  'admin-documents.html': 'Documents | Portfolio Admin',
  'admin-profile.html': 'My Profile | Portfolio Admin'
};

function reactPageShell() {
  return {
    name: 'portfolio-react-page-shells',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestUrl = request.url || '/';
        const fileName = path.basename(new URL(requestUrl, 'http://localhost').pathname);
        if (!pageTitles[fileName]) return next();

        try {
          const template = readFileSync(path.join(frontendRoot, 'index.html'), 'utf8');
          const html = await server.transformIndexHtml(requestUrl, template);
          response.statusCode = 200;
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(_html, context) {
        const fileName = path.basename(context.filename || context.path || 'index.html');
        const title = pageTitles[fileName];
        if (!title) return undefined;
        const admin = fileName.startsWith('admin');
        const noIndex = admin ? '<meta name="robots" content="noindex, nofollow">' : '';
        const description = fileName === 'index.html'
          ? "<meta name=\"description\" content=\"Explore David KWIZERA's portfolio, background, skills, projects and professional documents.\">"
          : '';
        return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${noIndex}
    ${description}
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/react/main.jsx"></script>
  </body>
</html>`;
      }
    },
    closeBundle() {
      const outputDirectory = path.join(frontendRoot, 'dist');
      const template = readFileSync(path.join(outputDirectory, 'index.html'), 'utf8');
      for (const [fileName, title] of Object.entries(pageTitles)) {
        const isAdmin = fileName.startsWith('admin');
        const html = template
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace('</head>', `${isAdmin ? '<meta name="robots" content="noindex, nofollow">' : ''}\n  </head>`);
        const pageDirectory = path.join(outputDirectory, 'src');
        mkdirSync(pageDirectory, { recursive: true });
        writeFileSync(path.join(pageDirectory, fileName), html);
        writeFileSync(path.join(outputDirectory, fileName), html);
      }
    }
  };
}

export default defineConfig({
  plugins: [reactPageShell()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}']
  },
  publicDir: false,
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000'
    }
  },
  build: {
    rollupOptions: { input: path.join(frontendRoot, 'index.html') }
  }
});
