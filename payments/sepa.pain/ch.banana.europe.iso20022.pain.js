// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.europe.iso20022.pain
// @api = 1.0
// @pubdate = 2019-12-04
// @publisher = Banana.ch SA
// @description =   Credit transfer files creation for european countries (SEPA PAIN.001)
// @task = accounting.payment
// @doctype = *

var ID_ERR_ELEMENT_EMPTY = "ID_ERR_ELEMENT_EMPTY";
var ID_ERR_PAYMENTMETHOD_NOTSUPPORTED = "ID_ERR_PAYMENTMETHOD_NOTSUPPORTED";
var ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";

var ID_PAYMENT_METHOD_SEPA_DIRECTDEBIT = "SEPADIRECTDEBIT";

function createTransferFile(msgId, executionDate, accountData, paymentData) {

    /*Banana.console.debug("msgId: " + msgId);
    Banana.console.debug("executionDate: " + executionDate);
    Banana.console.debug("accountDataObj: " + JSON.stringify(accountData, null, '   '));
    Banana.console.debug("paymentDataObj: " + JSON.stringify(paymentData, null, '   '));*/

    if (!Banana.document)
        return "@cancel";

    var accountDataObj = null;
    var paymentDataObj = null;
    if (typeof (accountData) === 'object') {
        accountDataObj = accountData;
    } else if (typeof (accountData) === 'string') {
        try {
            accountDataObj = JSON.parse(accountData);
        } catch (e) {
            Banana.document.addMessage(e);
        }
    }
    if (typeof (paymentData) === 'object') {
        paymentDataObj = paymentData;
    } else if (typeof (paymentData) === 'string') {
        try {
            paymentDataObj = JSON.parse(paymentData);
        } catch (e) {
            Banana.document.addMessage(e);
        }
    }
    if (!accountDataObj || !paymentDataObj)
        return "@cancel";

    // Create a transfer file which contains all data to transfer
    //...
	return "<?xml version='1.0' encoding='utf-8'?><Document></Document>";
}

function getEditorParams(paymentData) {
    var convertedParam = {};

    if (!paymentData)
        return convertedParam;

    //Get payment method: ISR, QR, IBAN, ...
    var methodId = getPaymentMethodSelected(paymentData);
    if (methodId == ID_PAYMENT_METHOD_SEPA_DIRECTDEBIT) {
        convertedParam = getEditorParamsSepaDirectDebit(paymentData);
    }

    convertedParam.readValues = function () {
        for (var i = 0; i < convertedParam.data.length; i++) {
            if (typeof (convertedParam.data[i].readValue) !== 'undefined') {
                convertedParam.data[i].readValue();
            }
        }
    }
    return convertedParam;
}

function getEditorParamsSepaDirectDebit(paymentData) {
    var lang = 'en';
    if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    var texts = setTexts(lang);

    var convertedParam = {};
    convertedParam.version = '1.0';
    /*array dei parametri dello script*/
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'creditor';
    currentParam.title = 'Beneficiary';
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'accountId';
    currentParam.title = 'Account';
    currentParam.type = 'combobox';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.accountId ? paymentData.accountId : '';
    currentParam.readValue = function () {
        paymentData.accountId = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'name';
    currentParam.title = 'Name';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.name ? paymentData.name : '';
    currentParam.readValue = function () {
        paymentData.name = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'address';
    currentParam.title = 'Address';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.address ? paymentData.address : '';
    currentParam.readValue = function () {
        paymentData.address = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'postalCode';
    currentParam.title = 'Postal code';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.postalCode ? paymentData.postalCode : '';
    currentParam.readValue = function () {
        paymentData.postalCode = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'locality';
    currentParam.title = 'Locality';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.locality ? paymentData.locality : '';
    currentParam.readValue = function () {
        paymentData.locality = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'country';
    currentParam.title = 'Country';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.country ? paymentData.country : '';
    currentParam.readValue = function () {
        paymentData.country = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'iban';
    currentParam.title = 'IBAN/Account';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.iban ? paymentData.iban : '';
    currentParam.readValue = function () {
        paymentData.iban = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'bic';
    currentParam.title = 'BIC';
    currentParam.type = 'string';
    currentParam.parentObject = 'creditor';
    currentParam.value = paymentData.bic ? paymentData.bic : '';
    currentParam.readValue = function () {
        paymentData.bic = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'additionalInfo';
    currentParam.title = "Additional Information";
    currentParam.type = 'string';
    currentParam.value = paymentData.additionalInfo ? paymentData.additionalInfo : '';
    currentParam.readValue = function () {
        paymentData.additionalInfo = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'amount';
    currentParam.title = "Amount";
    currentParam.type = 'string';
    currentParam.value = paymentData.amount ? paymentData.amount : '';
    currentParam.readValue = function () {
        paymentData.amount = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'currency';
    currentParam.title = "Currency";
    currentParam.type = 'string';
    currentParam.value = paymentData.currency ? paymentData.currency : '';
    currentParam.readValue = function () {
        paymentData.currency = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'duedate';
    currentParam.title = "Due date";
    currentParam.type = 'date';
    currentParam.value = paymentData.duedate ? paymentData.duedate : '';
    currentParam.readValue = function () {
        paymentData.duedate = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

/**
* return the text error message according to error id
*/
function getErrorMessage(errorId) {
    var lang = 'en';
    if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);

    switch (errorId) {
        case ID_ERR_ELEMENT_EMPTY:
            return "Required field";
        case ID_ERR_PAYMENTMETHOD_NOTSUPPORTED:
            return "The payment method %1 is not supported";
        case ID_ERR_VERSION_NOTSUPPORTED:
            if (lang == 'de')
                return "Das Skript funktionert mit Ihrer Version von Banana Buchhaltung nicht. Auf neuste Version aktualisieren.";
            else
                return "This script does not run with your version of Banana Accounting. Please update to a more recent version.";
    }
    return '';
}

function getPaymentMethods() {
    var lang = 'en';
    if (Banana.document && Banana.document.locale)
        lang = Banana.document.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);

    var jsonArray = [];
    jsonArray.push({ "methodId": ID_PAYMENT_METHOD_SEPA_DIRECTDEBIT, "description": "SEPA Direct Debit (EUR)" });
    return JSON.stringify(jsonArray, null, '   ');
}

function getPaymentMethodSelected(paymentData) {
    //Get payment method: ISR, QR, IBAN, ...
    if (paymentData && paymentData.id && paymentData.id.methodId)
        return paymentData.id.methodId;
    return '';
}

function getScriptVersion() {
    var scriptVersion = "1.0.0";
    return scriptVersion;
}

function scanCode(code) {
    var parsedCode = code.split(/\r?\n/);
    var qRCodeData = {};
    qRCodeData.QRType = parsedCode[0] ? parsedCode[0] : '';;
    qRCodeData.Version = parsedCode[1] ? parsedCode[1] : '';;
    //..

    var paymentData = {};
    paymentData.id = {};
    if (qRCodeData.QRType === "SPC") {
        //paymentData.id.methodId = "QRCode";
        //paymentData.iban = qRCodeData.Account;
    }

    return paymentData;
}

function setTexts(language) {
    var texts = {};
    if (language == 'de') {
    } else {
    }
    return texts;
}

function validateParams(paymentData) {
    var methodId = getPaymentMethodSelected(paymentData);
    if (methodId.length <= 0 || !paymentData.data)
        return paymentData;
    for (var i = 0; i < paymentData.data.length; i++) {
        var key = '';
        var value = '';
        if (paymentData.data[i].name)
            key = paymentData.data[i].name;
        if (paymentData.data[i].value && paymentData.data[i].value.length > 0)
            value = paymentData.data[i].value;
        if (value.length <= 0 && paymentData.data[i].placeholder)
            value = paymentData.data[i].placeholder;
        if (key === 'amount' && value.length <= 0) {
            var msg = getErrorMessage(ID_ERR_ELEMENT_EMPTY);
            //msg = msg.replace("%1", 'Amount');
            paymentData.data[i].errorId = ID_ERR_ELEMENT_EMPTY;
            paymentData.data[i].errorMsg = msg;
        }
        else if (key === 'currency' && value.length <= 0) {
            paymentData.data[i].errorId = ID_ERR_ELEMENT_EMPTY;
            paymentData.data[i].errorMsg = getErrorMessage(ID_ERR_ELEMENT_EMPTY);
        }
        else if (key === 'iban' && value.length <= 0) {
            paymentData.data[i].errorId = ID_ERR_ELEMENT_EMPTY;
            paymentData.data[i].errorMsg = getErrorMessage(ID_ERR_ELEMENT_EMPTY);
        }
    }
    return paymentData;
}

// Convert SEPA PAIN.001 to array of array.
function viewTransferFile(xml) {
  var transactions = [];

  const xmlFile = Banana.Xml.parse(xml);
  const xmlns = xmlFile.firstChildElement('Document')
    .attribute('xmlns');

  // Check if file is of format PAIN.001 (credit transactions).
  const creditTransfers = xmlns.search('pain.001') > 0 ? true : false;
  if (!creditTransfers) {
    Banana.application.addMessage('Document does not contain Credit Transactions (SEPA PAIN.001).');
    return false;
  }

  // Get to the element containing transactions.
  const pmtInf = xmlFile.firstChildElement('Document')
    .firstChildElement('CstmrCdtTrfInitn')
    .firstChildElement('PmtInf');

  // Date of transactions.
  const date = Banana.Converter.toLocaleDateFormat(pmtInf.firstChildElement('ReqdExctnDt').text);

  var expense = 0;
  var creditorName = '';
  var rmtInf = '';
  var description = '';

  // Loop through the transactions.
  var transactionNode = pmtInf.firstChildElement('CdtTrfTxInf');
  while (transactionNode) {
    expense = transactionNode.firstChildElement('Amt').text;
    creditorName = transactionNode.firstChildElement('Cdtr').text;
	if (transactionNode.firstChildElement('RmtInfRmtInf'))
		rmtInf = transactionNode.firstChildElement('RmtInfRmtInf').text;
    // Format for the description is: creditor name / transaction text.
    description = '"' + creditorName + ' / ' + rmtInf + '"';

    transactions.push([date, description, '', expense]);

    // Next transaction.
    transactionNode = transactionNode.nextSiblingElement('CdtTrfTxInf');
  }

  // Converts a table (array of array) to a tsv file (tabulator separated values)
  var tsvFile = Banana.Converter.arrayToTsv(transactions);

  // Return the converted tsv file
  return tsvFile;
}