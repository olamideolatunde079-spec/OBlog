import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Resolve directory candidates (local development and Vercel serverless /var/task)
const candidates = [process.cwd(), __dirname];

// Explicit static directories for assets
candidates.forEach(dir => {
    const cssDir = path.join(dir, 'css');
    if (fs.existsSync(cssDir)) {
        app.use('/css', express.static(cssDir, { maxAge: '1d' }));
    }
    const jsDir = path.join(dir, 'js');
    if (fs.existsSync(jsDir)) {
        app.use('/js', express.static(jsDir, { maxAge: '1d' }));
    }
    const imgDir = path.join(dir, 'images');
    if (fs.existsSync(imgDir)) {
        app.use('/images', express.static(imgDir, { maxAge: '1d' }));
    }
    app.use(express.static(dir, {
        extensions: ['html', 'htm'],
        maxAge: '1h'
    }));
});

// Fallback direct static lookups for root script, style, and image requests
app.use((req, res, next) => {
    // e.g. /data.js -> js/data.js
    if (req.path.endsWith('.js')) {
        const base = path.basename(req.path);
        for (const dir of candidates) {
            const jsPath = path.join(dir, 'js', base);
            if (fs.existsSync(jsPath)) {
                res.type('application/javascript');
                return res.sendFile(jsPath);
            }
        }
    }
    // e.g. /style.css -> css/style.css
    if (req.path.endsWith('.css')) {
        const base = path.basename(req.path);
        for (const dir of candidates) {
            const cssPath = path.join(dir, 'css', base);
            if (fs.existsSync(cssPath)) {
                res.type('text/css');
                return res.sendFile(cssPath);
            }
        }
    }
    // e.g. /oblog-logo.png -> images/oblog-logo.png or root
    if (req.path.endsWith('.png') || req.path.endsWith('.svg') || req.path.endsWith('.ico')) {
        const base = path.basename(req.path);
        for (const dir of candidates) {
            const imgPath = path.join(dir, 'images', base);
            if (fs.existsSync(imgPath)) {
                return res.sendFile(imgPath);
            }
            const rootImgPath = path.join(dir, base);
            if (fs.existsSync(rootImgPath)) {
                return res.sendFile(rootImgPath);
            }
        }
    }
    next();
});

// Clean URL routing fallback (e.g. /explore -> /explore.html)
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
    }

    if (path.extname(req.path)) {
        return next();
    }

    const sanitizedPath = req.path.replace(/^\//, '');
    for (const dir of candidates) {
        const htmlFile = path.join(dir, `${sanitizedPath}.html`);
        if (fs.existsSync(htmlFile)) {
            return res.sendFile(htmlFile);
        }
    }

    // Default fallback to index.html
    for (const dir of candidates) {
        const indexPath = path.join(dir, 'index.html');
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }

    res.status(404).send('Not Found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

// Export default app for Vercel serverless function entry
export default app;

app.listen(PORT, HOST, () => {
    console.log(`Listening on http://${HOST}:${PORT}`);
    console.log(`Local: http://localhost:${PORT}/`);
    console.log(`OBlog server started on port ${PORT}`);
});
