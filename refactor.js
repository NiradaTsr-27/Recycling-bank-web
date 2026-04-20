const fs = require('fs');
const path = require('path');

const files = [
  "src/app/api/admin/waste-types/[id]/route.ts",
  "src/app/api/admin/waste-types/route.ts",
  "src/app/api/admin/route.ts",
  "src/app/api/admin/recycle-categories/[id]/route.ts",
  "src/app/api/admin/recycle-categories/route.ts",
  "src/app/api/admin/members/[id]/status/route.ts",
  "src/app/api/admin/members/[id]/route.ts",
  "src/app/api/admin/members/route.ts",
  "src/app/api/admin/news/route.ts",
  "src/app/api/admin/employees/[id]/route.ts",
  "src/app/api/admin/employees/route.ts",
];

const basePath = "d:/HobProject/recycling-bank-final";

const safeRequireStr = `
// ✅ กัน build พัง (สำคัญมาก)
const safeRequireAdmin = async () => {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
};
`;

const authCheckStr = `  const adminAuth = await safeRequireAdmin();

  if (!adminAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
`;

for (let file of files) {
  const fullPath = path.join(basePath, file);
  if (!fs.existsSync(fullPath)) {
    console.log("File not found: " + fullPath);
    continue;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');

  if (content.includes('safeRequireAdmin')) {
    console.log("Skipping " + fullPath + ", already refactored.");
    continue;
  }

  let lines = content.split('\n');
  let lastExportIdx = -1;
  for(let i=0; i<lines.length; i++) {
    if (lines[i].startsWith('export const ')) {
      lastExportIdx = i;
    }
  }

  if (lastExportIdx !== -1) {
    lines.splice(lastExportIdx + 1, 0, safeRequireStr);
  } else {
    let lastImportIdx = -1;
    for(let i=0; i<lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIdx = i;
      }
    }
    lines.splice(lastImportIdx + 1, 0, safeRequireStr);
  }

  content = lines.join('\n');

  // Regex to match function declaration and insert auth check inside
  const regex = /(export(?:\s+default)?\s+async\s+function\s+[A-Z]+\s*\([^)]*\)\s*\{)/g;
  
  content = content.replace(regex, (match) => {
    return match + "\n" + authCheckStr;
  });

  // Remove await requireAdmin(); lines
  content = content.replace(/[ \t]*await\s+requireAdmin\(\);\s*\n?/g, '');

  // Refactor catch blocks returning 401
  content = content.replace(/catch\s*\{\s*return\s+NextResponse\.json\(\s*\{\s*error:\s*"?Unauthorized"?\s*\}\s*,\s*\{\s*status:\s*401\s*\}\s*,?\s*\);?\s*\}/g, 
    'catch (error) {\n    console.error(error);\n    return NextResponse.json({ error: "Server error" }, { status: 500 });\n  }');

  content = content.replace(/catch\s*\(\s*error(?:\s*:\s*any)?\s*\)\s*\{\s*(?:console\.error\(error\);\s*)?return\s+NextResponse\.json\(\s*\{\s*error:\s*"?Unauthorized"?\s*\}\s*,\s*\{\s*status:\s*401\s*\}\s*,?\s*\);?\s*\}/g,
    'catch (error) {\n    console.error(error);\n    return NextResponse.json({ error: "Server error" }, { status: 500 });\n  }');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log("Refactored " + fullPath);
}
