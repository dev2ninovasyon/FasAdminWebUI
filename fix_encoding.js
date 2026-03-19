const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', '(AdminUI)', 'components', 'Layout', 'Vertical', 'Sidebar', 'MenuItems.ts');

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    { from: /MÜÃ…ÂžTERİ/g, to: 'MÜŞTERİ' },
    { from: /DİÃ„ÂžER İÃ…ÂžLEMLER/g, to: 'DİĞER İŞLEMLER' },
    { from: /Ã…Âžirket/g, to: 'Şirket' },
    { from: /Ã…Âžubeler/g, to: 'Şubeler' },
    { from: /SÖZLEÃ…ÂžME/g, to: 'SÖZLEŞME' },
    { from: /MÜÃ…ÂžTERİ BELGELERİ/g, to: 'MÜŞTERİ BELGELERİ' },
    { from: /DÖNÜÃ…ÂžÜM/g, to: 'DÖNÜŞÜM' },
    { from: /Ã…ÂžikÃƒÂ¢yet/g, to: 'Şikâyet' },
    { from: /ÃƒÂ§/g, to: 'ç' },
    { from: /Ã¶/g, to: 'ö' },
    { from: /Ã¼/g, to: 'ü' },
    { from: /Ã„Â±/g, to: 'ı' },
    { from: /Ã„ÂŸ/g, to: 'ğ' },
    { from: /Ã…ÂŸ/g, to: 'ş' },
    { from: /Ã‡/g, to: 'Ç' },
    { from: /Ã–/g, to: 'Ö' },
    { from: /Ãœ/g, to: 'Ü' },
    { from: /Ã„Â°/g, to: 'İ' },
    { from: /Ã„Âž/g, to: 'Ğ' }
];

replacements.forEach(r => {
    content = content.replace(r.from, r.to);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Turkish characters in MenuItems.ts');
