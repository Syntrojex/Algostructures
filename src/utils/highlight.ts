function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CPP_KEYWORDS = new Set([
  'int','long','short','char','float','double','bool','void','auto','string',
  'if','else','for','while','do','switch','case','break','continue','return',
  'class','struct','public','private','protected','new','delete','nullptr',
  'true','false','const','static','virtual','override','namespace','using',
  'template','typename','include','define','vector','map','set','pair','queue',
  'stack','priority_queue','unordered_map','unordered_set','sort','endl',
  'cout','cin','sizeof','typedef','enum','union','goto','try','catch','throw',
  'this','inline','extern','register','signed','unsigned','volatile',
]);

export function highlightCode(code: string): string {
  const keywords = CPP_KEYWORDS;
  const lines = code.split('\n');
  
  return lines.map(line => {
    let result = '';
    let i = 0;
    
    // Handle full-line comments first
    const trimmed = line.trimStart();
    if (trimmed.startsWith('//')) {
      return `<span class="cm">${escapeHtml(line)}</span>`;
    }
    
    while (i < line.length) {
      // Multi-char comment
      if (line[i] === '/' && line[i+1] === '/') {
        result += `<span class="cm">${escapeHtml(line.slice(i))}</span>`;
        break;
      }
      
      // Preprocessor
      if (line[i] === '#') {
        const end = line.indexOf('\n', i);
        const pp = line.slice(i, end === -1 ? undefined : end);
        result += `<span class="pp">${escapeHtml(pp)}</span>`;
        i += pp.length;
        continue;
      }
      
      // String literal
      if (line[i] === '"' || line[i] === "'") {
        const quote = line[i];
        let j = i + 1;
        while (j < line.length && line[j] !== quote) {
          if (line[j] === '\\') j++;
          j++;
        }
        result += `<span class="st">${escapeHtml(line.slice(i, j + 1))}</span>`;
        i = j + 1;
        continue;
      }
      
      // Number
      if (/[0-9]/.test(line[i]) && (i === 0 || /[\s\W]/.test(line[i-1]))) {
        let j = i;
        while (j < line.length && /[0-9.xXabcdefABCDEF]/.test(line[j])) j++;
        result += `<span class="num">${escapeHtml(line.slice(i, j))}</span>`;
        i = j;
        continue;
      }
      
      // Identifier or keyword
      if (/[a-zA-Z_]/.test(line[i])) {
        let j = i;
        while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
        const word = line.slice(i, j);
        
        if (keywords.has(word)) {
          result += `<span class="kw">${escapeHtml(word)}</span>`;
        } else if (j < line.length && line[j] === '(') {
          result += `<span class="fn">${escapeHtml(word)}</span>`;
        } else if (/^[A-Z]/.test(word)) {
          result += `<span class="ty">${escapeHtml(word)}</span>`;
        } else {
          result += escapeHtml(word);
        }
        i = j;
        continue;
      }
      
      // Operators
      if (/[+\-*/%=<>!&|^~]/.test(line[i])) {
        result += `<span class="op">${escapeHtml(line[i])}</span>`;
        i++;
        continue;
      }
      
      result += escapeHtml(line[i]);
      i++;
    }
    
    return result;
  }).join('\n');
}
