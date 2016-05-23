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

function exec() {

  // Show debug output in the Message pane of the current window only.
  Banana.document.clearMessages();

  // Function call to manage and save user settings about the period date.
  var period = getPeriodSettings();

  // Cancel if user did not enter a Periode.
  if (!period) {
    Banana.document.addMessage(JSON.stringify('Bitte wählen Sie einen Zeitbereich.', null, 4));
    return;
  }



  // TODO: Make sure we get a known State from the AccountingDataBase.
  var land = getLandIdByName(Banana.document.info('AccountingDataBase','State'));

  // Get netto Umsatz values for 19% and 7%.
  // Must be positive and Integers.
  var vatU19 = Banana.document.vatCurrentBalance('U19', period.start, period.end);
  var vatTaxableU19 = Math.abs(vatU19.vatTaxable);
  vatTaxableU19 = parseInt(vatTaxableU19, 10);

  var vatU7 = Banana.document.vatCurrentBalance('U7', period.start, period.end);
  var vatTaxableU7 = Math.abs(vatU7.vatTaxable);
  vatTaxableU7 = parseInt(vatTaxableU7, 10);

  var vatUE19 = Banana.document.vatCurrentBalance('UE19', period.start, period.end);
  var vatTaxableUE19 = Math.abs(vatUE19.vatTaxable);
  vatTaxableUE19 = parseInt(vatTaxableUE19, 10);

  // Get added Vorsteuer.
  var vatV = Banana.document.vatCurrentBalance('V*', period.start, period.end);


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
    zeitraum: '4',
    kz81: vatTaxableU19,
    kz86: vatTaxableU7,
    kz89: vatTaxableUE19,
    kz93: '',
    kz66: vatV.vatAmount,
    kz61: '',
    kz62: '',
    kz39: '',
    kz83: ''
  };

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
    Banana.document.addMessage(JSON.stringify('Fehler bei der Validierung der Daten.', null, 4));
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
