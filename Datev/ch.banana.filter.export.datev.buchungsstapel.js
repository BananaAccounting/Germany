// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.filter.export.datev.buchungsstapel
// @description = DATEV Export / Buchungsdaten
// @doctype = *.*
// @encoding = Windows-1252
// @exportfilename = EXTF_Buchungstapel_<Date>
// @exportfiletype = csv
// @inputdatasource = none
// @pubdate = 2018-08-10
// @publisher = Banana.ch SA
// @task = export.file
// @timeout = -1

//TODO add limit of 99997 Transactions

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

   var datevBuchungsstapel = new DatevBuchungsstapel(Banana.document);
   datevBuchungsstapel.setParam(param);
   var transactions = datevBuchungsstapel.loadData();
   return transactions;
}

/**
* Calls the dialog in order to set variables
*/
function settingsDialog() {

   var datevBuchungsstapel = new DatevBuchungsstapel(Banana.document);
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      datevBuchungsstapel.setParam(JSON.parse(savedParam));
   }
   var accountingData = datevBuchungsstapel.readAccountingData();

   var dialog = Banana.Ui.createUi("ch.banana.filter.export.datev.buchungsstapel.dialog.ui");
   dialog.enableButtons = function () {
      if (dialog.zeitraumGroupBox.wirtschaftsjahrRadioButton.checked) {
         dialog.zeitraumGroupBox.quartalComboBox.enabled = false;
         dialog.zeitraumGroupBox.quartalComboBox.update();
         dialog.zeitraumGroupBox.monatComboBox.enabled = false;
         dialog.zeitraumGroupBox.monatComboBox.update();
         dialog.zeitraumGroupBox.vonDateEdit.enabled = false;
         dialog.zeitraumGroupBox.vonDateEdit.update();
         dialog.zeitraumGroupBox.bisLabelText.enabled = false;
         dialog.zeitraumGroupBox.bisLabelText.update();
         dialog.zeitraumGroupBox.bisDateEdit.enabled = false;
         dialog.zeitraumGroupBox.bisDateEdit.update();
      }
      else if (dialog.zeitraumGroupBox.quartalRadioButton.checked) {
         dialog.zeitraumGroupBox.quartalComboBox.enabled = true;
         dialog.zeitraumGroupBox.quartalComboBox.update();
         dialog.zeitraumGroupBox.monatComboBox.enabled = false;
         dialog.zeitraumGroupBox.monatComboBox.update();
         dialog.zeitraumGroupBox.vonDateEdit.enabled = false;
         dialog.zeitraumGroupBox.vonDateEdit.update();
         dialog.zeitraumGroupBox.bisLabelText.enabled = false;
         dialog.zeitraumGroupBox.bisLabelText.update();
         dialog.zeitraumGroupBox.bisDateEdit.enabled = false;
         dialog.zeitraumGroupBox.bisDateEdit.update();
      }
      else if (dialog.zeitraumGroupBox.monatRadioButton.checked) {
         dialog.zeitraumGroupBox.quartalComboBox.enabled = false;
         dialog.zeitraumGroupBox.quartalComboBox.update();
         dialog.zeitraumGroupBox.monatComboBox.enabled = true;
         dialog.zeitraumGroupBox.monatComboBox.update();
         dialog.zeitraumGroupBox.vonDateEdit.enabled = false;
         dialog.zeitraumGroupBox.vonDateEdit.update();
         dialog.zeitraumGroupBox.bisLabelText.enabled = false;
         dialog.zeitraumGroupBox.bisLabelText.update();
         dialog.zeitraumGroupBox.bisDateEdit.enabled = false;
         dialog.zeitraumGroupBox.bisDateEdit.update();
      }
      else if (dialog.zeitraumGroupBox.datumRadioButton.checked) {
         dialog.zeitraumGroupBox.quartalComboBox.enabled = false;
         dialog.zeitraumGroupBox.quartalComboBox.update();
         dialog.zeitraumGroupBox.monatComboBox.enabled = false;
         dialog.zeitraumGroupBox.monatComboBox.update();
         dialog.zeitraumGroupBox.vonDateEdit.enabled = true;
         dialog.zeitraumGroupBox.vonDateEdit.update();
         dialog.zeitraumGroupBox.bisLabelText.enabled = true;
         dialog.zeitraumGroupBox.bisLabelText.update();
         dialog.zeitraumGroupBox.bisDateEdit.enabled = true;
         dialog.zeitraumGroupBox.bisDateEdit.update();
      }
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
      Banana.Ui.showHelp("ch.banana.filter.export.datev.buchungsstapel.dialog.ui");
   }

   /**
   * Dialog's events declaration
   */
   dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
   dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
   dialog.zeitraumGroupBox.wirtschaftsjahrRadioButton.clicked.connect(dialog, dialog.enableButtons);
   dialog.zeitraumGroupBox.quartalRadioButton.clicked.connect(dialog, dialog.enableButtons);
   dialog.zeitraumGroupBox.monatRadioButton.clicked.connect(dialog, dialog.enableButtons);
   dialog.zeitraumGroupBox.datumRadioButton.clicked.connect(dialog, dialog.enableButtons);

   /*Writing data to dialog*/
   dialog.mandantenLineEdit.text = datevBuchungsstapel.param["mandanten"];
   dialog.mandantenLineEdit.cursorPosition = 0;
   dialog.mandantenLabelError.text = "";
   dialog.beraterLineEdit.text = datevBuchungsstapel.param["berater"];
   dialog.beraterLineEdit.cursorPosition = 0;
   dialog.beraterLabelError.text = "";
   if (datevBuchungsstapel.param["kontenzuordnungSelected"] == "true")
      dialog.kontenzuordnungCheckBox.checked = true;
   else
      dialog.kontenzuordnungCheckBox.checked = false;
   if (datevBuchungsstapel.param["wirtschaftsjahrSelected"] == "true")
      dialog.zeitraumGroupBox.wirtschaftsjahrRadioButton.checked = true;
   else
      dialog.zeitraumGroupBox.wirtschaftsjahrRadioButton.checked = false;
   dialog.zeitraumGroupBox.wirtschaftsjahrLabel.setText((accountingData.accountingYear).toString());
   if (datevBuchungsstapel.param["quartalSelected"] == "true")
      dialog.zeitraumGroupBox.quartalRadioButton.checked = true;
   else
      dialog.zeitraumGroupBox.quartalRadioButton.checked = false;
   dialog.zeitraumGroupBox.quartalComboBox.currentIndex = datevBuchungsstapel.param["quartalValue"];
   if (datevBuchungsstapel.param["monatSelected"] == "true")
      dialog.zeitraumGroupBox.monatRadioButton.checked = true;
   else
      dialog.zeitraumGroupBox.monatRadioButton.checked = false;
   dialog.zeitraumGroupBox.monatComboBox.currentIndex = datevBuchungsstapel.param["monatValue"];
   if (datevBuchungsstapel.param["datumSelected"] == "true")
      dialog.zeitraumGroupBox.datumRadioButton.checked = true;
   else
      dialog.zeitraumGroupBox.datumRadioButton.checked = false;
   dialog.zeitraumGroupBox.selektionskriteriumComboBox.currentIndex = datevBuchungsstapel.param["selektionskriteriumValue"];

   //check if dates are valid
   var vonDate = Banana.Converter.stringToDate(datevBuchungsstapel.param["vonDate"], "DD.MM.YYYY");
   var bisDate = Banana.Converter.stringToDate(datevBuchungsstapel.param["bisDate"], "DD.MM.YYYY");
   if (vonDate.getFullYear() != accountingData.accountingYear || bisDate.getFullYear() != accountingData.accountingYear) {
      vonDate = Banana.Converter.stringToDate(accountingData.accountingOpeningDate, "YYYY-MM-DD");
      bisDate = Banana.Converter.stringToDate(accountingData.accountingClosureDate, "YYYY-MM-DD");
   }
   dialog.zeitraumGroupBox.vonDateEdit.setDate(vonDate);
   dialog.zeitraumGroupBox.bisDateEdit.setDate(bisDate);


   Banana.application.progressBar.pause();
   dialog.enableButtons();
   var dlgResult = dialog.exec();
   Banana.application.progressBar.resume();

   if (dlgResult !== 1)
      return false;

   /*Reading data from dialog*/
   datevBuchungsstapel.param["mandanten"] = dialog.mandantenLineEdit.text;
   datevBuchungsstapel.param["berater"] = dialog.beraterLineEdit.text;
   if (dialog.kontenzuordnungCheckBox.checked)
      datevBuchungsstapel.param["kontenzuordnungSelected"] = "true";
   else
      datevBuchungsstapel.param["kontenzuordnungSelected"] = "false";
   if (dialog.zeitraumGroupBox.wirtschaftsjahrRadioButton.checked)
      datevBuchungsstapel.param["wirtschaftsjahrSelected"] = "true";
   else
      datevBuchungsstapel.param["wirtschaftsjahrSelected"] = "false";
   if (dialog.zeitraumGroupBox.quartalRadioButton.checked)
      datevBuchungsstapel.param["quartalSelected"] = "true";
   else
      datevBuchungsstapel.param["quartalSelected"] = "false";
   datevBuchungsstapel.param["quartalValue"] = dialog.zeitraumGroupBox.quartalComboBox.currentIndex.toString();
   if (dialog.zeitraumGroupBox.monatRadioButton.checked)
      datevBuchungsstapel.param["monatSelected"] = "true";
   else
      datevBuchungsstapel.param["monatSelected"] = "false";
   datevBuchungsstapel.param["monatValue"] = dialog.zeitraumGroupBox.monatComboBox.currentIndex.toString();
   if (dialog.zeitraumGroupBox.datumRadioButton.checked)
      datevBuchungsstapel.param["datumSelected"] = "true";
   else
      datevBuchungsstapel.param["datumSelected"] = "false";
   datevBuchungsstapel.param["vonDate"] = dialog.zeitraumGroupBox.vonDateEdit.text < 10 ? "0" + dialog.zeitraumGroupBox.vonDateEdit.text : dialog.zeitraumGroupBox.vonDateEdit.text;
   datevBuchungsstapel.param["bisDate"] = dialog.zeitraumGroupBox.bisDateEdit.text < 10 ? "0" + dialog.zeitraumGroupBox.bisDateEdit.text : dialog.zeitraumGroupBox.bisDateEdit.text;
   datevBuchungsstapel.param["selektionskriteriumValue"] = dialog.zeitraumGroupBox.selektionskriteriumComboBox.currentIndex.toString();

   /* set period */
   if (datevBuchungsstapel.param["datumSelected"] == "true" || datevBuchungsstapel.param["quartalSelected"] == "true" || datevBuchungsstapel.param["monatSelected"] == "true") {
      datevBuchungsstapel.param["periodSelected"] = "true";
      if (datevBuchungsstapel.param["datumSelected"] === "true") {
         datevBuchungsstapel.param["periodBegin"] = datevBuchungsstapel.param["vonDate"];
         datevBuchungsstapel.param["periodEnd"] = datevBuchungsstapel.param["bisDate"];
      }
      else if (datevBuchungsstapel.param["quartalSelected"] === "true") {
         if (datevBuchungsstapel.param["quartalValue"] === "0") {
            datevBuchungsstapel.param["periodBegin"] = "01.01." + accountingData.accountingYear.toString();
            datevBuchungsstapel.param["periodEnd"] = "31.03." + accountingData.accountingYear.toString();
         }
         else if (datevBuchungsstapel.param["quartalValue"] === "1") {
            datevBuchungsstapel.param["periodBegin"] = "01.04." + accountingData.accountingYear.toString();
            datevBuchungsstapel.param["periodEnd"] = "30.06." + accountingData.accountingYear.toString();
         }
         else if (datevBuchungsstapel.param["quartalValue"] === "2") {
            datevBuchungsstapel.param["periodBegin"] = "01.07." + accountingData.accountingYear.toString();
            datevBuchungsstapel.param["periodEnd"] = "30.09." + accountingData.accountingYear.toString();
         }
         else if (datevBuchungsstapel.param["quartalValue"] === "3") {
            datevBuchungsstapel.param["periodBegin"] = "01.10." + accountingData.accountingYear.toString();
            datevBuchungsstapel.param["periodEnd"] = "31.12." + accountingData.accountingYear.toString();
         }
      }
      else if (datevBuchungsstapel.param["monatSelected"] === "true") {
         var month = parseInt(datevBuchungsstapel.param["monatValue"]) + 1;
         //months with 30 days
         if (month === 11 || month === 4 || month === 6 || month === 9) {
            datevBuchungsstapel.param["periodBegin"] = "01." + datevBuchungsstapel.zeroPad(month, 2) + "." + accountingData.accountingYear.toString();
            datevBuchungsstapel.param["periodEnd"] = "30." + datevBuchungsstapel.zeroPad(month, 2) + "." + accountingData.accountingYear.toString();
         }
         //month with 28 or 29 days
         else if (month === 2) {
            var day = 28;
            if (accountingData.accountingYear % 4 == 0 && (accountingData.accountingYear % 100 != 0 || accountingData.accountingYear % 400 == 0)) {
               day = 29;
            }
            datevBuchungsstapel.param["periodBegin"] = "01.02." + accountingData.accountingYear.toString();
            datevBuchungsstapel.param["periodEnd"] = day.toString() + ".02." + accountingData.accountingYear.toString();
         }
         //months with 31 days
         else {
            datevBuchungsstapel.param["periodBegin"] = "01." + datevBuchungsstapel.zeroPad(month, 2) + "." + accountingData.accountingYear.toString();
            datevBuchungsstapel.param["periodEnd"] = "31." + datevBuchungsstapel.zeroPad(month, 2) + "." + accountingData.accountingYear.toString();
         }
      }
   }
   else {
      datevBuchungsstapel.param["periodSelected"] = "false";
      datevBuchungsstapel.param["periodBegin"] = "";
      datevBuchungsstapel.param["periodEnd"] = "";
   }

   var paramToString = JSON.stringify(datevBuchungsstapel.param);
   var value = Banana.document.setScriptSettings(paramToString);
   return true;
}

function DatevBuchungsstapel(banDocument) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;
   this.initParam();

   this.ID_ERR_DATEV_FIELDNOTFOUND = "ERR_DATEV_FIELDNOTFOUND";
   this.ID_ERR_DATEV_LONGTEXT = "ERR_DATEV_LONGTEXT";
   this.ID_ERR_DATEV_NOACCOUNT = "ERR_DATEV_NOACCOUNT";
   this.ID_ERR_DATEV_NOAMOUNT = "ERR_DATEV_NOAMOUNT";
   this.ID_ERR_DATEV_NODATE = "ERR_DATEV_NODATE";
   this.ID_ERR_DATEV_PERIODNOTVALID = "ERR_DATEV_PERIODNOTVALID";
}

/**
* check text length
*/
DatevBuchungsstapel.prototype.checkTextLength = function (text, maxLength, tableName, fieldName, rowNumber) {
   if (maxLength >= 0 && text.length > maxLength) {
      var msg = this.getErrorMessage(this.ID_ERR_DATEV_LONGTEXT);
      msg = msg.replace("%1", fieldName);
      msg = msg.replace("%2", maxLength);
      tableName.addMessage(msg, rowNumber, fieldName, this.ID_ERR_DATEV_LONGTEXT);
      text = text.substring(0, maxLength);
   }
   return text;
}

DatevBuchungsstapel.prototype.filterTransactions = function (row, index, table) {

   //only normal transaction
   //OperationType_None = 0, OperationType_Opening = 1, OperationType_CarryForward = 2,
   //OperationType_Transaction = 3, OperationType_Closure = 4, OperationType_Total = 6
   //this.banDocument.OPERATIONTYPE_TRANSACTION don't work in this.filterTransactions
   var operationType = row.value("JOperationType");
   if (operationType && operationType != 3)
      return false;

   //vat transactions are excluded
   var isVatOperation = row.value("JVatIsVatOperation");
   if (isVatOperation && !isVatOperation.isEmpty)
      return false;

   //rows with ContraAccountMultipleFirst and  ContraAccountVat are excluded
   //ContraAccountNone = 0, ContraAccountDirect = 1, ContraAccountMultipleFirst = 2,
   //ContraAccountMultipleFollow = 4, ContraAccountVat = 8,
   var contraAccountType = row.value("JContraAccountType");
   if (contraAccountType && contraAccountType == 8)
      return false;
   if (contraAccountType && contraAccountType == 2)
      return false;
   if (contraAccountType && contraAccountType == 1) {
      //Exclude duplicated row, this happens for contraaccounttype==1 where a single transaction is splitted into two rows in the journal
      var prevRow = table.row(index - 1);
      if (prevRow) {
         var currTransactionNumber = row.value("JRowOrigin");
         var prevTransactionNumber = prevRow.value("JRowOrigin");
         var prevContraAccountType = prevRow.value("JContraAccountType");
         if (prevContraAccountType && prevContraAccountType == 1 && currTransactionNumber == prevTransactionNumber)
            return false;
      }
   }

   //Exclude empty rows
   var jAccount = row.value("JAccount");
   if (!jAccount)
      jAccount = "";
   var jContraAccount = row.value("JContraAccount");
   if (!jContraAccount)
      jContraAccount = "";
   var date = row.value("Date");
   if (!date)
      date = "";
   var amount = row.value("JAmount");
   if (!amount)
      amount = "";
   var amountCurrency = row.value("JAmountAccountCurrency");
   if (!amountCurrency)
      amountCurrency = "";
   if (jAccount.isEmpty && jContraAccount.isEmpty && date.isEmpty
      && amount.isEmpty && amountCurrency.isEmpty)
      return false;

   return true;
}

/**
* Returns the value of the column
* if the row is not valid an error message is added
*/
DatevBuchungsstapel.prototype.getColumnValue = function (table, row, columnName) {

   if (columnName.length <= 0 || !row || !table)
      return "";

   var value = row.value(columnName);

   if (value === undefined) {
      var msg = this.getErrorMessage(this.ID_ERR_DATEV_FIELDNOTFOUND);
      msg = msg.replace("%1", columnName);
      table.addMessage(msg, -1, columnName, this.ID_ERR_DATEV_FIELDNOTFOUND);
      return "@Cancel";
   }

   return value;
}

/**
* return the country code of the specified account
*/
DatevBuchungsstapel.prototype.getCountry = function (vatnumber) {
   var country = "";
   var tableAccounts = this.banDocument.table("Accounts");
   if (vatnumber.length <= 0 || !tableAccounts)
      return country;
   var row = tableAccounts.findRowByValue("VatNumber", vatnumber);
   if (row) {
      country = this.getColumnValue(tableAccounts, row, "Country");
   }
   if (country.length > 2)
      country = country.substring(0, 2);
   return country;
}

/**
* return the datev account number if this is specified in the table Accounts, column DatevAccount
*/
DatevBuchungsstapel.prototype.getDatevAccount = function (accountId) {
   if (accountId.length <= 0)
      return accountId;

   var tableAccounts = this.banDocument.table("Accounts");
   if (tableAccounts) {
      var row = tableAccounts.findRowByValue("Account", accountId);
      if (row) {
         var value = row.value("DatevAccount");
         if (value !== undefined && value.length > 0)
            return value;
      }
   }
   var tableCategories = this.banDocument.table("Categories");
   if (tableCategories) {
      var row = tableCategories.findRowByValue("Category", accountId);
      if (row) {
         var value = row.value("DatevAccount");
         if (value !== undefined && value.length > 0)
            return value;
      }
   }
   return accountId;
}

/**
* return the text error message according to error id
*/
DatevBuchungsstapel.prototype.getErrorMessage = function (errorId) {
   switch (errorId) {
      case this.ID_ERR_DATEV_FIELDNOTFOUND:
         return "Das Feld %1 ist nicht vorhanden. Das Skript wird beendet.";
      case this.ID_ERR_DATEV_LONGTEXT:
         return "Der Text vom Feld %1 ist zu lang und er wird geschnitten. Maximale Länge %2 Zeichen";
      case this.ID_ERR_DATEV_NOAMOUNT:
         return "Buchung ohne Betrag. Diese Buchung wird ausgeschlossen.";
      case this.ID_ERR_DATEV_NOACCOUNT:
         return "Betrag ohne Konto Soll und Konto Haben. Diese Buchung wird ausgeschlossen.";
      case this.ID_ERR_DATEV_NODATE:
         return "Buchung ohne Datum. Diese Buchung wird ausgeschlossen.";
      case this.ID_ERR_DATEV_PERIODNOTVALID:
         return "Das Datum ist in der Buchhaltungsperiode nicht inbegriffen. Diese Buchung wird ausgeschlossen.";
   }
   return "";
}

/**
* return the key according to the used vat rate
*/
DatevBuchungsstapel.prototype.getSteuerSchlussel = function (transactionRow, valueAccount, valueContraAccount) {

   //get vatcode from table Transactions
   var vatCode = transactionRow.value("VatCode");
   if (!vatCode || vatCode.length <= 0)
      return "";

   //check if it is a reversal transaction with minus vatcode
   var reversalTransaction = false;
   if (vatCode.substring(0, 1) == "-") {
      vatCode = vatCode.substring(1);
      reversalTransaction = true;
      if (vatCode.length <= 0)
         return "";
   }

   //load table VatCodes
   var tableVatCodes = this.banDocument.table("VatCodes");
   if (!tableVatCodes) {
      return "";
   }

   //get row from table vatcode
   var row = tableVatCodes.findRowByValue("VatCode", vatCode);
   if (!row) {
      return "";
   }

   //steuerschlüssel
   var steuerkey = this.getColumnValue(tableVatCodes, row, "Gr1");
   if (!steuerkey)
      return "";

   //aufhebung der automatik
   if (parseInt(steuerkey) == 40)
      return "40";

   //Generalumkehrschlüssel
   //EU-Tatbestand wird 50 summiert, z.B. 12 umsatzsteuer wird 62
   if (reversalTransaction) {
      if (parseInt(steuerkey) >= 10 && parseInt(steuerkey) <= 19) {
         var nSteuerkey = parseInt(steuerkey);
         nSteuerkey += 50;
         steuerkey = nSteuerkey.toString();
      }
      else if (parseInt(steuerkey) < 10) {
         steuerkey = "2" + steuerkey;
      }
   }

   if (!this.isAutomaticAccount(valueAccount) && !this.isAutomaticAccount(valueContraAccount)) {
      return steuerkey;
   }

   return "";
}

/**
* Initialize dialog values with default values
*/
DatevBuchungsstapel.prototype.initParam = function () {
   this.param = {};
   this.param.mandanten = '';
   this.param.berater = '';
   this.param.kontenzuordnungSelected = false;
   this.param.wirtschaftsjahrSelected = true;
   this.param.quartalSelected = false;
   this.param.quartalValue = 0;
   this.param.monatSelected = false;
   this.param.monatValue = 0;
   this.param.datumSelected = false;
   this.param.vonDate = '';
   this.param.bisDate = '';
   this.param.selektionskriteriumValue = 0;
   this.param.periodSelected = false;
   this.param.periodBegin = '';
   this.param.periodEnd = '';
}

/**
* if in the table 'Accounts', column 'Datev' is written
* AM Automatische Errechnung der Umsatzsteuer
* AV Automatische Errechnung der Vorsteuer
* return true
*/
DatevBuchungsstapel.prototype.isAutomaticAccount = function (accountId) {
   if (accountId.length <= 0)
      return false;

   var tableAccounts = this.banDocument.table("Accounts");
   if (tableAccounts) {
      var row = tableAccounts.findRowByValue("Account", accountId);
      if (row) {
         var value = row.value("DatevAuto");
         if (value && value == 1)
            return true;
      }
   }
   var tableCategories = this.banDocument.table("Categories");
   if (tableCategories) {
      var row = tableCategories.findRowByValue("Category", accountId);
      if (row) {
         var value = row.value("DatevAuto");
         if (value && value == 1)
            return true;
      }
   }
   return false;
}

DatevBuchungsstapel.prototype.loadData = function () {
   var transactions = [];
   //get period selected
   var accountingData = this.readAccountingData();
   var vonDate = Banana.Converter.stringToDate(accountingData.accountingOpeningDate, "YYYY-MM-DD");
   var bisDate = Banana.Converter.stringToDate(accountingData.accountingClosureDate, "YYYY-MM-DD");
   var isPeriodSelected = false;
   if (this.param["periodSelected"] && (this.param["periodSelected"] == true || this.param["periodSelected"].toLowerCase() == 'true')) {
      vonDate = Banana.Converter.stringToDate(this.param["periodBegin"], "DD.MM.YYYY");
      bisDate = Banana.Converter.stringToDate(this.param["periodEnd"], "DD.MM.YYYY");
      isPeriodSelected = true;
   }

   //load data
   var tableTransactions = this.banDocument.table("Transactions");
   var journal = this.banDocument.journal(
      this.banDocument.ORIGINTYPE_CURRENT, this.banDocument.ACCOUNTTYPE_NORMAL);
   var filteredRows = journal.findRows(this.filterTransactions);

   if (tableTransactions && filteredRows) {
      var fieldsHeader = this.loadDataFields();
      transactions.push(fieldsHeader);

      var line = [];
      var value = "";
      var fieldName = "";
      var valueAccount = "";
      var valueContraAccount = "";
      var valueVatRate = "";
      var registrationType = "";

      for (var i = 0; i < filteredRows.length; i++) {

         //Original number of row in table transaction
         var originalRowNumber = filteredRows[i].value("JRowOrigin");

         //Check period
         var validPeriod = false;
         value = "";
         if (parseInt(this.param["selektionskriteriumValue"]) == 0) {
            //"Buchungsdatum"
            value = filteredRows[i].value("Date");
            fieldName = "Date";
         }
         else if (parseInt(this.param["selektionskriteriumValue"]) == 1) {
            //"Belegdatum"
            value = filteredRows[i].value("DateDocument");
            fieldName = "DateDocument";
         }

         if (value.length <= 0) {
            var msg = this.getErrorMessage(this.ID_ERR_DATEV_NODATE);
            tableTransactions.addMessage(msg, originalRowNumber, fieldName, this.ID_ERR_DATEV_NODATE);
            continue;
         }

         var valueDate = Banana.Converter.stringToDate(value, "YYYY-MM-DD");
         if (valueDate >= vonDate && valueDate <= bisDate)
            validPeriod = true;

         /*Banana.console.debug(" validPeriod=" + validPeriod + " isPeriodSelected=" + isPeriodSelected);
         Banana.console.debug("periodBegin=" + Banana.Converter.toLocaleDateFormat(this.param["periodBegin"]) + 
         " periodEnd=" + Banana.Converter.toLocaleDateFormat(this.param["periodEnd"]) + " vonDate=" + 
         Banana.Converter.toLocaleDateFormat(vonDate) + " bisDate=" + Banana.Converter.toLocaleDateFormat(bisDate) + " valueDate=" 
         + Banana.Converter.toLocaleDateFormat(valueDate));*/

         if (!validPeriod) {
            if (!isPeriodSelected) {
               var msg = this.getErrorMessage(this.ID_ERR_DATEV_PERIODNOTVALID);
               tableTransactions.addMessage(msg, originalRowNumber, fieldName, this.ID_ERR_DATEV_PERIODNOTVALID);
            }
            continue;
         }

         //1. Umsatz (Umsatz = 0 not permitted)
         var amountIsValid = false;
         fieldName = "JAmountAccountCurrency";
         value = filteredRows[i].value(fieldName);
         if (value && value.length > 0) {
            amountIsValid = true;
         }
         else {
            fieldName = "JAmount";
            value = filteredRows[i].value(fieldName);
            if (value && value.length > 0) {
               amountIsValid = true;
            }
         }
         var amountSign = Banana.SDecimal.sign(value);
         var transactionCurrency = filteredRows[i].value("JTransactionCurrency");
         value = Banana.SDecimal.abs(value);
         if (amountIsValid) {
            //if transaction has vatcode takes gross amount
            var vatCode = filteredRows[i].value("VatCode");
            if (vatCode && vatCode.length > 0
               && transactionCurrency === accountingData.accountingBasicCurrency) {
               var valueTax = filteredRows[i].value("VatTaxable");
               value = filteredRows[i].value("VatAmount");
               value = Banana.SDecimal.add(Banana.SDecimal.abs(valueTax), Banana.SDecimal.abs(value));
            }
            line.push(this.toAmountFormat(value));
         }
         else {
            var msg = this.getErrorMessage(this.ID_ERR_DATEV_NOAMOUNT);
            tableTransactions.addMessage(msg, originalRowNumber, fieldName, this.ID_ERR_DATEV_NOAMOUNT);
            continue;
         }

         //2. Soll/Haben Kennzeichen
         registrationType = "S";
         if (amountSign < 0)
            registrationType = "H";
         line.push(this.toTextFormat(registrationType));

         //3. WKZ Umsatz
         value = filteredRows[i].value("ExchangeCurrency");
         if (!value)
            value = "";
         var currency = this.checkTextLength(value, 3, tableTransactions, "ExchangeCurrency", originalRowNumber);
         line.push(this.toTextFormat(currency));

         //4. Kurs
         value = filteredRows[i].value("ExchangeRate");
         if (!value)
            value = "";
         //if the transaction currency is the same as the accounting currency and the exchange rate
         //is = 1 then is not necessary to write the value
         if (accountingData.accountingBasicCurrency == currency && parseInt(value) === 1)
            value = "";
         line.push(this.toExchangeRateFormat(value));

         //5. BasisUmsatz
         value = "";
         if (accountingData.accountingBasicCurrency != currency) {
            value = filteredRows[i].value("Amount");
            if (!value)
               value = "";
         }
         line.push(this.toAmountFormat(value));

         //6. WKZ Basis-Umsatz
         value = "";
         if (accountingData.accountingBasicCurrency != currency) {
            value = accountingData.accountingBasicCurrency;
         }
         line.push(this.toTextFormat(value));

         //7. Konto
         valueAccount = filteredRows[i].value("JAccount");
         valueAccount = this.getDatevAccount(valueAccount);
         if (valueAccount == "@Cancel")
            return "@Cancel";
         line.push(valueAccount);

         //8. Gegenkonto
         valueContraAccount = filteredRows[i].value("JContraAccount");
         valueContraAccount = this.getDatevAccount(valueContraAccount);
         if (valueContraAccount == "@Cancel")
            return "@Cancel";
         line.push(valueContraAccount);

         //9. BU-Schlüssel
         value = this.getSteuerSchlussel(filteredRows[i], valueAccount, valueContraAccount);
         if (value == "@Cancel") {
            line = [];
            continue;
         }
         line.push(this.toTextFormat(value));

         //10. Belegdatum
         value = filteredRows[i].value("DateDocument");
         if (!value)
            value = "";
         if (value.length <= 0)
            value = filteredRows[i].value("Date");
         if (!value)
            value = "";
         line.push(Banana.Converter.changeDateFormat(value, "YYYY-MM-DD", "DDMM"));

         //11. Belegfeld1
         value = filteredRows[i].value("Doc");
         if (!value)
            value = "";
         line.push(this.toTextFormat(value));

         //12. Belegfeld2
         value = filteredRows[i].value("DocInvoice");
         line.push(this.toTextFormat(value));

         //13. Skonto
         value = "";
         line.push(value);

         //14. Buchungstext
         value = filteredRows[i].value("Description");
         if (!value)
            value = "";
         value = this.checkTextLength(value, 60, tableTransactions, "Description", originalRowNumber);
         line.push(this.toTextFormat(value));

         //15. Postensperre
         value = "";
         line.push(value);

         //16. Diverse Adressnummer
         value = "";
         line.push(this.toTextFormat(value));

         //17. Geschäftspartnerbank
         value = "";
         line.push(value);


         //18. Sachverhalt
         value = "";
         line.push(value);

         //19. Zinssperre
         value = "";
         line.push(value);

         //20. Beleglink
         value = "";
         line.push(this.toTextFormat(value));

         //empty fields
         value = "";
         for (var j = 21; j <= 38; j++)
            line.push(this.toTextFormat(value));

         //empty field
         //39.
         value = "";
         line.push(value);

         //40. EU-Land u. UStID
         value = filteredRows[i].value("VatNumber");
         /*if (value.length > 0)
         {
             value = this.getCountry(tableAccounts, value) + value;
         }*/
         line.push(this.toTextFormat(value));

         //41.
         value = "";
         line.push(value);
         //42.
         value = "";
         line.push(this.toTextFormat(value));
         //43.
         value = "";
         line.push(value);
         //44.
         value = "";
         line.push(value);
         //45.
         value = "";
         line.push(value);
         //46.
         value = "";
         line.push(value);
         //47.
         value = "";
         line.push(value);

         //empty fields
         value = "";
         for (var j = 48; j <= 87; j++)
            line.push(this.toTextFormat(value));

         //88.
         value = "";
         line.push(value);
         //89.
         value = "";
         line.push(value);
         //90.
         value = "";
         line.push(value);
         //91.
         value = "";
         line.push(this.toTextFormat(value));
         //92.
         value = "";
         line.push(value);
         //93.
         value = "";
         line.push(value);

         transactions.push(line);
         line = [];
         fieldName = "";
         value = "";
         valueAccount = "";
         valueContraAccount = "";
         valueVatRate = "";
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
DatevBuchungsstapel.prototype.loadDataFields = function () {
   var fieldsHeader = [];
   fieldsHeader.push("Umsatz (ohne Soll/Haben-Kz)");
   fieldsHeader.push("Soll/Haben-Kennzeichen");
   fieldsHeader.push("WKZ Umsatz");
   fieldsHeader.push("Kurs");
   fieldsHeader.push("Basis-Umsatz");
   fieldsHeader.push("WKZ Basis-Umsatz");
   fieldsHeader.push("Konto");
   fieldsHeader.push("Gegenkonto (ohne BU-Schlüssel)");
   fieldsHeader.push("BU-Schlüssel");
   fieldsHeader.push("Belegdatum");
   fieldsHeader.push("Belegfeld 1");
   fieldsHeader.push("Belegfeld 2");
   fieldsHeader.push("Skonto");
   fieldsHeader.push("Buchungstext");
   fieldsHeader.push("Postensperre");
   fieldsHeader.push("Diverse Adressnummer");
   fieldsHeader.push("Geschäftspartnerbank");
   fieldsHeader.push("Sachverhalt");
   fieldsHeader.push("Zinssperre");
   fieldsHeader.push("Beleglink");
   for (var i = 1; i <= 8; i++) {
      fieldsHeader.push("Beleginfo - Art " + i.toString());
      fieldsHeader.push("Beleginfo - Inhalt " + i.toString());
   }
   fieldsHeader.push("KOST1 - Kostenstelle");
   fieldsHeader.push("KOST2 - Kostenstelle");
   fieldsHeader.push("Kost-Menge");
   fieldsHeader.push("EU-Land u. UStID");
   fieldsHeader.push("EU-Steuersatz");
   fieldsHeader.push("Abw. Versteuerungsart");
   fieldsHeader.push("Sachverhalt L+L");
   fieldsHeader.push("Funktionsergänzung L+L");
   fieldsHeader.push("BU 49 Hauptfunktionstyp");
   fieldsHeader.push("BU 49 Hauptfunktionsnummer");
   fieldsHeader.push("BU 49 Funktionsergänzung");
   for (var i = 1; i <= 20; i++) {
      fieldsHeader.push("Zusatzinformation - Art " + i.toString());
      fieldsHeader.push("Zusatzinformation- Inhalt " + i.toString());
   }
   fieldsHeader.push("Stück");
   fieldsHeader.push("Gewicht");
   fieldsHeader.push("Zahlweise");
   fieldsHeader.push("Forderungsart");
   fieldsHeader.push("Veranlagungsjahr");
   fieldsHeader.push("Zugeordnete Fälligkeit");
   return fieldsHeader;
}

/**
* The method loadDataHeader return the header of the file
* according to datev rules for Buchungsstapel format
*/
DatevBuchungsstapel.prototype.loadDataHeader = function (accountingData) {
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
   var field3 = "21";

   // Headr-Feld Nr. 4 Formatname
   // Länge:	 Typ:Text
   // vom Datev angegeben
   var field4 = "\"Buchungsstapel\"";

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
   var field14 = "4";

   // Headr-Feld Nr. 15 Datum vom
   // Länge: 8 Typ:Zahl
   // Datum von Format: JJJJMMTT
   var field15 = "";
   if (this.param["periodBegin"].length > 0) {
      field15 = Banana.Converter.changeDateFormat(this.param["periodBegin"], "DD.MM.YYYY", "YYYYMMDD");
   }
   else {
      field15 = Banana.Converter.changeDateFormat(accountingData.accountingOpeningDate, "YYYY-MM-DD", "YYYYMMDD")
   }

   // Headr-Feld Nr. 16 Datum bis
   // Länge: 8 Typ:Zahl
   // Datum bis Format: JJJJMMTT
   var field16 = "";
   if (this.param["periodEnd"].length > 0) {
      field16 = Banana.Converter.changeDateFormat(this.param["periodEnd"], "DD.MM.YYYY", "YYYYMMDD");
   }
   else {
      field16 = Banana.Converter.changeDateFormat(accountingData.accountingClosureDate, "YYYY-MM-DD", "YYYYMMDD")
   }

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
   var field22 = "\"EUR\"";

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
DatevBuchungsstapel.prototype.readAccountingData = function () {
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

DatevBuchungsstapel.prototype.setParam = function (param) {
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
DatevBuchungsstapel.prototype.tableToCsv = function (table) {
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
* The function toAmountFormat format amount fields
* according to datev rules
*/
DatevBuchungsstapel.prototype.toAmountFormat = function (string) {
   /* sample: 1123123123,12*/

   if (string.length <= 0)
      return '';

   var amount = string;
   var thousandSep = '\'';
   var decimalInt = '.';
   amount = amount.replace(thousandSep, '');
   if (amount.indexOf(decimalInt) >= 0) {
      amount = amount.replace(decimalInt, ',');
   }
   else {
      amount = amount + ",00";
   }
   return amount;
}

/**
* The function toExchangeRateFormat format exchange rate fields
* according to datev rules
*/
DatevBuchungsstapel.prototype.toExchangeRateFormat = function (string) {
   /* sample: 1123,123456*/

   if (string.length <= 0)
      return '';

   var rate = string;
   var thousandSep = '\'';
   var decimalSep = ',';

   if (rate.indexOf(thousandSep) >= 0)
      rate = rate.replace(thousandSep, '');

   if (rate.indexOf('.') >= 0)
      rate = rate.replace('.', decimalSep);

   var posDecimalSep = rate.indexOf(decimalSep);

   if (rate.length > 11 && rate.length - 11 > posDecimalSep)
      rate = rate.substring(0, 11);

   if (rate.length - posDecimalSep >= 5)
      rate = rate.substring(0, posDecimalSep + 5)

   return rate;
}

/**
* Format text fields removing white spaces
*/
DatevBuchungsstapel.prototype.toTextFormat = function (string) {
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

DatevBuchungsstapel.prototype.verifyParam = function () {
   if (!this.param.tipoRegistro)
      this.param.tipoRegistro = 0;
   if (!this.param.mandanten)
      this.param.mandanten = '';
   if (!this.param.berater)
      this.param.berater = '';
   if (!this.param.kontenzuordnungSelected)
      this.param.kontenzuordnungSelected = false;
   if (!this.param.wirtschaftsjahrSelected)
      this.param.wirtschaftsjahrSelected = true;
   if (!this.param.quartalSelected)
      this.param.quartalSelected = false;
   if (!this.param.quartalValue)
      this.param.quartalValue = 0;
   if (!this.param.monatSelected)
      this.param.monatSelected = false;
   if (!this.param.monatValue)
      this.param.monatValue = 0;
   if (!this.param.datumSelected)
      this.param.datumSelected = false;
   if (!this.param.vonDate)
      this.param.vonDate = '';
   if (!this.param.bisDate)
      this.param.bisDate = '';
   if (!this.param.selektionskriteriumValue)
      this.param.selektionskriteriumValue = 0;
   if (!this.param.periodSelected)
      this.param.periodSelected = false;
   if (!this.param.periodBegin)
      this.param.periodBegin = '';
   if (!this.param.periodEnd)
      this.param.periodEnd = '';
}

/**
* output integers with leading zeros
*/
DatevBuchungsstapel.prototype.zeroPad = function (num, places) {
   if (num.toString().length > places)
      num = 0;
   var zero = places - num.toString().length + 1;
   return Array(+(zero > 0 && zero)).join("0") + num;
}
