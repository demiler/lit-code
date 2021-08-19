export const js = "\
import { html, css, LitElement } from 'lit';\n\
import './prism.js'; //languages=markup+css+clike+javascript+c+css-extras\n\
import 'lit-code';\n\
\n\
class MyElement extends LitElement {\n\
  render() {\n\
    return html`\n\
      <lit-code linenumbers language=\"js\"></lit-code>\n\
    `;\n\
  }\n\
}\n\
\n\
customElements.define('my-element', MyElement);\
";

export const html = '\
<!DOCTYPE html>\n\
<html>\n\
  <head>\n\
    <meta charset="UTF-8">\n\
    <meta name="viewport" content="width=device-width, initial-scale=1">\n\
  \n\
    <title>My Awesome site</title>\n\
    <script type="module" src="/index.js" defer></script>\n\
  </head>\n\
  \n\
  <body>\n\
    <h1>Hello, World!<h1>\n\
  </body>\n\
</html>\
';

export const css = '\
button {\n\
  padding: 8px 10px;\n\
  border-radius: 8px;\n\
  background: cornflowerblue;\n\
  color: white;\n\
  transition: .2s;\n\
}\n\
\n\
button:hover {\n\
  background-color: aliceblue;\n\
  color: black;\n\
}\
';

export const c = '\
#include <stdio.h>\n\
\n\
int main(void) {\n\
  char name[255] = { 0 };\n\
  printf("Hello, There!\\n");\n\
  printf("What is your name: ");\n\
\n\
  scanf("%255s", name);\n\
  printf("\\nGood to see you, %s!\\n", name);\n\
  return 0;\n\
}\
';
