// Copyright [2015] [Banana.ch SA - Lugano Switzerland]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @api = 1.0
// @id = ch.banana.apps.ustvagermany-2016
// @description = Elster UStVA XML-Export
// @task = export.file
// @doctype = 100.110;100.130;110.110;110.130
// @publisher = Banana.ch SA
// @pubdate = 2017-03-02
// @inputdatasource = none
// @timeout = -1
// @exportfiletype = xml
// @exportfilename = Elster-UStVA-<Date>
// @outputformat = none
// @inputdataform = none
// @includejs = xmlwriter.js
// @includejs = geierlein.js

/*
  Show messages for debugging:
  - Show message in message pane only, not as alert:
    Banana.application.showMessages(false);
  - Show objects and arrays:
    Banana.document.addMessage(JSON.stringify(variable, null, 4));
 */

function exec() {

  // Show debug output in the Message pane of the current window only.
  Banana.document.clearMessages();

  // Function call to manage and save user settings about the period date.
  var period = getPeriodSettings();

  // Cancel if user did not enter a Periode.
  if (!period) {
    Banana.application.showMessages(true);
    Banana.document.addMessage('Bitte wählen Sie einen Zeitbereich.');
    return '@Cancel';
  }

  // Get year from period.
  var year = getYearFromPeriod(period);

  // Get "zeitraum".
  var zeitraum = getZeitraumFromPeriod(period);

  // Cancel if chosen period is not valid for German UStVA.
  // Only monthly or quarterly is allowed.
  if (!zeitraum) {
    Banana.application.showMessages(true);
    Banana.document.addMessage('Der gewählten Zeitbereich ist für die UStVA nicht gültig. Bitte wählen Sie einen monatlichen oder einen quartalsweisen Zeitraum.');
    return '@Cancel';
  }

  // Get a State from the AccountingDataBase.
  var land = getLandIdByName(Banana.document.info('AccountingDataBase','State'));

  // Get data from AccountingDataBase.
  var data = {
    name: Banana.document.info('AccountingDataBase','Company'),
    strasse: Banana.document.info('AccountingDataBase','Address1'),
    plz: Banana.document.info('AccountingDataBase','Zip'),
    ort: Banana.document.info('AccountingDataBase','City'),
    telefon: Banana.document.info('AccountingDataBase','Phone'),
    email: Banana.document.info('AccountingDataBase','Email'),
    land: land,
    steuernummer: Banana.document.info('AccountingDataBase','FiscalNumber'),
    jahr: year,
    zeitraum: zeitraum
  };

  // Get entries from VAT table.
  var vatTableValues = getValuesfromVatTable();

  // Get VAT balance for every VAT code separately and do not group by
  // Gr2 (Kennzahl) - which seems logical - because depending on IsDue and
  // AmountType the meaning of the values returned by vatCurrentBalance()
  // can be different.
  var noTransactionsInPeriod = true;
  for (var i in vatTableValues) {
    var kennzahl = 'kz' + vatTableValues[i].Gr2;
    var vatCode = vatTableValues[i].VatCode;
    var isDue = vatTableValues[i].IsDue;
    var vat = Banana.document.vatCurrentBalance(vatCode, period.start, period.end);

    // No VAT for this VAT code.
    if (!vat.rowCount) {
      continue;
    }

    // Got at least one transaction.
    noTransactionsInPeriod = false;

    // Dependend on IsDue flag use different values:
    // - IsDue = true, means Umsatzsteuer (due): use vatTaxable.
    // - IsDue = false, means Vorsteuer: use vatAmount.
    if (isDue) {
      var value = vat.vatTaxable;
      // Following the accounting convention the sign of vatAmount/vatTaxable is
      // negative (debit) if the VAT is due. Invert it for use in the UStVA.
      value = value * -1;
      // Taxable values always are Integers. German tax office is not interested
      // in your cents.
      value = parseInt(value, 10);
    }
    else {
      var value = vat.vatAmount;
    }

    // Add this VAT code sum to other VAT codes with same Kennzahl.
    data[kennzahl] = data[kennzahl] ? Banana.SDecimal.add(data[kennzahl], value) : value;

    var pairKennzahl = getPairwiseKennzahl(kennzahl);
    if (pairKennzahl) {
      // Pairs are VAT amounts which must not be Integer. Cents are important here.
      vatAmount = isDue ? vat.vatAmount * -1 : vat.vatAmount;
      data[pairKennzahl] = data[pairKennzahl] ? Banana.SDecimal.add(data[pairKennzahl], vatAmount) : vatAmount;
    }
  }

  // Cancel if no transactions in the chosen period.
  if (noTransactionsInPeriod) {
    Banana.document.addMessage('Im gewählten Zeitbereich gibt es keine Buchungen.');
    return '@Cancel';
  }

  // For debugging only.
  // Banana.application.showMessages(false);
  // Banana.document.addMessage(JSON.stringify(data, null, 4));
  // Banana.application.showMessages(true);

  // Create Geierlein object. See https://github.com/stesie/geierlein.
  var ustva = new geierlein.UStVA();

  // This for-loop copied from geierlein-0.9.3/bin/geierlein and adopted for
  // our needs.

  // Format data.
  for (var key in data) {
    if (data[key] === '') {
      // Skip empty fields.
      continue;
    }
    if (key.substr(0, 2) === 'kz' || key === 'land') {
      // Information belongs to the UStVA document and is numeric.
      ustva[key] = +data[key];
    }
    else if (key === 'steuernummer' || key === 'jahr' || key === 'zeitraum') {
      // Information belongs to the UStVA document and is a string.
      ustva[key] = data[key];
    }
    else {
      ustva.datenlieferant[key] = data[key];
    }
  }

  // Validate Stammdaten.
  var validationResult = ustva.datenlieferant.validate();

  // Steuernummer and Land will not be validated by
  // ustva.datenlieferant.validate() but by ustva.validate().
  // Move the results for those two to validationResult.
  if (data.steuernummer == undefined || data.steuernummer.length == 0) {
    validationResult = validationResult === true ? [] : validationResult;
    validationResult.push('steuernummer');
  }
  if (data.land == undefined || data.land.length == 0) {
    validationResult = validationResult === true ? [] : validationResult;
    validationResult.push('land');
  }

  // Show error dialog if Stammdaten did not validate.
  if (validationResult !== true) {
    Banana.Ui.showText(validateStammdatenDialogText(validationResult));
    return '@Cancel';
  }

  // Calculate resulting value for UStVA.
  if (ustva.kz83 === undefined) {
    ustva.kz83 = +ustva.calculateKz83().toFixed(2);
  }

  // Validate Kennzahlen.
  var validationResult = ustva.validate();

  // Show error dialog if Kennzahlen did not validate.
  if (validationResult !== true) {
    Banana.Ui.showText(validateKennzahlenDialogText(validationResult));
    return '@Cancel';
  }

  // Show control output dialog.
  Banana.Ui.showText(controlDialogText(ustva, period));

  // Create XML and export it to a file. See @exportfiletype above.
  return ustva.toXml(false);
}


/**
 * Convert State name to ID defined by COALA.
 *
 * @param  {string} name  Name of german state like "Sachsen".
 * @return {int}          Id of state conforming to Elster COALA standards.
 */
function getLandIdByName(name) {
  var landToId = {
    'Baden-Württemberg': 1,
    'Bayern': 2,
    'Berlin': 3,
    'Brandenburg': 4,
    'Bremen': 5,
    'Hamburg': 6,
    'Hessen': 7,
    'Mecklenburg-Vorpommern': 8,
    'Niedersachsen': 9,
    'Nordrhein-Westfalen': 10,
    'Rheinland-Pfalz': 11,
    'Saarland': 12,
    'Sachsen': 13,
    'Sachsen-Anhalt': 14,
    'Schleswig-Holstein': 15,
    'Thüringen': 16
  };

  return landToId[name];
}

//The main purpose of this function is to allow the user to enter the accounting period desired and saving it for the next time the script is run.
//Every time the user runs of the script he has the possibility to change the date of the accounting period.
function getPeriodSettings() {

  //The formeters of the period that we need
  var scriptform = {
     "start": "",
     "end": "",
     "checked": "false"
  };

  //Read script settings
  var data = Banana.document.scriptReadSettings();

  //Check if there are previously saved settings and read them
  if (data.length > 0) {
    try {
      var readSettings = JSON.parse(data);

      //We check if "readSettings" is not null, then we fill the formeters with the values just read
      if (readSettings) {
        scriptform = readSettings;
      }
    } catch (e){}
  }

  //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
  var start = Banana.document.startPeriod();
  var end = Banana.document.endPeriod();

  //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
  var selectedDates = Banana.Ui.getPeriod("Period", start, end,
    scriptform.start, scriptform.end, scriptform.checked);

  //We take the values entered by the user and save them as "new default" values.
  //This because the next time the script will be executed, the dialog window will contains the new values.
  if (selectedDates) {
    scriptform["start"] = selectedDates.startDate;
    scriptform["end"] = selectedDates.endDate;
    scriptform["checked"] = selectedDates.hasSelection;

    //Save script settings
    var formToString = JSON.stringify(scriptform);
    var value = Banana.document.scriptSaveSettings(formToString);
  }
  else {
    //User clicked cancel
    return;
  }
  return scriptform;
}


/**
 * Get pair value to some special case Kennzahlen has to appear pairwise.
 *
 * Example: Kz35 contains taxable amount, Kz36 contains VAT amount which is
 * not defined by a fixed tax rate. Therefor it got be entered manually by
 * using a split entry in the booking table: first entry for taxable amount,
 * second entry for VAT amount with AmountType = 2.
 *
 * @param  {int} kz UStVA Kennzahl for taxable amount.
 * @return {int}    UStVA Kennzahl for VAT amount.
 */
function getPairwiseKennzahl(kz) {
  var pairs = {
    kz35: 'kz36',
    kz76: 'kz80',
    kz95: 'kz98',
    kz94: 'kz96',
    kz46: 'kz47',
    kz52: 'kz53',
    kz73: 'kz74',
    kz78: 'kz79',
    kz84: 'kz85'
  }

  // No pair value found.
  if (pairs[kz] === undefined) {
    return false;
  }

  // Return pair value.
  return pairs[kz];
}

/**
 * Get reverse pair value to some special case Kennzahlen.
 *
 * Opposite of getPairwiseKennzahl().
 *
 * @param  {int} kz UStVA Kennzahl for VAT amount.
 * @return {int}    UStVA Kennzahl for taxable amount.
 */
function getPairwiseKennzahlReverse(kz) {
  var pairs = {
    kz36: 'kz35',
    kz80: 'kz76',
    kz98: 'kz95',
    kz96: 'kz94',
    kz47: 'kz46',
    kz53: 'kz52',
    kz74: 'kz73',
    kz79: 'kz78',
    kz85: 'kz84'
  }

  // No pair value found.
  if (pairs[kz] === undefined) {
    return false;
  }

  // Return pair value.
  return pairs[kz];
}

/**
 * Get all necessary values from the VatTable to calculate VAT values.
 *
 * @return {array} List of VAT codes together with some additional information.
 */
function getValuesfromVatTable() {
  // Get VAT table and its rows.
  var tableVatCodes = Banana.document.table("VatCodes");
  if (!tableVatCodes) {
    return '';
  }

  var rows = tableVatCodes.rows;
  if (!rows) {
    return '';
  }

  // Loop through the rows and extract some necessary fields.
  var vatTableValues = [];
  for (var i in rows) {
    var gr2 = rows[i].value("Gr2");
    var vatCode = rows[i].value("VatCode");
    var isDue = rows[i].value("IsDue");
    var amountType = rows[i].value("AmountType");

    // For german UStVA the Gr2 (Kennzahl) needs to be available.
    // Also without VAT code there is no VAT code anyway.
    if (!gr2 || !vatCode) {
      continue;
    }

    // Append information as array to the return value.
    vatTableValues.push({
      Gr2: gr2,
      VatCode: vatCode,
      IsDue: isDue,
      AmountType: amountType
    });
  }

  return vatTableValues;
}

/**
 * Calculate "zeitraum" between start and end of period.
 *
 * @param  {[type]} period [description]
 * @return {[type]}        [description]
 */
function getZeitraumFromPeriod(period) {
  // Unfortunately V8 Javascript engine used by Banana does not support
  // the "YYYY-MM-DD" format in Date.parse(). So just use split() to get
  // the parts of a date.
  var start = period.start.split('-');
  var end = period.end.split('-');

  var startMonth = start[1];
  var endMonth = end[1];

  // 1 month period.
  if (startMonth == endMonth) {
    return startMonth;
  }

  // Quarter period - 3 months.
  if (endMonth - startMonth == 2) {
    switch (startMonth) {
      case '01':
        return '41';
      case '04':
        return '42';
      case '07':
        return '43';
      case '10':
        return '44';
    }
  }

  return false;
}

/**
 * Get year part from start period.
 *
 * @param  {[type]} period [description]
 * @return {[type]}        [description]
 */
function getYearFromPeriod(period) {
  var start = period.start.split('-');
  return start[0];
}

/**
 * Create HTML text from data calculated by Geierlein as well as static data like the address.
 *
 * @param  {[type]} ustva            [description]
 * @param  {[type]} period           [description]
 * @param  {[type]} validationResult [description]
 * @return {[type]}                  [description]
 */
function controlDialogText(ustva, period, validationResult) {
  var html = '\
  <html>\
    <head>\
      <title>{0}</title>\
    </head>\
    <body>\
      <h3>{0}</h3>\
      <p></p>\
      <h4>Stammdaten:</h4>\
      <table>\
        <tr>\
          <td>Zeitraum:</td>\
          <td>&nbsp;</td>\
          <td>{1} bis {2}</td>\
        </tr>\
        <tr>\
          <td>Name:</td>\
          <td>&nbsp;</td>\
          <td>{3}</td>\
        </tr>\
        <tr>\
          <td>Adresse:</td>\
          <td>&nbsp;</td>\
          <td>{4}</td>\
        </tr>\
        <tr>\
          <td>PLZ/Ort:</td>\
          <td>&nbsp;</td>\
          <td>{5} {6}</td>\
        </tr>\
        <tr>\
          <td>Telefon:</td>\
          <td>&nbsp;</td>\
          <td>{7}</td>\
        </tr>\
        <tr>\
          <td>Emailadresse:</td>\
          <td>&nbsp;</td>\
          <td>{8}</td>\
        </tr>\
        <tr>\
          <td>Steuernummer:</td>\
          <td>&nbsp;</td>\
          <td>{9}</td>\
        </tr>\
        <tr>\
          <td>Bundesland:</td>\
          <td>&nbsp;</td>\
          <td>{10}</td>\
        </tr>\
      </table>\
      <h4>Kennzahlen:</h4>\
      <table>\
        {11}\
      </table>\
    </body>\
  </html>';

  // Add calculated Kennzahlen.
  var kennzahlen = '';
  var basicCurrency = Banana.document.info("AccountingDataBase","BasicCurrency");
  for (var kz in ustva) {
    if (typeof(kz) != 'string' || kz.slice(0,2) != 'kz' || getPairwiseKennzahlReverse(kz)) {
      continue;
    }

    var kzLabel = Banana.Converter.stringToTitleCase(kz);
    var pair = '&nbsp;';
    var delimiter = '&nbsp;';

    // Add pairwise Kennzahlen into one line together.
    var pairKz = getPairwiseKennzahl(kz);
    if (pairKz) {
      pair = sprintf('{0} {1}', Banana.Converter.toLocaleNumberFormat(ustva[pairKz]), basicCurrency);
      kzLabel = sprintf('{0}/{1}', kzLabel, Banana.Converter.stringToTitleCase(pairKz));
      delimiter = '/';
    }

    kennzahlen = kennzahlen + sprintf('<tr><td>{0}:</td><td>&nbsp;</td><td align="right">{1} {2}</td><td>{3}</td><td align="right">{4}</td><td >&nbsp;</td></tr>',
      kzLabel,
      Banana.Converter.toLocaleNumberFormat(ustva[kz]),
      basicCurrency,
      delimiter,
      pair);
  }

  var datenKonsistent = validationResult ? 'ja' : 'nein';

  return sprintf(html,
    'Elster-UStVA Export: Kontrollansicht der berechneten Daten',
    period.start,
    period.end,
    ustva.datenlieferant.name,
    ustva.datenlieferant.strasse,
    ustva.datenlieferant.plz,
    ustva.datenlieferant.ort,
    ustva.datenlieferant.telefon,
    ustva.datenlieferant.email,
    ustva.steuernummer,
    Banana.document.info('AccountingDataBase','State'),
    kennzahlen);
}

/**
 * sprintf-like function for replacing placeholders in a string.
 *
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
function sprintf(string) {
  var args = Array.prototype.slice.call(arguments, 1);
  return string.replace(/{(\d+)}/gm, function(match, number) {
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
}

/**
 * Build text for Stammdaten validation error dialog.
 *
 * @param  {[type]} validationResult [description]
 * @return {[type]}                  [description]
 */
function validateStammdatenDialogText(validationResult) {
  var html = '\
  <html>\
    <head>\
      <title>{0}</title>\
    </head>\
    <body>\
      <h3>{0}</h3>\
      <p>In den Stammdaten der aktuellen Datei fehlen folgende Angaben:</p>\
      <p></p>\
      <ul>\
        {1}\
      </ul>\
      <p>Bitte tragen Sie die Daten im Menü <em>Datei > Eigenschaften (Stammdaten)...</em> unter <em>Adresse</em> nach und starten Sie den Elster-UStVA Export anschließend erneut.</p>\
    </body>\
  </html>';

  var error = '';
  for (var i in validationResult) {
    var key = validationResult[i];

    // Add text to some special cases.
    switch (key) {
      case 'land':
        key = 'Bundesland (Feld: Region)';
        break;
      case 'strasse':
        key = 'Strasse (Feld: Adresse 1)';
        break;
      case 'plz':
        key = 'PLZ (Feld: Postleitzahl)';
        break;
      default:
        key = Banana.Converter.stringToTitleCase(key);
    }

    error = error + sprintf('<li>{0}</li>', key);
  }

  return sprintf(html, 'Elster-UStVA Export: Fehler in den Stammdaten', error);
}

/**
 * Build text for Kennzahlen validation error dialog.
 *
 * @param  {[type]} validationResult [description]
 * @return {[type]}                  [description]
 */
function validateKennzahlenDialogText(validationResult) {
  var html = '\
  <html>\
    <head>\
      <title>{0}</title>\
    </head>\
    <body>\
      <h3>{0}</h3>\
      <p>Folgende Kennzahlen konnten nicht korrekt validiert werden:</p>\
      <p></p>\
      <ul>\
        {1}\
      </ul>\
      <p>Entweder stimmt die Buchhaltung nicht oder die Elster-UStVA App enthält Fehler.</p>\
    </body>\
  </html>';

  var error = '';
  for (var i in validationResult) {
    var key = validationResult[i];

    // If error is in Kennzahl: Get VAT code(s) for the Kennzahl.
    if (key.slice(0,2) == 'kz') {
      var kennzahl = Banana.Converter.stringToTitleCase(key);
      var vatCodes = getVatCodesByGr2(key.slice(2));

      // If no VAT Code it maybe is a pairwise Kennzahl. Get the pair and try
      // getting VAT codes from it.
      if (vatCodes.length == 0 && getPairwiseKennzahlReverse(key)) {
        key = getPairwiseKennzahlReverse(key);
        vatCodes = getVatCodesByGr2(key.slice(2));
      }

      vatCodes = vatCodes.replace('|', ', ');
    }

    if (vatCodes) {
      error = error + sprintf('<li>{0} ({1})</li>', kennzahl, vatCodes);
    }
    else {
      key = Banana.Converter.stringToTitleCase(key);
      error = error + sprintf('<li>{0}</li>', key);
    }
  }

  return sprintf(html, 'Elster-UStVA Export: Fehler in den Kennzahlen', error);
}

/**
 * Get VAT Codes from the VAT table by value of the Gr2 column.
 *
 * The Gr2 value usually is a german UStVA Kennzahl.
 *
 * @param  {int}    gr2  Value of Gr2 column in the VAT table.
 * @return {string}      One VAT code or many VAT codes devided by "|" (pipe).
 */
function getVatCodesByGr2(gr2) {
  var tableVatCodes = Banana.document.table("VatCodes");
  if (!tableVatCodes) {
    return '';
  }

  // Get rows of VAT table containing the submitted Gr2 value.
  // Using an anonymous function as callback to allow adding the gr2 parameter
  // to the callback function.
  var rows = tableVatCodes.findRows(function(row, index, table) {return filterVatTableRowsByGr2(row, index, table, gr2)} );
  if (!rows) {
    return '';
  }

  // Loop through results and get the VatCode value.
  var vatCodes = [];
  for (var i in rows) {
    vatCodes.push(rows[i].value("VatCode"));
  }

  // Return VatCodes as string devided by "|".
  return vatCodes.join('|');
}

/**
 * Call back for findRows() to filter VAT table for a value in the Gr2 column.
 *
 * @param  {int}     gr2  Value of Gr2 column in the VAT table.
 * @return {boolean}      True if Gr2 column of row matches, false if not.
 */
function filterVatTableRowsByGr2(row, index, table, gr2) {
  var rowGr2 = row.value("Gr2");

  if (gr2 == '*' && rowGr2.length > 0) {
    return true;
  }

  if (gr2 == rowGr2) {
    return true;
  }

  return false;
}

/**
 * Unused functions - left for later reference.
 */

/**
 * Get the UStVA Kennzahlen used inside the VAT table, in column Gr2.
 *
 * @return {array} List of Kennzahlen.
 */
function getGermanKennzahlenFromVatTable() {
  var tableVatCodes = Banana.document.table("VatCodes");
  if (!tableVatCodes) {
    return '';
  }

  // Get rows of VAT table containing the submitted Gr2 value.
  // Using an anonymous function as callback to allow adding the gr2 parameter
  // to the callback function.
  var rows = tableVatCodes.findRows(function(row, index, table) {return filterVatTableRowsByGr2(row, index, table, '*')} );
  if (!rows) {
    return '';
  }

  var kennzahlen = new Array();
  for (var i in rows) {
    var value = rows[i].value("Gr2");
    if (value.length > 0 && kennzahlen.indexOf(value) < 0) {
      kennzahlen.push(value);
    }
  }

  return kennzahlen;
}
