var XmlOperator = class XmlOperator {
  constructor() {
    this.AMPERSAND = '&';
    this.APOS = "'"; 
    this.GREATERTHAN = ">"; 
    this.LOWERTHAN = "<"; 
    this.QUOTE = '"';
    this.ESCAPED_QUOTE = {  };
    this.ESCAPED_QUOTE[this.AMPERSAND] = '&amp;';
    this.ESCAPED_QUOTE[this.APOS] = '&apos;';
    this.ESCAPED_QUOTE[this.GREATERTHAN] = '&gt;';
    this.ESCAPED_QUOTE[this.LOWERTHAN] = '&lt;';
    this.ESCAPED_QUOTE[this.QUOTE] = '&quot;';
  }

  //ID_ERR_XML_LUNGHEZZA_NONVALIDA e ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA non trovati dichiarati nel progetto vecchio quindi commentati
  xml_createElement(name, content, attributes) {
    var att_str = '';
    if (attributes) { // tests false if this arg is missing!
      att_str = this.xml_formatAttributes(attributes);
    }
    content = content.toString()
    var xml = '';
    if (!content) {
      xml = '<' + name + att_str + '/>';
    }
    else {
      xml = '<' + name + att_str + '>' + content + '</' + name + '>';
    }
    return xml;
  }

  //XML writer with attributes and smart attribute quote escaping 
  //xml_createElement('CodiceFiscale', '1345453', {}, '11...16', 0)
  //Len una sola cifra lunghezza fissa, due cifre separate da ... lunghezza min e max, nessuna cifra non controlla
  //mandatory 0=non obbligatorio 1=obbligatorio
  //context: dà ulteriori informazioni nella stringa del messaggio d'errrore
  xml_createElementWithValidation(name, content, mandatory, len, context, attributes) {
    var att_str = '';
    if (attributes) { // tests false if this arg is missing!
      att_str = this.xml_formatAttributes(attributes);
    }

    content = content.toString()
    var xml = '';
    if (content) {
      xml = '<' + name + att_str + '>' + content + '</' + name + '>';
    }
    else {
      content = '';
      if (mandatory > 0) {
        xml = '<' + name + att_str + '/>';
      }
    }
    var fixedLen = 0;
    var minLen = 0;
    var maxLen = 0;
    var msg = '';
    if (len && len.indexOf("...") > 0) {
      var lenStrings = len.split("...");
      minLen = parseInt(lenStrings[0]);
      maxLen = parseInt(lenStrings[1]);
    }
    else if (len && len.length > 0) {
      fixedLen = parseInt(len);
    }
    if (fixedLen > 0 && content.length != fixedLen && xml.length > 0) {
      if (!content.length)
        content = '[vuoto]';
      //msg = this.getErrorMessage(ID_ERR_XML_LUNGHEZZA_NONVALIDA);
      msg = msg.replace("%1", name);
      msg = msg.replace("%2", content);
      msg = msg.replace("%3", fixedLen);
      if (context)
        msg = context + ': ' + msg;
      //Banana.document.addMessage(msg, ID_ERR_XML_LUNGHEZZA_NONVALIDA);
    }
    else if (maxLen && content.length > maxLen && xml.length > 0) {
      if (!content.length)
        content = '[vuoto]';
      //msg = this.getErrorMessage(ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA);
      msg = msg.replace("%1", name);
      msg = msg.replace("%2", content);
      msg = msg.replace("%3", maxLen);
      if (context)
        msg = context + ': ' + msg;
      //Banana.document.addMessage(msg, ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA);
    }
    else if (minLen && content.length < minLen && xml.length > 0) {
      if (!content.length)
        content = '[vuoto]';
      //msg = this.getErrorMessage(ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA);
      msg = msg.replace("%1", name);
      msg = msg.replace("%2", content);
      msg = msg.replace("%3", minLen);
      if (context)
        msg = context + ': ' + msg;
      //Banana.document.addMessage(msg, ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA);
    }
    return xml;
  }

  xml_escapeString(_string) {
    var string = _string.toString()
    var re = new RegExp(AMPERSAND, 'g');
    string = string.replace(re, this.ESCAPED_QUOTE[this.AMPERSAND]);
    re = new RegExp(GREATERTHAN, 'g');
    string = string.replace(re, this.ESCAPED_QUOTE[this.GREATERTHAN]);
    re = new RegExp(LOWERTHAN, 'g');
    string = string.replace(re, this.ESCAPED_QUOTE[this.LOWERTHAN]);
    re = new RegExp(APOS, 'g');
    string = string.replace(re, this.ESCAPED_QUOTE[this.APOS]);
    re = new RegExp(QUOTE, 'g');
    string = string.replace(re, this.ESCAPED_QUOTE[this.QUOTE]);
    string = string.trim();
    return string;
  }

  /*
     Format a dictionary of attributes into a string suitable
     for inserting into the start tag of an element.  Be smart
     about escaping embedded quotes in the attribute values.
  */
  xml_formatAttributes(attributes) {
    var att_value;
    var apos_pos, quot_pos;
    var use_quote, escape, quote_to_escape;
    var att_str;
    var re;
    var result = '';

    for (var att in attributes) {
      att_value = attributes[att];
      if (att_value === undefined)
        continue;

      re = new RegExp(AMPERSAND, 'g');
      att_value = att_value.replace(re, this.ESCAPED_QUOTE[this.AMPERSAND]);
      re = new RegExp(GREATERTHAN, 'g');
      att_value = att_value.replace(re, this.ESCAPED_QUOTE[this.GREATERTHAN]);
      re = new RegExp(LOWERTHAN, 'g');
      att_value = att_value.replace(re, this.ESCAPED_QUOTE[this.LOWERTHAN]);

      // Find first quote marks if any
      apos_pos = att_value.indexOf(this.APOS);
      quot_pos = att_value.indexOf(this.QUOTE);

      // Determine which quote type to use around 
      // the attribute value
      if (apos_pos === -1 && quot_pos === -1) {
        att_str = ' ' + att + "='" + att_value + "'";
        result += att_str + ' ';
        continue;
      }

      // Prefer the single quote unless forced to use double
      if (quot_pos != -1 && quot_pos < apos_pos) {
        use_quote = this.APOS;
      }
      else {
        use_quote = this.QUOTE;
      }

      // Figure out which kind of quote to escape
      // Use nice dictionary instead of yucky if-else nests
      escape = this.ESCAPED_QUOTE[use_quote];

      // Escape only the right kind of quote
      re = new RegExp(use_quote, 'g');
      att_str = ' ' + att + '=' + use_quote +
        att_value.replace(re, escape) + use_quote;
      result += att_str + ' ';
    }
    if (result.endsWith(' '))
      result = result.substr(0, result.length - 1);
    return result;
  }
  /*  
 //  Checks that string starts with the specific string
 if (typeof String.prototype.startsWith != 'function') {
     String.prototype.startsWith = function (str) {
         return this.slice(0, str.length) == str;
     };
 }
  
 //  Checks that string ends with the specific string...
 if (typeof String.prototype.endsWith != 'function') {
     String.prototype.endsWith = function (str) {
         return this.slice(-str.length) == str;
     };
 } */

  getErrorMessage(errorId) {
    //ErrorId List
    var ID_ERR_XBRL_MISSING = "ID_ERR_XBRL_MISSING";
    var ID_ERR_XBRL_NOTFOUND = "ID_ERR_XBRL_NOTFOUND";

    switch (errorId) {
      case ID_ERR_XBRL_MISSING:
        return "Das Konto %1 hat keine gültige Xbrl-Position und wird nicht berücksichtigt. Filename: %2";
      case ID_ERR_XBRL_NOTFOUND:
        return "Das Konto %1 hat keine gültige Xbrl-Position und wird nicht berücksichtigt. Xbrl-Position%2. Filename: %3";
    }
    return "";
  }
}
