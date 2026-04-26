const fs = require("fs");
const path = require("path");

const walk = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file === "route.ts") {
      let content = fs.readFileSync(fullPath, "utf8");
      if (!content.includes("force-dynamic")) {
        content =
          'export const dynamic = "force-dynamic";\n' + content;
        fs.writeFileSync(fullPath, content);
        console.log("Fixed:", fullPath);
      }
    }
  });
};

walk("./app/api");