/**
 * This file contains content from Geierlein library files necessary for
 * creating an Elster COALA conform XML output for German Umsatzsteuervoranmeldung.
 *
 * Created by this command:
 *
 *   cat geierlein-0.9.3/chrome/content/lib/geierlein/util.js \
 *       geierlein-0.9.3/chrome/content/lib/geierlein/taxnumber.js \
 *       geierlein-0.9.3/chrome/content/lib/geierlein/validation.js \
 *       geierlein-0.9.3/chrome/content/lib/geierlein/datenlieferant.js \
 *       geierlein-0.9.3/chrome/content/lib/geierlein/steuerfall.js \
 *       geierlein-0.9.3/chrome/content/lib/geierlein/ustva.js > geierlein.js
 *
 * And modified as follows:
 *
 * - All files: Anonymous function wrapper as well as dependency on the windows
 *   object and NodeJS is removed to make the code work in Banana Apps (Qt Script).
 *
 * - ustva.js: "var validationRules" in "Datenlieferant" is renamed to
 *   "validationRulesDatenlieferant" to avoid naming conflict with "validationRules".
 *
 * - utility.js: "geierlein.util.Xml = XML" needs to be "geierlein.util.Xml = XMLWriter"
 *
 * Depends on geierlein-0.9.3/chrome/content/lib/xmlwriter.js.
 *
 * See https://github.com/stesie/geierlein.
 */

var geierlein = {};

/**
 * Utility functions for Geierlein.
 *
 * @author Stefan Siegl
 *
 * Copyright (c) 2012 Stefan Siegl <stesie@brokenpipe.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

geierlein.util = {};

/**
 * Merge the contents of two objects together into the first one.
 *
 * @param target An object that will receive the properties.
 * @param src An object containingproperties to merge into target.
 */
geierlein.util.extend = function(target, src) {
    for(var name in src) {
        if(src.hasOwnProperty(name)) {
            target[name] = src[name];
        }
    }
};


geierlein.util.parseFile = function(data) {
    var result = {};
    data = data.split(/[\r\n]+/);
    for(var i = 0; i < data.length; i ++) {
        var line = data[i].replace(/#.*/, '');      // ignore comments
        if(line.match(/^\s*$/)) {
            continue;   // skip empty lines
        }
        var matches = line.match(/^\s*([A-Za-z0-9]+)\s*=\s*(.*?)\s*$/);
        if(matches === null) {
            throw "Unable to parse: " + line;
        }
        result[matches[1]] = matches[2];
    }
    return result;
};

geierlein.util.rewriteEncoding = function(xmlstr, newEncoding) {
    var doc = xmlstr.split(/(<\?.*?\?>)/);
    doc[1] = doc[1].replace(/encoding=['"][^'"]+['"]/,
        'encoding="' + newEncoding +'"');
    return doc.join('');
};


geierlein.util.addStylesheetHref = function(xmlstr, xslHref) {
    var doc = xmlstr.split(/(<\?.*?\?>)/);
    var tmp = doc.pop();
    doc.push('<?xml-stylesheet type="text/xsl" href="' + xslHref + '"?>');
    doc.push(tmp);
    return doc.join('');
};

/**
 * Tax-number definition for Geierlein.
 *
 * @author Stefan Siegl
 *
 * Copyright (c) 2012 Stefan Siegl <stesie@brokenpipe.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

geierlein.taxnumber = {};

geierlein.taxnumber.rules = [
    { spacer: '/',  groups: [5, 5]},         // Baden Württemberg
    { spacer: '/',  groups: [3, 3, 5]},      // Bayern
    { spacer: '/',  groups: [2, 3, 5]},      // Berlin
    { spacer: '/',  groups: [3, 3, 5]},      // Brandenburg
    { spacer: ' ',  groups: [2, 3, 5]},      // Bremen
    { spacer: '/',  groups: [2, 3, 5]},      // Hamburg
    { spacer: ' ',  groups: [3, 3, 5]},      // Hessen
    { spacer: '/',  groups: [3, 3, 5]},      // Mecklenburg-Vorpommern
    { spacer: '/',  groups: [2, 3, 5]},      // Niedersachsen
    { spacer: '/',  groups: [3, 4, 4]},      // Nordrhein-Westfalen
    { spacer: '/',  groups: [2, 3, 5]},      // Rheinland-Pfalz
    { spacer: '/',  groups: [3, 3, 5]},      // Saarland
    { spacer: '/',  groups: [3, 3, 5]},      // Sachsen
    { spacer: '/',  groups: [3, 3, 5]},      // Sachsen-Anhalt
    { spacer: ' ',  groups: [2, 3, 5]},      // Schleswig-Holstein
    { spacer: '/',  groups: [3, 3, 5]}       // Thüringen
];

geierlein.taxnumber.prefixes = [
    false,          // Baden Württemberg (handled specially)
    "9",            // Bayern
    "11",           // Berlin
    "3",            // Brandenburg
    "24",           // Bremen
    "22",           // Hamburg
    "26",           // Hessen
    "4",            // Mecklenburg-Vorpommern
    "23",           // Niedersachsen
    "5",            // Nordrhein-Westfalen
    "27",           // Rheinland-Pfalz
    "1",            // Saarland
    "3",            // Sachsen
    "3",            // Sachsen-Anhalt
    "21",           // Schleswig-Holstein
    "4"             // Thüringen
];

/**
 * Get a sample tax number in "user notation".
 *
 * @param {integer} land Number of federal state for which to get the sample (1 to 16)
 * @return {String} The sample tax number in "user notation"
 */
geierlein.taxnumber.getSample = function(land) {
    /* Get rule according to chosen federal state (#land).  The options
     * in the frontend are indexed beginning from one, there subtract one */
    var rule = geierlein.taxnumber.rules[land - 1];
    var result = "";

    for(var i = 0; i < rule.groups.length; i ++) {
        result += rule.spacer + '12345'.substring(0, rule.groups[i]);
    }

    return result.substring(1);
};

/**
 * Format the user-provided tax number into 13-digit format according to spec.
 *
 * @param {integer} land Which federal state the tax number belongs to (1 to 16)
 * @param {String} steuernummer The tax number in user-provided notation
 * @return {String} The tax number in 13-digit notation
 */
geierlein.taxnumber.format = function(land, steuernummer) {
    var rule = geierlein.taxnumber.rules[land - 1].groups;
    var prefix = geierlein.taxnumber.prefixes[land - 1];
    var pieces = steuernummer.split(/[\/ ]/);

    if(pieces.length !== rule.length) {
        return false;   // wrong number of pieces
    }

    for(var i = 0; i < pieces.length; i ++) {
        if(pieces[i].length !== rule[i]) {
            return false;   // length mismatch
        }
    }

    if(land == 1) {
        /* Special concatenation rule for Baden Württemberg */
        return '28' + pieces[0].substr(0, 2) + '0' +
            pieces[0].substr(2) + pieces[1];
    } else {
        return prefix + pieces[0].substr(-4 + prefix.length) +
            "0" + pieces[1] + pieces[2] +
            (pieces.length == 4 ? pieces[3] : '');
    }
};

/**
 * Form validation module for Geierlein.
 *
 * @author Stefan Siegl
 *
 * Copyright (c) 2012 Stefan Siegl <stesie@brokenpipe.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

geierlein.validation = {};

geierlein.validation.rules = {
    required: function(val) {
        return val !== undefined;
    },

    range: function(min, max) {
        return function(val) {
            if(val === undefined) {
                return true;  // ruleRange accepts undefined as valid!
            }

            val = parseInt(val, 10);
            return val >= min && val <= max;
        };
    },

    option: function(val) {
        return val === undefined || parseInt(val, 10) === 1;
    },

    signedInt: function(val) {
        return val === undefined || parseInt(val, 10) === +val;
    },

    unsignedInt: function(val) {
        return val === undefined ||
            (geierlein.validation.rules.signedInt(val) &&
                parseInt(val, 10) >= 0);
    },

    signedMonetary: function(val) {
        return val === undefined || (+val == parseFloat(val).toFixed(2));
    },

    unsignedMonetary: function(val) {
        return val === undefined || (+val >= 0 && +val == parseFloat(val).toFixed(2));
    },

    lessThan: function(otherKz) {
        return function(val) {
            if(val === undefined) {
                return true;
            }

            /* dependant field must be defined, error otherwise. */
            if(this[otherKz] === undefined) {
                return false;
            }

            var a = parseFloat(val);
            var b = parseFloat(this[otherKz]);

            /* Signs of both numbers must match, error otherwise. */
            if((a <= 0) !== (b <= 0)) {
                return false;
            }

            /* value must be less than value of dependant field */
            return Math.abs(a) < Math.abs(b);
        };
    },

    maxLength: function(maxLen) {
        return function(val) {
            if(val === undefined) {
                return true;
            }
            return typeof(val) === 'string' && val.length <= maxLen;
        };
    },

    kz83: function(val) {
        var expect = this.calculateKz83();
        var delta = Math.abs(+val - expect);
        return delta < 1;
    },

    taxNumber: function(val) {
        if(val === undefined) {
            return true;
        }
        if(this.land === undefined) {
            return false;
        }

        var rule = geierlein.taxnumber.rules[this.land - 1].groups;
        var pieces = val.split(/[\/ ]/);

        if(pieces.length !== rule.length) {
            return false;   // wrong number of pieces
        }

        for(var i = 0; i < pieces.length; i ++) {
            if(pieces[i].length !== rule[i]) {
                return false;   // length mismatch
            }
        }

        return true;
    }
};

geierlein.validation.validate = function(ruleset, field) {
    var errors = [];
    var rules = {};

    if(field === undefined) {
        rules = ruleset;
    } else {
        rules[field] = ruleset[field];
    }

    for(var fieldName in rules) {
        if(rules.hasOwnProperty(fieldName)) {
            var rule = rules[fieldName];
            for(var i = 0, max = rule.length; i < max; i ++) {
                if(rule[i] === undefined) {
                    //console.dir(rule);
                    //console.dir(this);
                }
                if(!rule[i].call(this, this[fieldName])) {
                    errors.push(fieldName);
                    break;
                }
            }
        }
    }

    return errors.length ? errors : true;
};

/**
 * Constructor function of XMLWriter objects.
 */
geierlein.util.Xml = XMLWriter;

/**
 * Datenlieferant module for Geierlein.
 *
 * @author Stefan Siegl
 *
 * Copyright (c) 2012 Stefan Siegl <stesie@brokenpipe.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var rules = geierlein.validation.rules;

var validationRulesDatenlieferant = {
    name: [ rules.required, rules.maxLength(45) ],
    strasse: [ rules.required, rules.maxLength(30) ],
    plz: [ rules.required, rules.maxLength(12) ],
    ort: [ rules.required, rules.maxLength(30) ],
    telefon: [ rules.maxLength(20) ],
    email: [ rules.maxLength(70) ]
};

/**
 * Create new Datenlieferant instance.
 */
geierlein.Datenlieferant = function() {
};

geierlein.Datenlieferant.prototype = {
    land: 'Deutschland',

    validate: function(field) {
        return geierlein.validation.validate.call(this, validationRulesDatenlieferant, field);
    },

    /**
     * Get concatenated representation as per Elster XML specification.
     *
     * @return Datenlieferant string according to specification.
     */
    toString: function() {
        var r = [
            this.name,
            this.strasse,
            this.ort,
            this.plz
        ];

        if(this.telefon !== undefined) {
            r.push(this.telefon);
        }

        if(this.email !== undefined) {
            r.push(this.email);
        }

        return r.join(', ');
    },

    /**
     * Get XML representation as per Elster XML specification.
     *
     * @return Datenlieferant XML block according to specification.
     */
    toXml: function() {
        var esc = geierlein.util.Xml.prototype.escape;

        var r = '<Name>' + esc(this.name) + '</Name>' +
            '<Strasse>' + esc(this.strasse) + '</Strasse>' +
            '<PLZ>' + esc(this.plz) + '</PLZ>' +
            '<Ort>' + esc(this.ort) + '</Ort>';

        if(this.telefon !== undefined) {
            r += '<Telefon>' + esc(this.telefon) + '</Telefon>';
        }

        if(this.email !== undefined) {
            r += '<Email>' + esc(this.email) + '</Email>';
        }

        return r;
    }
};


/**
 * XML-writer module for Geierlein.
 *
 * @author Stefan Siegl
 *
 * Copyright (c) 2012 Stefan Siegl <stesie@brokenpipe.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var schemaUri = 'http://www.elster.de/2002/XMLSchema';

/**
 * Create new Steuerfall instance.
 */
geierlein.Steuerfall = function() {
};

geierlein.Steuerfall.prototype = {
    herstellerID: '00616',

    getTaxNumberSample: function() {
        return geierlein.taxnumber.getSample(this.land);
    },

    /**
     * Get tax number in formatted (12-digit) notation.
     *
     * @return The formatted tax number as a string.
     */
    getFormattedTaxNumber: function() {
        return geierlein.taxnumber.format(this.land, this.steuernummer);
    },


    /**
     * Get XML representation of this taxcase.
     *
     * A callback function can be passed to this function, which needs to
     * perform the encryption as required by the specification.  Leave
     * undefined to get an unencrypted representation.
     *
     * @param testcase Whether to declare the taxcase as a testcase.
     * @param signer Optional signer context to put signature on XML,
     *   pass undefined to skip signing.
     * @param encCb Callback function to encrypt data as necessary.
     * @result XML representation of the taxcase as a string.
     */
    toXml: function(testcase, signer, encCb) {
        if(this.validate() !== true) {
            return false;
        }

        if(encCb === undefined) {
            encCb = function(data) {
                return data;
            };
        }

        var datenteil = encCb(this.getDatenteilXml(testcase, signer));

        var xml = new geierlein.util.Xml('ISO-8859-1', '1.0');
        xml.writeStartDocument();
        xml.writeStartElement('Elster');
        xml.writeAttributeString('xmlns', schemaUri);
        xml.writeAttributeString('xmlns:elster', schemaUri);
            xml.writeStartElement('TransferHeader');
            xml.writeAttributeString('version', 8);
                xml.writeElementString('Verfahren', 'ElsterAnmeldung');
                xml.writeElementString('DatenArt', this.datenart);
                xml.writeElementString('Vorgang',
                    signer === undefined ? 'send-NoSig' : 'send-Sig');

                if(testcase) {
                    xml.writeElementString('Testmerker', '700000004');
                    xml.writeElementString('HerstellerID', '74931');
                } else {
                    xml.writeElementString('Testmerker', '000000000');
                    xml.writeElementString('HerstellerID', this.herstellerID);
                }

                xml.writeStartElement('DatenLieferant');
                    xml.writeXml(encCb(xml.escape(this.datenlieferant.toString())));
                xml.writeEndElement();

                xml.writeStartElement('Datei');
                    xml.writeElementString('Verschluesselung', 'CMSEncryptedData');
                    xml.writeElementString('Kompression', 'GZIP');
                    xml.writeElementString('DatenGroesse',
                        datenteil.length.toString());
                    xml.writeElementString('TransportSchluessel', '');
                xml.writeEndElement();  // Datei
                xml.writeElementString('VersionClient', '0.9.3');
            xml.writeEndElement();  // TransferHeader

            xml.writeStartElement('DatenTeil');
                xml.writeXml(datenteil);

        return xml.flush();
    },

    /**
     * Get encrypted representation in Elster-XML format.
     *
     * @param testcase Whether to declare the taxcase as a testcase.
     * @param signer Optional signer context to put signature on XML,
     *   pass undefined to skip signing.
     * @param sendCb Callback function handling data exchange with
     *   Elster server.  Arguments, the data to send (encrypted) and
     *   another callback function to pass the (encrypted) result to.
     * @param resultCb Callback function to pass the decrypted results to.  The
     *   result is passed as first (and only) argument.
     * @result XML representation of the taxcase as a string.
     */
    toEncryptedXml: function(testcase, signer, sendCb, resultCb) {
        var key = geierlein.crypto.generateKey();
        var encData = this.toXml(testcase, signer, function(data) {
            return geierlein.crypto.encryptBlock(data, key);
        });

        if(encData && sendCb !== undefined) {
            sendCb(encData, function(resData) {
                if(resData === false) {
                    return resultCb(false);
                }
                resultCb(geierlein.crypto.decryptDocument(resData, key));
            });
        }

        return encData;
    },

    /**
     * Get Elster XML representation of the DatenTeil part.
     *
     * @param testcase Whether to declare the taxcase as a testcase.
     * @param signer Optional signer context to put signature on XML,
     *   pass undefined to skip signing.
     * @return XML representation of the DatenTeil part as a string.
     */
    getDatenteilXml: function(testcase, signer) {
        var datenteil = new geierlein.util.Xml();
        var stnr = this.getFormattedTaxNumber();
        var nutzdaten = this.getNutzdatenXml(testcase);

        datenteil.writeStartDocument();
        datenteil.writeStartElement('Nutzdatenblock');
            datenteil.writeStartElement('NutzdatenHeader');
            datenteil.writeAttributeString('version', 10);
                datenteil.writeElementString('NutzdatenTicket',
                    Math.floor(Math.random() * 9999999).toString());
                datenteil.writeStartElement('Empfaenger');
                datenteil.writeAttributeString('id', 'F');
                    datenteil.writeString(stnr.substr(0, 4));
                datenteil.writeEndElement();

                if(signer !== undefined) {
                    signer.sign(nutzdaten);
                    datenteil.writeXml(signer.getSignatureXml());
                }

                datenteil.writeStartElement('Hersteller');
                    datenteil.writeElementString('ProduktName', 'Geierlein');
                    datenteil.writeElementString('ProduktVersion', '0.9.3');
                datenteil.writeEndElement();

                datenteil.writeStartElement('DatenLieferant')
                    datenteil.writeString(this.datenlieferant.toString());
                datenteil.writeEndElement();
            datenteil.writeEndElement();    // NutzdatenHeader

            datenteil.writeXml(nutzdaten);
        return datenteil.flush(true);
    }
};


/**
 * UStVA (monthly value added tax declaration) module for Geierlein.
 *
 * @author Stefan Siegl
 *
 * Copyright (c) 2012 Stefan Siegl <stesie@brokenpipe.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


var rules = geierlein.validation.rules;

/**
 * Create new UStVA instance.
 *
 * @param datenlieferant A Datenlieferant instance to use.
 * @param jahr The year of the declaration.
 * @param zeitraum The month (1-12) or quarter specification (41-44)
 */
geierlein.UStVA = function(datenlieferant, jahr, zeitraum) {
    this.datenlieferant = datenlieferant || new geierlein.Datenlieferant();
    this.jahr = jahr;
    this.zeitraum = zeitraum;
};

geierlein.UStVA.prototype = new geierlein.Steuerfall();
geierlein.UStVA.prototype.constructor = geierlein.UStVA;


var validationRules = {
    land: [
        rules.required,
        rules.range(1, 16)
    ],

    jahr: [
        rules.required,
        rules.range(2010, 2016)
    ],

    zeitraum: [
        rules.required,
        function(val) {
            return rules.range(1, 12)(val) || rules.range(41, 44)(val);
        }
    ],

    steuernummer: [rules.required, rules.taxNumber],

    kz10: [rules.option],
    kz21: [rules.signedInt],
    kz22: [rules.option],
    kz26: [rules.option],
    kz29: [rules.option],
    kz35: [rules.signedInt],
    kz36: [rules.signedMonetary, rules.lessThan('kz35')],
    kz39: [rules.unsignedMonetary],
    kz41: [rules.signedInt],
    kz42: [rules.signedInt],
    kz43: [rules.signedInt],
    kz44: [rules.signedInt],
    kz45: [rules.signedInt],
    kz46: [rules.signedInt],
    kz47: [rules.signedMonetary, rules.lessThan('kz46')],
    kz48: [rules.signedInt],
    kz49: [rules.signedInt],
    kz52: [rules.signedInt],
    kz53: [rules.signedMonetary, rules.lessThan('kz52')],
    kz59: [rules.signedMonetary],
    kz60: [rules.signedInt],
    kz61: [rules.signedMonetary],
    kz62: [rules.signedMonetary],
    kz63: [rules.signedMonetary],
    kz64: [rules.signedMonetary],
    kz65: [rules.signedMonetary],
    kz66: [rules.signedMonetary],
    kz67: [rules.signedMonetary],
    kz68: [rules.signedInt],
    kz69: [rules.signedMonetary],
    kz73: [rules.signedInt],
    kz74: [rules.signedMonetary, rules.lessThan('kz73')],
    kz76: [rules.signedInt],
    kz77: [rules.signedInt],
    kz78: [rules.signedInt],
    kz79: [rules.signedMonetary, rules.lessThan('kz78')],
    kz80: [rules.signedMonetary, rules.lessThan('kz76')],
    kz81: [rules.signedInt],
    kz83: [rules.required, rules.signedMonetary, rules.kz83],
    kz84: [rules.signedInt],
    kz85: [rules.signedMonetary, rules.lessThan('kz84')],
    kz86: [rules.signedInt],
    kz89: [rules.signedInt],
    kz91: [rules.signedInt],
    kz93: [rules.signedInt],
    kz94: [rules.signedInt],
    kz95: [rules.signedInt],
    kz96: [rules.signedMonetary, rules.lessThan('kz94')],
    kz98: [rules.signedMonetary, rules.lessThan('kz95')]
};

function writeOption(val) {
    return val ? '1' : false;
}

function writeOptionalInt(val) {
    return val === undefined ? false : (+val).toString();
}

function writeOptionalUnsignedMonetary(val) {
    return val === undefined ? false : (+val).toFixed(2);
}

function writeOptionalSignedMonetary(val) {
    return val === undefined ? false : (+val).toFixed(2);
}

function writeMonetary(val) {
    return (+val).toFixed(2);
}

var xmlWritingRules = {
    kz10: writeOption,
    kz21: writeOptionalInt,
    kz22: writeOption,
    kz26: writeOption,
    kz29: writeOption,
    kz35: writeOptionalInt,
    kz36: writeOptionalSignedMonetary,
    kz39: writeOptionalUnsignedMonetary,
    kz41: writeOptionalInt,
    kz42: writeOptionalInt,
    kz43: writeOptionalInt,
    kz44: writeOptionalInt,
    kz45: writeOptionalInt,
    kz46: writeOptionalInt,
    kz47: writeOptionalSignedMonetary,
    kz48: writeOptionalInt,
    kz49: writeOptionalInt,
    kz52: writeOptionalInt,
    kz53: writeOptionalSignedMonetary,
    kz59: writeOptionalSignedMonetary,
    kz60: writeOptionalInt,
    kz61: writeOptionalSignedMonetary,
    kz62: writeOptionalSignedMonetary,
    kz63: writeOptionalSignedMonetary,
    kz64: writeOptionalSignedMonetary,
    kz65: writeOptionalSignedMonetary,
    kz66: writeOptionalSignedMonetary,
    kz67: writeOptionalSignedMonetary,
    kz68: writeOptionalInt,
    kz69: writeOptionalSignedMonetary,
    kz73: writeOptionalInt,
    kz74: writeOptionalSignedMonetary,
    kz76: writeOptionalInt,
    kz77: writeOptionalInt,
    kz78: writeOptionalInt,
    kz79: writeOptionalSignedMonetary,
    kz80: writeOptionalSignedMonetary,
    kz81: writeOptionalInt,
    kz83: writeMonetary,
    kz84: writeOptionalInt,
    kz85: writeOptionalSignedMonetary,
    kz86: writeOptionalInt,
    kz89: writeOptionalInt,
    kz91: writeOptionalInt,
    kz93: writeOptionalInt,
    kz94: writeOptionalInt,
    kz95: writeOptionalInt,
    kz96: writeOptionalSignedMonetary,
    kz98: writeOptionalSignedMonetary
};

geierlein.util.extend(geierlein.UStVA.prototype, {
    datenart: 'UStVA',

    validate: function(field) {
        var i = geierlein.validation.validate.call(this, validationRules, field);

        /* If field is not set, i.e. we should check the whole form, call
           validate on datenlieferant sub-model as well. */
        if(field === undefined) {
            var j = this.datenlieferant.validate();
            if(j !== true) {
                if(i === true) {
                    return j;
                }
                i = i.concat(j);
            }
        }
        return i;
    },

    /**
     * Calculate the correct value for Kz83 (total VAT due)
     *
     * @return The (roughly) expected value for Kz83.
     */
    calculateKz83: function() {
        function getValue(val, factor) {
            if(val === undefined) {
                return 0;
            }
            return +val * (factor || 1);
        }

        return getValue(this.kz81, +0.19) +
            getValue(this.kz86, +0.07) +
            getValue(this.kz36) +
            getValue(this.kz80) +
            getValue(this.kz96) +
            getValue(this.kz98) +
            getValue(this.kz89, +0.19) +
            getValue(this.kz93, +0.07) +
            getValue(this.kz85) +
            getValue(this.kz74) +
            getValue(this.kz79) +
            getValue(this.kz53) +
            getValue(this.kz47) +
            getValue(this.kz65) +
            getValue(this.kz66, -1) +
            getValue(this.kz61, -1) +
            getValue(this.kz62, -1) +
            getValue(this.kz67, -1) +
            getValue(this.kz63, -1) +
            getValue(this.kz64, -1) +
            getValue(this.kz59, -1) +
            getValue(this.kz69) +
            getValue(this.kz39, -1);
    },

    /**
     * Get Elster XML representation of the Nutzdaten part.
     *
     * @return XML representation of the Nutzdaten part as a string.
     */
    getNutzdatenXml: function(testcase) {
        var nutzdaten = new geierlein.util.Xml();
        var d = new Date();
        var erstellDatum = this.erstellungsdatum || d.getFullYear() +
            ('0' + (d.getMonth() + 1)).substr(-2) +
            ('0' + d.getDate()).substr(-2);

        nutzdaten.writeStartDocument();
        nutzdaten.writeStartElement('Nutzdaten');
            nutzdaten.writeStartElement('Anmeldungssteuern');
            nutzdaten.writeAttributeString('art', 'UStVA');
            nutzdaten.writeAttributeString('version', this.jahr + '01');

            nutzdaten.writeStartElement('DatenLieferant')
                nutzdaten.writeXml(this.datenlieferant.toXml());
            nutzdaten.writeEndElement();

            nutzdaten.writeElementString('Erstellungsdatum', erstellDatum);

            nutzdaten.writeStartElement('Steuerfall');
                nutzdaten.writeStartElement('Umsatzsteuervoranmeldung');
                    nutzdaten.writeElementString('Jahr', this.jahr);
                    nutzdaten.writeElementString('Zeitraum',
                        ('0' + this.zeitraum).substr(-2));
                    nutzdaten.writeElementString('Steuernummer',
                        this.getFormattedTaxNumber());
                    nutzdaten.writeElementString('Kz09',
                        testcase ? '74931' : this.herstellerID);

                    for(var key in xmlWritingRules) {
                        var fmtValue = xmlWritingRules[key](this[key]);
                        if(fmtValue === false) {
                            continue;
                        }
                        nutzdaten.writeElementString('Kz' + key.substr(2),
                            fmtValue);
                    }

        return nutzdaten.flush(true);
    }
});
