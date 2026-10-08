import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

// Ensure clean public directory
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 1. Copy css, js, images directories into public/
copyDir(path.join(__dirname, 'css'), path.join(publicDir, 'css'));
copyDir(path.join(__dirname, 'js'), path.join(publicDir, 'js'));
copyDir(path.join(__dirname, 'images'), path.join(publicDir, 'images'));

// 2. Copy root files (HTML, favicons, logos) into public/
const rootEntries = fs.readdirSync(__dirname, { withFileTypes: true });
for (const entry of rootEntries) {
    if (!entry.isDirectory()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.html', '.png', '.svg', '.ico', '.jpg', '.jpeg', '.json'].includes(ext)) {
            fs.copyFileSync(path.join(__dirname, entry.name), path.join(publicDir, entry.name));
        }
    }
}

// 3. Mirror files for root-path requests (e.g. /data.js, /style.css, /oblog-logo.png)
if (fs.existsSync(path.join(__dirname, 'css', 'style.css'))) {
    fs.copyFileSync(path.join(__dirname, 'css', 'style.css'), path.join(publicDir, 'style.css'));
}
const jsFiles = ['data.js', 'auth.js', 'app.js', 'interactions.js', 'posts.js'];
for (const file of jsFiles) {
    const src = path.join(__dirname, 'js', file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(publicDir, file));
    }
}
if (fs.existsSync(path.join(__dirname, 'images', 'oblog-logo.png'))) {
    fs.copyFileSync(path.join(__dirname, 'images', 'oblog-logo.png'), path.join(publicDir, 'oblog-logo.png'));
    fs.copyFileSync(path.join(__dirname, 'images', 'oblog-logo.png'), path.join(publicDir, 'OBloglogo.png'));
}

console.log('Static public/ build completed successfully for Vercel CDN!');
