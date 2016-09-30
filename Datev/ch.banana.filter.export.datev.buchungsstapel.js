// Copyright [2014] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.filter.export.datev.buchungsstapel
// @publisher = Banana.ch SA
// @description = DATEV Export / Buchungsdaten
// @doctype = *.*
// @task = export.file
// @exportfilename = EXTF_Buchungstapel_<Date>
// @exportfiletype = csv
// @inputdatasource = none
// @timeout = -1
// @encoding = Windows-1252

//TODO add limit of 99997 Transactions
/**
* ErrorId List
*/
var ID_ERR_DATEV_FIELDNOTFOUND = "ERR_DATEV_FIELDNOTFOUND";
var ID_ERR_DATEV_LONGTEXT = "ERR_DATEV_LONGTEXT";
var ID_ERR_DATEV_NOACCOUNT = "ERR_DATEV_NOACCOUNT";
var ID_ERR_DATEV_NOAMOUNT = "ERR_DATEV_NOAMOUNT";
var ID_ERR_DATEV_NODATE = "ERR_DATEV_NODATE";
var ID_ERR_DATEV_PERIODNOTVALID = "ERR_DATEV_PERIODNOTVALID";
/**
* param values are loaded from Banana.document, edited through dialog and saved to Banana.document
* This array object is like a map (associative array) i.e. "key":"value", see initParam()
* Examples of keys: mandantennummer, beraternummer
*/
var param = {};
var accountingBasicCurrency = "";
var accountingOpeningDate = "";
var accountingClosureDate = "";
var accountingYear = 0;

/**
* Dialog's functions declaration
*/
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
dialog.buttonBox.accepted.connect(dialog, "checkdata");
dialog.buttonBox.helpRequested.connect(dialog, "showHelp");
dialog.zeitraumGroupBox.wirtschaftsjahrRadioButton.clicked.connect(dialog, "enableButtons");
dialog.zeitraumGroupBox.quartalRadioButton.clicked.connect(dialog, "enableButtons");
dialog.zeitraumGroupBox.monatRadioButton.clicked.connect(dialog, "enableButtons");
dialog.zeitraumGroupBox.datumRadioButton.clicked.connect(dialog, "enableButtons");

/**
* main function
*/
function exec(inData) {

    //loads last saved settings from ac2 document
    readAccountingData();

    //calls dialog if inData contains no param
    var rtnDialog = true;
    if (inData.length > 0) {
        param = JSON.parse(inData);
    }
    else {
        rtnDialog = dialogExec();
    }

    //creates document
    var transactions = [];
    if (rtnDialog && Banana.document) {

        //get period selected
        var vonDate = Banana.Converter.stringToDate(accountingOpeningDate, "YYYY-MM-DD");
        var bisDate = Banana.Converter.stringToDate(accountingClosureDate, "YYYY-MM-DD");
        var isPeriodSelected = false;
        if (param["periodSelected"] == "true") {
            vonDate = Banana.Converter.stringToDate(param["periodBegin"], "DD.MM.YYYY");
            bisDate = Banana.Converter.stringToDate(param["periodEnd"], "DD.MM.YYYY");
            isPeriodSelected = true;
        }

        //load data
        var tableAccounts = Banana.document.table("Accounts");
        var tableTransactions = Banana.document.table("Transactions");
        var journal = Banana.document.journal(
            Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NORMAL);
        var filteredRows = journal.findRows(filterTransactions);

        if (tableAccounts && tableTransactions && filteredRows) {
            var fieldsHeader = getFieldsHeader();
            transactions.push(fieldsHeader);

            var line = [];
            var value = "";
            var fieldName = "";
            var valueAccount = "";
            var valueAccountDebit = "";
            var valueAccountCredit = "";
            var valueContraAccount = "";
            var valueVatRate = "";
            var valueVatTwinAccount = "";
            var registrationType = "";

            for (var i = 0; i < filteredRows.length; i++) {

                //Original number of row in table transaction
               var originalRowNumber = filteredRows[i].value("JRowOrigin");

                //Check period
                var validPeriod = false;
                value = "";
                if (param["selektionskriteriumValue"] == 0) {
                    //"Buchungsdatum"
                    value = filteredRows[i].value("Date");
                    fieldName = "Date";
                }
                else if (param["selektionskriteriumValue"] == 1) {
                    //"Belegdatum"
                    value = filteredRows[i].value("DateDocument");
                    fieldName = "DateDocument";
                }

                if (value.length <= 0) {
                    var msg = getErrorMessage(ID_ERR_DATEV_NODATE);
                    tableTransactions.addMessage(msg, originalRowNumber, fieldName, ID_ERR_DATEV_NODATE);
                    continue;
                }

                var valueDate = Banana.Converter.stringToDate(value, "YYYY-MM-DD");
                if (valueDate >= vonDate && valueDate <= bisDate)
                    validPeriod = true;

                /*line.push("START DEBUGGING");
                line.push("periodBegin="+param["periodBegin"]);
                line.push(" periodEnd=" + param["periodEnd"]);
                line.push(" valueDate="+valueDate.toString());
                line.push(" vonDate=" + vonDate.toString());
                line.push(" bisDate=" + bisDate.toString());
                line.push("END DEBUGGING");
                transactions.push(line);
                continue;*/

                if (!validPeriod) {
                    if (!isPeriodSelected) {
                        var msg = getErrorMessage(ID_ERR_DATEV_PERIODNOTVALID);
                        tableTransactions.addMessage(msg, originalRowNumber, fieldName, ID_ERR_DATEV_PERIODNOTVALID);
                    }
                    continue;
                }

                //1. Umsatz (Umsatz = 0 not permitted)
                var amountIsValid = false;
                fieldName = "AmountCurrency";
                value = filteredRows[i].value(fieldName);
                if (value) {
                    if (value.length > 0) {
                        amountIsValid = true;
                    }
                }
                else {
                    fieldName = "Amount";
                    value = filteredRows[i].value(fieldName);
                    if (value && value.length > 0) {
                        amountIsValid = true;
                    }
                }

                if (amountIsValid) {
                    //check if is a transaction vat excluding
                    if (isVatExcluded(filteredRows[i]))
                    {
                        var valueTax = filteredRows[i].value("VatTaxable");
                        value = filteredRows[i].value("VatAmount");
                        value = Banana.SDecimal.add(Math.abs(valueTax), Math.abs(value));
                    }
                    line.push(toAmountFormat(value));
                }
                else {
                    var msg = getErrorMessage(ID_ERR_DATEV_NOAMOUNT);
                    tableTransactions.addMessage(msg, originalRowNumber, fieldName, ID_ERR_DATEV_NOAMOUNT);
                    continue;
                }

                //2. Soll/Haben Kennzeichen
                registrationType = "S";
                valueAccount = "";  //Field 7. Konto
                valueAccountDebit = filteredRows[i].value("AccountDebit");
                valueAccountCredit = filteredRows[i].value("AccountCredit");
                valueVatTwinAccount = filteredRows[i].value("VatTwinAccount");

                if (valueVatTwinAccount.length > 0 && valueVatTwinAccount == valueAccountCredit)
                    registrationType = "H";

                if (valueAccountDebit.length > 0) {
                    valueAccount = getDatevAccount(tableAccounts, valueAccountDebit);
                    if (valueAccount == "@Cancel")
                        return "@Cancel";
                }
                else if (valueAccountCredit.length > 0) {
                    valueAccount = getDatevAccount(tableAccounts, valueAccountCredit);
                    if (valueAccount == "@Cancel")
                        return "@Cancel";
                }

                if (valueAccount.length <= 0) {
                    fieldName = "AccountDebit";
                    tableTransactions.addMessage(msg, originalRowNumber, fieldName, ID_ERR_DATEV_NOACCOUNT);
                    line = [];
                    continue;
                }
                line.push(toTextFormat(registrationType));

                //3. WKZ Umsatz
                value = filteredRows[i].value("ExchangeCurrency");
                if (!value)
                    value = "";
                var currency = checkTextLength(value, 3, tableTransactions, "ExchangeCurrency", originalRowNumber);
                line.push(toTextFormat(currency));

                //4. Kurs
                value = filteredRows[i].value("ExchangeRate");
                if (!value)
                    value = "";
                //if the transaction currency is the same as the accounting currency and the exchange rate
                //is = 1 then is not necessary to write the value
                if (accountingBasicCurrency == currency && parseInt(value) === 1)
                    value = "";
                line.push(toExchangeRateFormat(value));

                //5. BasisUmsatz
                value = "";
                if (accountingBasicCurrency != currency) {
                    value = filteredRows[i].value("Amount");
                    if (!value)
                        value = "";
                }
                line.push(toAmountFormat(value));

                //6. WKZ Basis-Umsatz
                value = "";
                if (accountingBasicCurrency != currency) {
                    value = accountingBasicCurrency;
                }
                line.push(toTextFormat(value));

                //7. Konto
                line.push(valueAccount);

                //8. Gegenkonto
                value = filteredRows[i].value("JContraAccount");
                value = getDatevAccount(tableAccounts, value);
                if (value == "@Cancel")
                    return "@Cancel";
                line.push(value);

                //9. BU-Schlüssel
                value = getSteuerSchlussel(tableAccounts, filteredRows[i], valueAccountDebit, valueAccountCredit);
                if (value == "@Cancel") {
                    line = [];
                    continue;
                }
                line.push(toTextFormat(value));

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
                line.push(toTextFormat(value));

                //12. Belegfeld2
                value = filteredRows[i].value("DocInvoice");
                line.push(toTextFormat(value));

                //13. Skonto
                value = "";
                line.push(value);

                //14. Buchungstext
                value = filteredRows[i].value("Description");
                if (!value)
                    value = "";
                value = checkTextLength(value, 60, tableTransactions, "Description", originalRowNumber);
                line.push(toTextFormat(value));

                //15. Postensperre
                value = "";
                line.push(value);

                //16. Diverse Adressnummer
                value = "";
                line.push(toTextFormat(value));

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
                line.push(toTextFormat(value));

                //empty fields
                value = "";
                for (var j = 21; j <= 38; j++)
                    line.push(toTextFormat(value));

                //empty field
                //39.
                value = "";
                line.push(value);

                //40. EU-Land u. UStID
                value = filteredRows[i].value("VatNumber");
                /*if (value.length > 0)
                {
                    value = getCountry(tableAccounts, value) + value;
                }*/
                line.push(toTextFormat(value));

                //41.
                value = "";
                line.push(value);
                //42.
                value = "";
                line.push(toTextFormat(value));
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
                    line.push(toTextFormat(value));

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
                line.push(toTextFormat(value));
                //92.
                value = "";
                line.push(value);
                //93.
                value = "";
                line.push(value);

                transactions.push(line);
                line = [];
                value = "";
                valueAccountDebit = "";
                valueAccountCredit = "";
                valueVatRate = "";
            }
        }
        var header = getHeader();
        return tableToCsv(header.concat(transactions));
    }

    return "@Cancel";
}

/**
* Calls the dialog in order to set variables
*/
function dialogExec() {

    initParam();
    if (Banana.document) {
        var data = Banana.document.scriptReadSettings();
        if (data.length > 0) {
            param = JSON.parse(data);
        }
    }

    dialog.mandantenLineEdit.text = param["mandanten"];
    dialog.mandantenLineEdit.cursorPosition = 0;
    dialog.mandantenLabelError.text = "";
    dialog.beraterLineEdit.text = param["berater"];
    dialog.beraterLineEdit.cursorPosition = 0;
    dialog.beraterLabelError.text = "";
    if (param["kontenzuordnungSelected"] == "true")
        dialog.kontenzuordnungCheckBox.checked = true;
    else
        dialog.kontenzuordnungCheckBox.checked = false;
    if (param["wirtschaftsjahrSelected"] == "true")
        dialog.zeitraumGroupBox.wirtschaftsjahrRadioButton.checked = true;
    else
        dialog.zeitraumGroupBox.wirtschaftsjahrRadioButton.checked = false;
    dialog.zeitraumGroupBox.wirtschaftsjahrLabel.setText((accountingYear).toString());
    if (param["quartalSelected"] == "true")
        dialog.zeitraumGroupBox.quartalRadioButton.checked = true;
    else
        dialog.zeitraumGroupBox.quartalRadioButton.checked = false;
    dialog.zeitraumGroupBox.quartalComboBox.currentIndex = param["quartalValue"];
    if (param["monatSelected"] == "true")
        dialog.zeitraumGroupBox.monatRadioButton.checked = true;
    else
        dialog.zeitraumGroupBox.monatRadioButton.checked = false;
    dialog.zeitraumGroupBox.monatComboBox.currentIndex = param["monatValue"];
    if (param["datumSelected"] == "true")
        dialog.zeitraumGroupBox.datumRadioButton.checked = true;
    else
        dialog.zeitraumGroupBox.datumRadioButton.checked = false;
    dialog.zeitraumGroupBox.selektionskriteriumComboBox.currentIndex = param["selektionskriteriumValue"];

    //check if dates are valid
    var vonDate = Banana.Converter.stringToDate(param["vonDate"], "DD.MM.YYYY");
    var bisDate = Banana.Converter.stringToDate(param["bisDate"], "DD.MM.YYYY");
    if (vonDate.getFullYear() != accountingYear || bisDate.getFullYear() != accountingYear) {
        vonDate = Banana.Converter.stringToDate(accountingOpeningDate, "YYYY-MM-DD");
        bisDate = Banana.Converter.stringToDate(accountingClosureDate, "YYYY-MM-DD");
    }
    dialog.zeitraumGroupBox.vonDateEdit.setDate(vonDate);
    dialog.zeitraumGroupBox.bisDateEdit.setDate(bisDate);


    Banana.application.progressBar.pause();
    dialog.enableButtons();
    var dlgResult = dialog.exec();
    Banana.application.progressBar.resume();

    if (dlgResult !== 1)
        return false;

    param["mandanten"] = dialog.mandantenLineEdit.text;
    param["berater"] = dialog.beraterLineEdit.text;
    if (dialog.kontenzuordnungCheckBox.checked)
        param["kontenzuordnungSelected"] = "true";
    else
        param["kontenzuordnungSelected"] = "false";
    if (dialog.zeitraumGroupBox.wirtschaftsjahrRadioButton.checked)
        param["wirtschaftsjahrSelected"] = "true";
    else
        param["wirtschaftsjahrSelected"] = "false";
    if (dialog.zeitraumGroupBox.quartalRadioButton.checked)
        param["quartalSelected"] = "true";
    else
        param["quartalSelected"] = "false";
    param["quartalValue"] = dialog.zeitraumGroupBox.quartalComboBox.currentIndex.toString();
    if (dialog.zeitraumGroupBox.monatRadioButton.checked)
        param["monatSelected"] = "true";
    else
        param["monatSelected"] = "false";
    param["monatValue"] = dialog.zeitraumGroupBox.monatComboBox.currentIndex.toString();
    if (dialog.zeitraumGroupBox.datumRadioButton.checked)
        param["datumSelected"] = "true";
    else
        param["datumSelected"] = "false";
    param["vonDate"] = dialog.zeitraumGroupBox.vonDateEdit.text < 10 ? "0" + dialog.zeitraumGroupBox.vonDateEdit.text : dialog.zeitraumGroupBox.vonDateEdit.text;
    param["bisDate"] = dialog.zeitraumGroupBox.bisDateEdit.text < 10 ? "0" + dialog.zeitraumGroupBox.bisDateEdit.text : dialog.zeitraumGroupBox.bisDateEdit.text;
    param["selektionskriteriumValue"] = dialog.zeitraumGroupBox.selektionskriteriumComboBox.currentIndex.toString();

    //set period
    if (param["datumSelected"] == "true" || param["quartalSelected"] == "true" || param["monatSelected"] == "true") {
        param["periodSelected"] = "true";
        if (param["datumSelected"] === "true") {
            param["periodBegin"] = param["vonDate"];
            param["periodEnd"] = param["bisDate"];
        }
        else if (param["quartalSelected"] === "true") {
            if (param["quartalValue"] === "0") {
                param["periodBegin"] = "01.01." + accountingYear.toString();
                param["periodEnd"] = "31.03." + accountingYear.toString();
            }
            else if (param["quartalValue"] === "1") {
                param["periodBegin"] = "01.04." + accountingYear.toString();
                param["periodEnd"] = "30.06." + accountingYear.toString();
            }
            else if (param["quartalValue"] === "2") {
                param["periodBegin"] = "01.07." + accountingYear.toString();
                param["periodEnd"] = "30.09." + accountingYear.toString();
            }
            else if (param["quartalValue"] === "3") {
                param["periodBegin"] = "01.10." + accountingYear.toString();
                param["periodEnd"] = "31.12." + accountingYear.toString();
            }
        }
        else if (param["monatSelected"] === "true") {
            var month = parseInt(param["monatValue"]) + 1;
            //months with 30 days
            if (month === 11 || month === 4 || month === 6 || month === 9) {
                param["periodBegin"] = "01." + zeroPad(month, 2) + "." + accountingYear.toString();
                param["periodEnd"] = "30." + zeroPad(month, 2) + "." + accountingYear.toString();
            }
                //month with 28 or 29 days
            else if (month === 2) {
                var day = 28;
                if (accountingYear % 4 == 0 && (accountingYear % 100 != 0 || accountingYear % 400 == 0)) {
                    day = 29;
                }
                param["periodBegin"] = "01.02." + accountingYear.toString();
                param["periodEnd"] = day.toString() + ".02." + accountingYear.toString();
            }
                //months with 31 days
            else {
                param["periodBegin"] = "01." + zeroPad(month, 2) + "." + accountingYear.toString();
                param["periodEnd"] = "31." + zeroPad(month, 2) + "." + accountingYear.toString();
            }
        }
    }
    else {
        param["periodSelected"] = "false";
        param["periodBegin"] = "";
        param["periodEnd"] = "";
    }


    var paramToString = JSON.stringify(param);
    var value = Banana.document.scriptSaveSettings(paramToString);

    return true;
}

function filterTransactions(row, index, table) {

    //only normal transaction
    //OperationType_None = 0, OperationType_Opening = 1, OperationType_CarryForward = 2,
    //OperationType_Transaction = 3, OperationType_Closure = 4, OperationType_Total = 6
    var operationType = row.value("JOperationType");
    if (operationType && operationType != Banana.document.OPERATIONTYPE_TRANSACTION)
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
    var accountDebit = row.value("AccountDebit");
    if (!accountDebit)
        accountDebit = "";
    var accountCredit = row.value("AccountCredit");
    if (!accountCredit)
        accountCredit = "";
    var date = row.value("Date");
    if (!date)
        date = "";
    var amount = row.value("Amount");
    if (!amount)
        amount = "";
    var amountCurrency = row.value("AmountCurrency");
    if (!amountCurrency)
        amountCurrency = "";
    if (accountDebit.isEmpty && accountCredit.isEmpty && date.isEmpty
        && amount.isEmpty && amountCurrency.isEmpty)
        return false;

    return true;
}



/**
* The function getFieldsHeader return an array
* with the field names
*/
function getFieldsHeader() {
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
* The function getHeader return the header of the file
* according to datev rules for Buchungsstapel format
*/
function getHeader() {
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
    var month = zeroPad(d.getMonth() + 1, 2);
    var day = zeroPad(d.getDate(), 2);
    var hours = zeroPad(d.getHours(), 2);
    var minutes = zeroPad(d.getMinutes(), 2);
    var secondes = zeroPad(d.getSeconds(), 2);
    var thousandspos = zeroPad("000", 3);
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
    var field11 = param["berater"];

    // Headr-Feld Nr. 12 Mandant
    // Länge: 5 Typ:Zahl
    // Mandantennummer
    // TODO: Dialog param
    var field12 = param["mandanten"];

    // Headr-Feld Nr. 13 WJ-Beginn
    // Länge: 8 Typ:Zahl
    // Wirtschaftsjahresbeginn Format: JJJJMMTT
    // TODO: Dialog param
    var field13 = Banana.Converter.changeDateFormat(accountingOpeningDate);

    // Headr-Feld Nr. 14 Sachkontenlänge
    // Länge: 1 Typ:Zahl
    // Kleinste Sachkontenlänge = 4, Grösste Sachkontenlänge = 8
    // TODO: Dialog param
    var field14 = "4";

    // Headr-Feld Nr. 15 Datum vom
    // Länge: 8 Typ:Zahl
    // Datum von Format: JJJJMMTT
    var field15 = "";
    if (param["periodBegin"].length > 0) {
        field15 = Banana.Converter.changeDateFormat(param["periodBegin"], "DD.MM.YYYY", "YYYYMMDD");
    }
    else {
        field15 = Banana.Converter.changeDateFormat(accountingOpeningDate, "YYYY-MM-DD", "YYYYMMDD")
    }

    // Headr-Feld Nr. 16 Datum bis
    // Länge: 8 Typ:Zahl
    // Datum bis Format: JJJJMMTT
    var field16 = "";
    if (param["periodEnd"].length > 0) {
        field16 = Banana.Converter.changeDateFormat(param["periodEnd"], "DD.MM.YYYY", "YYYYMMDD");
    }
    else {
        field16 = Banana.Converter.changeDateFormat(accountingClosureDate, "YYYY-MM-DD", "YYYYMMDD")
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
* check text length
*/
function checkTextLength(text, maxLength, tableName, fieldName, rowNumber) {
    if (maxLength >= 0 && text.length > maxLength) {
        var msg = getErrorMessage(ID_ERR_DATEV_LONGTEXT);
        msg = msg.replace("%1", fieldName);
        msg = msg.replace("%2", maxLength);
        tableName.addMessage(msg, rowNumber, fieldName, ID_ERR_DATEV_LONGTEXT);
        text = text.substring(0, maxLength);
    }
    return text;
}

/**
* return the country code of the specified account
*/
function getCountry(tableAccounts, vatnumber) {
    var country = "";
    if (vatnumber.length <= 0 || !tableAccounts)
        return country;
    var row = tableAccounts.findRowByValue("VatNumber", vatnumber);
    if (row) {
        country = getColumnValue(tableAccounts, row, "Country");
    }
    if (country.length > 2)
        country = country.substring(0, 2);
    return country;
}


/**
* return the datev account number if this is specified in the table Accounts, column DatevAccount
*/
function getDatevAccount(tableAccounts, accountId) {
    var datevAccountId = "";
    if (accountId.length <= 0 || !tableAccounts)
        return datevAccountId;
    var row = tableAccounts.findRowByValue("Account", accountId);
    if (row) {
        datevAccountId = getColumnValue(tableAccounts, row, "DatevAccount");
    }
    if (datevAccountId.length <= 0)
        datevAccountId = accountId;
    return datevAccountId;
}

/**
* return the key according to the used vat rate
*/
function getSteuerSchlussel(tableAccounts, transactionRow, valueAccountDebit, valueAccountCredit) {

    //get vatcode from table Transactions
    var vatCode = transactionRow.value("VatCode");
    if (!vatCode || vatCode.length <= 0)
        return "";

    //check if it is a reversal transaction with minus vatcode
    var reversalTransaction=false;
    if (vatCode.substring(0, 1) == "-") {
        vatCode = vatCode.substring(1);
        reversalTransaction = true;
        if (vatCode.length <= 0)
            return "";
    }

    //load table VatCodes
    var tableVatCodes = Banana.document.table("VatCodes");
    if (!tableVatCodes) {
        return "";
    }

    //get row from table vatcode
    var row = tableVatCodes.findRowByValue("VatCode", vatCode);
    if (!row) {
        return "";
    }

    //steuerschlüssel
    var steuerkey = getColumnValue(tableVatCodes, row, "Gr1");
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

    if (!isAutomaticAccount(valueAccountDebit, tableAccounts) && !isAutomaticAccount(valueAccountCredit, tableAccounts)) {
        return steuerkey;
    }

    return "";
}

/**
* return the text error message according to error id
*/
function getErrorMessage(errorId) {
    switch (errorId) {
        case ID_ERR_DATEV_FIELDNOTFOUND:
            return "Das Feld %1 ist nicht vorhanden. Das Skript wird beendet.";
        case ID_ERR_DATEV_LONGTEXT:
            return "Der Text vom Feld %1 ist zu lang und er wird geschnitten. Maximale Länge %2 Zeichen";
        case ID_ERR_DATEV_NOAMOUNT:
            return "Buchung ohne Betrag. Diese Buchung wird ausgeschlossen.";
        case ID_ERR_DATEV_NOACCOUNT:
            return "Betrag ohne Konto Soll und Konto Haben. Diese Buchung wird ausgeschlossen.";
        case ID_ERR_DATEV_NODATE:
            return "Buchung ohne Datum. Diese Buchung wird ausgeschlossen.";
        case ID_ERR_DATEV_PERIODNOTVALID:
            return "Das Datum ist in der Buchhaltungsperiode nicht inbegriffen. Diese Buchung wird ausgeschlossen.";
    }
    return "";
}

/**
* Returns the value of the column
* if the row is not valid an error message is added
*/
function getColumnValue(table, row, columnName) {

    if (columnName.length <= 0 || !row || !table)
        return "";

    var value = row.value(columnName);

    if (value === undefined) {
        var msg = getErrorMessage(ID_ERR_DATEV_FIELDNOTFOUND);
        msg = msg.replace("%1", columnName);
        table.addMessage(msg, -1, columnName, ID_ERR_DATEV_FIELDNOTFOUND);
        return "@Cancel";
    }

    return value;
}

/**
* Initialize dialog values with default values
*/
function initParam() {
    param = {
        "mandanten": "",
        "berater": "",
        "kontenzuordnungSelected": "false",
        "wirtschaftsjahrSelected": "true",
        "quartalSelected": "false",
        "quartalValue": "0",
        "monatSelected": "false",
        "monatValue": "0",
        "datumSelected": "false",
        "vonDate": "",
        "bisDate": "",
        "selektionskriteriumValue": "0",
        "periodSelected": "false",
        "periodBegin": "",
        "periodEnd": ""
    };
}

/**
* if in the table 'Accounts', column 'Datev' is written
* AM Automatische Errechnung der Umsatzsteuer
* AV Automatische Errechnung der Vorsteuer
* return true
*/
function isAutomaticAccount(accountId, table) {
    if (table) {
        var row = table.findRowByValue("Account", accountId);
        if (row) {
            var value = getColumnValue(table, row, "DatevAuto");
            if (value == "1") {
                return true;
            }
        }
    }
    return false;
}

/**
* if the vat code excludes the vat amount from the total amount return true
* Amount type 1 = without VAT/Sales tax
*/
function isVatExcluded(transactionRow) {

    //get vatcode from table Transactions
    var vatCode = transactionRow.value("VatCode");
    if (!vatCode || vatCode.length <= 0)
        return false;

    //load table VatCodes
    var tableVatCodes = Banana.document.table("VatCodes");
    if (!tableVatCodes) {
        return false;
    }

    //get row from table vatcode
    var row = tableVatCodes.findRowByValue("VatCode", vatCode);
    if (!row) {
        return false;
    }

    //amounttype
    var amountType = getColumnValue(tableVatCodes, row, "AmountType");
    if (amountType == 1)
        return true;

    return false;
}

/**
* load values from accounting file
* example of format
* accountingBasicCurrency = "EUR"
* accountingOpeningDate = "2012-01-01"
* accountingClosureDate = "2012-12-31"
*/
function readAccountingData() {

    accountingBasicCurrency = "";
    accountingOpeningDate = "";
    accountingClosureDate = "";
    accountingYear = 0;

    accountingBasicCurrency = Banana.document.info("AccountingDataBase", "BasicCurrency");
    accountingOpeningDate = Banana.document.info("AccountingDataBase", "OpeningDate");
    accountingClosureDate = Banana.document.info("AccountingDataBase", "ClosureDate");

    var openingYear = 0;
    var closureYear = 0;
    if (accountingOpeningDate.length >= 10)
        openingYear = accountingOpeningDate.substring(0, 4);
    if (accountingClosureDate.length >= 10)
        closureYear = accountingClosureDate.substring(0, 4);
    if (openingYear > 0 && openingYear === closureYear)
        accountingYear = openingYear;


    return true;
}

/**
* The function tableToCsv convert the table (array of array) to a CSV string
* (semicolon separated values). Double quotes are replaced with apos.
* @return Return the table as a string in the CSV format.
*/
function tableToCsv(table) {
    var result = "";
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
function toAmountFormat(string) {
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
function toExchangeRateFormat(string) {
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
function toTextFormat(string) {
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

/**
* output integers with leading zeros
*/
function zeroPad(num, places) {
    if (num.toString().length > places)
        num = 0;
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}
