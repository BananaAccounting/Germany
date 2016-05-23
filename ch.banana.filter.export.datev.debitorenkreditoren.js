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
// @id = ch.banana.filter.export.datev.debitorenkreditoren
// @publisher = Banana.ch SA
// @description = DATEV Export / Kontendaten von Kunden und Lieferanten
// @task = export.file
// @exportfilename = EXTF_GP_Stamm_<Date>
// @exportfiletype = csv
// @inputdatasource = none
// @timeout = -1
// @encoding = Windows-1252

/**
* The function checks if a number is between two numbers you enter
*/
Number.prototype.between = function (first, last) {
    return (first < last ? this >= first && this <= last : this >= last && this <= first);
}

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
var dialog = Banana.Ui.createUi("ch.banana.filter.export.datev.debitorenkreditoren.dialog.ui");

dialog.enableButtons = function () {
    if (dialog.bereichGroupBox.debitorenkontoCheckBox.checked) {
        dialog.bereichGroupBox.debitorenkontoVonSpinBox.enabled = true;
        dialog.bereichGroupBox.debitorenkontoBisLabel.enabled = true;
        dialog.bereichGroupBox.debitorenkontoBisSpinBox.enabled = true;
    }
    else {
        dialog.bereichGroupBox.debitorenkontoVonSpinBox.enabled = false;
        dialog.bereichGroupBox.debitorenkontoBisLabel.enabled = false;
        dialog.bereichGroupBox.debitorenkontoBisSpinBox.enabled = false;
    }

    if (dialog.bereichGroupBox.kreditorenkontoCheckBox.checked) {
        dialog.bereichGroupBox.kreditorenkontoVonSpinBox.enabled = true;
        dialog.bereichGroupBox.kreditorenkontoBisLabel.enabled = true;
        dialog.bereichGroupBox.kreditorenkontoBisSpinBox.enabled = true;
    }
    else {
        dialog.bereichGroupBox.kreditorenkontoVonSpinBox.enabled = false;
        dialog.bereichGroupBox.kreditorenkontoBisLabel.enabled = false;
        dialog.bereichGroupBox.kreditorenkontoBisSpinBox.enabled = false;
    }
}

dialog.checkdata = function () {
    var valid = true;
    var mandantenError = "";
    var beraterError = "";
    var debitorengruppeError = "";
    var kreditorengruppeError = "";

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

    if (dialog.bereichGroupBox.debitorengruppeLineEdit.text.length <= 0) {
        debitorengruppeError = "Das Feld Debitorengruppe hat keinen Inhalt";
        valid = false;
    }

    if (dialog.bereichGroupBox.kreditorengruppeLineEdit.text.length <= 0) {
        kreditorengruppeError = "Das Feld Kreditorengruppe hat keinen Inhalt";
        valid = false;
    }

    if (valid) {
        dialog.accept();
    }
    else {
        dialog.mandantenLabelError.text = mandantenError;
        dialog.beraterLabelError.text = beraterError;
        dialog.bereichGroupBox.debitorengruppeLabelError.text = debitorengruppeError;
        dialog.bereichGroupBox.kreditorengruppeLabelError.text = kreditorengruppeError;
    }
}

dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.filter.export.datev.debitorenkreditoren.dialog.ui");
}

/**
* Dialog's events declaration
*/
dialog.buttonBox.accepted.connect(dialog, "checkdata");
dialog.buttonBox.helpRequested.connect(dialog, "showHelp");
dialog.bereichGroupBox.debitorenkontoCheckBox.clicked.connect(dialog, "enableButtons");
dialog.bereichGroupBox.kreditorenkontoCheckBox.clicked.connect(dialog, "enableButtons");

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
        var fieldsHeader = getFieldsHeader();
        transactions.push(fieldsHeader);

        var tableAccounts = Banana.document.table("Accounts");
        if (tableAccounts) {
            //extract Customers' list
            tableAccounts.extractRows(extractCustomersAccounts, "Customers' accounts");
            var tableExtract = Banana.document.table("Extract");
            transactions = getExtractedRows(tableExtract, transactions);

            //extract Suppliers' list
            tableAccounts.extractRows(extractSuppliersAccounts, "Suppliers' accounts");
            tableExtract = Banana.document.table("Extract");
            transactions = getExtractedRows(tableExtract, transactions);
        }

        var header = getHeader();
        return tableToCsv(header.concat(transactions));
    }

    return "@Cancel";
}

/**
* Extract customers' accounts from table Accounts into table Extract
* according to the customer group
*/
function extractCustomersAccounts(row, i, table) {
    var debitorenGruppe = param["debitorengruppe"];
    if (param["debitorengruppe"].length <= 0)
        return 0;
    return row.value("Gr") === param["debitorengruppe"];
}

/**
* Extract suppliers' accounts from table Accounts into table Extract
* according to the supplier group
*/
function extractSuppliersAccounts(row, i, table) {
    var debitorenGruppe = param["kreditorengruppe"];
    if (param["kreditorengruppe"].length <= 0)
        return 0;
    return row.value("Gr") === param["kreditorengruppe"];
}

/**
* Calls the dialog in order to set variables
*/
function dialogExec() {

    //set param()
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

    if (param["debitorenkontoSelected"] == "true")
        dialog.bereichGroupBox.debitorenkontoCheckBox.checked = true;
    else
        dialog.bereichGroupBox.debitorenkontoCheckBox.checked = false;
    dialog.bereichGroupBox.debitorenkontoVonSpinBox.value = param["debitorenvonkonto"];
    dialog.bereichGroupBox.debitorenkontoBisSpinBox.value = param["debitorenbiskonto"];
    dialog.bereichGroupBox.debitorengruppeLineEdit.text = param["debitorengruppe"];
    dialog.bereichGroupBox.debitorengruppeLabelError.text = "";

    if (param["kreditorenkontoSelected"] == "true")
        dialog.bereichGroupBox.kreditorenkontoCheckBox.checked = true;
    else
        dialog.bereichGroupBox.kreditorenkontoCheckBox.checked = false;
    dialog.bereichGroupBox.kreditorenkontoVonSpinBox.value = param["kreditorenvonkonto"];
    dialog.bereichGroupBox.kreditorenkontoBisSpinBox.value = param["kreditorenbiskonto"];
    dialog.bereichGroupBox.kreditorengruppeLineEdit.text = param["kreditorengruppe"];
    dialog.bereichGroupBox.kreditorengruppeLabelError.text = "";

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

    if (dialog.bereichGroupBox.debitorenkontoCheckBox.checked)
        param["debitorenkontoSelected"] = "true";
    else
        param["debitorenkontoSelected"] = "false";
    param["debitorenvonkonto"] = dialog.bereichGroupBox.debitorenkontoVonSpinBox.value.toString();
    param["debitorenbiskonto"] = dialog.bereichGroupBox.debitorenkontoBisSpinBox.value.toString();
    param["debitorengruppe"] = dialog.bereichGroupBox.debitorengruppeLineEdit.text.toUpperCase();

    if (dialog.bereichGroupBox.kreditorenkontoCheckBox.checked)
        param["kreditorenkontoSelected"] = "true";
    else
        param["kreditorenkontoSelected"] = "false";
    param["kreditorenvonkonto"] = dialog.bereichGroupBox.kreditorenkontoVonSpinBox.value.toString();
    param["kreditorenbiskonto"] = dialog.bereichGroupBox.kreditorenkontoBisSpinBox.value.toString();
    param["kreditorengruppe"] = dialog.bereichGroupBox.kreditorengruppeLineEdit.text.toUpperCase();

    var paramToString = JSON.stringify(param);
    var value = Banana.document.scriptSaveSettings(paramToString);

    return true;
}

/**
* The function getFieldsHeader return an array
* with the field names
*/
function getFieldsHeader() {
    var fieldsHeader = [];

    fieldsHeader.push("Konto");
    fieldsHeader.push("Name (Adressattyp Unternehmen)");
    fieldsHeader.push("Unternehmensgegenstand");
    fieldsHeader.push("Name (Adressattyp natürl. Person)");
    fieldsHeader.push("Vorname (Adressattyp natürl. Person)");
    fieldsHeader.push("Name (Adressattyp keine Angabe)");
    fieldsHeader.push("Adressattyp");
    fieldsHeader.push("Kurzbezeichnung");
    fieldsHeader.push("EU-Land");
    fieldsHeader.push("EU-UStID");
    fieldsHeader.push("Anrede");
    fieldsHeader.push("Titel/Akad. Grad");
    fieldsHeader.push("Adelstitel");
    fieldsHeader.push("Namensvorsatz");
    fieldsHeader.push("Adressart");
    fieldsHeader.push("Strasse");
    fieldsHeader.push("Postfach");
    fieldsHeader.push("Postleitzahl");
    fieldsHeader.push("Ort");
    fieldsHeader.push("Land");
    fieldsHeader.push("Versandzusatz");
    fieldsHeader.push("Adresszusatz");
    fieldsHeader.push("Abweichende Anrede");
    fieldsHeader.push("Abw. Zustellbezeichnung 1");
    fieldsHeader.push("Abw. Zustellbezeichnung 2");
    fieldsHeader.push("Kennz. Korrespondenzadresse");
    fieldsHeader.push("Adresse Gültig von");
    fieldsHeader.push("Adresse Gültig bis");
    fieldsHeader.push("Telefon");
    fieldsHeader.push("Bemerkung (Telefon)");
    fieldsHeader.push("Telefon GL");
    fieldsHeader.push("Bemerkung (Telefon GL)");
    fieldsHeader.push("E-Mail");
    fieldsHeader.push("Bemerkung (E-Mail)");
    fieldsHeader.push("Internet");
    fieldsHeader.push("Bemerkung (Internet)");
    fieldsHeader.push("Fax");
    fieldsHeader.push("Bemerkung (Fax)");
    fieldsHeader.push("Sonstige");
    fieldsHeader.push("Bemerkung (Sonstige)");

    for (i = 1; i <= 5; i++) {
        fieldsHeader.push("Bankleitzahl " + i.toString());
        fieldsHeader.push("Bankbezeichnung " + i.toString());
        fieldsHeader.push("Bank-Kontonummer " + i.toString());
        fieldsHeader.push("Länderkennzeichen " + i.toString());
        fieldsHeader.push("IBAN-Nr. " + i.toString());
        fieldsHeader.push("IBAN" + i.toString() + " korrekt");
        fieldsHeader.push("SWIFT-Code " + i.toString());
        fieldsHeader.push("Abw. Kontoinhaber " + i.toString());
        fieldsHeader.push("Kennz. Hauptbankverb. " + i.toString());
        fieldsHeader.push("Bankverb " + i.toString() + " Gültig von");
        fieldsHeader.push("Bankverb " + i.toString() + " Gültig bis");
    }


    fieldsHeader.push("Leerfeld");
    fieldsHeader.push("Briefanrede");
    fieldsHeader.push("Grussformel");
    fieldsHeader.push("Kundennummer");
    fieldsHeader.push("Steuernummer");
    fieldsHeader.push("Sprache");
    fieldsHeader.push("Ansprechpartner");
    fieldsHeader.push("Vertreter");
    fieldsHeader.push("Sachbearbeiter");
    fieldsHeader.push("Diverse-Konto");
    fieldsHeader.push("Ausgabeziel");
    fieldsHeader.push("Währungssteuerung");
    fieldsHeader.push("Kreditlimit (Debitor)");
    fieldsHeader.push("Zahlungsbedingung");
    fieldsHeader.push("Fälligkeit in Tagen (Debitor)");
    fieldsHeader.push("Skonto in Prozent (Debitor)");
    fieldsHeader.push("Kreditoren-Ziel 1 Tg.");
    fieldsHeader.push("Kreditoren-Skonto 1 %");
    fieldsHeader.push("Kreditoren-Ziel 2 Tg.");
    fieldsHeader.push("Kreditoren-Skonto 2 %");
    fieldsHeader.push("Kreditoren-Ziel 3 Brutto Tg.");
    fieldsHeader.push("Kreditoren-Ziel 4 Tg.");
    fieldsHeader.push("Kreditoren-Skonto 4 %");
    fieldsHeader.push("Kreditoren-Ziel 5 Tg.");
    fieldsHeader.push("Kreditoren-Skonto 5 %");
    fieldsHeader.push("Mahnung");
    fieldsHeader.push("Kontoauszug");
    fieldsHeader.push("Mahntext 1");
    fieldsHeader.push("Mahntext 2");
    fieldsHeader.push("Mahntext 3");
    fieldsHeader.push("Kontoauszugstext");
    fieldsHeader.push("Mahnlimit Betrag");
    fieldsHeader.push("Mahnlimit %");
    fieldsHeader.push("Zinsberechnung");
    fieldsHeader.push("Mahnzinssatz 1");
    fieldsHeader.push("Mahnzinssatz 2");
    fieldsHeader.push("Mahnzinssatz 3");
    fieldsHeader.push("Lastschrift");
    fieldsHeader.push("Verfahren");
    fieldsHeader.push("Mandantenbank");
    fieldsHeader.push("Zahlungsträger");
    fieldsHeader.push("Indiv. Feld 1");
    fieldsHeader.push("Indiv. Feld 2");
    fieldsHeader.push("Indiv. Feld 3");
    fieldsHeader.push("Indiv. Feld 4");
    fieldsHeader.push("Indiv. Feld 5");
    fieldsHeader.push("Indiv. Feld 6");
    fieldsHeader.push("Indiv. Feld 7");
    fieldsHeader.push("Indiv. Feld 8");
    fieldsHeader.push("Indiv. Feld 9");
    fieldsHeader.push("Indiv. Feld 10");
    fieldsHeader.push("Indiv. Feld 11");
    fieldsHeader.push("Indiv. Feld 12");
    fieldsHeader.push("Indiv. Feld 13");
    fieldsHeader.push("Indiv. Feld 14");
    fieldsHeader.push("Indiv. Feld 15");
    fieldsHeader.push("Abweichende Anrede (Rechnungsadresse)");
    fieldsHeader.push("Adressart (Rechnungsadresse)");
    fieldsHeader.push("Straße (Rechnungsadresse)");
    fieldsHeader.push("Postfach (Rechnungsadresse)");
    fieldsHeader.push("Postleitzahl (Rechnungsadresse)");
    fieldsHeader.push("Ort (Rechnungsadresse)");
    fieldsHeader.push("Land (Rechnungsadresse)");
    fieldsHeader.push("Versandzusatz (Rechnungsadresse)");
    fieldsHeader.push("Adresszusatz (Rechnungsadresse)");
    fieldsHeader.push("Abw. Zustellbezeichnung 1 (Rechnungsadresse)");
    fieldsHeader.push("Abw. Zustellbezeichnung 2 (Rechnungsadresse)");
    fieldsHeader.push("Adresse Gültig von (Rechnungsadresse)");
    fieldsHeader.push("Adresse Gültig bis (Rechnungsadresse)");
    fieldsHeader.push("Bankleitzahl 6");
    fieldsHeader.push("Bankbezeichnung 6");
    fieldsHeader.push("Bank-Kontonummer 6");
    fieldsHeader.push("Länderkennzeichen 6");
    fieldsHeader.push("IBAN-Nr. 6");
    fieldsHeader.push("IBAN6 korrekt");
    fieldsHeader.push("SWIFT-Code 6");
    fieldsHeader.push("Abw. Kontoinhaber 6");
    fieldsHeader.push("Kennz. Hauptbankverb. 6");
    fieldsHeader.push("Bankverb 6 Gültig von");
    fieldsHeader.push("Bankverb 6 Gültig bis");
    fieldsHeader.push("Bankleitzahl 7");
    fieldsHeader.push("Bankbezeichnung 7");
    fieldsHeader.push("Bank-Kontonummer 7");
    fieldsHeader.push("Länderkennzeichen 7");
    fieldsHeader.push("IBAN-Nr. 7");
    fieldsHeader.push("IBAN7 korrekt");
    fieldsHeader.push("SWIFT-Code 7");
    fieldsHeader.push("Abw. Kontoinhaber 7");
    fieldsHeader.push("Kennz. Hauptbankverb. 7");
    fieldsHeader.push("Bankverb 7 Gültig von");
    fieldsHeader.push("Bankverb 7 Gültig bis");
    fieldsHeader.push("Bankleitzahl 8");
    fieldsHeader.push("Bankbezeichnung 8");
    fieldsHeader.push("Bank-Kontonummer 8");
    fieldsHeader.push("Länderkennzeichen 8");
    fieldsHeader.push("IBAN-Nr. 8");
    fieldsHeader.push("IBAN8 korrekt");
    fieldsHeader.push("SWIFT-Code 8");
    fieldsHeader.push("Abw. Kontoinhaber 8");
    fieldsHeader.push("Kennz. Hauptbankverb. 8");
    fieldsHeader.push("Bankverb 8 Gültig von");
    fieldsHeader.push("Bankverb 8 Gültig bis");
    fieldsHeader.push("Bankleitzahl 9");
    fieldsHeader.push("Bankbezeichnung 9");
    fieldsHeader.push("Bank-Kontonummer 9");
    fieldsHeader.push("Länderkennzeichen 9");
    fieldsHeader.push("IBAN-Nr. 9");
    fieldsHeader.push("IBAN9 korrekt");
    fieldsHeader.push("SWIFT-Code 9");
    fieldsHeader.push("Abw. Kontoinhaber 9");
    fieldsHeader.push("Kennz. Hauptbankverb. 9");
    fieldsHeader.push("Bankverb 9 Gültig von");
    fieldsHeader.push("Bankverb 9 Gültig bis");
    fieldsHeader.push("Bankleitzahl 10");
    fieldsHeader.push("Bankbezeichnung 10");
    fieldsHeader.push("Bank-Kontonummer 10");
    fieldsHeader.push("Länderkennzeichen 10");
    fieldsHeader.push("IBAN-Nr. 10");
    fieldsHeader.push("IBAN10 korrekt");
    fieldsHeader.push("SWIFT-Code 10");
    fieldsHeader.push("Abw. Kontoinhaber 10");
    fieldsHeader.push("Kennz. Hauptbankverb. 10");
    fieldsHeader.push("Bankverb 10 Gültig von");
    fieldsHeader.push("Bankverb 10 Gültig bis");
    fieldsHeader.push("Nummer Fremdsystem");

    return fieldsHeader;
}

/**
* The function getHeader return the header of the file
* according to datev rules for Buchungsstapel format
*/
function getHeader() {
    /* Beispiel 
    *  "EXTF";300;16;"Debitoren/Kreditoren";2;20120724064300472;;"SV";"Admin";"";29098;
    *  55003;20120101;4;;;"";"";;;;"";;;;
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
    // Debitoren-/Kreditoren = 16
    var field3 = "16";

    // Headr-Feld Nr. 4 Formatname
    // Länge:	 Typ:Text
    // vom Datev angegeben
    var field4 = "\"Debitoren/Kreditoren\"";

    // Headr-Feld Nr. 5 Formatversion
    // Länge:3 Typ:Zahl
    // vom Datev angegeben
    // Debitoren / Kreditoren = 2
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
    // Kleinste Sachkontenlänge = 5, Grösste Sachkontenlänge = 9
    // TODO: Dialog param
    var field14 = "5";

    // Die nachfolgenden Header-Felder sind ausschließlich für Buchungsstapel relevant

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
    var field17 = "\"\"";

    // Headr-Feld Nr. 18 Diktatkürzel
    // Länge:2 Typ:Text
    // Diktatkürzel Beispiel MM = Max Mustermann
    var field18 = "\"\"";

    // Headr-Feld Nr. 19 Buchungstyp
    // Länge: 1 Typ:Zahl
    // 1 = Finanzbuchhaltung, 2 = Jahresabschluss
    var field19 = "";

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
    var field22 = "\"\"";

    // Reservierte Felder
    var field23 = "";
    var field24 = "";
    var field25 = "";
    var field26 = "";

    return header = [[field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, field11, field12, field13, field14, field15, field16, field17, field18, field19, field20, field21, field22, field23, field24, field25, field26]];
}
/**
* Returns rows from table Extract
*/
function getExtractedRows(tableExtract, transactions) {

    if (tableExtract) {

        var line = [];
        var value = "";
        var firstname = "";
        var lastname = "";
        var company = "";

        for (i = 0; i < tableExtract.rowCount; i++) {

            // 1. Konto
            value = tableExtract.value(i, "Account");
            if (!value || !includeAccount(value))
                continue;
            line.push(value);

            // 2. Name (Adressattyp Unternehmen)
            value = tableExtract.value(i, "Company");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 3. Unternehmensgegenstand
            line.push(toTextFormat(""));

            // 4. Name (Adressattyp natürl. Person)
            lastname = tableExtract.value(i, "LastName");
            if (!lastname)
                lastname = "";
            line.push(toTextFormat(lastname));

            // 5. Vorname (Adressattyp natürl. Person)
            firstname = tableExtract.value(i, "FirstName");
            if (!firstname)
                firstname = "";
            line.push(toTextFormat(firstname));

            // 6. Name (Adressattyp keine Angabe)
            line.push(toTextFormat(""));

            // 7. Adressattyp
            if (firstname.length > 0 || lastname.length > 0) {
                line.push(toTextFormat("1"));
            }
            else if (company.length > 0) {
                line.push(toTextFormat("2"));
            }
            else {
                line.push(toTextFormat("0"));
            }

            // 8. Kurzbezeichnung
            line.push(toTextFormat(""));

            // 9. EU-Land
            line.push(toTextFormat(""));

            // 10. EU-UStID
            line.push(toTextFormat(""));

            // 11. Anrede
            value = tableExtract.value(i, "Salutation");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 12. Titel/Akad. Grad
            line.push(toTextFormat(""));

            // 13. Adelstitel
            line.push(toTextFormat(""));

            // 14. Namensvorsatz
            line.push(toTextFormat(""));

            // 15. Adressart
            line.push(toTextFormat(""));

            // 16. Strasse
            value = tableExtract.value(i, "Address1");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 17. Postfach
            line.push(toTextFormat(""));

            // 18. Postleitzahl
            value = tableExtract.value(i, "Zip");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 19. Ort
            value = tableExtract.value(i, "Town");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 20. Land
            value = tableExtract.value(i, "Country");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 21. Versandzusatz
            line.push(toTextFormat(""));

            // 22. Adresszusatz
            line.push(toTextFormat(""));

            // 23. Abweichende Anrede
            line.push(toTextFormat(""));

            // 24. Abw. Zustellbezeichnung 1
            line.push(toTextFormat(""));

            // 25. Abw. Zustellbezeichnung 2
            line.push(toTextFormat(""));

            // 26. Kennz. Korrespondenzadresse
            line.push("");

            // 27. Adresse Gültig von
            line.push("");

            // 28. Adresse Gültig bis
            line.push("");

            // 29. Telefon
            value = tableExtract.value(i, "Phone");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 30. Bemerkung (Telefon)
            line.push(toTextFormat(""));

            // 31. Telefon GL
            line.push(toTextFormat(""));

            // 32. Bemerkung (Telefon GL)
            line.push(toTextFormat(""));

            // 33. E-Mail
            value = tableExtract.value(i, "Email");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 34. Bemerkung (E-Mail)
            line.push(toTextFormat(""));

            // 35. Internet
            value = tableExtract.value(i, "Www");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 36. Bemerkung (Internet)
            line.push(toTextFormat(""));

            // 37. Fax
            value = tableExtract.value(i, "Fax");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            // 38. Bemerkung (Fax)
            line.push(toTextFormat(""));

            // 39. Sonstige
            line.push(toTextFormat(""));

            // 40. Bemerkung (Sonstige)
            value = tableExtract.value(i, "Notes");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            //41. Bankleitzahl
            line.push(toTextFormat(""));

            //42. Bankbezeichnung
            value = tableExtract.value(i, "BankName");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            //43. Bank-Kontonummer
            value = tableExtract.value(i, "BankAccount");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            //44. Länderkennzeichen
            line.push(toTextFormat(""));

            //45. IBAN-Nr.
            value = tableExtract.value(i, "BankClearing");
            if (!value)
                value = "";
            line.push(toTextFormat(value));

            //46. IBAN korrekt
            line.push(toTextFormat(""));

            //47. SWIFT-Code
            line.push(toTextFormat(""));

            //48. Abw. Kontoinhaber
            line.push(toTextFormat(""));

            //49. Kennz. Hauptbankverb.
            line.push("");

            //50. Bankverb Gültig von
            line.push("");

            //51. Bankverb Gültig bis
            line.push("");

            //52. bis 95.
            for (j = 0; j <= 3; j++) {
                //Bankleitzahl
                line.push(toTextFormat(""));

                //Bankbezeichnung
                line.push(toTextFormat(""));

                //Bank-Kontonummer
                line.push("");

                //Länderkennzeichen
                line.push(toTextFormat(""));

                //IBAN-Nr.
                line.push(toTextFormat(""));

                //IBAN korrekt
                line.push(toTextFormat(""));

                //SWIFT-Code "
                line.push(toTextFormat(""));

                //Abw. Kontoinhaber "
                line.push(toTextFormat(""));

                //Kennz. Hauptbankverb.
                line.push("");

                //Bankverb Gültig von
                line.push("");

                //Bankverb Gültig bis
                line.push("");
            }

            // 96. Leerfeld
            line.push("");

            // 97. Briefanrede
            line.push(toTextFormat(""));

            // 98. Grussformel
            line.push(toTextFormat(""));

            // 99. Kundennummer
            line.push(toTextFormat(""));

            // 100. Steuernummer
            line.push(toTextFormat(""));

            // 101. Sprache
            line.push("");

            // 102. Ansprechpartner
            line.push(toTextFormat(""));

            // 103. Vertreter
            line.push(toTextFormat(""));

            // 104. Sachbearbeiter
            line.push(toTextFormat(""));

            // 105. Diverse-Konto
            line.push("");

            // 106. Ausgabeziel
            line.push("");

            // 107. Währungssteuerung
            line.push("");

            // 108. Kreditlimit (Debitor)
            line.push("");

            // 109. Zahlungsbedingung
            line.push("");

            // 110. Fälligkeit in Tagen (Debitor)
            line.push("");

            // 111. Skonto in Prozent (Debitor)
            line.push("");

            // 112. Kreditoren-Ziel 1 Tg.
            line.push("");

            // 113. Kreditoren-Skonto 1 %
            line.push("");

            // 114. Kreditoren-Ziel 2 Tg.
            line.push("");

            // 115. Kreditoren-Skonto 2 %
            line.push("");

            // 116. Kreditoren-Ziel 3 Brutto Tg.
            line.push("");

            // 117. Kreditoren-Ziel 4 Tg.
            line.push("");

            // 118. Kreditoren-Skonto 4 %
            line.push("");

            // 119. Kreditoren-Ziel 5 Tg.
            line.push("");

            // 120. Kreditoren-Skonto 5 %
            line.push("");

            // 121. Mahnung
            line.push("");

            // 122. Kontoauszug
            line.push("");

            // 123. Mahntext 1
            line.push("");

            // 124. Mahntext 2
            line.push("");

            // 125. Mahntext 3
            line.push("");

            // 126. Kontoauszugstext
            line.push("");

            // 127. Mahnlimit Betrag
            line.push("");

            // 128. Mahnlimit %
            line.push("");

            // 129. Zinsberechnung
            line.push("");

            // 130. Mahnzinssatz 1
            line.push("");

            // 131. Mahnzinssatz 2
            line.push("");

            // 132. Mahnzinssatz 3
            line.push("");

            // 133. Lastschrift
            line.push(toTextFormat(""));

            // 134. Verfahren
            line.push(toTextFormat(""));

            // 135. Mandantenbank
            line.push("");

            // 136. Zahlungsträger
            line.push(toTextFormat(""));

            // 137. Indiv. Feld 1
            line.push(toTextFormat(""));

            // 138. Indiv. Feld 2
            line.push(toTextFormat(""));

            // 139. Indiv. Feld 3
            line.push(toTextFormat(""));

            // 140. Indiv. Feld 4
            line.push(toTextFormat(""));

            // 141. Indiv. Feld 5
            line.push(toTextFormat(""));

            // 142. Indiv. Feld 6
            line.push(toTextFormat(""));

            // 143. Indiv. Feld 7
            line.push(toTextFormat(""));

            // 144. Indiv. Feld 8
            line.push(toTextFormat(""));

            // 145. Indiv. Feld 9
            line.push(toTextFormat(""));

            // 146. Indiv. Feld 10
            line.push(toTextFormat(""));

            // 147. Indiv. Feld 11
            line.push(toTextFormat(""));

            // 148. Indiv. Feld 12
            line.push(toTextFormat(""));

            // 149. Indiv. Feld 13
            line.push(toTextFormat(""));

            // 150. Indiv. Feld 14
            line.push(toTextFormat(""));

            // 151. Indiv. Feld 15
            line.push(toTextFormat(""));

            // 152. Abweichende Anrede (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 153. Adressart (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 154. Straße (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 155. Postfach (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 156. Postleitzahl (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 157. Ort (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 158. Land (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 159. Versandzusatz (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 160. Adresszusatz (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 161. Abw. Zustellbezeichnung 1 (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 162. Abw. Zustellbezeichnung 2 (Rechnungsadresse)
            line.push(toTextFormat(""));

            // 163. Adresse Gültig von (Rechnungsadresse)
            line.push("");

            // 164. Adresse Gültig bis (Rechnungsadresse)
            line.push("");

            // 165. Bankleitzahl 6
            line.push(toTextFormat(""));

            // 166. Bankbezeichnung 6
            line.push(toTextFormat(""));

            // 167. Bank-Kontonummer 6
            line.push("");

            // 168. Länderkennzeichen 6
            line.push(toTextFormat(""));

            // 169. IBAN-Nr. 6
            line.push(toTextFormat(""));

            // 170. IBAN6 korrekt
            line.push(toTextFormat(""));

            // 171. SWIFT-Code 6
            line.push(toTextFormat(""));

            // 172. Abw. Kontoinhaber 6
            line.push(toTextFormat(""));

            // 173. Kennz. Hauptbankverb. 6
            line.push("");

            // 174. Bankverb 6 Gültig von
            line.push("");

            // 175. Bankverb 6 Gültig bis
            line.push("");

            // 176. Bankleitzahl 7
            line.push(toTextFormat(""));

            // 177. Bankbezeichnung 7
            line.push(toTextFormat(""));

            // 178. Bank-Kontonummer 7
            line.push("");

            // 179. Länderkennzeichen 7
            line.push(toTextFormat(""));

            // 180. IBAN-Nr. 7
            line.push(toTextFormat(""));

            // 181. IBAN7 korrekt
            line.push(toTextFormat(""));

            // 182. SWIFT-Code 7
            line.push(toTextFormat(""));

            // 183. Abw. Kontoinhaber 7
            line.push(toTextFormat(""));

            // 184. Kennz. Hauptbankverb. 7
            line.push("");

            // 185. Bankverb 7 Gültig von
            line.push("");

            // 186. Bankverb 7 Gültig bis
            line.push("");

            // 187. Bankleitzahl 8
            line.push(toTextFormat(""));

            // 188. Bankbezeichnung 8
            line.push(toTextFormat(""));

            // 189. Bank-Kontonummer 8
            line.push("");

            // 190. Länderkennzeichen 8
            line.push(toTextFormat(""));

            // 191. IBAN-Nr. 8
            line.push(toTextFormat(""));

            // 192. IBAN8 korrekt
            line.push(toTextFormat(""));

            // 193. SWIFT-Code 8
            line.push(toTextFormat(""));

            // 194. Abw. Kontoinhaber 8
            line.push(toTextFormat(""));

            // 195. Kennz. Hauptbankverb. 8
            line.push("");

            // 196. Bankverb 8 Gültig von
            line.push("");

            // 197. Bankverb 8 Gültig bis
            line.push("");

            // 198. Bankleitzahl 9
            line.push(toTextFormat(""));

            // 199. Bankbezeichnung 9
            line.push(toTextFormat(""));

            // 200. Bank-Kontonummer 9
            line.push("");

            // 201. Länderkennzeichen 9
            line.push(toTextFormat(""));

            // 202. IBAN-Nr. 9
            line.push(toTextFormat(""));

            // 203. IBAN9 korrekt
            line.push(toTextFormat(""));

            // 204. SWIFT-Code 9
            line.push(toTextFormat(""));

            // 205. Abw. Kontoinhaber 9
            line.push(toTextFormat(""));

            // 206. Kennz. Hauptbankverb. 9
            line.push("");

            // 207. Bankverb 9 Gültig von
            line.push("");

            // 208. Bankverb 9 Gültig bis
            line.push("");

            // 209. Bankleitzahl 10
            line.push(toTextFormat(""));

            // 210. Bankbezeichnung 10
            line.push(toTextFormat(""));

            // 211. Bank-Kontonummer 10
            line.push("");

            // 212. Länderkennzeichen 10
            line.push(toTextFormat(""));

            // 213. IBAN-Nr. 10
            line.push(toTextFormat(""));

            // 214. IBAN10 korrekt
            line.push(toTextFormat(""));

            // 215. SWIFT-Code 10
            line.push(toTextFormat(""));

            // 216. Abw. Kontoinhaber 10
            line.push(toTextFormat(""));

            // 217. Kennz. Hauptbankverb. 10
            line.push("");

            // 218. Bankverb 10 Gültig von
            line.push("");

            // 219. Bankverb 10 Gültig bis
            line.push("");

            // 220. Nummer Fremdsystem
            line.push(toTextFormat(""));


            transactions.push(line);
            line = [];
            value = "";
            firstname = "";
            lastname = "";
            company = "";
        }
    }
    return transactions;
}

/**
* Check if the accountNumber is a valid customer/supplier account number
*/
function includeAccount(accountNumber) {
    accountNumber = parseInt(accountNumber);

    //customers numbers between 10000 and 69999
    //suppliers numbers between 70000 and 99999
    if (param["debitorenkontoSelected"] == "true" && accountNumber.between(10000, 69999)) {
        if (parseInt(param["debitorenvonkonto"]) > parseInt(param["debitorenbiskonto"])) {
            var temp = param["debitorenbiskonto"];
            param["debitorenbiskonto"] = param["debitorenvonkonto"];
            param["debitorenvonkonto"] = temp;
        }

        if (accountNumber < parseInt(param["debitorenvonkonto"]) || accountNumber > parseInt(param["debitorenbiskonto"]))
            return false;
        else
            return true;
    }

    if (param["kreditorenkontoSelected"] == "true" && accountNumber.between(70000, 99999)) {
        if (parseInt(param["kreditorenvonkonto"]) > parseInt(param["kreditorenbiskonto"])) {
            var temp = param["kreditorenbiskonto"];
            param["kreditorenbiskonto"] = param["kreditorenvonkonto"];
            param["kreditorenvonkonto"] = temp;
        }

        if (accountNumber < parseInt(param["kreditorenvonkonto"]) || accountNumber > parseInt(param["kreditorenbiskonto"]))
            return false;
        else
            return true;
    }

    return true;
}

/**
* Initialize dialog values with default values
*/
function initParam() {
    param = { "mandanten": "",
        "berater": "",
        "kontenzuordnungSelected": "false",
        "debitorengruppe": "",
        "debitorenkontoSelected": "false",
        "debitorenvonkonto": "10000",
        "debitorenbiskonto": "69999",
        "kreditorengruppe": "",
        "kreditorenkontoSelected": "false",
        "kreditorenvonkonto": "70000",
        "kreditorenbiskonto": "99999"
    };
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

