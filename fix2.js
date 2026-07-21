const fs = require('fs');
const glob = require('glob');

glob.sync('app/api/**/route.ts').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('export const runtime = "edge";\n', '').replace('export const runtime = "edge";', '');
  if (!content.includes('export const maxDuration = 60;')) {
    content = 'export const maxDuration = 60;\n' + content;
  }
  fs.writeFileSync(file, content);
});
