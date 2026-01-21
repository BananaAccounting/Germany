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
//
// @id = ch.banana.de.app.spendenbescheinigung.js
// @api = 1.0
// @pubdate = 2026-01-21
// @publisher = Banana.ch SA
// @description = Spendenbescheinigung für Vereine in Deutschland
// @description.de = Spendenbescheinigung für Vereine in Deutschland
// @description.en = Statement of donation for Associations in Germany
// @doctype = 100.*;110.*;130.*
// @task = app.command
// @timeout = -1

/*
*   This BananaApp prints a donation receipt for all the selected donators and period.
*   Donators can be:
*   - a single donator (with or without ";") => (i.e. "10001" or  ";10011")
*   - more donators (with or without ";") separated by "," => (i.e. "10001, ;10011,;10012")
*   - all the donators (emty field) => (i.e. "")
*/

// Default texts
var t1 = '**Sammelbestätigung über Geldzuwendungen/Mitgliedsbeiträge** \nim Sinne des § 10b des Einkommensteuergesetzes an eine der in § 5 Abs. 1 Nr. 9 des Körperschaftsteuergesetzes bezeichneten Körperschaften, Personenvereinigungen oder Vermögensmassen';
var t2 = 'Wir sind wegen Förderung der Entwicklungszusammenarbeit nach dem Freistellungsbescheid bzw. nach der Anlage zum Körperschaft- steuerbescheid des Finanzamtes Kempten, StNr. 127/111/20031, vom 30.12.2016 für den letzten Veranlagungszeitraum 2013 bis 2015 nach § 5 Abs. 1 Nr. 9 des Körperschaftsteuergesetzes von der Körperschaftsteuer und nach § 3 Nr. 6 des Gewerbesteuergesetzes von der Gewerbesteuer befreit.';
var t3 = 'Die Einhaltung der satzungsmäßigen Voraussetzungen nach den §§ 51, 59, 60 und 61 AO wurde vom Finanzamt ......................., StNr. ................................., mit Bescheid vom ................... nach § 60a AO gesondert festgestellt. Wir fördern nach unserer Satzung (Angabe des begünstigten Zwecks / der begünstigten Zwecke) ................. .';
var t4 = 'Es wird bestätigt, dass die Zuwendung nur zur Förderung der Entwicklungszusammenarbeit verwendet wird. Nur für steuerbegünstigte Einrichtungen, bei denen die Mitgliedsbeiträge steuerlich nicht abziehbar sind: [] Es wird bestätigt, dass es sich nicht um einen Mitgliedsbeitrag handelt, dessen Abzug nach § 10b Abs. 1 des Einkommensteuergesetzes ausgeschlossen ist.';
var t5 = 'Es wird bestätigt, dass über die in der Gesamtsumme enthaltenen Zuwendungen keine weiteren Bestätigungen, weder formelle Zuwendungsbestätigungen noch Beitragsquittungen oder Ähnliches ausgestellt wurden und werden. Ob es sich um den Verzicht auf Erstattung von Aufwendungen handelt, ist der Anlage zur Sammelbestätigung zu entnehmen.';

function exec(inData, options) {
    
    if (!Banana.document)
        return "@Cancel";

    var userParam = initUserParam();

    // Retrieve saved param
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }

    // If needed show the settings dialog to the user
    if (!options || !options.useLastSettings) {
        userParam = settingsDialog(); // From properties
    }

    if (!userParam) {
        return "@Cancel";
    }

    // Add a transactions property to userParam object, and fill it with transactions data
    userParam.transactions = [];
    fillTransactionStructure(Banana.document, userParam);

    // Retrieves all the donors to print
    var accounts = getListOfAccountsToPrint(userParam);

    // Creates the report
    if (accounts.length > 0) {
        var report = createReport(Banana.document, userParam, accounts);            
        var stylesheet = createStyleSheet(userParam);
        Banana.Report.preview(report, stylesheet);
    } else {
        return "@Cancel";
    }
}

/* The report is created using the selected period and the data of the dialog */
function createReport(banDoc, userParam, accounts) {

    /* Create the report */
    var report = Banana.Report.newReport("Spendenbescheinigung");

    // Get the sender address one time at the beginning
    var senderAddress = {};
    senderAddress.company = banDoc.info("AccountingDataBase","Company");
    senderAddress.name = banDoc.info("AccountingDataBase","Name");
    senderAddress.familyName = banDoc.info("AccountingDataBase","FamilyName");
    senderAddress.address1 = banDoc.info("AccountingDataBase","Address1");
    senderAddress.buildingnumber = banDoc.info("AccountingDataBase","BuildingNumber");
    senderAddress.zip = banDoc.info("AccountingDataBase","Zip");
    senderAddress.city = banDoc.info("AccountingDataBase","City");
    senderAddress.country = banDoc.info("AccountingDataBase","Country");

    // Object to cache the amounts in words
    // Cached amounts can be reused to avoid recalculations when already present
    var amountInWordsCache = {};

    // Create the report for each account
    var length = accounts.length;
    for (var k = 0; k < length; k++) {

        // User can define a javascript function to change the print of the donator account
        // example "(function(text) {return text.split('_')[1];})"
        // This split the "12_MEYER" and returns "MEYER"
        var modifiedAccount = accounts[k].substring(1);
        if (userParam.accountMethod && userParam.accountMethod.length > "0") {
            var accMethod = eval(userParam.accountMethod);
            if (typeof(accMethod) === 'function') {
               modifiedAccount = accMethod(modifiedAccount);
            }
        }
        
        // Get the address of the account donor
        var address = getAddress(banDoc, accounts[k]);
        
        // Calculate the total amount of donations for the account donor
        var total = calculateTotalAmount(banDoc, userParam, accounts[k]);
        
        // Convert the total to word only one time, then cache it.
        // Next time there is the same amount, it's not recalculated, we use the cached word.
        function numToWordsCached(total) {
            if (!amountInWordsCache[total]) {
                amountInWordsCache[total] = numToWords(total);
            }
            return amountInWordsCache[total];
        }
        // Converts the amount in German words (cents excluded)
        var amountInWords = numToWordsCached(total);

        // Creates the report adding all the sections
        createReportAddressSender(banDoc, report, senderAddress);
        createReportAddressMember(report, userParam, accounts[k], modifiedAccount, address);
        createReportDonorReceiver(banDoc, report, userParam, accounts[k], address);
        createReportTableAddressMember(report, userParam, accounts[k], modifiedAccount, address);
        createReportAccountingDataDonation(report, userParam, accounts[k], total, amountInWords);
        createReportTexts(banDoc, report, userParam, accounts[k], address);
        createReportSignature(report, userParam);
        createReportTextFooter(report);
        createReportTransactionsDetails(banDoc, report, userParam, accounts[k], modifiedAccount, address, total, amountInWords);

        //Page break to all pages except the last
        if (k < length-1) {
            report.addPageBreak();
        }
    }

    if (userParam.printPageNumber) {
        addFooter(report);
    }

    return report;
}

function createReportAddressSender(banDoc, report, senderAddress) {

    var p = report.addParagraph("","addressSenderTop");
    if (senderAddress.name && senderAddress.familyName && senderAddress.company) {
        p.addText(senderAddress.company + ", " + senderAddress.name + " " + senderAddress.familyName, "");
    } else if (senderAddress.name && senderAddress.familyName && !senderAddress.company) {
        p.addText(senderAddress.name + " " + senderAddress.familyName, "");
    } else if (!senderAddress.name && !senderAddress.familyName && senderAddress.company) {
        p.addText(senderAddress.company, "");
    }

    if (senderAddress.address1 && senderAddress.zip && senderAddress.city) {
        if (senderAddress.buildingnumber) {
            p.addText("\n"+senderAddress.address1 + " " + senderAddress.buildingnumber + ", " + senderAddress.zip + " " + senderAddress.city + "\n", "");
        } else {
            p.addText("\n"+senderAddress.address1 + ", " + senderAddress.zip + " " + senderAddress.city + "\n", "");
        }
    }
    else if (!senderAddress.address1 && senderAddress.zip && senderAddress.city) {
        p.addText("\n"+senderAddress.zip + " " + senderAddress.city + "\n", "");
    }
    else if (!senderAddress.address1 && !senderAddress.zip && senderAddress.city) {
        p.addText("\n"+senderAddress.city + "\n", "");
    }
    p.addText(" ","");
}

function createReportAddressMember(report, userParam, account, modifiedAccount, address) {

    var p = report.addParagraph("","address");
    if (address.nameprefix) {
        p.addText(address.nameprefix+"\n", "");
    }

    if (address.firstname && address.familyname && userParam.printAccount) {
        p.addText(address.firstname + " " + address.familyname + "                                                             Mitgliedskonto: " + modifiedAccount, "");
    }
    else if (address.firstname && address.familyname && !userParam.printAccount) {
        p.addText(address.firstname + " " + address.familyname, "");
    }
    else if (!address.firstname && address.familyname && userParam.printAccount) {
        p.addText(address.familyname + "                                                             Mitgliedskonto: " + modifiedAccount, "");
    }
    else if (!address.firstname && address.familyname && !userParam.printAccount) {
        p.addText(address.familyname, "");
    }

    if (address.street) {
        if (address.buildingnumber) {
            p.addText("\n"+address.street + " " + address.buildingnumber, "");
        } else {
            p.addText("\n"+address.street, "");
        }
    }
    if (address.postalcode && address.locality) {
        p.addText("\n"+address.postalcode + " " + address.locality, "");
    }
}

function createReportDonorReceiver(banDoc, report, userParam, account, address) {

    var table = report.addTable("table01");
    
    tableRow = table.addRow();
    var paragraph01 = tableRow.addCell("","");
    paragraph01.addParagraph("Aussteller (Bezeichnung und Anschrift der steuerbegünstigten Einrichtung)", "");
    paragraph01.addParagraph(userParam.addressText1, "");
    paragraph01.addParagraph(userParam.addressText2, "");
    paragraph01.addParagraph(userParam.addressText3, "");

    //Add free text1
    if (userParam.text1) {
        report.addParagraph(" ", "");
        text = convertFields(banDoc, userParam, account, address, userParam.text1);
        addNewLine(report, text);
    }
}

function createReportTableAddressMember(report, userParam, account, modifiedAccount, address) {

    var table = report.addTable("table01a");
    var tableRow = table.addRow();
    var paragraph = tableRow.addCell("","");
    var strName = "";
    var strAddress = "";

    paragraph.addParagraph("Name und Anschrift des Zuwendenden:", "");
    
    if (address.firstname && address.familyname) {
        strName = address.firstname + " " + address.familyname;
    } else {
        strName = address.familyname;
    }
    paragraph.addParagraph(strName, "bold");

    if (address.street) {
        if (address.buildingnumber) {
            strAddress += address.street + " " + address.buildingnumber; 
        } else {
            strAddress += address.street;
        }
        strAddress += ", ";
    }
    if (address.postalcode) {
        strAddress += address.postalcode;
    }
    if (address.locality) {
        if (address.postalcode) {
            strAddress += " ";
        }
        strAddress += address.locality;
    }
    paragraph.addParagraph(strAddress, "bold");
    
    if (userParam.printAccount) {
        paragraph.addParagraph("Mitgliedskonto: " + modifiedAccount, "bold");
    }
}

function createReportAccountingDataDonation(report, userParam, account, total, amountInWords) {

    var table = report.addTable("table03");
    var tableRow = table.addRow();
    var cell1 = tableRow.addCell("","");
    cell1.addParagraph("Betrag der Zuwendung - in Ziffern -", "");
    cell1.addParagraph(Banana.Converter.toLocaleNumberFormat(total), "bold");

    /* Retrieves the cents from the amount */
    var digits = [];
    var number = Banana.Converter.toLocaleNumberFormat(total);
    var numberString = number.toString();
    var c1,c2 = '';
    for (var i = 0; i < numberString.length; i++) {
        if (!isNaN(numberString[i])) {
            digits.push(numberString[i]);
        }
    }
    c1 = digits[digits.length-2]; //es. x.3x
    c2 = digits[digits.length-1]; //es. x.x5 => x.35

    var cell2 = tableRow.addCell("","");
    cell2.addParagraph("- in Buchstaben -", "");
    cell2.addParagraph(amountInWords + " " + c1 + c2 + "/100", "bold");

    /* Date of the donation */
    var data = userParam.transactions; //array with all the transactions
    var accountOnly = data.filter(entry => entry.cc3 === account.substring(1)); //array with transactions filtered for the given account

    var cell3 = tableRow.addCell("","");
    cell3.addParagraph("Tag der Zuwendung: ", "");
    if ( !userParam.printSingle || (userParam.printSingle && accountOnly.length > 1) ) {
        // for multiple transactions of donations we print the whole period
        cell3.addParagraph(Banana.Converter.toLocaleDateFormat(userParam.selectionStartDate) + " - " + Banana.Converter.toLocaleDateFormat(userParam.selectionEndDate), "bold");
    }
    else {
        // for a single transaction when the userParam.printSingle is true, we print the transaction date
        var date = accountOnly[0].date; //there is only one element in the array
        cell3.addParagraph(Banana.Converter.toLocaleDateFormat(date), "bold");
    }
}

function createReportTexts(banDoc, report, userParam, account, address) {

    var text = "";
    if (userParam.text2) {
        report.addParagraph(" ", "textParagraphBottom");
        text = convertFields(banDoc, userParam, account, address, userParam.text2);
        addNewLine(report, text);
    }

    if (userParam.text3) {
        report.addParagraph(" ", "textParagraphBottom");
        text = convertFields(banDoc, userParam, account, address, userParam.text3);
        addNewLine(report, text);
    }

    if (userParam.text4) {
        report.addParagraph(" ", "textParagraphBottom");
        text = convertFields(banDoc, userParam, account, address, userParam.text4);
        addNewLine(report, text);
    }

    if (userParam.text5) {
        report.addParagraph(" ", "textParagraphBottom");
        text = convertFields(banDoc, userParam, account, address, userParam.text5);
        addNewLine(report, text);
    }
}

function createReportSignature(report, userParam) {

    var table = report.addTable("table04");
    tableRow = table.addRow();
    tableRow.addCell(userParam.localityAndDate, "bold", 1);
    tableRow.addCell(userParam.signature, "bold", 1);
    if (userParam.printUnterschrift) {
        tableRow.addCell("","",1).addImage(userParam.signatureImage, "logoStyle");    //documents:unterschrift      
    } else {
        tableRow.addCell("                     ", "", 1);
    }
    tableRow = table.addRow();
    tableRow.addCell("", "borderBottom", 3);
    tableRow = table.addRow();
    tableRow.addCell("(Ort, Datum und Unterschrift des Zuwendungsempfängers)", "", 3);
}

function createReportTextFooter(report) {
    var text1 = "Hinweis:";
    var text2 = "Wer vorsätzlich oder grob fahrlässig eine unrichtige Zuwendungsbestätigung erstellt oder wer veranlasst, dass Zuwendungen nicht zu den in der Zuwendungsbestätigung angegebenen steuerbegünstigten Zwecken verwendet werden, haftet für die entgangene Steuer (§ 10b Abs. 4 EStG, § 9 Abs. 3 KStG, § 9 Nr. 5 GewStG).";
    var text3 = "Diese Bestätigung wird nicht als Nachweis für die steuerliche Berücksichtigung der Zuwendung anerkannt, wenn das Datum des Freistellungsbescheides länger als 5 Jahre bzw. das Datum der Feststellung der Einhaltung der satzungsmäßigen Voraussetzungen nach § 60a Abs. 1 AO länger als 3 Jahre seit Ausstellung des Bescheides zurückliegt (§ 63 Abs. 5 AO).";
    report.addParagraph(text1, "bold textParagraphBottom");
    report.addParagraph(text2, "textParagraphBottom");
    report.addParagraph(text3, "textParagraphBottom");
}

function createReportTransactionsDetails(banDoc, report, userParam, account, modifiedAccount, address, total, amountInWords) {

    var data = userParam.transactions; //array with all the transactions
    var accountOnly = data.filter(entry => entry.cc3 === account.substring(1)); //array with transactions filtered for the given account

    if ( !userParam.printSingle || (userParam.printSingle && accountOnly.length > 1) ) {
        
        report.addPageBreak();

        var text1 = "Anlage zur Sammelbestätigung";
        var text2 = "Gesamtsumme";
        var strAddress = "";
        var strName = "";
        var rowCnt = 0;
        account = account.substring(1); //remove first character ";"

        if (address.firstname && address.familyname) {
            strName = address.firstname + " " + address.familyname;
        } else {
            strName = address.familyname;
        }

        strAddress += modifiedAccount + ": " + strName;

        if (address.street || address.postalcode || address.locality) {
            strAddress += ", ";
        }
        if (address.street) {
            if (address.buildingnumber) {
                strAddress += address.street + " " + address.buildingnumber;
            } else {
                strAddress += address.street;
            }
        }
        if (address.postalcode || address.locality) {
            if (address.street) {
                strAddress += ", ";
            }
        }
        if (address.postalcode) {
            strAddress += address.postalcode;
        }
        if (address.locality) {
            if (address.postalcode) {
                strAddress += " ";
            }
            strAddress += address.locality;
        }

        report.addParagraph(text1, "bold");
        report.addParagraph(strAddress, "");
        report.addParagraph(text2 + ": " + Banana.Converter.toLocaleNumberFormat(total) + " " + banDoc.info("AccountingDataBase", "BasicCurrency"), "bold textParagraphTop");

        //Print all the transactions details
        var table = report.addTable("table02");
        var t2col1 = table.addColumn("t2col1");
        var t2col2 = table.addColumn("t2col2");
        var t2col3 = table.addColumn("t2col3");
        var t2col4 = table.addColumn("t2col4");
        var t2col5 = table.addColumn("t2col5");
        var t2col6 = table.addColumn("t2col6");

        tableRow = table.addRow();
        tableRow.addCell("LfdNr", "bold headerStyle borderRight borderTop borderBottom", 1);
        tableRow.addCell("Konto", "bold headerStyle borderRight borderTop borderBottom", 1);
        tableRow.addCell("Datum", "bold headerStyle borderRight borderTop borderBottom", 1);
        tableRow.addCell("Bezeichnung", "bold headerStyle borderRight borderTop borderBottom", 1);
        tableRow.addCell("Betrag " + banDoc.info("AccountingDataBase", "BasicCurrency"), "bold headerStyle borderRight borderTop borderBottom", 1);
        tableRow.addCell("Verzicht", "bold headerStyle borderRight borderTop borderBottom", 1);

        var transactionsLength = userParam.transactions.length;
        for (var i = 0; i < transactionsLength; i++) {

            var cc3 = userParam.transactions[i].cc3;
            var date = userParam.transactions[i].date;
            var desc = userParam.transactions[i].description;
            var amount = userParam.transactions[i].amount;
            
            if (account && account === cc3 && total) {
                rowCnt++;
                tableRow = table.addRow();
                tableRow.addCell(rowCnt, "borderRight", 1); //sequencial numbers
                tableRow.addCell(desc, "borderRight", 1);
                tableRow.addCell(Banana.Converter.toLocaleDateFormat(date), "borderRight", 1);
                tableRow.addCell(strName, "borderRight", 1);
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(amount), "right borderRight", 1);
                tableRow.addCell(address.verzicht, "center borderRight", 1);
            }
        }

        // Total row of the table
        tableRow = table.addRow();
        tableRow.addCell("", "borderTop borderBottom", 3);
        tableRow.addCell("Summe", "bold right borderTop borderBottom", 1);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total), "bold right borderTop borderBottom", 1);
        tableRow.addCell("", "bold right borderTop borderBottom", 1);


        // Retrieves the cents from the amount
        var digits = [];
        var number = Banana.Converter.toLocaleNumberFormat(total);
        var numberString = number.toString();
        var c1,c2 = '';
        for (var i = 0; i < numberString.length; i++) {
            if (!isNaN(numberString[i])) {
                digits.push(numberString[i]);
            }
        }
        c1 = digits[digits.length-2]; //es. x.3x
        c2 = digits[digits.length-1]; //es. x.x5 => x.35

        report.addParagraph("Summe in Worten (" + amountInWords + " " + c1 + c2 + "/100)", "bold textParagraphTop");
    
    }
}

/* This function fill the data structure with the transactions data taken with getTransactionsData() */
function fillTransactionStructure(banDoc, userParam) {

    // Get the list of all the donors (CC3)
    var membershipList = getCC3Accounts(banDoc);
        
    if (userParam.costcenter) {
        var list = userParam.costcenter.split(",");
        for (var i = 0; i < list.length; i++) {
            list[i] = list[i].trim();
            
            // If user insert the Cc3 account without ";" we add it
            if (list[i].substring(0,1) !== ";") {
                list[i] = ";"+list[i];
            }

            // The inserted Cc3 exists
            if (membershipList.indexOf(list[i]) > -1) {
                var totalOfDonations = calculateTotalAmount(banDoc, userParam, list[i]);
                if (Banana.SDecimal.compare(totalOfDonations, userParam.minimumAmount) > -1) { //totalOfDonation >= mimimunAmount
                    getTransactionsData(banDoc, userParam, list[i]);
                }
            }
            else { // The inserted Cc3 does not exists
                banDoc.addMessage("Ungültiges Mitgliedkonto Konto: <" + list[i] + ">");              
            }
        }
    }
    else if (!userParam.costcenter || userParam.costcenter === "" || userParam.costcenter === undefined) {
        for (var i = 0; i < membershipList.length; i++) {
            var totalOfDonations = calculateTotalAmount(banDoc, userParam, membershipList[i]);
            if (Banana.SDecimal.compare(totalOfDonations, userParam.minimumAmount) > -1) { //totalOfDonation >= mimimunAmount
                getTransactionsData(banDoc, userParam, membershipList[i]);
            }
        }
    }    
}

/* This function renturns a list of all the cc3 accounts contained in data structure */
function getListOfAccountsToPrint(userParam) {
    
    var accounts = [];

    // Accouns with transactions
    var transactionsLength = userParam.transactions.length;
    for (var i = 0; i < transactionsLength; i++) {
        var account = userParam.transactions[i].cc3;
        accounts.push(";"+account);
    }

    //Remove duplicates
    for (var i = 0; i < accounts.length; i++) {
        for (var x = i+1; x < accounts.length; x++) {
            if (accounts[x] === accounts[i]) {
                accounts.splice(x,1);
                --x;
            }
        }
    }

    return accounts;
}

/* This function returns the total amount for a specific account and period */
function calculateTotalAmount(banDoc, userParam, account) {
    var startDate = userParam.selectionStartDate;
    var endDate = userParam.selectionEndDate;
    var totalAmount = banDoc.currentBalance(account,startDate,endDate).debit;
    return totalAmount;
}

/* This function returns an array of objects with all the donation transactions.
   Transactions are filtered by period and minimum donation amount entered by the user.
   Only the filtered transactions are taken. */
function getTransactionsData(banDoc, userParam, account) {

    var transactions = userParam.transactions;
    var startDate = userParam.selectionStartDate;
    var endDate = userParam.selectionEndDate;
    var transTab = banDoc.currentCard(account, startDate, endDate);
    //Banana.console.log("----------" + account + "----------");
    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        var jdate = tRow.value('JDate');
        var jaccount = tRow.value('JAccount');
        var jdescription = tRow.value("JDescription");
        var jdebit = tRow.value('JDebitAmount');
        var jcredit = tRow.value('JCreditAmount');
        var jbalance = tRow.value('JBalance');
        //var jcc3 = tRow.value('JCC3'); //only used in double-entry accouting

        if (jaccount && jaccount === account && jdebit && !jcredit && jdate >= startDate && jdate <= endDate) { //&& Banana.SDecimal.compare(jdebit, userParam.minimumAmount) > -1) {
            //Banana.console.log('YES >>> date: '+jdate + ', account:' + jaccount + ', description:' + jdescription + ', debit:' + jdebit + ', credit:' + jcredit + ', balance: ' + jbalance);
            transactions.push({
                "cc3": account.substring(1), //remove first character ;
                "date": jdate,
                "description": jdescription,
                "amount": jdebit
            });
        }
        else if (!jaccount && !jdebit && !jcredit && !jbalance && (!userParam.minimumAmount || userParam.minimumAmount === '0.00' || userParam.minimumAmount === undefined) ) {
            //Banana.console.log('NO >>> date: '+jdate + ', account:' + jaccount + ', description:' + jdescription + ', debit:' + jdebit + ', credit:' + jcredit + ', balance: ' + jbalance);
            transactions.push({
                "cc3": account.substring(1), //remove first character ;
                "date": '',
                "description": '',
                "amount": ''
            });
        }
    }
}

/* Function that converts a month to a readable string */
function getMonthText(date) {
    var month = "";
    switch (date.getMonth()) {
        case 0:
            month = "Januar";
            break;
        case 1:
            month = "Februar";
            break;
        case 2:
            month = "März";
            break;
        case 3:
            month = "April";
            break;
        case 4:
            month = "Mai";
            break;
        case 5:
            month = "Juni";
            break;
        case 6:
            month = "Juli";
            break;
        case 7:
            month = "August";
            break;
        case 8:
            month = "September";
            break;
        case 9:
            month = "Oktober";
            break;
        case 10:
            month = "November";
            break;
        case 11:
            month = "Dezember";
    }
    return month;
}

/* Function that converts quarters and semesters to a readable string */
function getPeriodText(period) {
    var periodText = "";
    switch (period) {
        case "Q1":
            periodText = "1. Quartal";
            break;
        case "Q2":
            periodText = "2. Quartal";
            break;
        case "Q3":
            periodText = "3. Quartal";
            break;
        case "Q4":
            periodText = "4. Quartal";
            break;
        case "S1":
            periodText = "1. Semester";
            break;
        case "S2":
            periodText = "2. Semester";
    }
    return periodText;
}

/* Function that converts a period defined by startDate and endDate to a readable string */
function getPeriod(banDoc, startDate, endDate) {

    var res = "";
    var year = Banana.Converter.toDate(startDate).getFullYear();
    var startDateDay = Banana.Converter.toDate(startDate).getDate(); //1-31
    var endDateDay = Banana.Converter.toDate(endDate).getDate(); //1-31
    var startDateMonth = Banana.Converter.toDate(startDate).getMonth(); //0=january ... 11=december
    var endDateMonth = Banana.Converter.toDate(endDate).getMonth(); //0=january ... 11=december

    /*
        CASE 1: all the year yyyy-01-01 - yyyy-12-31(i.e. "2018")
    */
    if (startDateMonth == 0 && startDateDay == 1 && endDateMonth == 11 && endDateDay == 31) {
        res = year;
    }

    /*
        CASE 2: single month (i.e. "January 2018")
    */
    else if (startDateMonth == endDateMonth) {
        res = getMonthText(Banana.Converter.toDate(startDate));
        res += " " + year;
    }

    /* 
        CASE 3: period in the year (i.e. "First quarter 2018", "Second semester 2018")
    */
    else if (startDateMonth != endDateMonth) {

        //1. Quarter (1.1 - 31.3)
        if (startDateMonth == 0 && endDateMonth == 2) {
            res = getPeriodText("Q1");
            res += " " + year;
        }   

        //2. Quarter (1.4 - 30.6)
        else if (startDateMonth == 3 && endDateMonth == 5) {
            res = getPeriodText("Q2");
            res += " " + year;          
        }

        //3. Quarter (1.7 - 30.9)
        else if (startDateMonth == 6 && endDateMonth == 8) {
            res = getPeriodText("Q3");
            res += " " + year;
        }

        //4. Quarter (1.10- 31.12)
        else if (startDateMonth == 9 && endDateMonth == 11) {
            res = getPeriodText("Q4");
            res += " " + year;
        }

        //1. Semester (1.1 - 30.6)
        else if (startDateMonth == 0 && endDateMonth == 5) {
            res = getPeriodText("S1");
            res += " " + year;
        }
        //2. Semester (1.7 - 31.12)
        else if (startDateMonth == 6 && endDateMonth == 11) {
            res = getPeriodText("S2");
            res += " " + year;
        }

        /* 
            CASE 4: other periods
        */
        else {
            res = Banana.Converter.toLocaleDateFormat(startDate) + " - " + Banana.Converter.toLocaleDateFormat(endDate);
        }
    }

    return res;
}

/* Function that replaces the tags with the respective data */
function convertFields(banDoc, userParam, account, address, text) {

    var startDate = userParam.selectionStartDate;
    var endDate = userParam.selectionEndDate;

    if (text.indexOf("<Period>") > -1) {
        var period = getPeriod(banDoc, startDate, endDate);
        text = text.replace(/<Period>/g,period);
    }
    if (text.indexOf("<Account>") > -1) {
        text = text.replace(/<Account>/g,account);
    }
    if (text.indexOf("<FirstName>") > -1) {
        var firstname = address.firstname;
        text = text.replace(/<FirstName>/g,firstname);
    }
    if (text.indexOf("<FamilyName>") > -1) {
        var familyname = address.familyname;
        text = text.replace(/<FamilyName>/g,familyname);
    }    
    if (text.indexOf("<Address>") > -1) {
        if (address.buildingnumber) {
            var address = address.street + " " + address.buildingnumber + ", " + address.postalcode + " " + address.locality;
        } else {
            var address = address.street + ", " + address.postalcode + " " + address.locality;
        }
        text = text.replace(/<Address>/g,address);
    }
    if (text.indexOf("<StartDate>") > -1) {
        var startdate = Banana.Converter.toLocaleDateFormat(startDate);
        text = text.replace(/<StartDate>/g,startdate);
    }
    if (text.indexOf("<EndDate>") > -1) {
        var enddate = Banana.Converter.toLocaleDateFormat(endDate);
        text = text.replace(/<EndDate>/g,enddate);
    }
    if (text.indexOf("<Currency>") > -1) {
        var currency = banDoc.info("AccountingDataBase", "BasicCurrency");
        text = text.replace(/<Currency>/g,currency);
    }
    if (text.indexOf("<Amount>") > -1) {
        var totalOfDonations = calculateTotalAmount(banDoc, userParam, account);
        var amount = Banana.Converter.toLocaleNumberFormat(totalOfDonations);
        text = text.replace(/<Amount>/g,amount);
    }
    return text;
}

/* Function that add a new line to the paragraph */
function addNewLine(reportElement, text) {

    var str = text.split("\n");

    for (var i = 0; i < str.length; i++) {
        addMdParagraph(reportElement, str[i]);
    }
}

/* Function that add bold style to the text between '**' */
function addMdParagraph(reportElement, text) {
    
    /*
    * BOLD TEXT STYLE
    *
    * Use '**' characters where the bold starts and/or ends.
    *
    * - set bold all the paragraph => **This is bold text
    *                              => **This is bold text**
    *
    * - set bold single/multiple words => This is **bold** text
    *                                  => This **is bold** text
    *                                  => **This** is **bold** text
    */

    var p = reportElement.addParagraph();
    var printBold = false;
    var startPosition = 0;
    var endPosition = -1;

    do {
        endPosition = text.indexOf("**", startPosition);
        var charCount = endPosition === -1 ? text.length - startPosition : endPosition - startPosition;
        if (charCount > 0) {
            //Banana.console.log(text.substr(startPosition, charCount) + ", " + printBold);
            var span = p.addText(text.substr(startPosition, charCount), "");
            if (printBold)
                span.setStyleAttribute("font-weight", "bold");
        }
        printBold = !printBold;
        startPosition = endPosition >= 0 ? endPosition + 2 : text.length;
    } while (startPosition < text.length && endPosition >= 0);
}

function getAddress(banDoc, accountNumber) {
    var address = {};
    address.nameprefix = banDoc.table('Accounts').findRowByValue('Account', accountNumber).value('NamePrefix');
    address.firstname = banDoc.table('Accounts').findRowByValue('Account', accountNumber).value('FirstName');
    address.familyname = banDoc.table('Accounts').findRowByValue('Account', accountNumber).value('FamilyName');
    address.street = banDoc.table('Accounts').findRowByValue('Account', accountNumber).value('Street');
    address.buildingnumber = banDoc.table('Accounts').findRowByValue('Account', accountNumber).value('BuildingNumber');
    address.postalcode = banDoc.table('Accounts').findRowByValue('Account', accountNumber).value('PostalCode');
    address.locality = banDoc.table('Accounts').findRowByValue('Account', accountNumber).value('Locality');
    address.verzicht = banDoc.table('Accounts').findRowByValue('Account', accountNumber).value('Verzicht') ? "Ja" : "Nein";
    return address;
}

function getCC3Accounts(banDoc) {
    var membershipList = [];
    var accountsTable = banDoc.table("Accounts");
    for (var i = 0; i < accountsTable.rowCount; i++) {
        var tRow = accountsTable.row(i);
        var account = tRow.value("Account");
        if (account.substring(0,1) === ";" && account !== ";") {
            membershipList.push(account);
        }
    }
    return membershipList;
}

function convertParam(userParam) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = []; /* array dei parametri dello script */

    //Cc3 (donor)
    var currentParam = {};
    currentParam.name = 'costcenter';
    currentParam.title = 'Mitgliedskonto eingeben (leer = alle ausdrucken)';
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.readValue = function() {
        userParam.costcenter = this.value;
    }
    convertedParam.data.push(currentParam);

    // minimun amount for cc3
    var currentParam = {};
    currentParam.name = 'minimumAmount';
    currentParam.title = 'Mindestspendenbetrag';
    currentParam.type = 'string';
    currentParam.value = userParam.minimumAmount ? userParam.minimumAmount : '';
    currentParam.readValue = function() {
        userParam.minimumAmount = this.value;
    }
    convertedParam.data.push(currentParam);

    // print account number
    var currentParam = {};
    currentParam.name = 'printAccount';
    currentParam.title = 'Mitgliedskonto ausdrucken';
    currentParam.type = 'bool';
    currentParam.value = userParam.printAccount ? true : false;
    currentParam.readValue = function() {
        userParam.printAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // print single donation without transaction details when there is only one transaction
    var currentParam = {};
    currentParam.name = 'printSingle';
    currentParam.title = 'Einzelspende ohne Seite 2 mit Details';
    currentParam.type = 'bool';
    currentParam.value = userParam.printSingle ? true : false;
    currentParam.readValue = function() {
        userParam.printSingle = this.value;
    }
    convertedParam.data.push(currentParam);

    // Function to print account number
    var currentParam = {};
    currentParam.name = 'accountMethod';
    currentParam.title = 'Funktion (optional)';
    currentParam.type = 'string';
    currentParam.value = userParam.accountMethod ? userParam.accountMethod : '';
    currentParam.readValue = function() {
        userParam.accountMethod = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address of the donor
    var currentParam = {};
    currentParam.name = 'addressDonor';
    currentParam.title = 'Mitgliedsadresse';
    currentParam.type = 'string';
    currentParam.value = userParam.addressDonor ? userParam.addressDonor : '';
    currentParam.readValue = function() {
        userParam.addressDonor = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'addressPositionDX';
    currentParam.parentObject = 'addressDonor';
    currentParam.title = 'Horizontal verschieben +/- (in cm, Voreinstellung 0)';
    currentParam.type = 'number';
    currentParam.value = userParam.addressPositionDX ? userParam.addressPositionDX : '0';
    currentParam.readValue = function() {
        userParam.addressPositionDX = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'addressPositionDY';
    currentParam.parentObject = 'addressDonor';
    currentParam.title = 'Vertikal verschieben +/- (in cm, Voreinstellung 0)';
    currentParam.type = 'number';
    currentParam.value = userParam.addressPositionDY ? userParam.addressPositionDY : '0';
    currentParam.readValue = function() {
        userParam.addressPositionDY = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address Aussteller
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
    currentParam.name = 'addressText1';
    currentParam.parentObject = 'address';
    currentParam.title = 'Aussteller Zeile 1';
    currentParam.type = 'string';
    currentParam.value = userParam.addressText1 ? userParam.addressText1 : '';
    currentParam.readValue = function() {
        userParam.addressText1 = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address row 2
    var currentParam = {};
    currentParam.name = 'addressText2';
    currentParam.parentObject = 'address';
    currentParam.title = 'Aussteller Zeile 2';
    currentParam.type = 'string';
    currentParam.value = userParam.addressText2 ? userParam.addressText2 : '';
    currentParam.readValue = function() {
        userParam.addressText2 = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address row 3
    var currentParam = {};
    currentParam.name = 'addressText3';
    currentParam.parentObject = 'address';
    currentParam.title = 'Aussteller Zeile 3';
    currentParam.type = 'string';
    currentParam.value = userParam.addressText3 ? userParam.addressText3 : '';
    currentParam.readValue = function() {
        userParam.addressText3 = this.value;
    }
    convertedParam.data.push(currentParam);

    // Texts
    var currentParam = {};
    currentParam.name = 'texts';
    currentParam.title = 'Texte';
    currentParam.type = 'string';
    currentParam.value = userParam.texts ? userParam.texts : '';
    currentParam.readValue = function() {
        userParam.texts = this.value;
    }
    convertedParam.data.push(currentParam);

    // default texts
    var currentParam = {};
    currentParam.name = 'useDefaultTexts';
    currentParam.parentObject = 'texts';
    currentParam.title = 'Standardtexte wiederherstellen (aktuelle Texte werden überschrieben)';
    currentParam.type = 'bool';
    currentParam.value = userParam.useDefaultTexts ? true : false;
    currentParam.readValue = function() {
        userParam.useDefaultTexts = this.value;
    }
    convertedParam.data.push(currentParam);

    // Free text 1
    var currentParam = {};
    currentParam.name = 'text1';
    currentParam.parentObject = 'texts';
    currentParam.title = 'Text 1 (optional)';
    currentParam.type = 'string';
    currentParam.value = userParam.text1 ? userParam.text1 : '';
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.text1 = t1;
        } else {
            userParam.text1 = this.value;
        }
    }
    convertedParam.data.push(currentParam);

    // Free text 2
    var currentParam = {};
    currentParam.name = 'text2';
    currentParam.parentObject = 'texts';
    currentParam.title = 'Text 2 (optional)';
    currentParam.type = 'string';
    currentParam.value = userParam.text2 ? userParam.text2 : '';
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.text2 = t2;
        } else {
            userParam.text2 = this.value;
        }
    }
    convertedParam.data.push(currentParam);

    // Free text 3
    var currentParam = {};
    currentParam.name = 'text3';
    currentParam.parentObject = 'texts';
    currentParam.title = 'Text 3 (optional)';
    currentParam.type = 'string';
    currentParam.value = userParam.text3 ? userParam.text3 : ''; 
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.text3 = t3;
        } else {
            userParam.text3 = this.value;
        }
    }
    convertedParam.data.push(currentParam);

    // Free text 4
    var currentParam = {};
    currentParam.name = 'text4';
    currentParam.parentObject = 'texts';
    currentParam.title = 'Text 4 (optional)';
    currentParam.type = 'string';
    currentParam.value = userParam.text4 ? userParam.text4 : ''; 
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.text4 = t4;
        } else {
            userParam.text4 = this.value;
        }
    }
    convertedParam.data.push(currentParam);

    // Free text 5
    var currentParam = {};
    currentParam.name = 'text5';
    currentParam.parentObject = 'texts';
    currentParam.title = 'Text 5 (optional)';
    currentParam.type = 'string';
    currentParam.value = userParam.text5 ? userParam.text5 : ''; 
    currentParam.readValue = function() {
        if (userParam.useDefaultTexts) {
            userParam.text5 = t5;
        } else {
            userParam.text5 = this.value;
        }
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

    // locality and date
    var currentParam = {};
    currentParam.name = 'localityAndDate';
    currentParam.parentObject = 'signature';
    currentParam.title = 'Ort und Datum';
    currentParam.type = 'string';
    currentParam.value = userParam.localityAndDate ? userParam.localityAndDate : '';
    currentParam.readValue = function() {
        userParam.localityAndDate = this.value;
    }
    convertedParam.data.push(currentParam);

    // print signature
    var currentParam = {};
    currentParam.name = 'printUnterschrift';
    currentParam.parentObject = 'signature';
    currentParam.title = 'Unterschrift Bild ausdrucken';
    currentParam.type = 'bool';
    currentParam.value = userParam.printUnterschrift ? true : false;
    currentParam.readValue = function() {
        userParam.printUnterschrift = this.value;
    }
    convertedParam.data.push(currentParam);

    // image for signature
    var currentParam = {};
    currentParam.name = 'signatureImage';
    currentParam.parentObject = 'signature';
    currentParam.title = 'Unterschrift Bild';
    currentParam.type = 'string';
    currentParam.value = userParam.signatureImage ? userParam.signatureImage : 'documents:unterschrift';
    currentParam.readValue = function() {
     userParam.signatureImage = this.value;
    }
    convertedParam.data.push(currentParam);

    // image height
    var currentParam = {};
    currentParam.name = 'imageHeight';
    currentParam.parentObject = 'signature';
    currentParam.title = 'Bildhöhe (mm)';
    currentParam.type = 'number';
    currentParam.value = userParam.imageHeight ? userParam.imageHeight : '10';
    currentParam.readValue = function() {
     userParam.imageHeight = this.value;
    }
    convertedParam.data.push(currentParam);

    // print page number
    var currentParam = {};
    currentParam.name = 'printPageNumber';
    currentParam.parentObject = 'signature';
    currentParam.title = 'Seitennummer ausdrucken';
    currentParam.type = 'bool';
    currentParam.value = userParam.printPageNumber ? true : false;
    currentParam.readValue = function() {
        userParam.printPageNumber = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function initUserParam() {

    var userParam = {};
    userParam.costcenter = '';
    userParam.minimumAmount = '';
    userParam.printAccount = true;
    userParam.printSingle = false;
    userParam.accountMethod = '';
    userParam.addressPositionDX = '0';
    userParam.addressPositionDY = '0';
    userParam.address = '';
    userParam.addressText1 = '';
    userParam.addressText2 = '';
    userParam.addressText3 = '';
    userParam.texts = '';
    userParam.useDefaultTexts = false;
    userParam.text1 = t1;
    userParam.text2 = t2;
    userParam.text3 = t3;
    userParam.text4 = t4;
    userParam.text5 = t5;
    userParam.localityAndDate = '';
    userParam.signature = '';
    userParam.printUnterschrift = '';
    userParam.signatureImage = '';
    userParam.imageHeight = '';
    userParam.printPageNumber = true;
    return userParam;
}

function parametersDialog(userParam) {

    if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
        var dialogTitle = "Einstellungen";
        var convertedParam = convertParam(userParam);
        var pageAnchor = 'dlgSettings';
        if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
            return null;
        }
        
        for (var i = 0; i < convertedParam.data.length; i++) {
            // Read values to userParam (through the readValue function)
            convertedParam.data[i].readValue();
        }
        
        //  Reset reset default values
        userParam.useDefaultTexts = false;
    }
    
    return userParam;
}

/* Save the period for the next time the script is run */
function settingsDialog() {
    
    var scriptform = initUserParam();

    // Retrieve saved param
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        scriptform = JSON.parse(savedParam);
    }

    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = Banana.document.startPeriod();
    var docEndDate = Banana.document.endPeriod();   
    
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod('Spendenbescheinigung', docStartDate, docEndDate, 
        scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);
        
    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedDates) {
        scriptform["selectionStartDate"] = selectedDates.startDate;
        scriptform["selectionEndDate"] = selectedDates.endDate;
        scriptform["selectionChecked"] = selectedDates.hasSelection;    
    } else {
        //User clicked cancel
        return null;
    }

    scriptform = parametersDialog(scriptform); // From propertiess
    if (scriptform) {
        var paramToString = JSON.stringify(scriptform);
        Banana.document.setScriptSettings(paramToString);
    }
    
    return scriptform;
}

/* This function adds a Footer to the report */
function addFooter(report) {
    report.getFooter().addClass("footer");
    //report.getFooter().addText("", "");
    report.getFooter().addFieldPageNr();
}

/* Function that creates all the styles used to print the report */
function createStyleSheet(userParam) {
    var stylesheet = Banana.Report.newStyleSheet();
    
    stylesheet.addStyle("@page", "margin:20mm 10mm 10mm 20mm;") 
    stylesheet.addStyle("body", "font-family:Helvetica; font-size:7pt");
    stylesheet.addStyle(".footer", "font-size:8pt;text-align:right");
    stylesheet.addStyle(".bold", "font-weight:bold;");
    stylesheet.addStyle(".borderLeft", "border-left:thin solid black");
    stylesheet.addStyle(".borderTop", "border-top:thin solid black");
    stylesheet.addStyle(".borderRight", "border-right:thin solid black");
    stylesheet.addStyle(".borderBottom", "border-bottom:thin solid black");
    stylesheet.addStyle(".horizontalLine", "border-top:thin solid black");
    stylesheet.addStyle(".right", "text-align:right;");
    stylesheet.addStyle(".center", "text-align:center;");
    stylesheet.addStyle(".headerStyle", "background-color:#E0EFF6; text-align:center; font-weight:bold;");
    stylesheet.addStyle(".padding", "padding-bottom:2px; padding-top:3px; padding-left:2px; padding-right:2px;");
    stylesheet.addStyle(".textParagraphBottom", "margin-bottom:0.15cm");
    stylesheet.addStyle(".textParagraphTop", "margin-top:0.6cm");

    // Donor address
    if (!userParam.addressPositionDX) {
        userParam.addressPositionDX = '0';
    }
    if (!userParam.addressPositionDY) {
        userParam.addressPositionDY = '0';
    }
    var addressSenderMarginTop = parseFloat(2.4)+parseFloat(userParam.addressPositionDY);
    var addressMarginLeft = parseFloat(0.0)+parseFloat(userParam.addressPositionDX);
    stylesheet.addStyle(".addressSenderTop", "margin-top:"+addressSenderMarginTop+"cm; margin-left:"+addressMarginLeft+"cm");
    stylesheet.addStyle(".address", "margin-top:0cm; margin-left:"+addressMarginLeft+"cm; font-size:11pt");

    /* table01 */
    var tableStyle = stylesheet.addStyle(".table01");
    tableStyle.setAttribute("width", "100%");
    tableStyle.setAttribute("margin-top", "2.2cm");
    stylesheet.addStyle("table.table01 td", "border:thin solid black;");

    /* table01a */
    var tableStyle = stylesheet.addStyle(".table01a");
    tableStyle.setAttribute("width", "100%");
    tableStyle.setAttribute("margin-top", "0.3cm");
    stylesheet.addStyle("table.table01a td", "border:thin solid black;");

    /* table02 */
    var tableStyle = stylesheet.addStyle(".table02");
    tableStyle.setAttribute("width", "100%");
    tableStyle.setAttribute("margin-top", "0.3cm");
    stylesheet.addStyle(".t2col1", "");
    stylesheet.addStyle(".t2col2", "");
    stylesheet.addStyle(".t2col3", "");
    stylesheet.addStyle(".t2col4", "");
    stylesheet.addStyle(".t2col5", "");
    stylesheet.addStyle(".t2col6", "");
    //stylesheet.addStyle("table.table02 td", "border-right:thin solid black;");
    // stylesheet.addStyle("table.table02 td", "border:thin solid black;");

    /* table03 */
    var tableStyle = stylesheet.addStyle(".table03");
    tableStyle.setAttribute("width", "100%");
    tableStyle.setAttribute("margin-top", "0.65cm");
    tableStyle.setAttribute("margin-bottom", "0.3cm");
    stylesheet.addStyle("table.table03 td", "border:thin solid black;");

    /* table04 */
    var tableStyle = stylesheet.addStyle(".table04");
    tableStyle.setAttribute("width", "80%");
    tableStyle.setAttribute("margin-top", "1.0cm");
    tableStyle.setAttribute("margin-bottom", "0.32cm");

    /* table05 */
    var tableStyle = stylesheet.addStyle(".table05");
    tableStyle.setAttribute("width", "100%");

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

    style = stylesheet.addStyle(".logoStyle");
    style.setAttribute("height", userParam.imageHeight + "mm");

    return stylesheet;
}

/* Conversion number in German words */
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
