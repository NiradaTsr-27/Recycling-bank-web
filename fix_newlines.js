const fs = require('fs');
const path = require('path');

const baseDir = "d:/HobProject/recycling-bank-final/src/app/api";

function fixFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;
    
    // Replace literal "\n" strings that are NOT part of regular strings
    // Wait, the fastest way is just replace `\nexport` with actual newline and export
    content = content.replace(/\\nexport/g, '\nexport');
    content = content.replace(/\\nconst safeRequireAdmin/g, '\nconst safeRequireAdmin');
    content = content.replace(/\\nconst safeRequireEmployee/g, '\nconst safeRequireEmployee');
    content = content.replace(/\\n  try \{/g, '\n  try {');
    content = content.replace(/\\n    return await/g, '\n    return await');
    content = content.replace(/\\n  \} catch \{/g, '\n  } catch {');
    content = content.replace(/\\n    return null;/g, '\n    return null;');
    content = content.replace(/\\n  \}/g, '\n  }');
    content = content.replace(/\\n\};/g, '\n};');
    content = content.replace(/\\n    console\.error/g, '\n    console.error');
    content = content.replace(/\\n    return NextResponse/g, '\n    return NextResponse');

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log("Fixed newlines in " + filepath);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file === 'route.ts') {
            fixFile(fullPath);
        }
    }
}

processDirectory(baseDir);
