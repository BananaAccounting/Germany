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
// @id = ch.banana.de.app.spendenbescheinigung.js
// @api = 1.0
// @pubdate = 2018-06-19
// @publisher = Banana.ch SA
// @description = Spendenbescheinigung
// @description.de = Spendenbescheinigung
// @description.en = Donation receipt
// @doctype = *
// @task = app.command


var param = {};
var selectedCostCenter = '';

/* Function that loads some parameters */
function loadParam() {
    param = {};
    param.reportName = "Spendenbescheinigung";
    return param;
}

/* Main function */
function exec() {

	/* 1) Opens the dialog for the period choice */
	var dateform = null;
	if (options && options.useLastSettings) {
	    dateform = getScriptSettings();
	} else {
	    dateform = settingsDialog();
	}
	if (!dateform) {
	    return;
	}

    /* 1) Get user parameters from the dialog */
    var userParam = initUserParam();
    userParam = parametersDialog(userParam);
    userParam = verifyUserParam(userParam);

    var membershipList = checkMembershipList(Banana.document);
    if (!arrayContains(membershipList, userParam.costcenter) || !userParam.costcenter) {
        return;
    }

	/* 2) Creates the report */
	var report = createReport(Banana.document, dateform.selectionStartDate, dateform.selectionEndDate, userParam);            
	var stylesheet = createStyleSheet();
	Banana.Report.preview(report, stylesheet);
}


/**************************************************************************************
*
* REPORT
* The report is created using the selected period and the data of the dialog
*
**************************************************************************************/
function createReport(banDoc, startDate, endDate, userParam) {

    /* 1) Load parameters */
    param = loadParam();

	/* 2) Create the report */
    var report = Banana.Report.newReport(param.reportName);

    /* Donor Receiver  */
    report.addParagraph(userParam.text01, "");
    report.addParagraph(userParam.text02 + ", " + userParam.text03, "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");


    /*************************************
     a) Address of the Membership (donor)
    *************************************/
    var address = getAddress(banDoc, userParam.costcenter);
    if (address.firstname && address.familyname) {
        report.addParagraph(address.firstname + " " + address.familyname, "bold");
    } else {
        report.addParagraph(address.familyname, "bold");
    }
    report.addParagraph(address.street, "bold");
    report.addParagraph(address.postalcode + " " + address.locality, "bold");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");


    /*************************************
     b) Donor Receiver 
    *************************************/
    var table = report.addTable("table01");
    
    tableRow = table.addRow();
    var paragraph01 = tableRow.addCell("","");
    paragraph01.addParagraph("Aussteller (Bezeichnung und Anschrift der steuerbegünstigten Einrichtung)", "");
    paragraph01.addParagraph(userParam.text01, "bold");
    paragraph01.addParagraph(userParam.text02, "bold");
    paragraph01.addParagraph(userParam.text03, "bold");

    report.addParagraph(" ", "");
    report.addParagraph("Bestätigung über Geldzuwendungen/Mitgliedsbeitrag", "bold");
    report.addParagraph("im Sinne des § 10b des Einkommensteuergesetzes an eine der in § 5 Abs. 1 Nr. 9 des Körperschaftsteuergesetzes bezeichneten Körperschaften, Personenvereinigungen oder Vermögensmassen", "");
    report.addParagraph(" ", "");


    /*************************************
     c) Address of the Membership (donor)  
    *************************************/
    var table = report.addTable("table01");
    tableRow = table.addRow();
    var paragraph01 = tableRow.addCell("","");
    paragraph01.addParagraph("Name und Anschrift des Zuwendenden:", "");
    if (address.firstname && address.familyname) {
        paragraph01.addParagraph(address.firstname + " " + address.familyname, "bold");
    } else {
        paragraph01.addParagraph(address.familyname, "bold");
    }
    paragraph01.addParagraph(address.street + ", " + address.postalcode + " " + address.locality, "bold");
    report.addParagraph(" ", "");


    /*************************************
     d) Accounting data of the donation
    *************************************/

    /* Calculate the total of the Transactions */
    var transactionsObj = calculateTotalTransactions(banDoc, userParam.costcenter, userParam.account, startDate, endDate);
    
    report.addParagraph(" ", "");
    var table = report.addTable("table03");
    tableRow = table.addRow();
    var cell1 = tableRow.addCell("","");
    cell1.addParagraph("Betrag der Zuwendung - in Ziffern -", "");
    cell1.addParagraph(Banana.Converter.toLocaleNumberFormat(transactionsObj.total), "bold");

    /* Retrieves the cents from the amount */
    var digits = [];
    var number = Banana.Converter.toLocaleNumberFormat(transactionsObj.total);
    var numberString = number.toString();
    var c1,c2 = '';
    for (i = 0; i < numberString.length; i++) {
        if (!isNaN(numberString[i])) {
            digits.push(numberString[i]);
        }
    }
    c1 = digits[digits.length-2]; //es. x.3x
    c2 = digits[digits.length-1]; //es. x.x5 => x.35

    /* Converts the amount in German words (cents excluded) */
    var amountInWords = numToWords(transactionsObj.total);

    var cell2 = tableRow.addCell("","");
    cell2.addParagraph("- in Buchstaben -", "");
    cell2.addParagraph(amountInWords + " " + c1 + c2 + "/100", "bold");

    /* Date of the donation */
    var cell3 = tableRow.addCell("","");
    cell3.addParagraph("Tag der Zuwendung: ", "");
    cell3.addParagraph(Banana.Converter.toLocaleDateFormat(startDate) + " - " + Banana.Converter.toLocaleDateFormat(endDate), "bold");
    report.addParagraph(" ", "");


    /*************************************
     e) Show donation transactions
    *************************************/
    if (userParam.transactions) {
        report.addParagraph(" ", "");
        printTransactionTable(banDoc, report, userParam.costcenter, userParam.account, startDate, endDate);
        report.addParagraph(" ", "");
    }


    /*************************************
     f) Add Free texts
    *************************************/
    var bold = '';
    var border = '';

    if (userParam.text04 !== '') {
        if (userParam.text04bold && userParam.text04border) {
            bold = 'bold';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else if (userParam.text04bold && !userParam.text04border) {
            bold = 'bold';
            border = '';
        }
        else if (!userParam.text04bold && userParam.text04border) {
            bold = '';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else {
            bold = '';
            border = '';      
        }
        report.addParagraph(" ", "");
        report.addParagraph(userParam.text04, bold+" "+border);
    }

    if (userParam.text05 !== '') {
        if (userParam.text05bold && userParam.text05border) {
            bold = 'bold';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else if (userParam.text05bold && !userParam.text05border) {
            bold = 'bold';
            border = '';
        }
        else if (!userParam.text05bold && userParam.text05border) {
            bold = '';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else {
            bold = '';
            border = '';      
        }
        report.addParagraph(" ", "");
        report.addParagraph(userParam.text05, bold+" "+border);
    }

    if (userParam.text06 !== '') {
        if (userParam.text06bold && userParam.text06border) {
            bold = 'bold';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else if (userParam.text06bold && !userParam.text06border) {
            bold = 'bold';
            border = '';
        }
        else if (!userParam.text06bold && userParam.text06border) {
            bold = '';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else {
            bold = '';
            border = '';      
        }
        report.addParagraph(" ", "");
        report.addParagraph(userParam.text06, bold+" "+border);
    }

    if (userParam.text07 !== '') {
        if (userParam.text07bold && userParam.text07border) {
            bold = 'bold';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else if (userParam.text07bold && !userParam.text07border) {
            bold = 'bold';
            border = '';
        }
        else if (!userParam.text07bold && userParam.text07border) {
            bold = '';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else {
            bold = '';
            border = '';      
        }
        report.addParagraph(" ", "");
        report.addParagraph(userParam.text07, bold+" "+border);
    }

    if (userParam.text08 !== '') {
        if (userParam.text08bold && userParam.text08border) {
            bold = 'bold';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else if (userParam.text08bold && !userParam.text08border) {
            bold = 'bold';
            border = '';
        }
        else if (!userParam.text08bold && userParam.text08border) {
            bold = '';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else {
            bold = '';
            border = '';      
        }
        report.addParagraph(" ", "");
        report.addParagraph(userParam.text08, bold+" "+border);
    }

    if (userParam.text09 !== '') {
        if (userParam.text09bold && userParam.text09border) {
            bold = 'bold';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else if (userParam.text09bold && !userParam.text09border) {
            bold = 'bold';
            border = '';
        }
        else if (!userParam.text09bold && userParam.text09border) {
            bold = '';
            border = 'borderTop borderRight borderBottom borderLeft padding';
        }
        else {
            bold = '';
            border = '';      
        }
        report.addParagraph(" ", "");
        report.addParagraph(userParam.text09, bold+" "+border);
    }


    /*************************************
     g) Adds Locality, date and signature
    *************************************/
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    var table = report.addTable("table04");
    
    tableRow = table.addRow();
    tableRow.addCell(userParam.localityAndDate, "", 1);
    tableRow.addCell(userParam.signature, "", 1);
    tableRow.addCell("                     ", "", 1);
    
    tableRow = table.addRow();
    tableRow.addCell("", "borderBottom", 3);
    
    tableRow = table.addRow();
    tableRow.addCell("(Ort, Datum und Unterschrift des Zuwendungsempfängers)", "", 3);


    /*************************************
     h) Adds the footer
    *************************************/
    addFooter(report);


    /* Return the report */
	return report;
}

function getAddress(banDoc, accountNumber) {
    var address = {};
    var table = banDoc.table("Accounts");
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var account = tRow.value("Account");

        if (accountNumber === account) {

            address.firstname = tRow.value("FirstName");
            address.familyname = tRow.value("FamilyName");
            address.street = tRow.value("Street");
            address.postalcode = tRow.value("PostalCode");
            address.locality = tRow.value("Locality");
        }
    }
    return address;
}

function countTransactions(banDoc, costcenter, account, startDate, endDate) {
    var cntTransactions = 0;
    var transTab = banDoc.table("Transactions");
    costcenter = costcenter.substring(1); //remove first character . , ;
    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        var date = tRow.value("Date");
        var cc1 = tRow.value("Cc1");
        var cc2 = tRow.value("Cc2");
        var cc3 = tRow.value("Cc3");
        if (date >= startDate && date <= endDate) {
            if (costcenter && costcenter === cc1 || costcenter === cc2 || costcenter === cc3) {
                cntTransactions++;
            }
        }
    }
    return cntTransactions;
}

function calculateTotalTransactions(banDoc, costcenter, account, startDate, endDate) {
    var transTab = banDoc.table("Transactions");
    var date = "";
    var total = "";
    var transactionsObj = {};
    costcenter = costcenter.substring(1); //remove first character . , ;

    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        date = tRow.value("Date");
        transactionsObj.date = date;
        var cc1 = tRow.value("Cc1");
        var cc2 = tRow.value("Cc2");
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {

            if (costcenter && costcenter === cc1 || costcenter === cc2 || costcenter === cc3) {
                
                if (!account || account === "" || account === undefined) {
                    total = Banana.SDecimal.add(total, tRow.value("Amount"));
                }
                else if (tRow.value("AccountDebit") === account || tRow.value("AccountCredit") === account) {
                    total = Banana.SDecimal.add(total, tRow.value("Amount"));
                }
            }
        }
    }

    transactionsObj.total = total;
    
    return transactionsObj;
}

function printTransactionTable(banDoc, report, costcenter, account, startDate, endDate) {
    var transTab = banDoc.table("Transactions");
    var date = "";
    var total = "";
    costcenter = costcenter.substring(1); //remove first character . , ;

    var table = report.addTable("table02");
    var t2col1 = table.addColumn("t2col1");
    var t2col2 = table.addColumn("t2col2");
    var t2col3 = table.addColumn("t2col3");
    var t2col4 = table.addColumn("t2col4");


    tableRow = table.addRow();
    tableRow.addCell("Date", "bold headerStyle borderRight borderTop borderBottom", 1);
    tableRow.addCell("Doc", "bold headerStyle borderRight borderTop borderBottom", 1);
    tableRow.addCell("Description", "bold headerStyle borderRight borderTop borderBottom", 1);
    tableRow.addCell("Amount " + banDoc.info("AccountingDataBase", "BasicCurrency"), "bold headerStyle borderRight borderTop borderBottom", 1);

    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        tableRow = table.addRow();

        date = tRow.value("Date");
        var cc1 = tRow.value("Cc1");
        var cc2 = tRow.value("Cc2");
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {

            if (costcenter && costcenter === cc1 || costcenter === cc2 || costcenter === cc3) {
                
                if (!account || account === "" || account === undefined) {
                    tableRow.addCell(Banana.Converter.toLocaleDateFormat(tRow.value("Date")), "borderRight", 1);
                    tableRow.addCell(tRow.value("Doc"), "borderRight", 1);
                    tableRow.addCell(tRow.value("Description"), "borderRight", 1);
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value("Amount")), "right borderRight", 1);
                    total = Banana.SDecimal.add(total, tRow.value("Amount"));
                }
                else if (tRow.value("AccountDebit") === account || tRow.value("AccountCredit") === account) {
                    tableRow.addCell(Banana.Converter.toLocaleDateFormat(tRow.value("Date")), "borderRight", 1);
                    tableRow.addCell(tRow.value("Doc"), "borderRight", 1);
                    tableRow.addCell(tRow.value("Description"), "borderRight", 1);
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value("Amount")), "right borderRight", 1);
                    total = Banana.SDecimal.add(total, tRow.value("Amount"));
                }
            }
        }
    }

    tableRow = table.addRow();
    tableRow.addCell("", "borderTop borderBottom", 2);
    tableRow.addCell("Summe", "bold right borderTop borderBottom", 1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total), "bold right borderTop borderBottom", 1);
}

function checkMembershipList(banDoc) {
    var membershipList = [];
    var accountsTable = banDoc.table("Accounts");
    for (var i = 0; i < accountsTable.rowCount; i++) {
        var tRow = accountsTable.row(i);
        var account = tRow.value("Account");
        if (account.substring(0,1) === "." || account.substring(0,1) === "," || account.substring(0,1) === ";") {
            membershipList.push(account);
            //membershipList.push(account + " " + tRow.value("Description"));
        }
    }
    return membershipList;
}

function arrayContains(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === value) {
            return true;
        }
    }
    return false;
}

/**************************************************************************************
*
* CONVERSION NUMBER IN GERMAN WORDS
*
**************************************************************************************/
function numToWords(number) {

    //Test number
    //number = Banana.Converter.toLocaleNumberFormat(1111.35);
    //Banana.document.addMessage(number);
    
    number = Banana.Converter.toLocaleNumberFormat(number);
    //number = Banana.Converter.toInternalNumberFormat(number);

    var digits = [];
    var numberString = number.toString();
    var i;
    var res = '';
    var a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11 = '';
    var num = '';
    var len = 0;

    for (i = 0; i < numberString.length; i++) {
        if (!isNaN(numberString[i])) {
            digits.push(numberString[i]);
        }
    }

    //Take values
    a0 = digits[0];
    a1 = digits[1];
    a2 = digits[2];
    a3 = digits[3];
    a4 = digits[4];
    a5 = digits[5];
    a6 = digits[6];
    a7 = digits[7];
    a8 = digits[8];
    
    len = digits.length-2; //esclude centesimi

    if (len == 1) { // 0..9
        res += convertDigit_0_9(a0);
    }
    else if (len == 2) { // 10..99
        if (a0 === "1") { //10..19
            res += convertDigit_10_19(a0, a1);
        }
        else if (a0 !== "1") { //20..99
            res += convertDigit_20_99(a0, a1);
        }
    }
    else if (len === 3) { // 100...999
        res += convertDigit_100_999(a0, a1, a2);
    }
    else if (len === 4) { // 1000...9999
        res += convertDigit_1000_9999(a0, a1, a2, a3);
    }
    else if (len === 5) { // 10000...99999
        res += convertDigit_10000_99999(a0, a1, a2, a3, a4);
    }
    else if (len === 6) { //100000..999999
        res += convertDigit_100000_999999(a0, a1, a2, a3, a4, a5);
    }
    else if (len === 7) { //1000000..9999999
        res += convertDigit_1000000_9999999(a0, a1, a2, a3, a4, a5, a6);
    }
    else if (len === 8) { //10000000..99999999
        res += convertDigit_10000000_99999999(a0, a1, a2, a3, a4, a5, a6, a7);
    }
    else if (len === 9) { //100000000..999999999
        res += convertDigit_100000000_999999999(a0, a1, a2, a3, a4, a5, a6, a7, a8);
    }

    return res.trim();
}

function convertDigit_0_9(digit) {
    var converted = '';
    if (digit === "0") {
        converted = '';
    }
    else if (digit === "1") {
        converted = 'eins';
    }
    else if (digit === "2") {
        converted = 'zwei';
    }
    else if (digit === "3") {
        converted = 'drei';
    }
    else if (digit === "4") {
        converted = 'vier';
    }
    else if (digit === "5") {
        converted = 'fünf';
    }
    else if (digit === "6") {
        converted = 'sechs';
    }
    else if (digit === "7") {
        converted = 'sieben';
    }
    else if (digit === "8") {
        converted = 'acht';
    }
    else if (digit === "9") {
        converted = 'neun';
    }
    return converted;
}

function convertDigit_10_19(digit1, digit2) {
    var converted = '';
    var digits = digit1+digit2;

    if (digits === "10") {
        converted = 'zehn';
    }
    else if (digits === "11") {
        converted = 'elf';
    }
    else if (digits === "12") {
        converted = 'zwölf';
    }
    else if (digits === "13") {
        converted = 'dreizehn';
    }
    else if (digits === "14") {
        converted = 'vierzehn';
    }
    else if (digits === "15") {
        converted = 'fünfzehn';
    }
    else if (digits === "16") {
        converted = 'sechzehn';
    }
    else if (digits === "17") {
        converted = 'siebzehn';
    }
    else if (digits === "18") {
        converted = 'achtzehn';
    }
    else if (digits === "19") {
        converted = 'neunzehn';
    }
    return converted;
}

function convertDigit_20_99(digit1, digit2) {
    var converted = '';

    if (digit2 === "1") { //es. 31
        converted += 'ein';
    }
    else { // es. 32
        converted += convertDigit_0_9(digit2);
    }

    if (digit2 !== "0") {
        converted += "und";
    }
    
    if (digit1 === "2") {
        converted += 'zwanzig';
    }
    else if (digit1 === "3") {
        converted += 'dreißig';
    }
    else if (digit1 === "4") {
        converted += 'vierzig';
    }
    else if (digit1 === "5") {
        converted += 'fünfzig';
    }
    else if (digit1 === "6") {
        converted += 'sechzig';
    }
    else if (digit1 === "7") {
        converted += 'siebzig';
    }
    else if (digit1 === "8") {
        converted += 'achtzig';
    }
    else if (digit1 === "9") {
        converted += 'neunzig';
    }
    return converted;
}

function convertDigit_100_999(digit1, digit2, digit3) {
    var converted = '';
    
    if (digit1 === "1") {
        converted += 'ein'; // einhundert..
    }
    else {
        converted += convertDigit_0_9(digit1); // zwei,..
    }

    converted += 'hundert'; // hundert, zweihundert,..

    if (digit2 === "0") { //es. 103
        converted += convertDigit_0_9(digit3);
    }
    else if (digit2 === "1") { //es. 112
        converted += convertDigit_10_19(digit2, digit3);
    }
    else { //es. 132
        converted += convertDigit_20_99(digit2, digit3);
    }

    return converted;
}

function convertDigit_1000_9999(digit1, digit2, digit3, digit4) {
    var converted = '';
    
    if (digit1 == "1") {
        converted += 'ein';
    }
    else {
        converted += convertDigit_0_9(digit1); // zwei,..
    }

    converted += 'tausend';

    if (digit2 === "0" && digit3 === "0") { //es. 1000, 1001
        converted += convertDigit_0_9(digit4);
    }
    else if (digit2 === "0" && digit3 !== "0") { //es. 1010, 1035
        if (digit3 === "1") { //es. 1010
            converted += convertDigit_10_19(digit3, digit4);
        }
        else { //es. 1035
            converted += convertDigit_20_99(digit3, digit4);
        }
    }
    else if (digit2 !== "0") { //es. 1101, 2400
        converted += convertDigit_100_999(digit2, digit3, digit4);
    }

    return converted;
}

function convertDigit_10000_99999(digit1, digit2, digit3, digit4, digit5) {
    var converted = '';
    
    if (digit1 === "1") {
        converted += convertDigit_10_19(digit1, digit2);  //10xxx, 12xxx
    }
    else {
        converted += convertDigit_20_99(digit1, digit2); //20xxx, 34xxx
    }

    converted += 'tausend';

    if (digit3 === "0" && digit4 === "0") { //es. 10001, 22003
        converted += convertDigit_0_9(digit5);
    }
    else if (digit3 === "0" && digit4 !== "0") { //es. 10010, 22035
        if (digit4 === "1") { //es. 1010
            converted += convertDigit_10_19(digit4, digit5);
        }
        else { //es. 1035
            converted += convertDigit_20_99(digit4, digit5);
        }
    }
    else if (digit3 !== "0") { //es. 10101, 22400
        converted += convertDigit_100_999(digit3, digit4, digit5);
    }

    return converted;
}

function convertDigit_100000_999999(digit1, digit2, digit3, digit4, digit5, digit6) {
    var converted = '';

    /* digit1 digit2 digit3 */
    if (digit1 === "1") {
        converted += 'ein'; // einhundert..
    }
    else {
        converted += convertDigit_0_9(digit1);
    }
    converted += 'hundert';

    if (digit2 === "0") { //es. 103xxx
        if (digit3 === "1") { //es. 101xxx
            converted += "ein";
        }
        else {
            converted += convertDigit_0_9(digit3);
        }
    }
    else if (digit2 === "1") { //es. 112xxx
        converted += convertDigit_10_19(digit2, digit3);
    }
    else { //es. 132xxx
        converted += convertDigit_20_99(digit2, digit3);
    }

    converted += 'tausend';

    /* digit4 digit5 digit6 */
    if (digit4 === "0" && digit5 === "0") { //es. 100001, 22003
        converted += convertDigit_0_9(digit6);
    }
    else if (digit4 === "0" && digit5 !== "0") { //es. 100010, 220035
        if (digit5 === "1") { //es. 1010
            converted += convertDigit_10_19(digit5, digit6);
        }
        else { //es. 1035
            converted += convertDigit_20_99(digit5, digit6);
        }
    }
    else if (digit4 !== "0") { //es. 100101, 220400
        converted += convertDigit_100_999(digit4, digit5, digit6);
    }

    return converted;
}

function convertDigit_1000000_9999999(digit1, digit2, digit3, digit4, digit5, digit6, digit7) {
    var converted = '';
 
    /* digit1: */
    if (digit1 === '1') {
        converted += 'eine Million '; //1'000'000
    } else {
        converted += convertDigit_0_9(digit1) + ' Millionen '; //3'000'000
    }
 
    /*  */
    if (digit2 === '0' && digit3 === '0' && digit4 === '0' && digit5 === '0' && digit6 === '0' && digit7 === '0') { //1'000'000
        converted = converted;
    }
    else {
 
        /* digit2 digit3 digit4 */
        if (digit2 !== '0') { //1'235'xxx
            converted += convertDigit_100_999(digit2, digit3, digit4);
            converted += 'tausend';
        }
        else {
            if (digit3 === '0') { //1'002'001
                converted += convertDigit_0_9(digit4);
            }
            else if (digit3 === "1") { //1'010'011
                converted += convertDigit_10_19(digit3, digit4);
            }
            else { //1'043'032
                converted += convertDigit_20_99(digit3, digit4);
            }
 
            //Se non ci sono cifre delle migliaia non metto la parola tausend
            if (digit3 !== '0' || digit4 !== '0') {
                converted += 'tausend';
            }      
        }
 
        /* digit5 digit6 digit7 */
        if (digit5 !== '0') { //1'000'654
            converted += convertDigit_100_999(digit5, digit6, digit7);
        }
        else {
            if (digit6 === '0') { //1'000'001
                converted += convertDigit_0_9(digit7);
            }
            else if (digit6 === "1") { //1'000'011
                converted += convertDigit_10_19(digit6, digit7);
            }
            else { //1'000'032
                converted += convertDigit_20_99(digit6, digit7);
            }
        }
 
        // //!!! the unit "eins" loses its final -s when composed in a number
        converted = converted.replace("einstausend", "eintausend");
    }
 
    return converted;
}

function convertDigit_10000000_99999999(digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8) {
    var converted = '';
 
    /* digit1: */
    if (digit1 === '1') {
        converted += convertDigit_10_19(digit1, digit2);
    } else {
        converted += convertDigit_20_99(digit1, digit2);
    }
    converted += ' Millionen ';

    /*  */
    if (digit2 === '0' && digit3 === '0' && digit4 === '0' && digit5 === '0' && digit6 === '0' && digit7 === '0' && digit8 === '0') { //10'000'000
        converted = converted;
    }
    else {
 
        /* digit4 digit4 digit5 */
        if (digit3 !== '0') { //1'235'xxx
            converted += convertDigit_100_999(digit3, digit4, digit5);
            converted += 'tausend';
        }
        else {
            if (digit4 === '0') { //1'002'001
                converted += convertDigit_0_9(digit5);
            }
            else if (digit4 === "1") { //1'010'011
                converted += convertDigit_10_19(digit4, digit5);
            }
            else { //1'043'032
                converted += convertDigit_20_99(digit4, digit5);
            }
 
            //Se non ci sono cifre delle migliaia non metto la parola tausend
            if (digit4 !== '0' || digit5 !== '0') {
                converted += 'tausend';
            }      
        }
 
        /* digit6 digit7 digit8 */
        if (digit6 !== '0') { //1'000'654
            converted += convertDigit_100_999(digit6, digit7, digit8);
        }
        else {
            if (digit7 === '0') { //1'000'001
                converted += convertDigit_0_9(digit8);
            }
            else if (digit7 === "1") { //1'000'011
                converted += convertDigit_10_19(digit7, digit8);
            }
            else { //1'000'032
                converted += convertDigit_20_99(digit7, digit8);
            }
        }
 
        // //!!! the unit "eins" loses its final -s when composed in a number
        converted = converted.replace("einstausend", "eintausend");
    }
 
    return converted;
}

function convertDigit_100000000_999999999(digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9) {
    var converted = '';
 
    /* digit1 digit2 digit3 */
    if (digit2 === '0' && digit3 === '1') { //es. x01'xxx'xxx
        
        if (digit1 === '1') { //es. 101'xxx'xxx
            converted += 'ein';
        }
        else {
            converted += convertDigit_0_9(digit1);
        }
        converted += 'hundert';
        converted += 'eine';
    }
    else { //es. x34'xxx'xxx
        converted += convertDigit_100_999(digit1, digit2, digit3);
    }

    converted += ' Millionen ';

    if (digit2 === '0' && digit3 === '0' && digit4 === '0' && digit5 === '0' && digit6 === '0' && digit7 === '0' && digit8 === '0' && digit9 === '0') { //100'000'000
        converted = converted;
    }
    else {
 
        /* digit4 digit5 digit6 */
        if (digit4!== '0') { //1'235'xxx
            converted += convertDigit_100_999(digit4, digit5, digit6);
            converted += 'tausend';
        }
        else {
            if (digit5 === '0') { //1'002'001
                converted += convertDigit_0_9(digit6);
            }
            else if (digit5 === "1") { //1'010'011
                converted += convertDigit_10_19(digit5, digit6);
            }
            else { //1'043'032
                converted += convertDigit_20_99(digit5, digit6);
            }
 
            //Se non ci sono cifre delle migliaia non metto la parola tausend
            if (digit5 !== '0' || digit6 !== '0') {
                converted += 'tausend';
            }      
        }
 
        /* digit7 digit8 digit9 */
        if (digit7 !== '0') { //1'000'654
            converted += convertDigit_100_999(digit7, digit8, digit9);
        }
        else {
            if (digit8 === '0') { //1'000'001
                converted += convertDigit_0_9(digit9);
            }
            else if (digit8 === "1") { //1'000'011
                converted += convertDigit_10_19(digit8, digit9);
            }
            else { //1'000'032
                converted += convertDigit_20_99(digit8, digit9);
            }
        }
 
        // //!!! the unit "eins" loses its final -s when composed in a number
        converted = converted.replace("einstausend", "eintausend");
    }
 
    return converted;
}


/**************************************************************************************
*
* USER PARAMETERS
*
**************************************************************************************/
function convertParam(userParam) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = []; /* array dei parametri dello script */

    //Cost center (donor)
    var currentParam = {};
    currentParam.name = 'costcenter';
    currentParam.title = 'Mitgliedkonto';
    currentParam.type = 'string';
    currentParam.value = selectedCostCenter;
    currentParam.readValue = function() {
        userParam.costcenter = this.value;
    }
    convertedParam.data.push(currentParam);

    // //Account
    // var currentParam = {};
    // currentParam.name = 'account';
    // currentParam.title = 'Konto';
    // currentParam.type = 'string';
    // currentParam.value = userParam.account ? userParam.account : '';
    // currentParam.readValue = function() {
    //     userParam.account = this.value;
    // }
    // convertedParam.data.push(currentParam);

    // Transaction table
    var currentParam = {};
    currentParam.name = 'transactions';
    currentParam.title = 'Buchungen anzeigen  (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.transactions ? true : false;
    currentParam.readValue = function() {
        userParam.transactions = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address
    var currentParam = {};
    currentParam.name = 'address';
    currentParam.title = 'Aussteller';
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.readValue = function() {
        userParam.address = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address row 1
    var currentParam = {};
    currentParam.name = 'text01';
    currentParam.parentObject = 'address';
    currentParam.title = 'Aussteller Zeile 1';
    currentParam.type = 'string';
    currentParam.value = userParam.text01 ? userParam.text01 : '';
    currentParam.readValue = function() {
        userParam.text01 = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address row 2
    var currentParam = {};
    currentParam.name = 'text02';
    currentParam.parentObject = 'address';
    currentParam.title = 'Aussteller Zeile 2';
    currentParam.type = 'string';
    currentParam.value = userParam.text02 ? userParam.text02 : '';
    currentParam.readValue = function() {
        userParam.text02 = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address row 3
    var currentParam = {};
    currentParam.name = 'text03';
    currentParam.parentObject = 'address';
    currentParam.title = 'Aussteller Zeile 3';
    currentParam.type = 'string';
    currentParam.value = userParam.text03 ? userParam.text03 : '';
    currentParam.readValue = function() {
        userParam.text03 = this.value;
    }
    convertedParam.data.push(currentParam);

    // Free text 1
    var currentParam = {};
    currentParam.name = 'text04';
    currentParam.title = 'Text 1';
    currentParam.type = 'string';
    currentParam.value = userParam.text04 ? userParam.text04 : '';
    currentParam.readValue = function() {
        userParam.text04 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text04bold';
    currentParam.parentObject = 'text04';
    currentParam.title = 'Fett (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text04bold ? true : false;
    currentParam.readValue = function() {
     userParam.text04bold = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text04border';
    currentParam.parentObject = 'text04';
    currentParam.title = 'Rahmen (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text04border ? true : false;
    currentParam.readValue = function() {
     userParam.text04border = this.value;
    }
    convertedParam.data.push(currentParam);

    // Free text 2
    var currentParam = {};
    currentParam.name = 'text05';
    currentParam.title = 'Text 2';
    currentParam.type = 'string';
    currentParam.value = userParam.text05 ? userParam.text05 : '';
    currentParam.readValue = function() {
        userParam.text05 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text05bold';
    currentParam.parentObject = 'text05';
    currentParam.title = 'Fett (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text05bold ? true : false;
    currentParam.readValue = function() {
     userParam.text05bold = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text05border';
    currentParam.parentObject = 'text05';
    currentParam.title = 'Rahmen (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text05border ? true : false;
    currentParam.readValue = function() {
     userParam.text05border = this.value;
    }
    convertedParam.data.push(currentParam);

    // Free text 3
    var currentParam = {};
    currentParam.name = 'text06';
    currentParam.title = 'Text 3';
    currentParam.type = 'string';
    currentParam.value = userParam.text06 ? userParam.text06 : '';
    currentParam.readValue = function() {
        userParam.text06 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text06bold';
    currentParam.parentObject = 'text06';
    currentParam.title = 'Fett (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text06bold ? true : false;
    currentParam.readValue = function() {
     userParam.text06bold = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text06border';
    currentParam.parentObject = 'text06';
    currentParam.title = 'Rahmen (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text06border ? true : false;
    currentParam.readValue = function() {
     userParam.text06border = this.value;
    }
    convertedParam.data.push(currentParam);

    // Free text 4
    var currentParam = {};
    currentParam.name = 'text07';
    currentParam.title = 'Text 4';
    currentParam.type = 'string';
    currentParam.value = userParam.text07 ? userParam.text07 : '';
    currentParam.readValue = function() {
        userParam.text07 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text07bold';
    currentParam.parentObject = 'text07';
    currentParam.title = 'Fett (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text07bold ? true : false;
    currentParam.readValue = function() {
     userParam.text07bold = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text07border';
    currentParam.parentObject = 'text07';
    currentParam.title = 'Rahmen (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text07border ? true : false;
    currentParam.readValue = function() {
     userParam.text07border = this.value;
    }
    convertedParam.data.push(currentParam);

    // Free text 5
    var currentParam = {};
    currentParam.name = 'text08';
    currentParam.title = 'Text 5';
    currentParam.type = 'string';
    currentParam.value = userParam.text08 ? userParam.text08 : '';
    currentParam.readValue = function() {
        userParam.text08 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text08bold';
    currentParam.parentObject = 'text08';
    currentParam.title = 'Fett (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text08bold ? true : false;
    currentParam.readValue = function() {
     userParam.text08bold = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text08border';
    currentParam.parentObject = 'text08';
    currentParam.title = 'Rahmen (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text08border ? true : false;
    currentParam.readValue = function() {
     userParam.text08border = this.value;
    }
    convertedParam.data.push(currentParam);

    // Free text 6
    var currentParam = {};
    currentParam.name = 'text09';
    currentParam.title = 'Text 6';
    currentParam.type = 'string';
    currentParam.value = userParam.text09 ? userParam.text09 : '';
    currentParam.readValue = function() {
        userParam.text09 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text09bold';
    currentParam.parentObject = 'text09';
    currentParam.title = 'Fett (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text09bold ? true : false;
    currentParam.readValue = function() {
     userParam.text09bold = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'text09border';
    currentParam.parentObject = 'text09';
    currentParam.title = 'Rahmen (0=Nein; 1=Ja)';
    currentParam.type = 'bool';
    currentParam.value = userParam.text09border ? true : false;
    currentParam.readValue = function() {
     userParam.text09border = this.value;
    }
    convertedParam.data.push(currentParam);

    // luogo e data
    var currentParam = {};
    currentParam.name = 'localityAndDate';
    currentParam.title = 'Ort und Datum';
    currentParam.type = 'string';
    currentParam.value = userParam.localityAndDate ? userParam.localityAndDate : '';
    currentParam.readValue = function() {
        userParam.localityAndDate = this.value;
    }
    convertedParam.data.push(currentParam);

    // signature
    var currentParam = {};
    currentParam.name = 'signature';
    currentParam.title = 'Unterschrift';
    currentParam.type = 'string';
    currentParam.value = userParam.signature ? userParam.signature : '';
    currentParam.readValue = function() {
        userParam.signature = this.value;
    }
    convertedParam.data.push(currentParam);
    return convertedParam;
}

function initUserParam() {
    var userParam = {};

    userParam.costcenter = '';
    // userParam.account = '';
    userParam.transactions = true;
    userParam.address = '';
    userParam.text01 = '';
    userParam.text02 = '';
    userParam.text03 = '';
    userParam.text04 = '';
    userParam.text04bold = false;
    userParam.text04border = false;
    userParam.text05 = '';
    userParam.text05bold = false;
    userParam.text05border = false;
    userParam.text06 = '';
    userParam.text06bold = false;
    userParam.text06border = false;
    userParam.text07 = '';
    userParam.text07bold = false;
    userParam.text07border = false;
    userParam.text08 = '';
    userParam.text08bold = false;
    userParam.text08border = false;
    userParam.text09 = '';
    userParam.text09bold = false;
    userParam.text09border = false;
    userParam.localityAndDate = '';
    userParam.signature = '';

    //Takes the account from the cursor. If it is a cost center use it
    var accountsTable = Banana.document.table('Accounts');
    var selectedAccount = accountsTable.row(Banana.document.cursor.rowNr).value('Account');
    if (selectedAccount.substring(0,1) === "." || selectedAccount.substring(0,1) === "," || selectedAccount.substring(0,1) === ";") {
        selectedCostCenter = selectedAccount;
        userParam.costcenter = selectedCostCenter;
    }

    return userParam;
}

function verifyUserParam(userParam) {

    if (!userParam.costcenter) {
        userParam.costcenter = '';
    }

    // if (!userParam.account) {
    //     userParam.account = '';
    // }

    if (!userParam.transactions) {
        userParam.transactions = false;
    }

    if (!userParam.address) {
        userParam.address = '';
    }

    if (!userParam.text01) {
        userParam.text01 = '';
    }

    if (!userParam.text02) {
        userParam.text02 = '';
    }

    if (!userParam.text03) {
        userParam.text03 = '';
    }

    //Free Text 1
    if (!userParam.text04) {
        userParam.text04 = '';
    }
    if (!userParam.text04bold) {
        userParam.text04bold = false;
    }
    if (!userParam.text04border) {
        userParam.text04border = false;
    }

    //Free Text 2
    if (!userParam.text05) {
        userParam.text05 = '';
    }
    if (!userParam.text05bold) {
        userParam.text05bold = false;
    }
    if (!userParam.text05border) {
        userParam.text05border = false;
    }

    //Free Text 3
    if (!userParam.text06) {
        userParam.text06 = '';
    }
    if (!userParam.text06bold) {
        userParam.text06bold = false;
    }
    if (!userParam.text06border) {
        userParam.text06border = false;
    }

    //Free Text 4
    if (!userParam.text07) {
        userParam.text07 = '';
    }
    if (!userParam.text07bold) {
        userParam.text07bold = false;
    }
    if (!userParam.text07border) {
        userParam.text07border = false;
    }

    //Free Text 5
    if (!userParam.text08) {
        userParam.text08 = '';
    }
    if (!userParam.text08bold) {
        userParam.text08bold = false;
    }
    if (!userParam.text08border) {
        userParam.text08border = false;
    }

    //Free Text 6
    if (!userParam.text09) {
        userParam.text09 = '';
    }
    if (!userParam.text09bold) {
        userParam.text09bold = false;
    }
    if (!userParam.text09border) {
        userParam.text09border = false;
    }

    //Signature
    if (!userParam.localityAndDate) {
        userParam.localityAndDate = '';
    }

    if (!userParam.signature) {
        userParam.signature = '';
    }

    return userParam;
}

function parametersDialog(userParam) {

    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }
    
    if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
        var dialogTitle = param.xmldialogtitle;
        var convertedParam = convertParam(userParam);
        var pageAnchor = 'dlgSettings';
        if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
            return;
        }
        
        for (var i = 0; i < convertedParam.data.length; i++) {
            // Read values to userParam (through the readValue function)
            convertedParam.data[i].readValue();
        }
    }
    else {

        userParam.costcenter = Banana.Ui.getText('costcenter', 'Mitgliedkonto', selectedCostCenter);
        if (userParam.costcenter === undefined) {
            return;
        }

        // userParam.account = Banana.Ui.getText('account', 'Account', '');
        // if (userParam.account === undefined) {
        //     return;
        // }

        userParam.transactions = Banana.Ui.getInt('transactions', 'Buchungen anzeigen  (0=Nein; 1=Ja)', userParam.transactions);
        if (userParam.transactions === undefined) {
            return;
        }

        // userParam.address = Banana.Ui.getText('address', 'Aussteller', '');
        // if (userParam.address === undefined) {
        //     return;
        // }

        userParam.text01 = Banana.Ui.getText('text01', 'Aussteller Zeile 1', '');
        if (userParam.text01 === undefined) {
            return;
        }

        userParam.text02 = Banana.Ui.getText('text02', 'Aussteller Zeile 2', '');
        if (userParam.text02 === undefined) {
            return;
        }

        userParam.text03 = Banana.Ui.getText('text03', 'Aussteller Zeile 3', '');
        if (userParam.text03 === undefined) {
            return;
        }

        //Free text 1
        userParam.text04 = Banana.Ui.getText('text04', 'Text 1', '');
        if (userParam.text04 === undefined) {
            return;
        }
        userParam.text04bold = Banana.Ui.getInt('text04bold', 'Fett (0=Nein; 1=Ja)', userParam.text04bold);
        if (userParam.text04bold === undefined) {
            return;
        }
        userParam.text04border = Banana.Ui.getInt('text04border', 'Rahmen (0=Nein; 1=Ja)', userParam.text04border);
        if (userParam.text04border === undefined) {
            return;
        }

        //Free text 2
        userParam.text05 = Banana.Ui.getText('text05', 'Text 2', '');
        if (userParam.text05 === undefined) {
            return;
        }
        userParam.text05bold = Banana.Ui.getInt('text05bold', 'Fett (0=Nein; 1=Ja)', userParam.text05bold);
        if (userParam.text05bold === undefined) {
            return;
        }
        userParam.text05border = Banana.Ui.getInt('text05border', 'Rahmen (0=Nein; 1=Ja)', userParam.text05border);
        if (userParam.text05border === undefined) {
            return;
        }

        //Free text 3
        userParam.text06 = Banana.Ui.getText('text06', 'Text 3', '');
        if (userParam.text06 === undefined) {
            return;
        }
        userParam.text06bold = Banana.Ui.getInt('text06bold', 'Fett (0=Nein; 1=Ja)', userParam.text06bold);
        if (userParam.text06bold === undefined) {
            return;
        }
        userParam.text06border = Banana.Ui.getInt('text06border', 'Rahmen (0=Nein; 1=Ja)', userParam.text06border);
        if (userParam.text06border === undefined) {
            return;
        }

        //Free text 4
        userParam.text07 = Banana.Ui.getText('text07', 'Text 4', '');
        if (userParam.text07 === undefined) {
            return;
        }
        userParam.text07bold = Banana.Ui.getInt('text07bold', 'Fett (0=Nein; 1=Ja)', userParam.text07bold);
        if (userParam.text07bold === undefined) {
            return;
        }
        userParam.text07border = Banana.Ui.getInt('text07border', 'Rahmen (0=Nein; 1=Ja)', userParam.text07border);
        if (userParam.text07border === undefined) {
            return;
        }

        //Free text 5
        userParam.text08 = Banana.Ui.getText('text08', 'Text 5', '');
        if (userParam.text08 === undefined) {
            return;
        }
        userParam.text08bold = Banana.Ui.getInt('text08bold', 'Fett (0=Nein; 1=Ja)', userParam.text08bold);
        if (userParam.text08bold === undefined) {
            return;
        }
        userParam.text08border = Banana.Ui.getInt('text08border', 'Rahmen (0=Nein; 1=Ja)', userParam.text08border);
        if (userParam.text08border === undefined) {
            return;
        }

        //Free text 6
        userParam.text09 = Banana.Ui.getText('text09', 'Text 6', '');
        if (userParam.text09 === undefined) {
            return;
        }
        userParam.text09bold = Banana.Ui.getInt('text09bold', 'Fett (0=Nein; 1=Ja)', userParam.text09bold);
        if (userParam.text09bold === undefined) {
            return;
        }
        userParam.text09border = Banana.Ui.getInt('text09border', 'Rahmen (0=Nein; 1=Ja)', userParam.text09border);
        if (userParam.text09border === undefined) {
            return;
        }

        userParam.localityAndDate = Banana.Ui.getText('localityAndDate', 'Ort und Datum', '');
        if (userParam.localityAndDate === undefined) {
            return;
        }

        userParam.signature = Banana.Ui.getText('signature', 'Unterschrift', '');
        if (userParam.signature === undefined) {
            return;
        }        
    }

    var paramToString = JSON.stringify(userParam);
    var value = Banana.document.setScriptSettings(paramToString);
    
    return userParam;
}


/**************************************************************************************
*
* SCRIPT SETTINGS
*
**************************************************************************************/
function getScriptSettings() {
   var data = Banana.document.getScriptSettings();
   //Check if there are previously saved settings and read them
   if (data.length > 0) {
       try {
           var readSettings = JSON.parse(data);
           //We check if "readSettings" is not null, then we fill the formeters with the values just read
           if (readSettings) {
               return readSettings;
           }
       } catch (e) {
       }
   }

   return {
      "selectionStartDate": "",
      "selectionEndDate": "",
      "selectionChecked": "false"
   }
}

/* The main purpose of this function is to allow the user to enter the accounting period desired and saving it for the next time the script is run
   Every time the user runs of the script he has the possibility to change the date of the accounting period */
function settingsDialog() {
    
    //The formeters of the period that we need
    var scriptform = getScriptSettings();

    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = Banana.document.startPeriod();
    var docEndDate = Banana.document.endPeriod();   
    
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod(param.reportName, docStartDate, docEndDate, 
        scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);
        
    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedDates) {
        scriptform["selectionStartDate"] = selectedDates.startDate;
        scriptform["selectionEndDate"] = selectedDates.endDate;
        scriptform["selectionChecked"] = selectedDates.hasSelection;

        //Save script settings
        var formToString = JSON.stringify(scriptform);
        var value = Banana.document.setScriptSettings(formToString);       
    } else {
        //User clicked cancel
        return null;
    }
    return scriptform;
}


/**************************************************************************************
*
* FOOTER
*
**************************************************************************************/
/* This function adds a Footer to the report */
function addFooter(report) {
    var date = new Date();
    var d = Banana.Converter.toLocaleDateFormat(date);
    report.getFooter().addClass("footer");
    var textfield = report.getFooter();

    //var text1 = "(Ort, Datum und Unterschrift des Zuwendungsempfängers)";
    var text2 = "Hinweis:";
    var text3 = "Wer vorsätzlich oder grob fahrlässig eine unrichtige Zuwendungsbestätigung erstellt oder veranlasst, dass Zuwendungen nicht zu den in der Zuwendungsbestätigung angegebenen steuerbegünstigten Zwecken verwendet werden, haftet für die entgangene Steuer (§ 10b Abs. 4 EStG, § 9 Abs. 3 KStG, § 9 Nr. 5 GewStG).";
    var text4 = "Diese Bestätigung wird nicht als Nachweis für die steuerliche Berücksichtigung der Zuwendung anerkannt, wenn das Datum des Freistellungs-bescheides länger als 5 Jahre bzw.";
    var text5 = "das Datum der Feststellung der Einhaltung der satzungsmäßigen Voraussetzungen nach § 60a Abs. 1 AO länger als 3 Jahre seit Ausstellung des Bescheides zurückliegt (§ 63 Abs. 5 AO).";

    //textfield.addParagraph("", "horizontalLine");
    //textfield.addParagraph(text1, "");
    textfield.addParagraph(" ", "");
    textfield.addParagraph(text2, "bold");
    textfield.addParagraph(text3, "");
    textfield.addParagraph(" ", "");
    textfield.addParagraph(text4 + " " + text5, "");
}


/**************************************************************************************
*
* STYLE
*
**************************************************************************************/
/* Function that creates all the styles used to print the report */
function createStyleSheet() {
    var stylesheet = Banana.Report.newStyleSheet();
    
    stylesheet.addStyle("@page", "margin:20mm 10mm 10mm 20mm;") 
    stylesheet.addStyle("body", "font-family:Helvetica; font-size:8pt");
    stylesheet.addStyle(".footer", "font-size:8pt");
    stylesheet.addStyle(".bold", "font-weight:bold;");
    stylesheet.addStyle(".borderLeft", "border-left:thin solid black");
    stylesheet.addStyle(".borderTop", "border-top:thin solid black");
    stylesheet.addStyle(".borderRight", "border-right:thin solid black");
    stylesheet.addStyle(".borderBottom", "border-bottom:thin solid black");
    stylesheet.addStyle(".horizontalLine", "border-top:thin solid black");
    stylesheet.addStyle(".right", "text-align:right;");
    stylesheet.addStyle(".headerStyle", "background-color:#E0EFF6; text-align:center; font-weight:bold;");
    stylesheet.addStyle(".padding", "padding-bottom:2px; padding-top:3px; padding-left:2px; padding-right:2px;");

    /* table01 */
    var tableStyle = stylesheet.addStyle(".table01");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle("table.table01 td", "border:thin solid black;");

    /* table02 */
    var tableStyle = stylesheet.addStyle(".table02");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle(".t2col1", "width:10%");
    stylesheet.addStyle(".t2col2", "width:10%");
    stylesheet.addStyle(".t2col3", "width:60%");
    stylesheet.addStyle(".t2col4", "width:20%");
    //stylesheet.addStyle("table.table02 td", "border-right:thin solid black;");
    // stylesheet.addStyle("table.table02 td", "border:thin solid black;");

    /* table03 */
    var tableStyle = stylesheet.addStyle(".table03");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle("table.table03 td", "border:thin solid black;");

    /* table04 */
    var tableStyle = stylesheet.addStyle(".table04");
    tableStyle.setAttribute("width", "80%");

    //Style for the table titles
    style = stylesheet.addStyle(".styleTableHeader");
    style.setAttribute("font-weight", "bold");
    style.setAttribute("padding-bottom", "5px");
    style.setAttribute("background-color", "#ffd100");
    style.setAttribute("color", "#1b365d");

    //Style for account numbers
    style = stylesheet.addStyle(".styleAccount");
    style.setAttribute("padding-bottom", "5px");
    style.setAttribute("text-align", "center");

    //Style for amounts
    style = stylesheet.addStyle(".styleAmount");
    style.setAttribute("padding-bottom", "5px");
    style.setAttribute("text-align", "right");

    //Style for balances
    style = stylesheet.addStyle(".styleBalance");
    style.setAttribute("color", "red");

    //Style for the total of the table
    style = stylesheet.addStyle(".styleTotal");
    style.setAttribute("font-weight", "bold");
    style.setAttribute("padding-bottom", "5px");
    style.setAttribute("background-color", "#b7c3e0");
    style.setAttribute("border-bottom", "1px double black");

    return stylesheet;
}
