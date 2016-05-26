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
// @id = ch.banana.apps.ustvagermany
// @description = Elster UStVA (COALA XML)
// @task = export.file
// @doctype = 100.110;100.130;110.110;110.130
// @publisher = Banana.ch SA
// @pubdate = 2016-05-23
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
    Banana.document.addMessage('Bitte wählen Sie einen Zeitbereich.');
    return;
  }

  // TODO: Make sure we get a known State from the AccountingDataBase.
  var land = getLandIdByName(Banana.document.info('AccountingDataBase','State'));

  // Get data from AccountingDataBase.
  // TODO: User friendly error handling for missing or wrong values.
  var data = {
    name: Banana.document.info('AccountingDataBase','Company'),
    strasse: Banana.document.info('AccountingDataBase','Address1'),
    plz: Banana.document.info('AccountingDataBase','Zip'),
    ort: Banana.document.info('AccountingDataBase','City'),
    telefon: Banana.document.info('AccountingDataBase','Phone'),
    email: Banana.document.info('AccountingDataBase','Email'),
    land: '13',
    steuernummer: Banana.document.info('AccountingDataBase','FiscalNumber'),
    jahr: '2016',
    zeitraum: '4'
  };

  var kennziffern = getGermanKennziffernFromVatTable();
  for (var i in kennziffern) {
    var kz = kennziffern[i];
    var vatCodes = getVatCodesByGr2(kz);
    var vat = Banana.document.vatCurrentBalance(vatCodes, period.start, period.end);
    if (vat.rowCount) {
      var taxable = vat.vatTaxable * -1;
      data['kz'+kz] = parseInt(taxable, 10);

      var pair = getPairwiseKennziffer(kz);
      if (pair) {
        var vatAmount = vat.vatAmount * -1;
        data['kz'+pair] = parseInt(vatAmount, 10);
      }
    }
  }

  // Get added Vorsteuer.
  var vatV = Banana.document.vatCurrentBalance('V*', period.start, period.end);

  Banana.application.showMessages(false);
  Banana.document.addMessage(JSON.stringify(data, null, 4));

  var ustva = new geierlein.UStVA();

  // Format data.
  for(var key in data) {
    if(data[key] === '') {
      /* Skip empty fields, especially the GUI version simply adds them
         all to explicitly state that the field was left empty. */
      continue;
    }
    if(key.substr(0, 2) === 'kz'
       || key === 'land') {
        /* Information belongs to the UStVA document and is numeric. */
        ustva[key] = +data[key] // .replace(',', '.');
    } else if(key === 'steuernummer'
       || key === 'jahr'
       || key === 'zeitraum') {
        /* Information belongs to the UStVA document and is a string. */
        ustva[key] = data[key];
    } else {
        ustva.datenlieferant[key] = data[key];
    }
  }

  // Calculate resulting value for UStVA.
  if(ustva.kz83 === undefined) {
    ustva.kz83 = +ustva.calculateKz83().toFixed(2);
  }

  // Validate data.
  // TODO: User friendly error handling for missing Stammdaten or wrong Kennzahlen.
  var validationResult = ustva.validate();
  if(validationResult !== true) {
    Banana.document.addMessage('Fehler bei der Validierung der Daten.');
    return;
  }

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
 * Get VAT Codes from the VAT table by value of the Gr2 column.
 *
 * The Gr2 value usually is a german UStVA Kennziffer.
 *
 * @param  {int}    gr2 Value of Gr2 column in the VAT table.
 * @return {string}     One VAT code or many VAT codes devided by "|" (pipe).
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
 * @param  {int}    gr2   Value of Gr2 column in the VAT table.
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

function getGermanKennziffernFromVatTable() {
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

  var kennziffern = new Array();
  for (var i in rows) {
    var value = rows[i].value("Gr2");
    if (value.length > 0 && kennziffern.indexOf(value) < 0) {
      kennziffern.push(value);
    }
  }

  return kennziffern;
}

/**
 * Get pair
 *
 * @param  {[type]} kz [description]
 * @return {[type]}    [description]
 */
function getPairwiseKennziffer(kz) {
  var pairs = {
    35: 36,
    76: 80,
    95: 98,
    94: 96,
    46: 47,
    52: 53,
    73: 74,
    78: 79,
    84: 85
  }

  if (pairs[kz]) {
    return pairs[kz];
  }

  return false;
}
