const { Project, SyntaxKind } = require("ts-morph");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const apiFiles = project.getSourceFiles("src/app/api/**/*.ts");

for (const sourceFile of apiFiles) {
    let hasChanges = false;
    const filepath = sourceFile.getFilePath();

    const functions = sourceFile.getFunctions();
    let hasGet = false;
    
    for (const func of functions) {
        if (func.isExported() && func.getName() === "GET") {
            hasGet = true;
        }
    }

    if (!hasGet) {
        // Remove ALL Next.js Route Segment Config exports because POST/PUT/DELETE are inherently dynamic
        const toRemove = ["dynamic", "runtime", "revalidate", "fetchCache"];
        for (const stmt of sourceFile.getStatements()) {
            if (stmt.getKind() === SyntaxKind.VariableStatement) {
                const decs = stmt.getDeclarations();
                if (decs.length > 0 && toRemove.includes(decs[0].getName()) && stmt.hasExportKeyword()) {
                    stmt.remove();
                    hasChanges = true;
                }
            }
        }
    }

    if (hasChanges) {
        sourceFile.saveSync();
        console.log("Cleaned non-GET route exports: " + filepath);
    }
}

console.log("Done");
