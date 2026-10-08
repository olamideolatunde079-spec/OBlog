import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Serve static assets from root directory
app.use(express.static(__dirname, {
    extensions: ['html', 'htm']
}));

// Clean URL routing fallback (e.g. /explore -> /explore.html)
app.use((req, res, next) => {
    // Only handle GET / HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
    }

    // If request contains a file extension that wasn't found, 404
    if (path.extname(req.path)) {
        return next();
    }

    const sanitizedPath = req.path.replace(/^\//, '');
    const htmlFile = path.join(__dirname, `${sanitizedPath}.html`);

    if (fs.existsSync(htmlFile)) {
        return res.sendFile(htmlFile);
    }

    // Default fallback to index.html
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

app.listen(PORT, HOST, () => {
    console.log(`Listening on http://${HOST}:${PORT}`);
    console.log(`Local: http://localhost:${PORT}/`);
    console.log(`OBlog server started on port ${PORT}`);
});
