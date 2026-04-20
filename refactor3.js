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

const targetPattern = /  const adminAuth = await requireAdmin\(\);\s*\n\s*if \(!adminAuth\) \{\s*return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\s*\}/g;

const replacement = `  try {
    await requireAdmin();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }`;

files.forEach(f => {
  const p = 'd:/HobProject/recycling-bank-final/' + f;
  if(fs.existsSync(p)){
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(targetPattern, replacement);
    fs.writeFileSync(p, c);
    console.log("Fixed " + p);
  }
});
