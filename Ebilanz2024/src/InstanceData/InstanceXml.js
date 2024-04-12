var InstanceXml = class InstanceXml {
    constructor() {
        this.AMPERSAND = '&';
        this.APOS = "'";
        this.GREATERTHAN = ">";
        this.LOWERTHAN = "<";
        this.QUOTE = '"';
        this.ESCAPED_QUOTE = {};
        // Utilizzo delle proprietà dell'istanza per inizializzare ESCAPED_QUOTE
        this.ESCAPED_QUOTE[this.AMPERSAND] = '&amp;';
        this.ESCAPED_QUOTE[this.APOS] = '&apos;';
        this.ESCAPED_QUOTE[this.GREATERTHAN] = '&gt;';
        this.ESCAPED_QUOTE[this.LOWERTHAN] = '&lt;';
        this.ESCAPED_QUOTE[this.QUOTE] = '&quot;';
    }
    xml_formatAttributes(attributes) {
        var att_value;
        var apos_pos, quot_pos;
        var use_quote, escape, quote_to_escape;
        var att_str;
        var re;
        var result = '';
        const xml = new Xml();
        for (var att in attributes) {
            att_value = attributes[att];
            if (att_value === undefined)
                continue;

            re = new RegExp(xml.AMPERSAND, 'g');
            att_value = att_value.replace(re, xml.ESCAPED_QUOTE[xml.AMPERSAND]);
            re = new RegExp(GREATERTHAN, 'g');
            att_value = att_value.replace(re, xml.ESCAPED_QUOTE[xml.GREATERTHAN]);
            re = new RegExp(LOWERTHAN, 'g');
            att_value = att_value.replace(re, xml.ESCAPED_QUOTE[xml.LOWERTHAN]);

            // Find first quote marks if any
            apos_pos = att_value.indexOf(xml.APOS);
            quot_pos = att_value.indexOf(xml.QUOTE);

            // Determine which quote type to use around 
            // the attribute value
            if (apos_pos === -1 && quot_pos === -1) {
                att_str = ' ' + att + "='" + att_value + "'";
                result += att_str + ' ';
                continue;
            }

            // Prefer the single quote unless forced to use double
            if (quot_pos != -1 && quot_pos < apos_pos) {
                use_quote = xml.APOS;
            }
            else {
                use_quote = xml.QUOTE;
            }

            // Figure out which kind of quote to escape
            // Use nice dictionary instead of yucky if-else nests
            escape = xml.ESCAPED_QUOTE[use_quote];

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
    createInstance(param, contextList) {
        var xbrlContent = '';
        var attrsIdentifier = {
            scheme: param['identifierScheme']
        };
        var xbrlIdentifier = this.xml_createElement("xbrli:identifier", param['companyId'], attrsIdentifier);

        for (var j in param['schemaRefs']) {
            if (param['schemaRefs'][j].length > 0) {
                var attrsSchemaRef = {
                    'xlink:type': 'simple',
                    'xlink:href': param['schemaRefs'][j]
                };
                xbrlContent += '\n' + this.xml_createElement("link:schemaRef", "", attrsSchemaRef);
            }
        }

        for (var i in contextList) {
            var attrsInstant = {
                id: "i-" + contextList[i].name
            };
            var xbrlInstant = '\n' + this.xml_createElement("xbrli:instant", contextList[i].enddate) + '\n';
            var xbrlString = '\n' + this.xml_createElement("xbrli:entity", xbrlIdentifier);
            xbrlString += '\n' + this.xml_createElement("xbrli:period", xbrlInstant) + '\n';
            xbrlContent += '\n' + this.xml_createElement("xbrli:context", xbrlString, attrsInstant);

            var attrsDuration = {
                id: "d-" + contextList[i].name
            };
            var xbrlDuration = '\n' + this.xml_createElement("xbrli:startDate", contextList[i].startdate) + '\n';
            xbrlDuration += this.xml_createElement("xbrli:endDate", contextList[i].enddate) + '\n';
            xbrlString = '\n' + this.xml_createElement("xbrli:entity", xbrlIdentifier);
            xbrlString += '\n' + this.xml_createElement("xbrli:period", xbrlDuration) + '\n';
            xbrlContent += '\n' + this.xml_createElement("xbrli:context", xbrlString, attrsDuration);
        }

        var accountingBasicCurrency = "";
        var accountingDecimals = "";
        if (contextList[i].document) {
            accountingBasicCurrency = contextList[i].document.info("AccountingDataBase", "BasicCurrency");
            accountingDecimals = contextList[i].document.info("Base", "DecimalsAmounts");
        }
        var xbrlMeasure = '\n' + this.xml_createElement("xbrli:measure", "iso4217:" + accountingBasicCurrency) + '\n';
        var xbrlUnit = '\n' + this.xml_createElement("xbrli:unit", xbrlMeasure, { 'id': 'BaseCurrency' }) + '\n';
        xbrlContent += xbrlUnit;

        for (var role in param.taxonomy) {
            for (var object in param.taxonomy[role]) {
                if (typeof param.taxonomy[role][object] === 'string')
                    continue;
                var print = false;
                for (var i in contextList) {
                    var contextname = contextList[i]['name'];
                    if (param.taxonomy[role][object][contextname] != 0)
                        print = true;
                }
                if (print == false)
                    continue;

                for (var i in contextList) {
                    var contextname = contextList[i]['name'];
                    if (param.taxonomy[role][object][contextname] != 0) {
                        var periodtype = param.taxonomy[role][object]['periodtype'];
                        if (periodtype.length >= 1)
                            periodtype = periodtype.substr(0, 1);
                        var contextref = periodtype + '-' + contextname;
                        var attrs = { 'contextRef': contextref, 'unitRef': 'BaseCurrency', 'decimals': accountingDecimals };
                        xbrlContent += this.xml_createElement(param.taxonomy[role][object]['qname'], Banana.SDecimal.round(param.taxonomy[role][object][contextname], { 'decimals': 2 }), attrs) + '\n';
                    }
                }
            }
        }
        var results = [];
        results.push("<?xml version='1.0' encoding='UTF-8'?>");

        var attrsNamespaces = {};
        for (var j in param.namespaces) {
            var prefix = param.namespaces[j]['prefix'];
            var namespace = param.namespaces[j]['namespace'];
            if (prefix.length > 0)
                attrsNamespaces[prefix] = namespace;
        }

        results.push(this.xml_createElement("xbrli:xbrl", xbrlContent, attrsNamespaces));
        return results.join('\n');

    }
}