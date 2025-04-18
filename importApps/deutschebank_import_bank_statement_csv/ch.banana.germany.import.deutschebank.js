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

// @id = ch.banana.germany.import.deutschebank
// @api = 1.0
// @pubdate = 2025-04-14
// @publisher = Banana.ch SA
// @description = Deutsche Bank - Import account statement .csv (Banana+ Advanced)
// @description.en = Deutsche Bank - Import account statement .csv (Banana+ Advanced)
// @description.de = Deutsche Bank - Bewegungen importieren .csv (Banana+ Advanced)
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

  // Format 5
  var format5 = new DBFormat5();
  convertionParam = format5.defineConversionParam(string);
  transactionsData = format5.getFormattedData(transactions, convertionParam, importUtilities);
  if (format5.match(transactionsData)) {
    transactions = format5.convert(transactionsData);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format 4 (Maybe Credit Card format ?), use the headers names
  var format4 = new DBFormat4();
  convertionParam = format4.defineConversionParam(string);
  transactionsData = format4.getFormattedData(transactions, convertionParam, importUtilities);
  if (format4.match(transactionsData)) {
    transactions = format4.convert(transactionsData);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format 3, use the headers names
  var format3 = new DBFormat3();
  convertionParam = format3.defineConversionParam(string);
  transactionsData = format3.getFormattedData(transactions, convertionParam, importUtilities);
  if (format3.match(transactionsData)) {
    transactions = format3.convert(transactionsData);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format 2
  var format2 = new DBFormat2();
  if (format2.match(transactions)) {
    transactions = format2.convert(transactions);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format 1
  var format1 = new DBFormat1();
  if (format1.match(transactions)) {
    transactions = format1.convert(transactions);
    return Banana.Converter.arrayToTsv(transactions);
  }

  // Format is unknow, return an error
  importUtilities.getUnknownFormatError();

  return "";

}

function DBFormat5() {

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
    var amountConverter = new AmountConverter('.', ',');

    mappedLine.push(Banana.Converter.toInternalDateFormat(element["Buchungstag"], "dd.mm.yyyy"));
    mappedLine.push(Banana.Converter.toInternalDateFormat(element["Wert"], "dd.mm.yyyy"));
    // i want to replace double spaces with a single space
    let description = element["Verwendungszweck"].replace(/\s+/g, ' ').trim();
    mappedLine.push(description);

    if (element["Betrag"].charAt(0) === '-') {
      mappedLine.push("");
      mappedLine.push(amountConverter.toInternalFormat(element["Betrag"].substr(1)));
    } else {
      mappedLine.push(amountConverter.toInternalFormat(element["Betrag"]));
      mappedLine.push("");
    }
    mappedLine.push(element["Umsatzart"]);

    return mappedLine;
  }
}

function DBFormat4() {

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
    convertionParam.headerLineStart = 0;
    convertionParam.dataLineStart = 1;
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

      if (formatMatched && transaction["Datum"] && transaction["Datum"].length >= 10 &&
        transaction["Datum"].match(/[0-9\.\-\/]+/g))
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
      if (transactionsData[i]["Datum"] && transactionsData[i]["Datum"].length >= 10 &&
        transactionsData[i]["Datum"].match(/[0-9\.\-\/]+/g)) {
        transactionsToImport.push(this.mapTransaction(transactionsData[i]));
      }
    }

    // Sort rows by date
    transactionsToImport = transactionsToImport.reverse();

    // Add header and return
    var header = [["Date", "Description", "Income", "Expenses"]];
    return header.concat(transactionsToImport);
  }

  this.mapTransaction = function (element) {
    var mappedLine = [];
    var amountConverter = new AmountConverter('.', ',');

    mappedLine.push(Banana.Converter.toInternalDateFormat(element["Datum"]));
    mappedLine.push(element["Verwendungszweck"]);

    if (element["Betrag"].charAt(0) === '-') {
      mappedLine.push("");
      mappedLine.push(amountConverter.toInternalFormat(element["Betrag"].substr(1)));
    } else {
      mappedLine.push(amountConverter.toInternalFormat(element["Betrag"]));
      mappedLine.push("");
    }
    return mappedLine;
  }
}

/**
 * Deutsche bank format 3
 * Xxx�xxx Mius�peciete Incem (63);;;Irexpastatum: 123 456789
 * 06.11.2023 - 30.01.2024
 * Addunis Vestondias;;;;11.478,60;LUS
 * Patestotime lis pass grabo sicieces Xxx�xxx stia grabo Ganequissus priere �stanesto.
 * Buchungstag;Wert;Umsatzart;Beg�nstigter / Auftraggeber;Verwendungszweck;IBAN;BIC;Kundenreferenz;Mandatsreferenz ;Gl�ubiger ID;Fremde Geb�hren;Betrag;Abweichender Empf�nger;Abweichender Auftraggeber;Anzahl der Auftr�ge;Anzahl der Schecks;Soll;Haben;W�hrung
 * 06.11.2023;06.11.2023;"Audactinsemus";;Funiuvituus//Nate/BY 73-14-2150R74:62:35 Expagnis. 4740534234636241;;;;;;;;;;;;-54,00;;EUR
 * 06.11.2023;06.11.2023;"Audactinsemus";;agite holus//Nate/BY 73-14-3757T76:43:51 Expagnis. 4740534234636241;;;;;;;;;;;;-79,90;;EUR
 */
function DBFormat3() {

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
    convertionParam.headerLineStart = this.getHeaderLineStart(inData);
    convertionParam.headerLineStart == 0 ? convertionParam.dataLineStart = 1 : convertionParam.dataLineStart = 5;
    return convertionParam;
  }

  this.getHeaderLineStart = function (inData) {
    /** Actually we have two options:
     * - 1) Header starts at 0 (format 4)
     * - 2) Header starts at 4 (format 1,2 and 3)
     * To define the case, we check if the dates in the second and third row are valid,
     * if we find a valid date, then we are working with the first option, otherwise with 
     * the second option.
     * For more information see the test cases.
     * */
    if (inData.length > 0) {

      let secondRowDate = inData[1][0]; // Date column in the second row.
      let thirdRowDate = inData[2][0]; // Date column in the third row.

      let date1 = Banana.Converter.toDate(secondRowDate);
      let date2 = Banana.Converter.toDate(thirdRowDate);

      if (date1 && date2) {
        return 0
      }
      return 4
    }
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

      if (formatMatched && transaction["Buchungstag"] && transaction["Buchungstag"].length >= 10 &&
        transaction["Buchungstag"].match(/[0-9\.\-\/]+/g))
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction["Wert"] && transaction["Wert"].length >= 10 &&
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
      if (transactionsData[i]["Buchungstag"] && transactionsData[i]["Buchungstag"].length >= 10 &&
        transactionsData[i]["Buchungstag"].match(/[0-9\.\-\/]+/g)) {
        transactionsToImport.push(this.mapTransaction(transactionsData[i]));
      }
    }

    // Sort rows by date
    transactionsToImport = transactionsToImport.reverse();

    // Add header and return
    var header = [["Date", "DateValue", "Description", "Income", "Expenses"]];
    return header.concat(transactionsToImport);
  }

  this.mapTransaction = function (element) {
    var mappedLine = [];
    var amountConverter = new AmountConverter('.', ',');

    mappedLine.push(Banana.Converter.toInternalDateFormat(element["Buchungstag"]));
    mappedLine.push(Banana.Converter.toInternalDateFormat(element["Wert"]));
    mappedLine.push(element["Verwendungszweck"]);

    if (element["Soll"].length > 0) {
      if (element["Soll"].charAt(0) === '-') {
        mappedLine.push("");
        mappedLine.push(amountConverter.toInternalFormat(element["Soll"].substr(1)));
      } else {
        mappedLine.push(amountConverter.toInternalFormat(element["Soll"]));
        mappedLine.push("");
      }
    } else if (element["Haben"].length > 0) {
      if (element["Haben"].charAt(0) === '-') {
        mappedLine.push("");
        mappedLine.push(amountConverter.toInternalFormat(element["Haben"].substr(1)));
      } else {
        mappedLine.push(amountConverter.toInternalFormat(element["Haben"]));
        mappedLine.push("");
      }
    }
    else {
      mappedLine.push("");
      mappedLine.push("");
    }
    return mappedLine;
  }
}

/**
 * Deutsche Bank Format 2
 Ums�tze pers�nliches Konto (00);;;Kundennummer: 130 1094275
30.06.2014 - 29.07.2014
Letzter Kontostand;;;;67.065,88;EUR
Vorgemerkte und noch nicht gebuchte Ums�tze sind nicht Bestandteil dieser �bersicht.
Buchungstag;Wert;Umsatzart;Beg�nstigter / Auftraggeber;Verwendungszweck;IBAN;BIC;Kundenreferenz;Mandatsreferenz ;Gl�ubiger ID;Fremde Geb�hren;Betrag;Abweichender Empf�nger;Soll;Haben;W�hrung
30.06.2014;30.06.2014;;;Saldo der Abschlussposten QM - Support 04082 Leipzig Kontoabschluss 2. Quartal 14 PlusKonto 23,97 8 kostenfreie Poste;;;;;;;;;-23,97;;EUR
08.07.2014;08.07.2014;;;GA NR01301019 BLZ6807002406 08.07/15.36UHR EMMENDING.;;;;;;;;;-100,00;;EUR
09.07.2014;09.07.2014;;;ELV58040043 08.07 16.18 ME6 PARFUEMERIE GROSS EMMENDING 5009190;;;;;;;;;-204,00;;EUR
11.07.2014;11.07.2014;;;EC 54005983 100714113909OC6 F074256119522 00000 BARBARA DESSOUS F074256119522 00000;;;;;;;;;-228,85;;EUR
14.07.2014;14.07.2014;;;EC 58037445 110714170455OC6 F036364716512 00000 BUCHHANDLUNG SILL EMMENDING F036364716512 00000;;;;;;;;;-12,99;;EUR
14.07.2014;14.07.2014;;;EC 58031208 110714171446OC6 F010318769761 00000 REFORMHAUS F010318769761 00000;;;;;;;;;-18,94;;EUR
15.07.2014;15.07.2014;;;110711316303979171207003040 ELV65132717 11.07 11.31 ME6 DM DROGERIEMARKT SAGT DANKE 5303979;;;;;;;;;-49,10;;EUR
15.07.2014;15.07.2014;;;EC 70006296 140714172600OC6 F027284778367 00000 SHELL 0495 BERG F027284778367 00000;;;;;;;;;-49,19;;EUR
17.07.2014;17.07.2014;;;SEV Sonntagstrasse 15 Auszahlung per:15.07.2014;;;;;;;;;;2.577,16;EUR
29.07.2014;30.07.2014;;;5232271300185044 ELISA KARIMA SWAILE DEUTSCHE BANK KREDITKARTE ELISA KARIMA SWAILEM;;;;;;;;;-39,00;;EUR
Kontostand;29.07.2014;;;68.917,00;EUR
**/
function DBFormat2() {

  // Index of columns in csv file
  colDate = 0;
  colValuta = 1;
  colDescr = 4;
  colCredit = 13;
  colDebit = 14;
  colCurrency = 15;

  /** Return true if the transactions match this format */
  this.match = function (transactions) {
    if (transactions.length === 0)
      return false;

    for (i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      var formatMatched = false;
      if (transaction.length === (colCurrency + 1))
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction[colDate].match(/[0-9\.\-\/]+/g) &&
        transaction[colDate].length == 10)
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction[colValuta].match(/[0-9\.\-\/]+/g) &&
        transaction[colValuta].length == 10)
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched)
        return true;
    }
    return false;
  }

  /** Convert the transaction to the format to be imported */
  this.convert = function (transactions) {
    var transactionsToImport = [];

    // Filter and map rows
    for (i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];
      if (transaction.length < (colCurrency))
        continue;
      if (transaction[colDate].match(/[0-9\.\-\/]+/g) && transaction[colDate].length == 10 &&
        transaction[colValuta].match(/[0-9\.\-\/]+/g) && transaction[colValuta].length == 10)
        transactionsToImport.push(mapTransaction(transaction));
    }

    if (transactionsToImport.length > 1) {
      if (transactionsToImport[0][colDate] > transactionsToImport[transactionsToImport.length - 1][colDate])
        transactionsToImport = transactionsToImport.reverse();
    }

    // Add header and return
    var header = [["Date", "DateValue", "Description", "Income", "Expenses"]];
    return header.concat(transactionsToImport);
  }
}


/**
 * Deutsche Bank Format 1
 * Ums�tze pers�nliches Konto (00);;;Kundennummer: XXXXXXXXXXXX
 * 26.08.2012 - 04.09.2012
 * Letzter Kontostand;;;;752,54;EUR
 * Buchungstag;Wert;Verwendungszweck;Soll;Haben;W�hrung
 * 26.08.2012;26.08.2012;"EC TANKSTELLE AN DER B";-42,33;;EUR
 * 01.09.2012;01.09.2012;"03/232347 KRANKENVERS";-511,97;;EUR
 * 03.09.2012;03.09.2012;"KLEINHOLZ 3077/09";;376,97;EUR
 * 04.09.2012;04.09.2012;"LOTTO";;1000,00;EUR
 * 04.09.2012;04.09.2012;"LOTTO *STORNO*";-1000,00;;EUR
 * Kontostand;04.09.2012;;;575,21;EUR
**/
function DBFormat1() {

  // Index of columns in csv file
  colDate = 0;
  colValuta = 1;
  colDescr = 2;
  colCredit = 3;
  colDebit = 4;
  colCurrency = 5;

  /** Return true if the transactions match this format */
  this.match = function (transactions) {
    if (transactions.length === 0)
      return false;

    for (i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      var formatMatched = false;
      if (transaction.length === (colCurrency + 1))
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction[colDate].match(/[0-9\.\-\/]+/g) &&
        transaction[colDate].length == 10)
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched && transaction[colValuta].match(/[0-9\.\-\/]+/g) &&
        transaction[colValuta].length == 10)
        formatMatched = true;
      else
        formatMatched = false;

      if (formatMatched)
        return true;
    }
    return false;
  }

  /** Convert the transaction to the format to be imported */
  this.convert = function (transactions) {
    var transactionsToImport = [];

    // Filter and map rows
    for (i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];
      if (transaction.length < (colCurrency))
        continue;
      if (transaction[colDate].match(/[0-9\.\-\/]+/g) && transaction[colDate].length == 10 &&
        transaction[colValuta].match(/[0-9\.\-\/]+/g) && transaction[colValuta].length == 10)
        transactionsToImport.push(mapTransaction(transaction));
    }

    if (transactionsToImport.length > 1) {
      if (transactionsToImport[0][colDate] > transactionsToImport[transactionsToImport.length - 1][colDate])
        transactionsToImport = transactionsToImport.reverse();
    }

    // Add header and return
    var header = [["Date", "DateValue", "Description", "Income", "Expenses"]];
    return header.concat(transactionsToImport);
  }


}
function mapTransaction(element) {
  var mappedLine = [];
  var amountConverter = new AmountConverter('.', ',');

  if (element[colDate] == null || element[colDescr] == null || element[colCredit] == null || element[colDebit] == null || element[colCurrency] == null) {
    mappedLine.push("");
    mappedLine.push("");
    mappedLine.push("Error importing data");
    mappedLine.push("");
    mappedLine.push("");
    return mappedLine;
  }

  mappedLine.push(Banana.Converter.toInternalDateFormat(element[colDate]));
  mappedLine.push(Banana.Converter.toInternalDateFormat(element[colValuta]));
  mappedLine.push(element[colDescr]);

  if (element[colCredit].length > 0) {
    if (element[colCredit].charAt(0) === '-') {
      mappedLine.push("");
      mappedLine.push(amountConverter.toInternalFormat(element[colCredit].substr(1)));
    } else {
      mappedLine.push(amountConverter.toInternalFormat(element[colCredit]));
      mappedLine.push("");
    }
  } else if (element[colDebit].length > 0) {
    if (element[colDebit].charAt(0) === '-') {
      mappedLine.push("");
      mappedLine.push(amountConverter.toInternalFormat(element[colDebit].substr(1)));
    } else {
      mappedLine.push(amountConverter.toInternalFormat(element[colDebit]));
      mappedLine.push("");
    }
  }
  else {
    mappedLine.push("");
    mappedLine.push("");
  }
  return mappedLine;
}

function AmountConverter(groupSeparator, decimalSeparator) {
  this.groupSeparator = groupSeparator;
  this.decimalSeparator = decimalSeparator;

  this.toInternalFormat = function (amount) {
    return amount.replace(this.groupSeparator, '').replace(this.decimalSeparator, '.');
  }
}
