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

files.forEach(f => {
  const p = 'd:/HobProject/recycling-bank-final/' + f;
  if(fs.existsSync(p)){
    let c = fs.readFileSync(p, 'utf8');
    
    // Remove the safeRequireAdmin block completely
    c = c.replace(/\/\/\s*✅ กัน build พัง[\s\S]*?const safeRequireAdmin = async \(\) => \{[\s\S]*?return null;\n  \}\n\};\n?/g, '');
    
    // Replace safeRequireAdmin with requireAdmin
    c = c.replace(/await safeRequireAdmin\(\)/g, 'await requireAdmin()');
    
    fs.writeFileSync(p, c);
    console.log("Fixed " + p);
  }
});
