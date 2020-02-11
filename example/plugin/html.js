const htmlparser = require('parse5');
const fs = require('fs');
const path = require('path');

class HtmlPlugin {
  constructor (template) {
    this.template = template;
  }

  apply (compliance) {
    compliance.hooks.end.tap('end', () => {
      const filename = compliance.config.output.filename;
      const fileData = fs.readFileSync(this.template, 'utf8');
      const htmlDom = htmlparser.parse(fileData, { sourceCodeLocationInfo: true });
      const htmlTag = htmlDom.childNodes.find(item => item.nodeName === 'html');
      const bodyTag = htmlTag.childNodes.find(item => item.nodeName === 'body');
      const offset = bodyTag.sourceCodeLocation.endTag.startOffset;
      const result = `${ fileData.substring(0, offset) }
<script src="${ filename }"></script>
${ fileData.substring(offset) }`;
      fs.writeFileSync(path.join(compliance.config.output.path, 'index.html'), result);
    });
  }
}

module.exports = HtmlPlugin;
