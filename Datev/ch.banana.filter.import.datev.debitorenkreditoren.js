// @id = ch.banana.filter.import.datev.debitorenkreditoren
// @api = 1.0
// @pubdate = 2019-01-14
// @publisher = Banana.ch SA
// @description = DATEV Import Kontendaten von Kunden und Lieferanten (*.csv)
// @task = import.accounts
// @doctype = *
// @docproperties =
// @inputdatasource = openfiledialog
// @inputfilefilter = CSV (*.csv);;All files (*.*)
// @inputfilefilter.de = CSV (*.csv);;Alle Dateien (*.*)

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */

//Main function
function exec(inData) {

   if (!Banana.document)
      return "@Cancel";

   var output = '';
   if (Banana.script.getParamValue('task') === 'import.accounts') {
      var datevImport = new DatevImport(Banana.document);
      output = datevImport.importAccounts(inData);
   }
   else if (Banana.script.getParamValue('task') === 'import.transactions') {
      var datevImport = new DatevImport(Banana.document);
      output = datevImport.importTransactions(inData);
   }
   
   //TO DEBUG SHOW THE INTERMEDIARY TEXT
   Banana.Ui.showText(output);
	
   return output;

}

function DatevImport(banDocument) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;
   this.initParam();

   this.ID_ERR_DATEV_LONGTEXT = "ERR_DATEV_LONGTEXT";
   this.ID_ERR_CUSTOMERSGROUP_NOTDEFINED = "ID_ERR_CUSTOMERSGROUP_NOTDEFINED";
   this.ID_ERR_SUPPLIERSGROUP_NOTDEFINED = "ID_ERR_SUPPLIERSGROUP_NOTDEFINED";
   this.ID_ERR_NOTSUPPORTED_FORMAT = "ID_ERR_NOTSUPPORTED_FORMAT";
}

// Convert to an array of objects where each object property is the banana columnNameXml
DatevImport.prototype.convertCsvToIntermediaryData = function(inData, conversionParam) {

   var form = [];
   var intermediaryData = [];
      
   //Read the CSV file and create an array with the data
   var csvFile = Banana.Converter.csvToArray(inData, conversionParam.separator, conversionParam.textDelim);

   //Variables used to save the columns titles and the rows values
   var columns = this.getHeaderData(csvFile, conversionParam.headerLineStart); //array
   var rows = this.getRowData(csvFile, conversionParam.dataLineStart); //array of array

   //Load the form with data taken from the array. Create objects
   this.loadForm(form, columns, rows);

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

//The purpose of this function is to convert all the data into a format supported by Banana
DatevImport.prototype.convertToBananaFormat = function(intermediaryData) {

   //Example: ['Account','Description','BClass','Opening'];
   var accountHeaders = [];

   //Create titles only for fields not starting with "_"
   for (var name in intermediaryData[0]) {
      if (name.substring(0,1) !== "_") {
         accountHeaders.push(name);
      }
   }
   
   /*var accounting = { // readen data
      'accounts' : [],
      'categories' : [],
      'segments' : [],
      'costcenters' : [],
      'transactions': [],
      'accountsMap' : [],
      'accountsAlreadyImported': [],
      'accountsWithTransactions' : []
   };
   accounting['costcenters'] = intermediaryData;
   var accountsToImport = accounting['accounts'].concat(
               accounting['accounts'],
               accounting['categories'],
               accounting['costcenters'],
               accounting['segments']);*/
      
   //Function call Banana.Converter.objectArrayToCsv() to create a CSV with new data just converted
   var convertedCsv = Banana.Converter.objectArrayToCsv(accountHeaders, intermediaryData, "\t");

   return convertedCsv;
}


//The purpose of this function is to let the users define:
// - the parameters for the conversion of the CSV file;
// - the fields of the csv/table
DatevImport.prototype.defineConversionParamAccounts = function(inData) {

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
   
   /** ACCOUNTING DATA INFORMATION */
   conversionParam = this.getAccountingInfo(conversionParam);
   if (conversionParam.customersGroup.length<=0 && this.banDocument) {
      var msg = this.getErrorMessage(this.ID_ERR_CUSTOMERSGROUP_NOTDEFINED);
      this.banDocument.addMessage(msg, this.ID_ERR_CUSTOMERSGROUP_NOTDEFINED);
   }
   if (conversionParam.suppliersGroup.length<=0 && this.banDocument) {
      var msg = this.getErrorMessage(this.ID_ERR_SUPPLIERSGROUP_NOTDEFINED);
      this.banDocument.addMessage(msg, this.ID_ERR_SUPPLIERSGROUP_NOTDEFINED);
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

      //Konto
      convertedRow["Account"] = inputRow[0] ? inputRow[0] : "";
      //Description
      convertedRow["Description"] = inputRow[1] ? inputRow[1].replace(/  +/g, ", ") : "";
      //Gr
      var nAccount = parseInt(convertedRow["Account"]);
      if (nAccount>= 10000 && nAccount < 70000)
         convertedRow["Gr"] = this.customersGroup;
      else
         convertedRow["Gr"] = this.suppliersGroup;
      /** END */

      return convertedRow;
   };
   return conversionParam;
}

//The purpose of this function is to let the users define:
// - the parameters for the conversion of the CSV file;
// - the fields of the csv/table
DatevImport.prototype.defineConversionParamTransactions = function(inData) {

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
   
   /** ACCOUNTING DATA INFORMATION */
   conversionParam = this.getAccountingInfo(conversionParam);
   
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
      convertedRow["Income"] = "";
      convertedRow["Expenses"] = "";
      if (transactionCode == "S") {
         if (basisCurrency.length)
            convertedRow["Income"] = Banana.Converter.toInternalNumberFormat(inputRow[4]?inputRow[4]:"", ",");
         if (convertedRow["Income"].length<=0)   
            convertedRow["Income"] = Banana.Converter.toInternalNumberFormat(inputRow[0]?inputRow[0]:"", ",");
      }
      else {
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
            vatCode = this.getVatCode(convertedRow["VatCode"]);
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

DatevImport.prototype.getAccountingInfo = function(param) {
   if (!param)
      return param;

   param.multiCurrency = false;
   param.withVat = false;
   param.customersGroup = "";
   param.suppliersGroup = "";
   
   if (this.banDocument) {
      var fileType = this.banDocument.info("Base","FileType");
      var fileGroup = this.banDocument.info("Base","FileTypeGroup");
      var fileNumber = this.banDocument.info("Base","FileTypeNumber");
      if (fileNumber == "110") {
         param.withVat = true;
      }
      if (fileNumber == "120") {
         param.multiCurrency = true;
      }
      if (fileNumber == "130") {
         param.multiCurrency = true;
         param.withVat = true;
      }
      if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
         param.customersGroup = this.banDocument.info("AccountingDataBase", "CustomersGroup");
      if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
         param.suppliersGroup = this.banDocument.info("AccountingDataBase", "SuppliersGroup");
   }
   return param;   
}

/**
* return the text error message according to error id
*/
DatevImport.prototype.getErrorMessage = function (errorId) {
   switch (errorId) {
      case this.ID_ERR_DATEV_LONGTEXT:
         return "Der Text vom Feld %1 ist zu lang und er wird geschnitten. Maximale Länge %2 Zeichen";
      case this.ID_ERR_CUSTOMERSGROUP_NOTDEFINED:
         return "Die Gruppe Kunden ist nicht definiert. Verwenden Sie den Befehl Buch2-Kunden-Einstellungen, um die Gruppe zu definieren";
      case this.ID_ERR_SUPPLIERSGROUP_NOTDEFINED:
         return "Die Gruppe Lieferanten ist nicht definiert. Verwenden Sie den Befehl Buch2-Lieferanten-Einstellungen, um die Gruppe zu definieren";
      case this.ID_ERR_NOTSUPPORTED_FORMAT:
         return "%1 is a wrong format. Requested format: %2";
   }
   return "";
}

//The purpose of this function is to return all the titles of the columns
DatevImport.prototype.getHeaderData = function(csvFile, startLineNumber) {
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
DatevImport.prototype.getRowData = function(csvFile, startLineNumber) {
   if (!startLineNumber) {
      startLineNumber = 1;
   }
   var rowData = [];
   for (var i = startLineNumber; i < csvFile.length; i++) {
      rowData.push(csvFile[i]);
   }
   return rowData;
}

DatevImport.prototype.getVatCode = function (buSchluessel) {
   var vatCode = "";
   if (buSchluessel.length<=0 || !this.banDocument)
      return vatCode;
   var tableVatCodes = this.banDocument.table('VatCodes');
   if (!tableVatCodes)
      return vatCode;
   var row = tableVatCodes.findRowByValue('Gr1', buSchluessel);
   if (row)
      vatCode = row.value("VatCode");
   
   return vatCode;
}

DatevImport.prototype.importAccounts = function (inData) {
   //1. Function call to define the conversion parameters
   var conversionParam = this.defineConversionParamAccounts(inData);

   //2. we can eventually process the input text
   inData = this.preProcessInData(inData);

   //3. intermediaryData is an array of objects where the property is the banana column name
   var intermediaryData = [];
   if (conversionParam.header.category === "16") {
      intermediaryData = this.convertCsvToIntermediaryData(inData, conversionParam);
   }
   else {
      var msg = this.getErrorMessage(this.ID_ERR_NOTSUPPORTED_FORMAT);
      msg = msg.replace("%1", conversionParam.header.category);
      msg = msg.replace("%2", "16");
      if (this.banDocument)
         this.banDocument.addMessage(msg, this.ID_ERR_NOTSUPPORTED_FORMAT);
   } 

   //4. can define as much postProcessIntermediaryData function as needed
   intermediaryData = this.postProcessIntermediaryData(intermediaryData);

   //5. sort data
   intermediaryData = this.sortData(intermediaryData, conversionParam);

   //6. convert to banana format
   //column that start with "_" are not converted
   var text = this.convertToBananaFormat(intermediaryData);

   return text;
}

DatevImport.prototype.importTransactions = function (inData) {
Banana.console.debug("inDataXX " + inData);
   //1. Function call to define the conversion parameters
   var conversionParam = this.defineConversionParamTransactions(inData);

   //2. we can eventually process the input text
   inData = this.preProcessInData(inData);

   //3. intermediaryData is an array of objects where the property is the banana column name
   var intermediaryData = [];
   if (conversionParam.header.category === "21") {
      intermediaryData = this.convertCsvToIntermediaryData(inData, conversionParam);
   }
   else {
      var msg = this.getErrorMessage(this.ID_ERR_NOTSUPPORTED_FORMAT);
      msg = msg.replace("%1", conversionParam.header.category);
      msg = msg.replace("%2", "21");
      if (this.banDocument)
         this.banDocument.addMessage(msg, this.ID_ERR_NOTSUPPORTED_FORMAT);
   } 

   //4. can define as much postProcessIntermediaryData function as needed
   intermediaryData = this.postProcessIntermediaryData(intermediaryData);

   //5. sort data
   intermediaryData = this.sortData(intermediaryData, conversionParam);

   //6. convert to banana format
   //column that start with "_" are not converted
   var text = this.convertToBananaFormat(intermediaryData);

   return text;
}

/**
* Initialize dialog values with default values
*/
DatevImport.prototype.initParam = function () {
   this.param = {};
}

//The purpose of this function is to load all the data (titles of the columns and rows) and create a list of objects.
//Each object represents a row of the csv file
DatevImport.prototype.loadForm = function(form, columns, rows) {
   for(var j = 0; j < rows.length; j++){
      var obj = {};
      for(var i = 0; i < columns.length; i++){
         //obj[columns[i]] = rows[j][i];
         obj[i] = rows[j][i];
      }
      form.push(obj);
   }
}

//The purpose of this function is to let the user specify how to convert the categories
DatevImport.prototype.postProcessIntermediaryData = function(intermediaryData) {
   return intermediaryData;
}

DatevImport.prototype.preProcessInData = function(inData) {
   return inData;
}

DatevImport.prototype.setParam = function (param) {
   if (param && typeof(param) === 'object') {
      this.param = param;
   } else if (param && typeof(param) === 'string') {
      this.param = JSON.parse(param)
   }
   this.verifyParam();
}

// The purpose of this function is to sort the data
DatevImport.prototype.sortData = function(intermediaryData, conversionParam) {
   return intermediaryData;
}

DatevImport.prototype.verifyParam = function () {
   if (!this.param)
      this.param = {};
}
