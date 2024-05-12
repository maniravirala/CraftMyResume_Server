const pug = require('pug');

// Compile the source code
const compiledFunction = pug.compileFile('./utils/mail/template.pug');

console.log(compiledFunction({
  name: 'Timothy'
}));
// "<p>Timothy's Pug source code!</p>"
