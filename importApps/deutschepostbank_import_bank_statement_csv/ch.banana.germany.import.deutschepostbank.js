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

// @id = ch.banana.germany.import.deutschepostbank
// @api = 1.0
// @pubdate = 2025-04-16
// @publisher = Banana.ch SA
// @description = Deutsche Postbank - Import account statement .csv (Banana+ Advanced)
// @description.en = Deutsche Postbank - Import account statement .csv (Banana+ Advanced)
// @description.de = Deutsche Postbank - Bewegungen importieren .csv (Banana+ Advanced)
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

  var transactions = Banana.Converter.csvToArray(string, ';', '"');

  let convertionParam = "";
  let transactionsData = [];

  // Format 1 - Deutsche Postbank
  var format1 = new DPbFormat1();
  convertionParam = format1.defineConversionParam(string);
  transactionsData = format1.getFormattedData(transactions, convertionParam, importUtilities);
  if (format1.match(transactionsData)) {
    transactions = format1.convert(transactionsData);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format is unknow, return an error
  importUtilities.getUnknownFormatError();

  return "";

}

function DPbFormat1() {

  this.defineConversionParam = function (inData) {

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
    convertionParam.headerLineStart = 7;
    convertionParam.dataLineStart = 8;
    return convertionParam;
  }

  this.getFormattedData = function (transactions, convertionParam, importUtilities) {
    const transactionsCopy = JSON.parse(JSON.stringify(transactions)); // Copy the transactions array
    var columns = importUtilities.getHeaderData(transactionsCopy, convertionParam.headerLineStart); //array
    var rows = importUtilities.getRowData(transactionsCopy, convertionParam.dataLineStart); //array of array
    let form = [];
    //Load the form with data taken from the array. Create objects
    importUtilities.loadForm(form, columns, rows);
    return form;
  }

  /** Return true if the transactions match this format */
  this.match = function (transactionsData) {
    if (transactionsData.length === 0)
      return false;

    for (var i = 0; i < transactionsData.length; i++) {
      var transaction = transactionsData[i];
      var formatMatched = true;

      if (formatMatched && transaction["Buchungstag"] && transaction["Buchungstag"].length >= 8 &&
        transaction["Buchungstag"].match(/[0-9\.\-\/]+/g))
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction["Wert"] && transaction["Wert"].length >= 8 &&
        transaction["Wert"].match(/[0-9\.\-\/]+/g))
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
      if (transactionsData[i]["Betrag"]) {
        transactionsToImport.push(this.mapTransaction(transactionsData[i]));
      }
    }

    // Sort rows by date
    transactionsToImport = transactionsToImport.reverse();

    // Add header and return
    var header = [["Date", "DateValue", "Description", "Income", "Expenses", "Notes"]];
    return header.concat(transactionsToImport);
  }

  this.mapTransaction = function (element) {
    var mappedLine = [];

    mappedLine.push(Banana.Converter.toInternalDateFormat(element["Buchungstag"], "dd.mm.yyyy"));
    mappedLine.push(Banana.Converter.toInternalDateFormat(element["Wert"], "dd.mm.yyyy"));
    // i want to replace double spaces with a single space
    let description = element["Verwendungszweck"].replace(/\s+/g, ' ').trim();
    mappedLine.push(description);

    if (element["Betrag"].charAt(0) === '-') {
      mappedLine.push("");
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element["Betrag"].substr(1)));
    } else {
      mappedLine.push(Banana.Converter.toInternalNumberFormat(element["Betrag"]));
      mappedLine.push("");
    }
    mappedLine.push(element["Umsatzart"]);

    return mappedLine;
  }
}
