const fs = require('fs');
const glob = require('glob');

glob.sync('app/api/**/route.ts').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('runtime = "edge"')) {
    content = content.replace('export const maxDuration = 60;', 'export const maxDuration = 60;\nexport const runtime = "edge";');
    fs.writeFileSync(file, content);
  }
});
