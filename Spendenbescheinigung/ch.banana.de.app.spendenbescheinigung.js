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
// @pubdate = 2018-09-21
// @publisher = Banana.ch SA
// @description = Spendenbescheinigung
// @description.de = Spendenbescheinigung
// @description.en = Donation receipt
// @doctype = *
// @task = app.command

function exec(inData, options) {
    
    if (!Banana.document)
        return "@Cancel";

	/* 1) Opens the dialog for the period choice */
	var dateform = null;
	if (options && options.useLastSettings) {
	    dateform = getScriptSettings();
	} else {
	    dateform = settingsDialog();
	}
	if (!dateform) {
	    return "@Cancel";
	}

    /* 2) Get user parameters from the dialog */
    var userParam = initUserParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = parametersDialog(savedParam);
    }

    if (!userParam) {
        return "@Cancel";
    }

    /* 3) Get the list of all the donors (CC3) */
    var membershipList = getCC3List(Banana.document);
    var donorsToPrint = [];

    //If user insert the Cc3 account without ";", we add it
    if (userParam.costcenter && userParam.costcenter.substring(0,1) !== ";") {
        userParam.costcenter = ";"+userParam.costcenter;
    }

    if (userParam.costcenter && membershipList.indexOf(userParam.costcenter) > -1) { //CC3 exists
        donorsToPrint.push(userParam.costcenter);
    }
    else if (userParam.costcenter && membershipList.indexOf(userParam.costcenter) < 0) { //CC3 does not exists
        Banana.document.addMessage("Ungültiges Mitgliedkonto Konto");
        return "@Cancel";
    }
    else if (!userParam.costcenter || userParam.costcenter === "" || userParam.costcenter === undefined) { //Empty field, so we take all the CC3
        donorsToPrint = membershipList;
    }

	/* 4) Creates the report */
	var report = createReport(Banana.document, dateform.selectionStartDate, dateform.selectionEndDate, userParam, donorsToPrint);            
	var stylesheet = createStyleSheet(userParam);
	Banana.Report.preview(report, stylesheet);
}

/* The report is created using the selected period and the data of the dialog */
function createReport(banDoc, startDate, endDate, userParam, donorsToPrint) {

    /* Create the report */
    var report = Banana.Report.newReport("Spendenbescheinigung");

    for (var k = 0; k < donorsToPrint.length; k++) {

        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");

        /*************************************
        a) Address of the sender
        *************************************/
        var company = banDoc.info("AccountingDataBase","Company");
        var name = banDoc.info("AccountingDataBase","Name");
        var familyName = banDoc.info("AccountingDataBase","FamilyName");
        var address1 = banDoc.info("AccountingDataBase","Address1");
        var zip = banDoc.info("AccountingDataBase","Zip");
        var city = banDoc.info("AccountingDataBase","City");
        var country = banDoc.info("AccountingDataBase","Country");

        if (name && familyName && company) {
            report.addParagraph(company + ", " + name + " " + familyName, "");
        } else if (name && familyName && !company) {
            report.addParagraph(name + " " + familyName, "");
        } else if (!name && !familyName && company) {
        	report.addParagraph(company, "");
        }

        if (address1 && zip && city) {
            report.addParagraph(address1 + ", " + zip + " " + city, "");
        }
        else if (!address1 && zip && city) {
            report.addParagraph(zip + " " + city, "");
        }
        else if (!address1 && !zip && city) {
            report.addParagraph(city, "");
        }
        report.addParagraph("", "");


        /*************************************
        b) Address of the Membership (donor)
        *************************************/
        var address = getAddress(banDoc, donorsToPrint[k]);
        if (address.firstname && address.familyname) {
            report.addParagraph(address.firstname + " " + address.familyname + "                                                             Mitgliedskonto: " + donorsToPrint[k].substring(1), "address");
        } else {
            report.addParagraph(address.familyname, "address");
        }
        report.addParagraph(address.street, "address");
        report.addParagraph(address.postalcode + " " + address.locality, "address");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");


        /*************************************
        c) Donor Receiver 
        *************************************/
        var table = report.addTable("table01");
        
        tableRow = table.addRow();
        var paragraph01 = tableRow.addCell("","");
        paragraph01.addParagraph("Aussteller (Bezeichnung und Anschrift der steuerbegünstigten Einrichtung)", "");
        paragraph01.addParagraph(userParam.text01, "");
        paragraph01.addParagraph(userParam.text02, "");
        paragraph01.addParagraph(userParam.text03, "");

        report.addParagraph(" ", "");
        report.addParagraph("Sammelbestätigung über Geldzuwendungen/Mitgliedsbeiträge", "bold");
        report.addParagraph("im Sinne des § 10b des Einkommensteuergesetzes an eine der in § 5 Abs. 1 Nr. 9 des Körperschaftsteuergesetzes bezeichneten Körperschaften, Personenvereinigungen oder Vermögensmassen", "");
        report.addParagraph(" ", "");


        /*************************************
        d) Address of the Membership (donor)  
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
        paragraph01.addParagraph("Mitgliedskonto: " + donorsToPrint[k].substring(1), "bold");
        report.addParagraph(" ", "");


        /*************************************
        e) Accounting data of the donation
        *************************************/

        /* Calculate the total of the Transactions */
        var transactionsObj = calculateTotalTransactions(banDoc, donorsToPrint[k], startDate, endDate);
        
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
        f) Add texts
        *************************************/
        var text04 = "[ ] Wir sind wegen Förderung der Entwicklungszusammenarbeit nach dem Freistellungsbescheid bzw. nach der Anlage zum Körperschaft- steuerbescheid des Finanzamtes Kempten, StNr. 127/111/20031, vom 30.12.2016 für den letzten Veranlagungszeitraum 2013 bis 2015 nach § 5 Abs. 1 Nr. 9 des Körperschaftsteuergesetzes von der Körperschaftsteuer und nach § 3 Nr. 6 des Gewerbesteuergesetzes von der Gewerbesteuer befreit.";
        report.addParagraph(" ", "");
        report.addParagraph(text04, "");

        var text05 = "[ ] Die Einhaltung der satzungsmäßigen Voraussetzungen nach den §§ 51, 59, 60 und 61 AO wurde vom Finanzamt .......................,,StNr. ................................., mit Bescheid vom ................... nach § 60a AO gesondert festgestellt. Wir fördern nach unserer Satzung (Angabe des begünstigten Zwecks / der begünstigten Zwecke) ................. .";
        report.addParagraph(" ", "");
        report.addParagraph(text05, "bold");
        
        var text06 = "Es wird bestätigt, dass die Zuwendung nur zur Förderung";
        var text07 = "der Entwicklungszusammenarbeit";
        var text08 = "verwendet wird.";
        var text09 = "Nur für steuerbegünstigte Einrichtungen, bei denen die Mitgliedsbeiträge steuerlich nicht abziehbar sind:";
        var text10 = "[ ] Es wird bestätigt, dass es sich nicht um einen Mitgliedsbeitrag handelt, dessen Abzug nach § 10b Abs. 1 des Einkommensteuergesetzes ausgeschlossen ist.";

        report.addParagraph(" ", "");
        var tableTexts = report.addTable("table05");
        tRow = tableTexts.addRow();
        tRow.addCell(text06, "borderLeft borderRight borderTop");
        tRow = tableTexts.addRow();
        tRow.addCell(text07, "bold borderLeft borderRight");
        tRow = tableTexts.addRow();
        tRow.addCell(" ", "borderLeft borderRight");
        tRow = tableTexts.addRow();
        tRow.addCell(text08, "borderLeft borderRight");
        tRow = tableTexts.addRow();
        tRow.addCell(" ", "borderLeft borderRight");
        tRow = tableTexts.addRow();
        tRow.addCell(text09, "bold borderLeft borderRight");
        tRow = tableTexts.addRow();
        tRow.addCell(" ", "borderLeft borderRight");
        tRow = tableTexts.addRow();
        tRow.addCell(text10, "borderLeft borderRight borderBottom");

        var text11 = "Es wird bestätigt, dass über die in der Gesamtsumme enthaltenen Zuwendungen keine weiteren Bestätigungen, weder formelle Zuwendungsbe- stätigungen noch Beitragsquittungen oder Ähnliches ausgestellt wurden und werden.";
        report.addParagraph(" ", "");
        report.addParagraph(text11, "");

        var text12 = "Ob es sich um den Verzicht auf Erstattung von Aufwendungen handelt, ist der Anlage zur Sammelbestätigung zu entnehmen.";
        report.addParagraph(" ", "");
        report.addParagraph(text12, "");
        

        /*************************************
        g) Adds Locality, date and signature.
           It is possible to use an image as
           signature (table Documents)
        *************************************/
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        var table = report.addTable("table04");
        tableRow = table.addRow();
        tableRow.addCell(userParam.localityAndDate, "bold", 1);
        tableRow.addCell(userParam.signature, "bold", 1);
        if (userParam.printLogo) {
            tableRow.addCell("","",1).addImage("documents:logo", "logoStyle");          
        } else {
            tableRow.addCell("                     ", "", 1);
        }
        tableRow = table.addRow();
        tableRow.addCell("", "borderBottom", 3);
        tableRow = table.addRow();
        tableRow.addCell("(Ort, Datum und Unterschrift des Zuwendungsempfängers)", "", 3);


        /*************************************
        h) Footer
        *************************************/
        var text1 = "Hinweis:";
        var text2 = "Wer vorsätzlich oder grob fahrlässig eine unrichtige Zuwendungsbestätigung erstellt oder wer veranlasst, dass Zuwendungen nicht zu den in der Zuwendungsbestätigung angegebenen steuerbegünstigten Zwecken verwendet werden, haftet für die entgangene Steuer (§ 10b Abs. 4 EStG, § 9 Abs. 3 KStG, § 9 Nr. 5 GewStG).";
        var text3 = "Diese Bestätigung wird nicht als Nachweis für die steuerliche Berücksichtigung der Zuwendung anerkannt, wenn das Datum des Freistellungsbescheides länger als 5 Jahre bzw. das Datum der Feststellung der Einhaltung der satzungsmäßigen Voraussetzungen nach";
        var text4 = "§ 60a Abs. 1 AO länger als 3 Jahre seit Ausstellung des Bescheides zurückliegt (§ 63 Abs. 5 AO).";
        report.addParagraph(" ", "");
        report.addParagraph(text1, "bold");
        report.addParagraph(text2, "");
        report.addParagraph(" ", "");
        report.addParagraph(text3, "");
        report.addParagraph(" ", "");
        report.addParagraph(text4, "");


        /*************************************
        i) Show donation transactions
        *************************************/
        report.addPageBreak();

        var text1 = "Anlage zur Sammelbestätigung";
        var text2 = "Gesamtsumme";

        report.addParagraph(text1, "bold");
        if (address.firstname && address.familyname) {
            report.addParagraph(donorsToPrint[k].substring(1) + ": " + address.firstname + " " + address.familyname + ", " + address.street + ", " + address.postalcode + " " + address.locality, "");
        } else {
            report.addParagraph(donorsToPrint[k].substring(1) + ": " + address.familyname + ", " + address.street + ", " + address.postalcode + " " + address.locality, "");
        }
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph(text2 + ": " + Banana.Converter.toLocaleNumberFormat(transactionsObj.total) + " " + banDoc.info("AccountingDataBase", "BasicCurrency"), "bold");
        report.addParagraph(" ", "");
        
        //Print all the transactions for the selected CC3 account and period
        printTransactionTable(banDoc, report, donorsToPrint[k], startDate, endDate);
        
        report.addParagraph(" ", "");
        report.addParagraph(" ", "");
        report.addParagraph("Summe in Worten (" + amountInWords + " " + c1 + c2 + "/100)", "bold");
    
        //Page break to all pages except the last
        if (k < donorsToPrint.length-1) {
            report.addPageBreak();
        }
    }

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

function calculateTotalTransactions(banDoc, costcenter, startDate, endDate) {
    var transTab = banDoc.table("Transactions");
    var date = "";
    var total = "";
    var transactionsObj = {};
    costcenter = costcenter.substring(1); //remove first character ;

    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        date = tRow.value("Date");
        transactionsObj.date = date;
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {

            if (costcenter && costcenter === cc3) {
                total = Banana.SDecimal.add(total, tRow.value("Amount"));
            }
        }
    }

    transactionsObj.total = total;
    
    return transactionsObj;
}

function printTransactionTable(banDoc, report, costcenter, startDate, endDate) {
    
    //Get name and family name of the donor
    var address = getAddress(banDoc, costcenter);
    var name = "";
    if (address.firstname && address.familyname) {
        name = address.firstname + " " + address.familyname;
    } else {
        name = address.familyname;
    }

    var transTab = banDoc.table("Transactions");
    var date = "";
    var total = "";
    costcenter = costcenter.substring(1); //remove first character ";"

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

    var rowCnt = 0;
    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        tableRow = table.addRow();

        date = tRow.value("Date");
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {

            if (costcenter && costcenter === cc3) {
                rowCnt++;
                tableRow.addCell(rowCnt, "borderRight", 1); //sequencial numbers
                tableRow.addCell(tRow.value("Description"), "borderRight", 1);
                tableRow.addCell(Banana.Converter.toLocaleDateFormat(tRow.value("Date")), "borderRight", 1);
                tableRow.addCell(name, "borderRight", 1);
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(tRow.value("Amount")), "right borderRight", 1);
                tableRow.addCell("Nein", "center borderRight", 1);
                total = Banana.SDecimal.add(total, tRow.value("Amount"));
            }
        }
    }

    tableRow = table.addRow();
    tableRow.addCell("", "borderTop borderBottom", 3);
    tableRow.addCell("Summe", "bold right borderTop borderBottom", 1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total), "bold right borderTop borderBottom", 1);
    tableRow.addCell("", "bold right borderTop borderBottom", 1);
}

function getCC3List(banDoc) {
    var membershipList = [];
    var accountsTable = banDoc.table("Accounts");
    for (var i = 0; i < accountsTable.rowCount; i++) {
        var tRow = accountsTable.row(i);
        var account = tRow.value("Account");
        if (account.substring(0,1) === ";") {
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

    // locality and date
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

    // image for signature
    var currentParam = {};
    currentParam.name = 'printLogo';
    currentParam.parentObject = 'signature';
    currentParam.title = 'Unterschrift mit Bild';
    currentParam.type = 'bool';
    currentParam.value = userParam.printLogo ? true : false;
    currentParam.readValue = function() {
     userParam.printLogo = this.value;
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

    return convertedParam;
}

function initUserParam() {
    var userParam = {};
    userParam.costcenter = '';
    userParam.address = '';
    userParam.text01 = '';
    userParam.text02 = '';
    userParam.text03 = '';
    userParam.localityAndDate = '';
    userParam.signature = '';
    userParam.printLogo = '';
    userParam.imageHeight = '';
    return userParam;
}

function parametersDialog(userParam) {

    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }

    if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
        var dialogTitle = userParam.xmldialogtitle;
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
    // else {
    //     userParam.costcenter = Banana.Ui.getText('', 'Mitgliedskonto', '');
    //     if (userParam.costcenter) {
    //         //removes the description text in order to have only the account (es. ";S001 Socio 1" => ";S001")
    //         userParam.costcenter = userParam.costcenter.split(' ')[0];            
    //     } else {
    //         userParam.costcenter = getCC3List(Banana.document); //take the list of all CC3 accounts
    //     }

    //     userParam.text01 = Banana.Ui.getText('', 'Aussteller Zeile 1', '');
    //     if (userParam.text01 === undefined) {
    //         return;
    //     }

    //     userParam.text02 = Banana.Ui.getText('', 'Aussteller Zeile 2', '');
    //     if (userParam.text02 === undefined) {
    //         return;
    //     }

    //     userParam.text03 = Banana.Ui.getText('', 'Aussteller Zeile 3', '');
    //     if (userParam.text03 === undefined) {
    //         return;
    //     }

    //     userParam.localityAndDate = Banana.Ui.getText('', 'Ort und Datum', '');
    //     if (userParam.localityAndDate === undefined) {
    //         return;
    //     }

    //     userParam.signature = Banana.Ui.getText('', 'Unterschrift', '');
    //     if (userParam.signature === undefined) {
    //         return;
    //     }

    //     userParam.printLogo = Banana.Ui.getInt('', 'Unterschrift mit Bild (1=ja, 0=nein)', '');
    //     if (userParam.printLogo === undefined) {
    //         return;
    //     }

    //     userParam.image_height = Banana.Ui.getInt('', 'Bildhöhe (mm)', '');
    //     if (userParam.image_height === undefined) {
    //         return;
    //     }   
    // }

    var paramToString = JSON.stringify(userParam);
    var value = Banana.document.setScriptSettings(paramToString);
    
    return userParam;
}

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

/* Save the period for the next time the script is run */
function settingsDialog() {
    
    //The formeters of the period that we need
    var scriptform = getScriptSettings();

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

        //Save script settings
        var formToString = JSON.stringify(scriptform);
        var value = Banana.document.setScriptSettings(formToString);       
    } else {
        //User clicked cancel
        return null;
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
    stylesheet.addStyle(".address", "font-size:11pt");

    /* table01 */
    var tableStyle = stylesheet.addStyle(".table01");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle("table.table01 td", "border:thin solid black;");

    /* table02 */
    var tableStyle = stylesheet.addStyle(".table02");
    tableStyle.setAttribute("width", "100%");
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
    stylesheet.addStyle("table.table03 td", "border:thin solid black;");

    /* table04 */
    var tableStyle = stylesheet.addStyle(".table04");
    tableStyle.setAttribute("width", "80%");

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
