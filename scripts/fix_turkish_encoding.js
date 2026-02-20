const fs = require('fs');
const path = require('path');

const root = process.cwd();
const scanDirs = ["src", "public", "app"];
const ignoreDirs = new Set(["node_modules", ".git", ".next", "build", "dist"]);
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".html", ".txt", ".css", ".scss", ".less"]);

const replacements = {
  'Ã§': 'ç',
  'Ã‡': 'Ç',
  'Ã¼': 'ü',
  'Ãœ': 'Ü',
  'Ã¶': 'ö',
  'Ã–': 'Ö',
  'ÅŸ': 'ş',
  'Åž': 'Ş',
  'Ä±': 'ı',
  'ÄŸ': 'ğ',
  'Äž': 'Ğ',
  'Ä°': 'İ',
  'Ã¼': 'ü',
  'Ã©': 'é',
  'Ã ': 'à',
};

const keys = Object.keys(replacements).map(k => escapeRegExp(k));
const regex = new RegExp(keys.join('|'), 'g');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function walk(dir, cb) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of list) {
    const name = dirent.name;
    if (ignoreDirs.has(name)) continue;
    const full = path.join(dir, name);
    if (dirent.isDirectory()) {
      walk(full, cb);
    } else if (dirent.isFile()) {
      cb(full);
    }
  }
}

let changedFiles = [];

for (const base of scanDirs) {
  const dir = path.join(root, base);
  if (!fs.existsSync(dir)) continue;
  walk(dir, (file) => {
    const ext = path.extname(file).toLowerCase();
    if (!exts.has(ext)) return;
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (!regex.test(content)) return;
      const newContent = content.replace(regex, (m) => replacements[m] || m);
      if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedFiles.push(path.relative(root, file));
      }
    } catch (err) {
      console.error('Failed to process', file, err.message);
    }
  });
}

console.log('Fix encoding run finished.');
console.log('Files changed:', changedFiles.length);
for (const f of changedFiles) console.log(' -', f);

if (changedFiles.length === 0) {
  console.log('No replacements were necessary.');
} else {
  console.log('Replacements applied. Consider running your build to verify.');
}

process.exit(0);
