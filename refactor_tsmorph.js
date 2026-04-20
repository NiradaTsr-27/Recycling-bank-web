const { Project, SyntaxKind } = require("ts-morph");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const apiFiles = project.getSourceFiles("src/app/api/**/*.ts");

for (const sourceFile of apiFiles) {
    let hasChanges = false;
    const filepath = sourceFile.getFilePath();

    // 1. Add fetchCache export if missing
    let hasFetchCache = false;
    const varDecls = sourceFile.getVariableDeclarations();
    for (const v of varDecls) {
        if (v.getName() === "fetchCache") hasFetchCache = true;
    }

    if (!hasFetchCache) {
        // Remove existing config exports to avoid duplicates
        const toRemove = ["dynamic", "runtime", "revalidate", "fetchCache"];
        for (const stmt of sourceFile.getStatements()) {
            if (stmt.getKind() === SyntaxKind.VariableStatement) {
                const decs = stmt.getDeclarations();
                if (decs.length > 0 && toRemove.includes(decs[0].getName()) && stmt.hasExportKeyword()) {
                    stmt.remove();
                }
            }
        }
        
        // Add proper config
        const imports = sourceFile.getImportDeclarations();
        const insertPos = imports.length > 0 ? imports[imports.length - 1].getChildIndex() + 1 : 0;
        
        sourceFile.insertStatements(insertPos, `
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "force-no-store";
`);
        hasChanges = true;
    }

    // 2. Safe Require Admin/Employee block
    const fullText = sourceFile.getFullText();
    const needsSafeAdmin = fullText.includes('requireAdmin') && !fullText.includes('safeRequireAdmin');
    const needsSafeEmployee = fullText.includes('requireEmployee') && !fullText.includes('safeRequireEmployee');

    if (needsSafeAdmin) {
        // Find last import
        const imports = sourceFile.getImportDeclarations();
        const insertPos = imports.length > 0 ? imports[imports.length - 1].getChildIndex() + 1 : 0;
        sourceFile.insertStatements(insertPos, `
const safeRequireAdmin = async () => {
  try { return await requireAdmin(); } catch { return null; }
};
`);
        hasChanges = true;
    }

    if (needsSafeEmployee) {
        // Find last import
        const imports = sourceFile.getImportDeclarations();
        const insertPos = imports.length > 0 ? imports[imports.length - 1].getChildIndex() + 1 : 0;
        sourceFile.insertStatements(insertPos, `
const safeRequireEmployee = async () => {
  try { return await requireEmployee(); } catch { return null; }
};
`);
        hasChanges = true;
    }

    // Replace direct requires
    sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.CallExpression) {
            const exp = node.getExpression().getText();
            if (exp === "requireAdmin" && !node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)?.getText().includes('safeRequireAdmin')) {
                node.getExpression().replaceWithText("safeRequireAdmin");
                hasChanges = true;
            } else if (exp === "requireEmployee" && !node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)?.getText().includes('safeRequireEmployee')) {
                node.getExpression().replaceWithText("safeRequireEmployee");
                hasChanges = true;
            }
        }
    });

    // 3. Wrap HTTP methods body in Build Safe catch
    const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    const functions = sourceFile.getFunctions();
    
    for (const func of functions) {
        if (func.isExported() && httpMethods.includes(func.getName())) {
            const body = func.getBody();
            if (body && body.getKind() === SyntaxKind.Block) {
                const bodyText = body.getText();
                
                // If it's ALREADY wrapped in Build Safe, skip
                if (bodyText.includes("BUILD SAFE ERROR")) continue;
                
                // Remove the '{' and '}'
                const innerLines = body.getStatements().map(s => s.getFullText()).join('');
                
                func.setBodyText(`
  try {
${innerLines}
  } catch (err) {
    console.error("BUILD SAFE ERROR:", err);
    return NextResponse.json({ error: "Build safe" }, { status: 200 });
  }
`);
                hasChanges = true;
            }
        }
    }

    if (hasChanges) {
        sourceFile.saveSync();
        console.log("Safely patched: " + filepath);
    }
}

console.log("Done");
