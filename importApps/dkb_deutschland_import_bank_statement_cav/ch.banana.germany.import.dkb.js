// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.germany.import.dkbdeutschland
// @api = 1.0
// @pubdate = 2025-04-03
// @publisher = Banana.ch SA
// @description = DKB Deutschland - Import account statement .csv (Banana+ Advanced)
// @description.en = DKB Deutschland - Import account statement .csv (Banana+ Advanced)
// @description.de = DKB Deutschland - Bewegungen importieren .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf-8
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {

  var importUtilities = new ImportUtilities(Banana.document);

  if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
    return "";

  let convertionParam = defineConversionParam(string);

  var transactions = Banana.Converter.csvToArray(string, ';');
  let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);

  // DKB Format 1
  var dkbFormat1 = new DKBFormat1();
  if (dkbFormat1.match(transactionsData)) {
    transactions = dkbFormat1.convert(transactionsData);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format is unknow, return an error
  importUtilities.getUnknownFormatError();

  return "";

}

/**
 * "Girokonto";"DE111111111111111111"
 * "Zeitraum:";"31.03.2025 - 31.03.2025"
 * "Kontostand vom 31.03.2025:";"1.361,16 €"
 * ""
 * "Buchungsdatum";"Wertstellung";"Status";"Zahlungspflichtige*r";"Zahlungsempfänger*in";"Verwendungszweck";"Umsatztyp";"IBAN";"Betrag (€)";"Gläubiger-ID";"Mandatsreferenz";"Kundenreferenz"
 * "31.03.25";"31.03.25";"Gebucht";"ISSUER";"test";"VISA Debitkartenumsatz";"Ausgang";"DE22222222222222222222";"-15,18";;;"123456"
 * "31.03.25";"31.03.25";"Gebucht";"ISSUER";"test";"VISA Debitkartenumsatz";"Ausgang";"DE22222222222222222222";"-71,16";;;"123456"
 */
function DKBFormat1() {

  /** Return true if the transactions match this format */
  this.match = function (transactionsData) {
    if (transactionsData.length === 0)
      return false;

    for (var i = 0; i < transactionsData.length; i++) {
      var transaction = transactionsData[i];
      var formatMatched = false;

      if (transaction["Buchungsdatum"] && transaction["Buchungsdatum"].length >= 8 &&
        transaction["Buchungsdatum"].match(/[0-9\.\-\/]+/g))
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction["Wertstellung"] && transaction["Wertstellung"].length >= 8 &&
        transaction["Wertstellung"].match(/[0-9\.\-\/]+/g))
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched)
        return true;
    }

    return false;
  }

  this.convert = function (transactionsData) {
    var transactionsToImport = [];

    for (var i = 0; i < transactionsData.length; i++) {
      if (transactionsData[i]["Buchungsdatum"] && transactionsData[i]["Buchungsdatum"].length >= 8 &&
        transactionsData[i]["Buchungsdatum"].match(/[0-9\.\-\/]+/g)) {
        transactionsToImport.push(this.mapTransaction(transactionsData[i]));
      }
    }

    // Sort rows by date
    transactionsToImport = transactionsToImport.reverse();

    // Add header and return
    var header = [["Date", "DateValue", "Description", "Notes", "Income", "Expenses"]];
    return header.concat(transactionsToImport);
  }

  this.mapTransaction = function (element) {
    var mappedLine = [];

    mappedLine.push(Banana.Converter.toInternalDateFormat(element["Buchungsdatum"], "dd.mm.yy"));
    mappedLine.push(Banana.Converter.toInternalDateFormat(element["Wertstellung"], "dd.mm.yy"));
    mappedLine.push(element["Verwendungszweck"]);
    mappedLine.push(element["Zahlungsempfänger*in"]);

    if (element["Betrag (€)"].charAt(0) === '-') {
      let cleanAmt = element["Betrag (€)"].replace(/-/g, '');
      mappedLine.push("");
      mappedLine.push(Banana.Converter.toInternalNumberFormat(cleanAmt, ","));
    } else {
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element["Betrag"], ","));
      mappedLine.push("");
    }
    return mappedLine;
  }
}

function defineConversionParam(inData) {

  var inData = Banana.Converter.csvToArray(inData, ';', '"');
  var header = String(inData[0]);
  var convertionParam = {};
  /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
  convertionParam.format = "csv"; // available formats are "csv", "html"
  //get text delimiter
  convertionParam.textDelim = '"';
  // get separator
  if (header.indexOf(';') >= 0) {
    convertionParam.separator = ';';
  } else {
    convertionParam.separator = ',';
  }

  /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
  We suppose the data will always begin right away after the header line */
  convertionParam.headerLineStart = 4;
  convertionParam.dataLineStart = 5;
  return convertionParam;
}

function getFormattedData(inData, convertionParam, importUtilities) {
  var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
  var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
  let form = [];
  //Load the form with data taken from the array. Create objects
  importUtilities.loadForm(form, columns, rows);
  return form;
}
