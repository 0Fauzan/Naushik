const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'server');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');

  // Match .handler(async ({ data }: { data: Type }) => { ... })
  // OR .handler(async ({ data: name }: { data: Type }) => { ... })
  
  const regex = /(createServerFn\(\{ method: "[A-Z]+" \}\)(?:\s*\.middleware\(\[.*?\]\))?)\s*\.handler\(async \(\{ data(?:: \w+)? \}: \{ data: (.*?) \} \)/g;
  
  content = content.replace(regex, (match, prefix, type) => {
      // Find the original destructured parameter
      const paramsMatch = match.match(/\.handler\(async \(\{ (data(?:: \w+)?) \}:/);
      const paramName = paramsMatch ? paramsMatch[1] : 'data';
      
      return `${prefix}\n  .validator((data: ${type}) => data)\n  .handler(async ({ ${paramName} })`;
  });

  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed', file);
}
