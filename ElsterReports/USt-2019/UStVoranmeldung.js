// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.de.elster_USt_Vornamedlung_ab_2019
// @api = 1.0
// @pubdate = 2025-06-11
// @publisher = Banana.ch SA
// @description = Elster Umsatzsteuer Voranmeldung ab 2019
// @task = app.command
// @doctype = 100.110;110.110;130.110;100.130
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1


var param = {};

/* Main function */
function exec(inData, options) {

    //Check the version of Banana. If < than 9.0.4 the script does not start
    var requiredVersion = "9.0.4";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {

        var dateform = null;
        if (options && options.useLastSettings) {
            dateform = getScriptSettings(Banana.document);
        } else {
            dateform = settingsDialog();
        }

        if (!dateform || !Banana.document) {
            return;
        }

        //Create the VAT report
        var report = createVatReport(Banana.document, dateform.selectionStartDate, dateform.selectionEndDate);

        //Add styles and print the report
        var stylesheet = createStyleSheet();
        Banana.Report.preview(report, stylesheet);

    }
}

/* This function adds a Footer to the report */
function addFooter(report) {
    var date = new Date();
    var d = Banana.Converter.toLocaleDateFormat(date);
    report.getFooter().addClass("footer");
    var textfield = report.getFooter().addText(d + " - ");
    if (textfield.excludeFromTest) {
        textfield.excludeFromTest();
    }
    report.getFooter().addFieldPageNr();
}

/* This function adds an Header to the report */
function addHeader(report) {
    var pageHeader = report.getHeader();
    pageHeader.addClass("header");
    pageHeader.addParagraph(param.title, "heading");
    pageHeader.addParagraph(param.version, "");
    pageHeader.addParagraph(" ", "");
    pageHeader.addParagraph("Elster Umsatzsteuer-Voranmeldung", "h1");

    if (param.headerLeft) {
        pageHeader.addParagraph(param.headerLeft, "bold");
    }
    if (param.vatNumber) {
        pageHeader.addParagraph("Steuernummer: " + param.vatNumber, "bold");
    }

    pageHeader.addParagraph("Periode: " + Banana.Converter.toLocaleDateFormat(param.startDate) + " - " + Banana.Converter.toLocaleDateFormat(param.endDate), "bold");
    pageHeader.addParagraph(" ", "");

}

/* The purpose of this function is to check if an array contains the given value */
function arrayContains(array, value) {
    if (!array || !value)
        return false;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === value) {
            return true;
        }
    }
    return false;
}

/* Function that creates all the styles used to print the report */
function createStyleSheet() {
    var stylesheet = Banana.Report.newStyleSheet();

    stylesheet.addStyle("@page", "margin:10mm 10mm 10mm 10mm;")
    stylesheet.addStyle("body", "font-family:Helvetica; font-size:8pt");
    stylesheet.addStyle(".headerStyle", "background-color:#E0EFF6; text-align:center; font-weight:bold;");
    stylesheet.addStyle(".bold", "font-weight:bold;");
    stylesheet.addStyle(".right", "text-align:right;");
    stylesheet.addStyle(".center", "text-align:center;");
    stylesheet.addStyle(".h1", "font-size:14pt;font-weight:bold;padding-bottom: 10px;");
    stylesheet.addStyle(".heading", "font-weight:bold; font-size:16pt; text-align:left");
    stylesheet.addStyle(".footer", "text-align:center; font-size:8px; font-family:Courier New;");
    stylesheet.addStyle(".horizontalLine", "border-top:1px solid orange");
    stylesheet.addStyle(".borderLeft", "border-left:thin solid orange");
    stylesheet.addStyle(".borderTop", "border-top:thin solid orange");
    stylesheet.addStyle(".borderRight", "border-right:thin solid orange");
    stylesheet.addStyle(".borderBottom", "border-bottom:thin solid orange");
    stylesheet.addStyle(".dataCell", "background-color:#FFEFDB");
    stylesheet.addStyle(".orange", "color:orange;");
    stylesheet.addStyle(".red", "color:red;");
    stylesheet.addStyle(".underline", "text-decoration:underline;");
    stylesheet.addStyle(".instructions", "background-color:#eeeeee");
    stylesheet.addStyle(".italic", "font-style:italic;");

    /* Table */
    var tableStyle = stylesheet.addStyle("table.codes");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle(".col1", "width:64%");
    stylesheet.addStyle(".col2", "width:3%");
    stylesheet.addStyle(".col3", "width:15%");
    stylesheet.addStyle(".col4", "width:3%");
    stylesheet.addStyle(".col5", "width:15%");
    stylesheet.addStyle("table td", "padding-bottom: 2px; padding-top: 3px");
    stylesheet.addStyle("table td", "border:thin solid black;");
    stylesheet.addStyle("table td.amount", "text-align:right;");
    stylesheet.addStyle(".noBorder", "border:0ox solid white;");
    stylesheet.addStyle("table td.headerRow", "font-size:10pt;font-weight:bold;padding-top: 8px;padding-bottom: 4px;");
    stylesheet.addStyle("table td.total", "padding-top: 5px;padding-bottom: 5px;");

    var summaryStyle = stylesheet.addStyle("table.summary");
    summaryStyle.setAttribute("width", "100%");
    summaryStyle.setAttribute("margin-top", "50px");
    summaryStyle.setAttribute("border", "none");
    stylesheet.addStyle(".summaryCol1", "width:65%");
    stylesheet.addStyle(".summaryCol2", "width:5%");
    stylesheet.addStyle(".summaryCol3", "width:5%");
    stylesheet.addStyle(".summaryCol4", "width:25%");

    return stylesheet;
}

/* Function that creates and prints the report */
function createVatReport(banDoc, startDate, endDate) {

    if (!banDoc)
        return null;

    /* 1) Load parameters and texts */
    loadParam(banDoc, startDate, endDate);

    /* 2) Load vat amounts */
    loadData(banDoc);

    /* 3) Create the report */
    var report = Banana.Report.newReport(param.reportName);
    var table = report.addTable("codes");
    var col1 = table.addColumn("col1");
    var col2 = table.addColumn("col2");
    var col3 = table.addColumn("col3");
    var col4 = table.addColumn("col4");
    var col5 = table.addColumn("col5");

    var headerRow = table.getHeader().addRow();
    headerRow.addCell("Beschreibung", "bold");
    headerRow.addCell("Kz.", "bold amount");
    headerRow.addCell("Bemessungs-grundlage (Euro)", "bold amount");
    headerRow.addCell("Kz.", "bold amount");
    headerRow.addCell("Steuer (Euro, Cent)", "bold amount");

    var totals = {};

    //Title
    var title = "Steuerfreie Umsätze mit Vorsteuerabzug";
    table.addRow().addCell(title, "headerRow", 5);

    createVatReportAddRow(banDoc, "41;ZM", "IgL (§ 4 Nr. 1b UStG) an Abnehmer mit USt-ID (ZM)", table, totals);
    createVatReportAddRow(banDoc, "44", "IgL (§ 4 Nr. 1b UStG) neuer Fahrzeuge an Abnehmer ohne USt-ID", table, totals);
    createVatReportAddRow(banDoc, "49", "IgL (§ 4 Nr. 1b UStG) neuer Fahrzeuge außerhalb eines Unternehmens (§ 2a UStG)", table, totals);

	title = "Weitere steuerfreie Umsätze mit Vorsteuerabzug";
    table.addRow().addCell(title, "headerRow", 5);

    createVatReportAddRow(banDoc, "43", "z. B. Ausfuhrlieferungen, Umsätze nach § 4 Nr. 2 bis 7 UStG", table, totals);

	title = "Steuerfreie Umsätze ohne Vorsteuerabzug";
    table.addRow().addCell(title, "headerRow", 5);

    createVatReportAddRow(banDoc, "48", "z. B. Umsätze nach § 4 Nr. 8 bis 28 UStG", table, totals);

	title = "Steuerpflichtige Umsätze";
    table.addRow().addCell(title, "headerRow", 5);

	createVatReportAddRow(banDoc, "81;81", "zum Steuersatz von 19%", table, totals);
	createVatReportAddRow(banDoc, "86;86", "zum Steuersatz von 7%", table, totals);
	createVatReportAddRow(banDoc, "35;36", "zu anderen Steuersätzen", table, totals);

    title = "Steuerfreie IgE";
    table.addRow().addCell(title, "headerRow", 5);

	createVatReportAddRow(banDoc, "91", "Erwerbe nach §§ 4b und 25c UStG", table, totals);

    title = "Steuerpflichtige IgE";
    table.addRow().addCell(title, "headerRow", 5);

    createVatReportAddRow(banDoc, "89;89", "zum Steuersatz von 19%", table, totals);
	createVatReportAddRow(banDoc, "93;93", "zum Steuersatz von 7%", table, totals); 
	createVatReportAddRow(banDoc, "95;98", "zu anderen Steuersätzen", table, totals);
	createVatReportAddRow(banDoc, "94;96", "neuer Fahrzeuge (§ 1b Abs. 2 und 3 UStG) von Lieferern ohne USt-ID zum allgemeinen Steuersatz", table, totals); 

    title = "Ergänzende Angaben zu Umsätzen";
    table.addRow().addCell(title, "headerRow", 5);

    createVatReportAddRow(banDoc, "42;ZM", "Lieferungen des ersten Abnehmers bei innergemeinschaftlichen Dreiecksgeschäften (§ 25b UStG) (ZM)", table, totals);
	createVatReportAddRow(banDoc, "60", "Steuerpflichtige Umsätze, für die der Leistungsempfänger die Steuer nach § 13b Abs. 5 UStG schuldet", table, totals);
	createVatReportAddRow(banDoc, "21;ZM", "Nicht steuerbare sonstige Leistungen gemäß § 18b Satz 1 Nr. 2 UStG (ZM)", table, totals);
	createVatReportAddRow(banDoc, "45", "Übrige nicht steuerbare Umsätze (Leistungsort nicht im Inland)", table, totals);

    title = "Leistungsempfänger als Steuerschuldner (§ 13b UStG)";
    table.addRow().addCell(title, "headerRow", 5);

    createVatReportAddRow(banDoc, "46;47", "Steuerpflichtige sonstige Leistungen eines im übrigen Gemeinschaftsgebiet ansässigen Unternehmers (§ 13b Abs. 1 UStG)", table, totals);
	createVatReportAddRow(banDoc, "73;74", "Umsätze, die unter das GrEStG fallen (§ 13b Abs. 2 Nummer 3 UStG)", table, totals);
	createVatReportAddRow(banDoc, "84;85", "Andere Leistungen (§ 13b Abs. 2 Nr. 1, 2, 4 bis 11 UStG)", table, totals);

    title = "Vorsteuerbeträge, Einfuhrumsatzsteuer, Berichtigung des Vorsteuerabzugs";
    table.addRow().addCell(title, "headerRow", 5);

    createVatReportAddRow(banDoc, "66", "Vorsteuerbeträge aus Rechnungen von anderen Unternehmern (§ 15 Abs. 1 Satz 1 Nr. 1 UStG), aus Leistungen i.S.d. § 13a Abs. 1 Nr. 6 UStG (§ 15 Abs. 1 Satz 1 Nr. 5 UStG) und aus innergemeinschaftlichen Dreiecksgeschäften (§ 25b Abs. 5 UStG)", table, totals); 
	createVatReportAddRow(banDoc, "61", "Vorsteuerbeträge aus dem innergemeinschaftlichen Erwerb von Gegenständen (§ 15 Absatz 1 Satz 1 Nummer 3 UStG)", table, totals);
	createVatReportAddRow(banDoc, "62", "Entstandene Einfuhrumsatzsteuer (§ 15 Absatz 1 Satz 1 Nummer 2 UStG)", table, totals);
	createVatReportAddRow(banDoc, "67", "Vorsteuerbeträge aus Leistungen i.S.d. § 13b UStG (§ 15 Abs. 1 Satz 1 Nr. 4 UStG)", table, totals);
	createVatReportAddRow(banDoc, "63", "Vorsteuerbeträge, die nach allg. Durchschnittssätzen berechnet sind (§§ 23 und 23a UStG)", table, totals);
	createVatReportAddRow(banDoc, "64", "Berichtigung des Vorsteuerabzugs (§ 15a UStG)", table, totals);
	createVatReportAddRow(banDoc, "59", "Vorsteuerabzug für IgL neuer Fahrzeuge außerhalb eines Unternehmens (§ 2a UStG) sowie von Kleinunternehmern i.S.d. § 19 Abs. 1 UStG (§ 15 Abs. 4a UStG)", table, totals);

	//Create summary table
	report.addPageBreak();
	createVatReportSummary(banDoc, report, totals);
    
	//Add Header and footer
    addHeader(report);
	addFooter(report);
    
	return report;
}

function createVatReportAddRow(banDoc, code, description, table, totals) {

    if (!banDoc || code.length<=0)
        return;

    var group = "";
    for (var cntGroup in param.gr2List) {
        for (var i = 0; i < param.gr2List[cntGroup].length; i++) {
            if (param.gr2List[cntGroup][i] == code) {
                group = cntGroup;
                break;
            }
        }
    }
    
    var gr = [];
    gr.push(group);
    var gr2 = [];
    gr2.push(code);
    var vatCodes = findVatCodes(banDoc, gr, gr2);
    var vatAmounts = banDoc.vatCurrentBalance(vatCodes.join("|"), param.startDate, param.endDate);
    
    /*var debugPrint = false;
    if (!Banana.SDecimal.isZero(vatAmounts.vatAmount) || !Banana.SDecimal.isZero(vatAmounts.vatPosted) || !Banana.SDecimal.isZero(vatAmounts.vatTaxable)) {
        Banana.console.debug("*** gr2: " + gr2.join(", ") + " ***");
        Banana.console.debug("*** vat codes: " + vatCodes.join(", ") + " ***");
        Banana.console.debug("vatTaxable: " + vatAmounts.vatTaxable + ", vatPosted: " + vatAmounts.vatPosted + " ,vatAmount: " + vatAmounts.vatAmount + " ,vatNotDeductible: " + vatAmounts.vatNotDeductible);
        debugPrint = true;
    }*/

    var vatAmountCol1 = "";
    var vatAmountCol2 = "";
    var vatAmountCol3 = "";
    var gr2List = code.split(";");
    var code1 = "";
    var code2 = "";
    if (gr2List.length > 0) {
        if (gr2List[0] == "ZM") {
            vatAmountCol3 = vatAmounts.vatTaxable;
        }
        else {
            code1 = gr2List[0];
            if (group == "4" || group == "5") {
                vatAmountCol2 = vatAmounts.vatPosted;
                if (group == "5")
                    vatAmountCol2 = Banana.SDecimal.invert(vatAmountCol2);
            }
            else {
                vatAmountCol1 = vatAmounts.vatTaxable;
                vatAmountCol1 = Banana.SDecimal.invert(vatAmountCol1);
            }
        }
    }
    if (gr2List.length > 1) {
        if (gr2List[1] == "ZM") {
            vatAmountCol3 = vatAmounts.vatPosted;
        }
        else {
            code2 = gr2List[1];
            vatAmountCol2 = vatAmounts.vatPosted;
            if (group == "1" || group == "2" || group == "3" || group == "0")
                vatAmountCol2 = Banana.SDecimal.invert(vatAmountCol2);
        }
    }

    if (!totals[group])
        totals[group] = {};
    totals[group].vatTaxable = Banana.SDecimal.add(totals[group].vatTaxable, vatAmountCol1);
    totals[group].vatPosted = Banana.SDecimal.add(totals[group].vatPosted, vatAmountCol2);
    totals[group].vatZM = Banana.SDecimal.add(totals[group].vatZM, vatAmountCol3);

    if (!totals["_tot_"])
        totals["_tot_"] = {};
    totals["_tot_"].vatTaxable = Banana.SDecimal.add(totals["_tot_"].vatTaxable, totals[group].vatTaxable);
    totals["_tot_"].vatPosted = Banana.SDecimal.add(totals["_tot_"].vatPosted, totals[group].vatPosted);
    totals["_tot_"].vatZM = Banana.SDecimal.add(totals["_tot_"].vatZM, totals[group].vatZM);

    var tableRow = table.addRow();
    tableRow.addCell(description, "description", 1);
    tableRow.addCell(code1, "amount");
    tableRow.addCell(formatNumber(vatAmountCol1), "amount", 1);
    tableRow.addCell(code2, "amount");
    tableRow.addCell(formatNumber(vatAmountCol2), "amount", 1);

    /*if (debugPrint) {
        for (var key in totals) { 
            Banana.console.debug("[" + key + "] vatTaxable: " + totals[key].vatTaxable + " vatPosted: " + totals[key].vatPosted + " vatZM: " + totals[key].vatZM);
        }
    }*/

}

function createVatReportSummary(banDoc, report, totals) {
    if (!banDoc)
        return;

    var table = report.addTable("summary");
    var col1 = table.addColumn("summaryCol1");
    var col2 = table.addColumn("summaryCol2");
    var col3 = table.addColumn("summaryCol3");
    var col4 = table.addColumn("summaryCol4");
    
    //Header Berechnungen aus
    createVatReportSummaryHeader("Berechnungen aus", table);

    //Row 30
    var vatPosted = "";
    if (totals["1"])
        vatPosted = totals["1"].vatPosted;
    var sum = vatPosted;
    var tableRow = table.addRow();
    tableRow.addCell("(Z30) Steuerpflichtige Umsätze (Summe)", "description", 1);
    tableRow.addCell("", "description", 1);
    tableRow.addCell("", "amount", 1);
    tableRow.addCell(formatNumber(vatPosted), "amount", 1);

    //Row 36
    vatPosted = "";
    if (totals["2"])
        vatPosted = totals["2"].vatPosted;
    sum = Banana.SDecimal.add(sum, vatPosted);
    tableRow = table.addRow();
    tableRow.addCell("(Z36) Innergemeinschaftliche Erwerbe (Summe)", "description", 1);
    tableRow.addCell("", "description", 1);
    tableRow.addCell("+", "amount", 1);
    tableRow.addCell(formatNumber(vatPosted), "amount", 1);

    //Row 51
    vatPosted = "";
    if (totals["3"])
        vatPosted = totals["3"].vatPosted;
    sum = Banana.SDecimal.add(sum, vatPosted);
    tableRow = table.addRow();
    tableRow.addCell("(Z51) Leistungsempfänger geschuldete Umsatzsteuer (Summe)", "description", 1);
    tableRow.addCell("", "description", 1);
    tableRow.addCell("+", "amount", 1);
    tableRow.addCell(formatNumber(vatPosted), "amount", 1);

    //Row 51
    // "1" + "2" + "3"
    tableRow = table.addRow();
    tableRow.addCell("(Z51) Aufsummierung Umsatzsteuer (Summe)", "description", 1);
    tableRow.addCell("", "description", 1);
    tableRow.addCell("=", "amount", 1);
    tableRow.addCell(formatNumber(sum), "amount", 1);

    //Row 60
    vatPosted = "";
    if (totals["4"])
        vatPosted = totals["4"].vatPosted;
    sum = Banana.SDecimal.subtract(sum, vatPosted);
    tableRow = table.addRow();
    tableRow.addCell("(Z60) abziehbare Vorsteuer (Summe)", "description", 1);
    tableRow.addCell("", "description", 1);
    tableRow.addCell("-", "amount", 1);
    tableRow.addCell(formatNumber(vatPosted), "amount", 1);

    //Row 60
    // "1" + "2" + "3" + "4"
    tableRow = table.addRow();
    tableRow.addCell("(Z60) verbleibender Betrag (Steuer)", "description", 1);
    tableRow.addCell("", "description", 1);
    tableRow.addCell("=", "amount", 1);
    tableRow.addCell(formatNumber(sum), "amount", 1);

    //Header Andere Steuerbeträge
    createVatReportSummaryHeader("Andere Steuerbeträge", table);

    //Row 62
    // "5"
    var vatCodes = findVatCodes(banDoc, [], ["65"]);
    vatAmounts = banDoc.vatCurrentBalance(vatCodes.join("|"), param.startDate, param.endDate);
    vatAmounts.vatPosted = Banana.SDecimal.invert(vatAmounts.vatPosted);
    sum = Banana.SDecimal.add(sum, vatAmounts.vatPosted);
    tableRow = table.addRow();
    tableRow.addCell("Steuer infolge Wechsel der Besteuerungsform sowie Nachsteuer auf verteuerte Anzahlungen und ähnlichem egen Steuersatzänderung", "description", 1);
    tableRow.addCell("65", "description amount", 1);
    tableRow.addCell("", "amount", 1);
    tableRow.addCell(formatNumber(vatAmounts.vatPosted), "amount", 1);

    //Row 63
    // "5"
    vatCodes = findVatCodes(banDoc, [], ["69"]);
    vatAmounts = banDoc.vatCurrentBalance(vatCodes.join("|"), param.startDate, param.endDate);
    vatAmounts.vatPosted = Banana.SDecimal.invert(vatAmounts.vatPosted);
    sum = Banana.SDecimal.add(sum, vatAmounts.vatPosted);
    tableRow = table.addRow();
    tableRow.addCell("In Rechnungen unrichtig oder unberechtigt ausgewiesene Seuerbeträge (§ 14c UStG) sowie Steuerbeträge, die nach § 6a Absatz 4 Satz 2, § 17 Absatz 1 Satz 6, § 2rb Absatz 2 UStG oder von einem Auslagerer oder Lagehalter nach § 13a Absatz 1 Nummer 6 UStG geschuldet werden", "description", 1);
    tableRow.addCell("69", "description amount", 1);
    tableRow.addCell("+", "amount", 1);
    tableRow.addCell(formatNumber(vatAmounts.vatPosted), "amount", 1);

    //Row 64
    tableRow = table.addRow();
    tableRow.addCell("(Z64) Umsatzsteuer-Vorauszahlung / Überschuss (Steuer)", "description", 1);
    tableRow.addCell("", "description", 1);
    tableRow.addCell("=", "amount", 1);
    tableRow.addCell(formatNumber(sum), "amount", 1);

    //Row 65
    vatCodes = findVatCodes(banDoc, [], ["39"]);
    vatAmounts = banDoc.vatCurrentBalance(vatCodes.join("|"), param.startDate, param.endDate);
    sum = Banana.SDecimal.subtract(sum, vatAmounts.vatPosted);
    tableRow = table.addRow();
    tableRow.addCell("Abzug der festgesetzten Sondervorauszahlung für Dauerverlängerung (in der Regel nur in denr letzten Voranmeldung des Besteuerungszeitraums auszufüllen)", "description", 1);
    tableRow.addCell("39", "description amount", 1);
    tableRow.addCell("-", "amount", 1);
    tableRow.addCell(formatNumber(vatAmounts.vatPosted), "amount", 1);

    //Header Verbleibende Umsatzsteuer-Vorauszahlung
    createVatReportSummaryHeader("Verbleibende Umsatzsteuer-Vorauszahlung, Verbleibender Überschuss", table);

    //Row 66
    tableRow = table.addRow();
    tableRow.addCell("(Z66) Verbleibende Umsatzsteuer-Vorauszahlung beziehungsweise verbleibender Überschuss", "description", 1);
    tableRow.addCell("83", "description amount", 1);
    tableRow.addCell("=", "amount", 1);
    tableRow.addCell(formatNumber(sum), "amount", 1);

    //Row 66
    /*tableRow = table.addRow();
    tableRow.addCell("Manuelle Berechnung: Verbleibende Umsatzsteuer-Vorauszhalung beziehungsweise verbleibender Überschuss", "description", 1);
    tableRow.addCell("66", "description", 1);
    tableRow.addCell("=", "amount", 1);
    tableRow.addCell("", "amount", 1);*/

    //Checksum with banana vatReport and vatcodes that have an amount but they are not printed in this report
    //Checksum with vatTaxable
    var vatCodesList = [];
    var tableVatReport = banDoc.vatReport(param.startDate, param.endDate);
    for (var rowNr = 0; rowNr < tableVatReport.rowCount; rowNr++) {
        var rowValueGroup = tableVatReport.value(rowNr, "Group").toString();
        var rowValueVatPosted = tableVatReport.value(rowNr, "VatPosted").toString();
        if (rowValueGroup.startsWith("_c_") && !Banana.SDecimal.isZero(rowValueVatPosted)) {
            var vatCode = rowValueGroup.substring(3);
            vatCodesList.push(vatCode);
        }
    }

    var totalRow = tableVatReport.findRowByValue("Group", "_tot_");
    vatPosted = totalRow.value("VatPosted");
    vatPosted = Banana.SDecimal.invert(vatPosted);

    //empty row
    tableRow = table.addRow();
    tableRow.addCell("", "noBorder", 4);

    if (param.printCheckTotals) {
        tableRow = table.addRow();
        tableRow.addCell("", "noBorder", 4);
        tableRow = table.addRow();
        tableRow.addCell("VAT/Sales tax report in Banana (for checksum)", "description noBorder", 2);
        tableRow.addCell("", "amount noBorder", 1);
        tableRow.addCell(formatNumber(vatPosted), "amount noBorder", 1);

        tableRow = table.addRow();
        tableRow.addCell("Difference", "description  noBorder", 2);
        tableRow.addCell("", "amount  noBorder", 1);
        var diff = Banana.SDecimal.subtract(vatPosted, sum);
        tableRow.addCell(formatNumber(diff), "amount  noBorder", 1);
    }

    for (var m = 0; m < vatCodesList.length; m++) {
        var vatCode = vatCodesList[m];
        //if the vat code is excluded from printout, no warning is printed
        if (param.excludedVatCodes.indexOf(vatCode) >= 0)
            continue;
        //if the vat code is not found in the printout, warning is printed
        if (param.vatCodes.indexOf(vatCode) < 0) {
            tableRow = table.addRow();
            tableRow.addCell("The vat code " + vatCode + " is not included in this printout", "description  noBorder", 4);
        }
    }
}

function createVatReportSummaryHeader(text, table) {
    var tableRow = table.addRow();
    tableRow.addCell(text, "headerRow", 4);

    tableRow = table.addRow();
    tableRow.addCell("", "bold");
    tableRow.addCell("Kz.", "bold amount");
    tableRow.addCell("", "bold amount");
    tableRow.addCell("Steuer (Euro, Cent)", "bold amount");
}

function findVatCodes(banDoc, arrayGr, arrayGr2) {
    var vatCodes = [];
    if (!banDoc)
        return vatCodes;

    var tableVatCodes = banDoc.table("VatCodes");
    if (!tableVatCodes)
        return vatCodes;

    if (!arrayGr)
        arrayGr = [];
    if (!arrayGr2)
        arrayGr2 = [];
    for (var rowNr = 0; rowNr < tableVatCodes.rowCount; rowNr++) {
        var rowValueGr = tableVatCodes.value(rowNr, "Gr").toString();
        var rowValueGr2 = tableVatCodes.value(rowNr, "Gr2").toString();
        if ((arrayContains(arrayGr, rowValueGr) || arrayGr.length <= 0) && (arrayContains(arrayGr2, rowValueGr2) || arrayGr2.length <= 0)) {
            var vatCode = tableVatCodes.value(rowNr, "VatCode");
            vatCodes.push(vatCode);
        }
    }
    //add vat codes to param to check if all have been printed
    if (!param.vatCodes)
        param.vatCodes = [];
    for (m=0; m<vatCodes.length;m++)
        param.vatCodes.push(vatCodes[m]);

    return vatCodes;
}

function getVatGroupDescription(banDoc, group) {
    if (!banDoc)
        return "";
    var description = group;
    if (description.length <= 0)
        return description;
    var tableVatCodes = banDoc.table("VatCodes");
    if (tableVatCodes) {
        var row = tableVatCodes.findRowByValue('Group', group);
        if (row)
            description = row.value("Description").toString();
    }
    return description;
}

function loadData(banDoc) {
    if (!banDoc)
        return;
    var tableVatCodes = banDoc.table("VatCodes");
    if (!tableVatCodes)
        return;

    //Load data from column Gr2, grouped by column Gr
	if (!param)
	    param = {};
    param.gr2List = {};
    for (var i = 0; i < tableVatCodes.rowCount; i++) {
        var tRow = tableVatCodes.row(i);
        var gr = tRow.value('Gr').toString();
        var gr2 = tRow.value('Gr2').toString();
        if (gr.length <= 0 || gr2.length <= 0)
            continue;
        if (!param.gr2List[gr]) {
            param.gr2List[gr] = [];
        }
        if (param.gr2List[gr].indexOf(gr2) < 0) {
            param.gr2List[gr].push(gr2);
        }
    }

    //Banana.console.debug(JSON.stringify(param.gr2List, null, 2));
}

/* Function that loads some parameters */
function loadParam(banDoc, startDate, endDate) {
    param = {};
    if (banDoc) {
        param = {
            "scriptVersion": "20180529",
            "headerLeft": banDoc.info("Base", "HeaderLeft"),
            "vatNumber": banDoc.info("AccountingDataBase", "VatNumber"),
            "company": banDoc.info("AccountingDataBase", "Company"),
            "name": banDoc.info("AccountingDataBase", "Name"),
            "familyName": banDoc.info("AccountingDataBase", "FamilyName"),
            "startDate": startDate,
            "endDate": endDate,
            "grColumn": "Gr1",
            "rounding": 2
        };
    }
    param.reportName = "USt Voranmeldung";
    param.printCheckTotals = true;
    param.gr2List = {};
    param.vatCodes = [];

    // Not used vat codes
    // These vat codes aren't printed in the vat report and excluded from sum check
    param.excludedVatCodes = [];
    param.excludedVatCodes.push("240-352");
    param.excludedVatCodes.push("240-355");
    param.excludedVatCodes.push("250-352");
    param.excludedVatCodes.push("250-355");

}

/* The purpose of this function is to convert the value to local format */
function formatNumber(amount, convZero) {
    if (!amount) { //if undefined return 0.00
        amount = 0;
    }
    return Banana.Converter.toLocaleNumberFormat(amount, 2, convZero);
}

function getScriptSettings(banDoc) {
    if (banDoc) {
        var data = banDoc.getScriptSettings();
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
    if (!Banana.document)
        return null;

    //The formeters of the period that we need
    var scriptform = getScriptSettings(Banana.document);

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

//  Checks that string starts with the specific string
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

//  Checks that string ends with the specific string...
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}