// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.germany.import.sparkasse.schwelm.sprockhovel
// @api = 1.0
// @pubdate = 2026-01-21
// @publisher = Banana.ch SA
// @description = Sparkasse Schwelm-Sprockhövel - Import movements .csv (Banana+ Advanced)
// @description.it = Sparkasse Schwelm-Sprockhövel - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Sparkasse Schwelm-Sprockhövel - Import movements .csv (Banana+ Advanced)
// @description.de = Sparkasse Schwelm-Sprockhövel - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Sparkasse Schwelm-Sprockhövel - Importer mouvements .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 * Works with Sparkasse Schwelm-Sprockhövel and Sparkasse Münsterland Ost.
 */
function exec(string, isTest) {

   var importUtilities = new ImportUtilities(Banana.document);

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   //If the file contains double quotations marks, remove them
   var cleanString = string;
   if (cleanString.match(/""/)) {
      cleanString = cleanString.replace(/^"/mg, "");
      cleanString = cleanString.replace(/"$/mg, "");
      cleanString = cleanString.replace(/""/g, "\"");
   }

   let convertionParam = defineConversionParam(string);

   var transactions = Banana.Converter.csvToArray(string, ';', '"');
   let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);

   // Sparkasse Schwelm Sprockhovel Format, this format works with the header names.
   var sparkasseSchwelmFormat1 = new SparkasseSchwelmFormat1();
   if (sparkasseSchwelmFormat1.match(transactionsData)) {
      transactions = sparkasseSchwelmFormat1.convert(transactionsData);
      return Banana.Converter.arrayToTsv(transactions);
   }

   // Format is unknow, return an error
   importUtilities.getUnknownFormatError();

   return "";
}

/**
 * Sparkasse Schwelm Sprockhovel Format
 *
 * "Auftragskonto";"Buchungstag";"Valutadatum";"Buchungstext";"Verwendungszweck";"Glaeubiger ID";"Mandatsreferenz";"Kundenreferenz (End-to-End)";"Sammlerreferenz";"Lastschrift Ursprungsbetrag";"Auslagenersatz Ruecklastschrift";"Beguenstigter/Zahlungspflichtiger";"Kontonummer/IBAN";"BIC (SWIFT-Code)";"Betrag";"Waehrung";"Info"
 * "SE22181624564401062258";"28.06.24";"29.06.24";"ALITUDISSICOGNOS";"Pliursimen 60.88.2210 cutas Caeris ";"";"";"";"";"";"";"";"0000000000";"45451555";"-39,58";"INE";"Umsatz gebucht"
 * "SE22181624564401062258";"27.06.24";"27.06.24";"CONTRA-VERUMNUTICUS";"20 DATUM 27.06.2024, 18.56 UHR ";"";"";"";"";"";"";"Orbigat Multire";"LK50673877100165861243";"OIHHILP5ASU";"-920,47";"INE";"Umsatz gebucht"
 * "SE22181624564401062258";"27.06.24";"27.06.24";"SICENDABITQUADICIT";"NATEST 1 ";"";"";"8116905223-0000001LG0000";"8116905223";"";"";"";"";"";"-2396,74";"INE";"Umsatz gebucht"
 * "SE22181624564401062258";"27.06.24";"27.06.24";"CAPTUDIXIMODERVA";"Ocentiburum.: V2758472036 - Sempecum.: D2521733203 ";"IT21NFT83778420385";"G-D2521733203-8141";"V2758472036";"";"";"";"Oremple Contra StiS";"MB26440554856177044035";"PQWBKSIK831";"-116,50";"INE";"Umsatz gebucht"
 * "SE22181624564401062258";"26.06.24";"26.06.24";"CONTRA-VERUMNUTICUS";"19 DATUM 26.06.2024, 09.51 UHR ";"";"";"";"";"";"";"Orbigat Multire";"LK50673877100165861243";"OIHHILP5ASU";"-4446,08";"INE";"Umsatz gebucht"
 * 
 * Sparkasse Münsterland Ost.
 * Auftragskonto;Buchungstag;Valutadatum;Buchungstext;Verwendungszweck;Beguenstigter/Zahlungspflichtiger;Kontonummer;BLZ;Betrag;Waehrung;Info
 * DE12345678999876543212;12.01.26;12.01.26;GUTSCHRIFT;CounterPart;DEXXXXXXXXXXXXXXXXXX;Test;583,34;EUR;Umsatz gebucht
 * DE12345678999876543212;12.01.26;12.01.26;GUTSCHR;CounterPart;DEXXXXXXXXXXXXXXXXXX;Test;700;EUR;Umsatz gebucht
 * DE12345678999876543212;12.01.26;12.01.26;UEBERTRAG;TestCounterPart;DEXXXXXXXXXXXXXXXXXX;Test;6000;EUR;Umsatz gebucht
*/
function SparkasseSchwelmFormat1() {

   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Date"] && transaction["Date"].length >= 8 &&
            transaction["Date"].match(/^\d{2}.\d{2}.\d{2}$/))
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
         if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 8 &&
            transactionsData[i]["Date"].match(/^\d{2}.\d{2}.\d{2}$/)) {
            transactionsToImport.push(this.mapTransaction(transactionsData[i]));
         }
      }

      // Sort rows by date
      transactionsToImport = transactionsToImport.reverse();

      // Add header and return
      var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
      return header.concat(transactionsToImport);
   }

   this.mapTransaction = function (transaction) {
      let mappedLine = [];

      mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd.mm.yyyy"));
      mappedLine.push(Banana.Converter.toInternalDateFormat("", "dd.mm.yyyy"));
      mappedLine.push("");
      mappedLine.push("");
      mappedLine.push(this.getDescription(transaction));
      if (transaction["Amount"].match(/^[0-9]/))
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], ','));
      else
         mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], ','));

      return mappedLine;
   }

   this.getDescription = function (transaction) {
      if (!transaction) return "";
      const { "Counterpart": counterPart, "Description": descr, "Purpose": purpose } = transaction;
      return [counterPart, descr, purpose]
         .filter(value => value && typeof value === "string" && value.trim() !== "")
         .join(", ");
   }
}

function defineConversionParam(inData) {

   var inData = Banana.Converter.csvToArray(inData);
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

   /** SPECIFY THE COLUMN TO USE FOR SORTING
   If sortColums is empty the data are not sorted */
   convertionParam.sortColums = ["Date", "Doc"];
   convertionParam.sortDescending = false;

   return convertionParam;
}

function getFormattedData(inData, convertionParam, importUtilities) {
   var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
   var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
   let form = [];

   let convertedColumns = [];

   convertedColumns = convertHeaderDe(columns);

   //Load the form with data taken from the array. Create objects
   if (convertedColumns.length > 0) {
      importUtilities.loadForm(form, convertedColumns, rows);
      return form;
   }

   convertedColumns = convertHeaderFr(columns);
   if (convertedColumns.length > 0) {
      importUtilities.loadForm(form, convertedColumns, rows);
      return form;
   }

   return [];
}

function convertHeaderDe(columns) {
   let convertedColumns = [];

   for (var i = 0; i < columns.length; i++) {
      switch (columns[i]) {
         case "Buchungstag":
            convertedColumns[i] = "Date";
            break;
         case "Buchungstext":
            convertedColumns[i] = "Description";
            break;
         case "Beguenstigter/Zahlungspflichtiger":
            convertedColumns[i] = "Counterpart";
            break;
         case "Betrag":
            convertedColumns[i] = "Amount";
            break;
         case "Verwendungszweck":
            convertedColumns[i] = "Purpose";
            break;
         default:
            break;
      }
   }

   if (convertedColumns.indexOf("Date") < 0) {
      return [];
   }

   return convertedColumns;
}

function convertHeaderFr(columns) {
   let convertedColumns = [];

   for (var i = 0; i < columns.length; i++) {
      switch (columns[i]) {
         case "Date":
            convertedColumns[i] = "Date";
            break;
         case "Libellé":
            convertedColumns[i] = "Description";
            break;
         case "Montant":
            convertedColumns[i] = "Amount";
            break;
         default:
            break;
      }
   }

   if (convertedColumns.indexOf("Date") < 0) {
      return [];
   }

   return convertedColumns;
}