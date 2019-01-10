// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
// @api = 1.0
// @id = ch.banana.filter.export.datev.kontenbeschriftungen
// @description = DATEV Export / Sachkontenbeschriftungen
// @doctype = *.*
// @encoding = Windows-1252
// @exportfilename = EXTF_Kontenbeschriftungen_<Date>
// @exportfiletype = csv
// @inputdatasource = none
// @pubdate = 2019-01-10
// @publisher = Banana.ch SA
// @task = export.file
// @timeout = -1

function exec(inData, options) {

   if (!Banana.document)
      return "@Cancel";

   var param = {};
   if (inData.length > 0) {
      param = JSON.parse(inData);
   }
   else if (options && options.useLastSettings) {
      param = JSON.parse(Banana.document.getScriptSettings());
   }
   else {
      if (!settingsDialog())
         return "@Cancel";
      param = JSON.parse(Banana.document.getScriptSettings());
   }

   var datevKontenbeschriftungen = new DatevKontenbeschriftungen(Banana.document);
   datevKontenbeschriftungen.setParam(param);
   var transactions = datevKontenbeschriftungen.loadData();
   return transactions;
}

/**
* Calls the dialog in order to set variables
*/
function settingsDialog() {

   var datevKontenbeschriftungen = new DatevKontenbeschriftungen(Banana.document);
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      datevKontenbeschriftungen.setParam(JSON.parse(savedParam));
   }
   var accountingData = datevKontenbeschriftungen.readAccountingData();

   var dialog = Banana.Ui.createUi("ch.banana.filter.export.datev.kontenbeschriftungen.dialog.ui");
   dialog.enableButtons = function () {
   }
   dialog.checkdata = function () {
      var valid = true;
      var mandantenError = "";
      var beraterError = "";
      if (dialog.mandantenLineEdit.text.length <= 0) {
         mandantenError = "Das Feld Mandantennummer hat keinen Inhalt";
         valid = false;
      }
      if (dialog.beraterLineEdit.text.length <= 0) {
         beraterError = "Das Feld Beraternummer hat keinen Inhalt";
         valid = false;
      }
      else if (dialog.beraterLineEdit.text.length < 4) {
         beraterError = "Der Inhalt im Feld Beraternummer ist unzulässig. Gültige Werte sind 1001-9999999";
         valid = false;
      }
      if (valid) {
         dialog.accept();
      }
      else {
         dialog.mandantenLabelError.text = mandantenError;
         dialog.beraterLabelError.text = beraterError;
      }
   }
   dialog.showHelp = function () {
      Banana.Ui.showHelp("ch.banana.filter.export.datev.kontenbeschriftungen.dialog.ui");
   }

   /**
   * Dialog's events declaration
   */
   dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
   dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);

   /*Writing data to dialog*/
   dialog.mandantenLineEdit.text = datevKontenbeschriftungen.param["mandanten"];
   dialog.mandantenLineEdit.cursorPosition = 0;
   dialog.mandantenLabelError.text = "";
   dialog.beraterLineEdit.text = datevKontenbeschriftungen.param["berater"];
   dialog.beraterLineEdit.cursorPosition = 0;
   dialog.beraterLabelError.text = "";
   if (datevKontenbeschriftungen.param["kontenzuordnungSelected"] == "true")
      dialog.kontenzuordnungCheckBox.checked = true;
   else
      dialog.kontenzuordnungCheckBox.checked = false;

   Banana.application.progressBar.pause();
   dialog.enableButtons();
   var dlgResult = dialog.exec();
   Banana.application.progressBar.resume();

   if (dlgResult !== 1)
      return false;

   /*Reading data from dialog*/
   datevKontenbeschriftungen.param["mandanten"] = dialog.mandantenLineEdit.text;
   datevKontenbeschriftungen.param["berater"] = dialog.beraterLineEdit.text;
   if (dialog.kontenzuordnungCheckBox.checked)
      datevKontenbeschriftungen.param["kontenzuordnungSelected"] = "true";
   else
      datevKontenbeschriftungen.param["kontenzuordnungSelected"] = "false";


   var paramToString = JSON.stringify(datevKontenbeschriftungen.param);
   var value = Banana.document.setScriptSettings(paramToString);
   return true;
}

function DatevKontenbeschriftungen(banDocument) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;
   this.initParam();

   this.ID_ERR_DATEV_LONGTEXT = "ERR_DATEV_LONGTEXT";
}

/**
* check text length
*/
DatevKontenbeschriftungen.prototype.checkTextLength = function (text, maxLength, tableName, fieldName, rowNumber) {
   if (maxLength >= 0 && text.length > maxLength) {
      var msg = this.getErrorMessage(this.ID_ERR_DATEV_LONGTEXT);
      msg = msg.replace("%1", fieldName);
      msg = msg.replace("%2", maxLength);
      tableName.addMessage(msg, rowNumber, fieldName, this.ID_ERR_DATEV_LONGTEXT);
      text = text.substring(0, maxLength);
   }
   return text;
}

/**
* return the text error message according to error id
*/
DatevKontenbeschriftungen.prototype.getErrorMessage = function (errorId) {
   switch (errorId) {
      case this.ID_ERR_DATEV_LONGTEXT:
         return "Der Text vom Feld %1 ist zu lang und er wird geschnitten. Maximale Länge %2 Zeichen";
   }
   return "";
}

/**
* Initialize dialog values with default values
*/
DatevKontenbeschriftungen.prototype.initParam = function () {
   this.param = {};
   this.param.mandanten = '';
   this.param.berater = '';
   this.param.kontenzuordnungSelected = false;
}

DatevKontenbeschriftungen.prototype.loadData = function () {

   var transactions = [];

   var fieldsHeader = this.loadDataFields();
   transactions.push(fieldsHeader);
   
   var accountingData = this.readAccountingData();
   var tableAccounts = this.banDocument.table('Accounts');
   if (tableAccounts) {
      for (var i=0; i<tableAccounts.rowCount; i++) {
         var row = tableAccounts.row(i);
         var accountId = row.value('Account');
         if (!accountId || accountId.length<=0)
            continue;
         if (this.param["kontenzuordnungSelected"]) {
            var accountDatev = row.value("DatevAccount");
            if (accountDatev && accountDatev.length) {
               accountId = accountDatev;
            }
         }
         var accountDescription = row.value("Description");
         //debitoren- kreditorenkonten are not added
         
         var line = [];
         line.push(accountId);
         line.push(this.toTextFormat(accountDescription));
         transactions.push(line);
      }
   }
   
   var tableCategories = this.banDocument.table("Categories");
   if (tableCategories) {
      for (var i=0; i<tableCategories.rowCount; i++) {
         var row = tableCategories.row(i);
         var accountId = row.value('Category');
         if (!accountId || accountId.length<=0)
            continue;
         if (this.param["kontenzuordnungSelected"]) {
            var accountDatev = row.value("DatevAccount");
            if (accountDatev && accountDatev.length) {
               accountId = accountDatev;
            }
         }
         var accountDescription = row.value("Description");
         var line = [];
         line.push(accountId);
         line.push(this.toTextFormat(accountDescription));
         transactions.push(line);
      }
   }

   var header = this.loadDataHeader(accountingData);
   if (transactions.length)
      return this.tableToCsv(header.concat(transactions));

   return "@Cancel";
}

/**
* The method loadDataFields return an array
* with the field names
*/
DatevKontenbeschriftungen.prototype.loadDataFields = function () {
   var fieldsHeader = [];
   fieldsHeader.push("Konto");
   fieldsHeader.push("Kontenbeschriftung");
   return fieldsHeader;
}

/**
* The method loadDataHeader return the header of the file
* according to datev rules for Buchungsstapel format
*/
DatevKontenbeschriftungen.prototype.loadDataHeader = function (accountingData) {
   /* Beispiel 
   *  “EXTF“;300;21;“Buchungsstapel“;2;20110329065650770;;““;““;““;29098;
   *  55003;20110101;4;20110301;20110331;“Rechnungen März 2011“;“MM“;1;0;;“EUR“;;;;
   */
   // Headr-Feld Nr. 1 DATEV-Format-KZ
   // Länge:4 Typ:Text
   // vom Datev angegeben
   // EXTF = für Datei-Formate, die von externen Programmen erstellt wurden
   var field1 = "\"EXTF\"";

   // Headr-Feld Nr. 2 Versions-nummer
   // Länge:3 Typ:Zahl
   // entspricht der zugrundeliegenden Versionsnummer des Scnittstellen-Entwicklungsleitfadens
   var field2 = "300";

   // Headr-Feld Nr. 3 Datenkategorie
   // Länge:2 Typ:Zahl
   // vom Datev angegeben
   // Buchungsstapel = 21
   // Sachkontenbeschriftungen = 20
   var field3 = "20";

   // Headr-Feld Nr. 4 Formatname
   // Länge:	 Typ:Text
   // vom Datev angegeben
   var field4 = "\"Kontenbeschriftungen\"";

   // Headr-Feld Nr. 5 Formatversion
   // Länge:3 Typ:Zahl
   // vom Datev angegeben
   // Buchungsstapel = 2
   var field5 = "2";

   // Headr-Feld Nr. 6 Erzeugt am
   // Länge: 17 Typ:Zahl
   // Format: JJJJMMTTHHMMSS (+Tausendstel)
   // TODO: (+Tausendstel) not defined
   var field6 = "";
   var d = new Date();
   var year = d.getFullYear().toString();
   var month = this.zeroPad(d.getMonth() + 1, 2);
   var day = this.zeroPad(d.getDate(), 2);
   var hours = this.zeroPad(d.getHours(), 2);
   var minutes = this.zeroPad(d.getMinutes(), 2);
   var secondes = this.zeroPad(d.getSeconds(), 2);
   var thousandspos = this.zeroPad("000", 3);
   field6 = year + month + day + hours + minutes + secondes + thousandspos;

   // Headr-Feld Nr. 7 Importiert
   // Länge: 17 Typ:Zahl
   // Darf nicht gefüllt werden, durch Import gesetzt.
   var field7 = "";

   // Headr-Feld Nr. 8 Herkunft
   // Länge:2 Typ:Text
   // Herkunfts-Kennzeichen
   // Beim Import wird das Herkunfts-Kennzeichen durch „SV“ (= Stapelverarbeitung) ersetzt.
   var field8 = "\"\"";

   // Headr-Feld Nr. 9 Exportiert von
   // Länge:25 Typ:Text
   // Benutzername
   var field9 = "\"\"";

   // Headr-Feld Nr. 10 Importiert von
   // Länge:10 Typ:Text
   // Darf nicht gefüllt werden, durch Import gesetzt.
   var field10 = "\"\"";

   // Headr-Feld Nr. 11 Berater
   // Länge: 7 Typ:Zahl
   // Beraternummer
   // TODO: Dialog param
   var field11 = this.param["berater"];

   // Headr-Feld Nr. 12 Mandant
   // Länge: 5 Typ:Zahl
   // Mandantennummer
   // TODO: Dialog param
   var field12 = this.param["mandanten"];

   // Headr-Feld Nr. 13 WJ-Beginn
   // Länge: 8 Typ:Zahl
   // Wirtschaftsjahresbeginn Format: JJJJMMTT
   // TODO: Dialog param
   var field13 = Banana.Converter.changeDateFormat(accountingData.accountingOpeningDate);

   // Headr-Feld Nr. 14 Sachkontenlänge
   // Länge: 1 Typ:Zahl
   // Kleinste Sachkontenlänge = 4, Grösste Sachkontenlänge = 8
   // TODO: Dialog param
   var field14 = "8";

   // Headr-Feld Nr. 15 Datum vom
   // Länge: 8 Typ:Zahl
   // Datum von Format: JJJJMMTT
   var field15 = "";

   // Headr-Feld Nr. 16 Datum bis
   // Länge: 8 Typ:Zahl
   // Datum bis Format: JJJJMMTT
   var field16 = "";

   // Headr-Feld Nr. 17 Bezeichnung
   // Länge:30 Typ:Text
   // Bezeichnung des Buchungsstapels
   var field17 = "";

   // Headr-Feld Nr. 18 Diktatkürzel
   // Länge:2 Typ:Text
   // Diktatkürzel Beispiel MM = Max Mustermann
   var field18 = "";

   // Headr-Feld Nr. 19 Buchungstyp
   // Länge: 1 Typ:Zahl
   // 1 = Finanzbuchhaltung, 2 = Jahresabschluss
   var field19 = "1";

   // Headr-Feld Nr. 20 Rechnungslegungszweck
   // Länge: 2 Typ:Zahl
   // 0 oder leer = Rechnungslegungszweckunabhängig
   var field20 = "";

   // Headr-Feld Nr. 21 reserviert
   // Länge:	 Typ:Zahl
   var field21 = "";

   // Headr-Feld Nr. 22 WKZ
   // Länge:3 Typ:Text
   // Währungskennzeichen
   var field22 = "";

   // Reservierte Felder
   var field23 = "";
   var field24 = "";
   var field25 = "";
   var field26 = "";

   return header = [[field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, field11, field12, field13, field14, field15, field16, field17, field18, field19, field20, field21, field22, field23, field24, field25, field26]];
}

/**
* load values from accounting file
* example of format
* accountingBasicCurrency = "EUR"
* accountingOpeningDate = "2012-01-01"
* accountingClosureDate = "2012-12-31"
*/
DatevKontenbeschriftungen.prototype.readAccountingData = function () {
   var param = {};
   param.accountingBasicCurrency = '';
   param.accountingOpeningDate = '';
   param.accountingClosureDate = '';
   param.accountingYear = 0;

   param.accountingBasicCurrency = this.banDocument.info("AccountingDataBase", "BasicCurrency");
   param.accountingOpeningDate = this.banDocument.info("AccountingDataBase", "OpeningDate");
   param.accountingClosureDate = this.banDocument.info("AccountingDataBase", "ClosureDate");

   var openingYear = 0;
   var closureYear = 0;
   if (param.accountingOpeningDate.length >= 10)
      openingYear = param.accountingOpeningDate.substring(0, 4);
   if (param.accountingClosureDate.length >= 10)
      closureYear = param.accountingClosureDate.substring(0, 4);
   if (openingYear > 0 && openingYear === closureYear)
      param.accountingYear = openingYear;
   return param;
}

DatevKontenbeschriftungen.prototype.setParam = function (param) {
   if (param && typeof(param) === 'object') {
      this.param = param;
   } else if (param && typeof(param) === 'string') {
      this.param = JSON.parse(param)
   }
   this.verifyParam();
}

/**
* The function tableToCsv convert the table (array of array) to a CSV string
* (semicolon separated values). Double quotes are replaced with apos.
* @return Return the table as a string in the CSV format.
*/
DatevKontenbeschriftungen.prototype.tableToCsv = function (table) {
   var result = '';
   for (var i = 0; i < table.length; i++) {
      var values = table[i];
      for (var j = 0; values && j < values.length; j++) {
         if (j > 0)
            result += ";";
         var value = values[j];
         /*if ( value.match(/;|\n|\r/)) {
         value = value.replace( '"', '\''); // Can't have "
         value = '"' + value + '"';
         }*/
         result += value;
      }
      result += "\r\n";
   }
   return result;
}

/**
* Format text fields removing white spaces
*/
DatevKontenbeschriftungen.prototype.toTextFormat = function (string) {
   string = (string || "");
   if (string.length <= 0)
      return '""';

   var text = string;
   text = text.replace(/^\s\s*/g, '');     // Remove Preceding white space
   text = text.replace(/\s\s*$/g, '');     // Remove Trailing white space
   text = text.replace(/"/g, '""');
   text = '"' + text + '"';
   return text;
}

DatevKontenbeschriftungen.prototype.verifyParam = function () {
   if (!this.param.mandanten)
      this.param.mandanten = '';
   if (!this.param.berater)
      this.param.berater = '';
   if (!this.param.kontenzuordnungSelected)
      this.param.kontenzuordnungSelected = false;
}

/**
* output integers with leading zeros
*/
DatevKontenbeschriftungen.prototype.zeroPad = function (num, places) {
   if (num.toString().length > places)
      num = 0;
   var zero = places - num.toString().length + 1;
   return Array(+(zero > 0 && zero)).join("0") + num;
}
