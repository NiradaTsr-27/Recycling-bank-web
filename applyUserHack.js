const fs = require('fs');

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
  "src/app/api/admin/[id]/route.ts"
];

const basePath = "d:/HobProject/recycling-bank-final/";

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

files.forEach(f => {
  const p = basePath + f;
  if(fs.existsSync(p)){
    let c = fs.readFileSync(p, 'utf8');

    // Restore force-dynamic if missing
    if (!c.includes('export const dynamic = "force-dynamic";')) {
      c = c.replace(/import bcrypt from "bcryptjs";\n/, 'import bcrypt from "bcryptjs";\n\nexport const dynamic = "force-dynamic";\nexport const runtime = "nodejs";\nexport const revalidate = 0;\n');
    }

    // 1. Clean out my previous fix
    c = c.replace(/  try \{\s*await requireAdmin\(\);\s*\} catch \(error: any\) \{\s*if \(error\.message === "Unauthorized"\) \{\s*return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\s*\}\s*throw error;\s*\}/g, '');

    // 2. Clean out old safeRequireAdmin if it exists to prevent duplicates
    c = c.replace(/\/\/\s*✅ กัน build พัง \(สำคัญมาก\)\nconst safeRequireAdmin = async \(\) => \{\n  try \{\n    return await requireAdmin\(\);\n  \} catch \{\n    return null;\n  \}\n\};\n\n?/g, '');

    // 3. Clean out old authCheck if it exists
    c = c.replace(/  const adminAuth = await safeRequireAdmin\(\);\n\n  if \(!adminAuth\) \{\n    return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\n  \}\n?/g, '');

    // 4. Inject safeRequireAdmin after imports/exports
    let lines = c.split('\n');
    let insertIdx = -1;
    for(let i=0; i<lines.length; i++) {
      if (lines[i].startsWith('export const revalidate = 0;')) {
        insertIdx = i;
        break;
      }
    }
    if (insertIdx !== -1) {
      lines.splice(insertIdx + 1, 0, safeRequireStr);
    }
    c = lines.join('\n');

    // 5. Inject authCheckStr inside every export async function HTTP_METHOD
    const methodRegex = /(export(?:\s+default)?\s+async\s+function\s+[A-Z]+\s*\([^)]*\)\s*\{)/g;
    c = c.replace(methodRegex, (match) => {
      return match + "\n" + authCheckStr;
    });

    fs.writeFileSync(p, c);
    console.log("Restored user structure in " + p);
  }
});
