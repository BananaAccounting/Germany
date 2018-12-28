// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.filter.import.datev.buchungsstapel.js
// @api = 1.0
// @pubdate = 2018-12-27
// @publisher = Banana.ch SA
// @description = Import Datev
// @task = import.transactions
// @doctype = 100.*; 130.*
// @docproperties = 
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)


//Main function
function exec(inData) {

   //1. Function call to define the conversion parameters
   var conversionParam = defineConversionParam(inData);

   //2. we can eventually process the input text
   inData = preProcessInData(inData);

   //3. intermediaryData is an array of objects where the property is the banana column name
   var intermediaryData = convertToIntermediaryData(inData, conversionParam);

   //4. can define as much postProcessIntermediaryData function as needed
   intermediaryData = postProcessIntermediaryData(intermediaryData);

   //5. sort data
   intermediaryData = sortData(intermediaryData, conversionParam);

   //6. convert to banana format
   //column that start with "_" are not converted
   var text = convertToBananaFormat(intermediaryData);

   //TO DEBUG SHOW THE INTERMEDIARY TEXT
   //Banana.Ui.showText(text);
	
   return text;
}


//The purpose of this function is to let the users define:
// - the parameters for the conversion of the CSV file;
// - the fields of the csv/table
function defineConversionParam(inData) {

   var conversionParam = {};

   /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
   conversionParam.format = "csv";
   conversionParam.separator = ';';
   conversionParam.textDelim = '"';
   
   /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
   We suppose the data will always begin right away after the header line */
   conversionParam.headerLineStart = 1;
   conversionParam.dataLineStart = 2;
   
   /** SPECIFY THE VERSION OF DATEV-FORMAT
   Available at the first line of imported data */
   conversionParam.header = {};
   conversionParam.header.datevformat = "";  //EXTF externe Programme, DTVF Datev reserviert
   conversionParam.header.version = "";      //300 for version 3.00
   conversionParam.header.category = "";     //16=Debitoren/Kreditoren 21=Buchungsstapel
   conversionParam.header.year = "";         //WJ-Beginn
   conversionParam.header.fromDate = "";     //Datum von des Buchungsstapels
   conversionParam.header.toDate = "";       //Datum bis des Buchungsstapels
   var csvFile = Banana.Converter.csvToArray(inData, conversionParam.separator, conversionParam.textDelim);
   if (csvFile.length>0) {
      var headerLine = csvFile[0];
      if (headerLine.length>15) {
         conversionParam.header.datevformat = headerLine[0];
         conversionParam.header.version = headerLine[1];
         conversionParam.header.category = headerLine[2];
         conversionParam.header.year = headerLine[12];
         if (conversionParam.header.year.length >= 4)
            conversionParam.header.year = conversionParam.header.year.substring(0, 4);
         conversionParam.header.fromDate = headerLine[14];
         conversionParam.header.toDate = headerLine[15];
      }
   }

   /** SPECIFY THE COLUMN TO USE FOR SORTING
   If sortColums is empty the data are not sorted */
   conversionParam.sortColums = [] // ["Date", "ExternalReference"];
   conversionParam.sortDescending = false;
   /** END */
   
   //For file accounting type
   conversionParam.multiCurrency = false;
   conversionParam.withVat = false;
   if (Banana.document) {
      var fileType = Banana.document.info("Base","FileType");
      var fileGroup = Banana.document.info("Base","FileTypeGroup");
      var fileNumber = Banana.document.info("Base","FileTypeNumber");
      if (fileNumber == "110") {
         conversionParam.withVat = true;
      }
      if (fileNumber == "120") {
         conversionParam.multiCurrency = true;
      }
      if (fileNumber == "130") {
         conversionParam.multiCurrency = true;
         conversionParam.withVat = true;
      }
   }
   
   /* rowConvert is a function that convert the inputRow (passed as parameter)
   *  to a convertedRow object
   * - inputRow is an object where the properties is the column name found in the CSV file
   * - convertedRow is an  object where the properties are the column name to be exported in Banana
   * For each column that you need to export in Banana create a line that create convertedRow column
   * The right part can be any fuction or value
   * Remember that in Banana
   * - Date must be in the format "yyyy-mm-dd"
   * - Number decimal separator must be "." and there should be no thousand separator */
   conversionParam.rowConverter = function(inputRow) {
      var convertedRow = {};

      /** MODIFY THE FIELDS NAME AND THE CONVERTION HERE
      *   The right part is a statements that is then executed for each inputRow

      /*   Field that start with the underscore "_" will not be exported
      *    Create this fields so that you can use-it in the postprocessing function */
      //Soll/Haben Kennzeichen
      var transactionCode = inputRow[1] ? inputRow[1] : "S";
      //WKZ Umsatz
      var currency = inputRow[2] ? inputRow[2] : "";
      if (conversionParam.multiCurrency)
         convertedRow["ExchangeCurrency"] = currency;
      //WKZ Basis-Umsatz
      var basisCurrency = inputRow[5] ? inputRow[5] : "";
      if (conversionParam.multiCurrency)
         convertedRow["AmountCurrency"] = basisCurrency;
      //Umsatz (ohne Soll/Haben-Kz) 
      //Basis-Umsatz
      if (transactionCode == "S") {
         if (basisCurrency.length)
            convertedRow["Income"] = Banana.Converter.toInternalNumberFormat(inputRow[4]?inputRow[4]:"", ",");
         if (convertedRow["Income"].length<=0)   
            convertedRow["Income"] = Banana.Converter.toInternalNumberFormat(inputRow[0]?inputRow[0]:"", ",");
         convertedRow["Expenses"] = "";
      }
      else {
         convertedRow["Income"] = "";
         if (basisCurrency.length)
            convertedRow["Expenses"] = Banana.Converter.toInternalNumberFormat(inputRow[4]?inputRow[4]:"", ",");
         if (convertedRow["Expenses"].length<=0)   
            convertedRow["Expenses"] = Banana.Converter.toInternalNumberFormat(inputRow[0]?inputRow[0]:"", ",");
      }
      //Konto
      convertedRow["Account"] = inputRow[6] ? inputRow[6] : "";
      //Gegenkonto (ohne BU-Schlüssel)
      convertedRow["ContraAccount"] = inputRow[7] ? inputRow[7] : "";
      //BU-Schlüssel
      if (conversionParam.withVat) {
         convertedRow["VatCode"] = inputRow[8] ? inputRow[8] : "";
         var vatCode = "";
         if (convertedRow["VatCode"].length)
            vatCode = getVatCode(convertedRow["VatCode"]);
         convertedRow["VatCode"] = vatCode;
         //Banana.console.debug(withVat + " buSchluessel " + convertedRow["VatCode"] + " vatCode " + convertedRow["VatCode"]);      
      }
      //Belegdatum
      convertedRow["Date"] = inputRow[9] ? inputRow[9] : "";
      if (convertedRow["Date"] && convertedRow["Date"].length==4 ) {
         var day = convertedRow["Date"].substr(0,2);
         var month = convertedRow["Date"].substr(2,2);
         convertedRow["Date"] = conversionParam.header.year+month+day;
         //Banana.Converter.toInternalDateFormat(inputRow["Date"], "dd.mm.yyyy");
      }
      //Belegfeld1
      convertedRow["Doc"] = inputRow[10] ? inputRow[10].replace(/  +/g, ", ") : "";
      //Buchungstext
      convertedRow["Description"] = inputRow[13] ? inputRow[13].replace(/  +/g, ", ") : "";
      /** END */

      return convertedRow;
   };
   return conversionParam;
}



function preProcessInData(inData) {
   return inData;
}



//The purpose of this function is to let the user specify how to convert the categories
function postProcessIntermediaryData(intermediaryData) {

   /*var accountingOpeningDate = '';
   var accountingClosureDate = '';
   if (Banana.document && Banana.document.info) {
      accountingOpeningDate = Banana.document.info("AccountingDataBase", "OpeningDate");
      accountingClosureDate = Banana.document.info("AccountingDataBase", "ClosureDate");
   }
   if (accountingOpeningDate.length<=0 && Banana.Test) {
      accountingOpeningDate = '20180101';
   }
   if (accountingClosureDate.length<=0 && Banana.Test) {
      accountingClosureDate = '20181231';
   }
   var openingYear = '';
   var closureYear = '';
   if (accountingOpeningDate.length >= 4)
      openingYear = accountingOpeningDate.substring(0, 4);
   if (accountingClosureDate.length >= 4)
      closureYear = accountingClosureDate.substring(0, 4);
   

   //Apply the conversions
   for (var i = 0; i < intermediaryData.length; i++) {
      var convertedData = intermediaryData[i];
   Banana.console.debug(JSON.stringify(convertedData));      
      //Add year to date
      if (convertedData["Date"] && convertedData["Date"].length==4 ) {
         var day = convertedData["Date"].substr(0,2);
         var month = convertedData["Date"].substr(2,2);
         var year = openingYear;
         convertedData["Date"] = year+month+day;
         //Banana.Converter.toInternalDateFormat(inputRow["Date"], "dd.mm.yyyy");
      }
   }*/

   return intermediaryData;
}


/* DO NOT CHANGE THIS CODE */

// Convert to an array of objects where each object property is the banana columnNameXml
function convertToIntermediaryData(inData, conversionParam) {
   //21 Buchungsstapel
   if (conversionParam.header.category === "21") {
      return convertCsvToIntermediaryData(inData, conversionParam);
   } else {
      if (Banana.document)
         Banana.document.addMessage( "Not supported format " + conversionParam.header.category, "ERR_DATEV_IMPORT_NOTSUPPORTED_FORMAT");
      var emptyArray = [];
      return emptyArray;
   }
}

// Convert to an array of objects where each object property is the banana columnNameXml
function convertCsvToIntermediaryData(inData, conversionParam) {

   var form = [];
   var intermediaryData = [];
   //Read the CSV file and create an array with the data
   var csvFile = Banana.Converter.csvToArray(inData, conversionParam.separator, conversionParam.textDelim);

   //Variables used to save the columns titles and the rows values
   var columns = getHeaderData(csvFile, conversionParam.headerLineStart); //array
   var rows = getRowData(csvFile, conversionParam.dataLineStart); //array of array

   //Load the form with data taken from the array. Create objects
   loadForm(form, columns, rows);

   //Create the new CSV file with converted data
   var convertedRow;
   //For each row of the form, we call the rowConverter() function and we save the converted data
   for (var i = 0; i < form.length; i++) {
      convertedRow = conversionParam.rowConverter(form[i]);
      intermediaryData.push(convertedRow);
   }

   //Return the converted CSV data
   return intermediaryData;
}

// The purpose of this function is to sort the data
function sortData(intermediaryData, conversionParam) {
   if (conversionParam.sortColums && conversionParam.sortColums.length) {
      intermediaryData.sort(
               function(row1, row2) {
                  for (var i = 0; i < conversionParam.sortColums.length; i++) {
                     var columnName = conversionParam.sortColums[i];
                     if (row1[columnName] > row2[columnName])
                        return 1;
                     else if (row1[columnName] < row2[columnName])
                        return -1;
                  }
                  return 0;
               });

      if (conversionParam.sortDescending)
         intermediaryData.reverse();
   }

   return intermediaryData;
}

//The purpose of this function is to convert all the data into a format supported by Banana
function convertToBananaFormat(intermediaryData) {

   var columnTitles = [];

   //Create titles only for fields not starting with "_"
   for (var name in intermediaryData[0]) {
      if (name.substring(0,1) !== "_") {
         columnTitles.push(name);
      }

   }
   //Function call Banana.Converter.objectArrayToCsv() to create a CSV with new data just converted
   var convertedCsv = Banana.Converter.objectArrayToCsv(columnTitles, intermediaryData, "\t");

   return convertedCsv;
}


//The purpose of this function is to load all the data (titles of the columns and rows) and create a list of objects.
//Each object represents a row of the csv file
function loadForm(form, columns, rows) {
   for(var j = 0; j < rows.length; j++){
      var obj = {};
      for(var i = 0; i < columns.length; i++){
         //obj[columns[i]] = rows[j][i];
         obj[i] = rows[j][i];
      }
      form.push(obj);
   }
}


//The purpose of this function is to return all the titles of the columns
function getHeaderData(csvFile, startLineNumber) {
   if (!startLineNumber) {
      startLineNumber = 0;
   }
   var headerData = csvFile[startLineNumber];
   for (var i = 0; i < headerData.length; i++) {

      headerData[i] = headerData[i].trim();

      if (!headerData[i]) {
         headerData[i] = i;
      }

      //Avoid duplicate headers
      var headerPos = headerData.indexOf(headerData[i]);
      if (headerPos >= 0 && headerPos < i) { // Header already exist
         var postfixIndex = 2;
         while (headerData.indexOf(headerData[i] + postfixIndex.toString()) !== -1 && postfixIndex <= 99)
            postfixIndex++; // Append an incremental index
         headerData[i] = headerData[i] + postfixIndex.toString()
      }

   }
   return headerData;
}


//The purpose of this function is to return all the data of the rows
function getRowData(csvFile, startLineNumber) {
   if (!startLineNumber) {
      startLineNumber = 1;
   }
   var rowData = [];
   for (var i = startLineNumber; i < csvFile.length; i++) {
      rowData.push(csvFile[i]);
   }
   return rowData;
}

function getVatCode(buSchluessel) {
   var vatCode = "";
   if (buSchluessel.length<=0 || !Banana.document)
      return vatCode;
   var tableVatCodes = Banana.document.table('VatCodes');
   if (!tableVatCodes)
      return vatCode;
   var row = tableVatCodes.findRowByValue('Gr1', buSchluessel);
   if (row)
      vatCode = row.value("VatCode");
   
   return vatCode;
}
