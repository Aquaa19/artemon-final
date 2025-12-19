// Filename: tree.js
const fs = require('fs');
const path = require('path');

const IGNORE_LIST = ['node_modules', '.git', 'dist', '.DS_Store'];

function generateTree(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    
    // Sort to show directories first, then files
    const sortedFiles = files.filter(file => !IGNORE_LIST.includes(file)).sort((a, b) => {
        const aPath = path.join(dir, a);
        const bPath = path.join(dir, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
    });

    sortedFiles.forEach((file, index) => {
        const filePath = path.join(dir, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        const isLast = index === sortedFiles.length - 1;
        
        const marker = isLast ? '└── ' : '├── ';
        console.log(`${prefix}${marker}${file}`);

        if (isDirectory) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            generateTree(filePath, newPrefix);
        }
    });
}

// Get directory from command line arguments or use current directory
const targetDir = process.argv[2] || '.';
const absolutePath = path.resolve(targetDir);

console.log(`\n📁 Project Tree: ${path.basename(absolutePath)}`);
console.log('=' .repeat(30));
generateTree(absolutePath);
console.log('=' .repeat(30) + '\n');