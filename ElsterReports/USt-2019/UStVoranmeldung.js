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
// @id = ch.banana.de.elster_USt_Vornamedlung_2019
// @api = 1.0
// @pubdate = 2019-10-24
// @publisher = Banana.ch SA
// @description = Elster Umsatzsteuer Voranmeldung 2019
// @task = app.command
// @doctype = 100.110;110.110;130.110;100.130
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1


var param = {};

/* Main function */
function exec(inData, options) {

    //Check the version of Banana. If < than 9.0.0.171128 the script does not start
    var requiredVersion = "9.0.0.171128";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {

        var dateform = null;
        if (options && options.useLastSettings) {
            dateform = getScriptSettings();
        } else {
            dateform = settingsDialog();
        }

        if (!dateform || !Banana.document) {
            return;
        }

        //Create the VAT report
        var report = createVatReport(dateform.selectionStartDate, dateform.selectionEndDate);

        //Add styles and print the report
        var stylesheet = createStyleSheet();
        Banana.Report.preview(report, stylesheet);

    }
}

/* This function adds a Footer to the report */
function addFooter(report, param) {
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
    pageHeader.addParagraph("Elster Umsatzsteuer-Voranmeldung 2019 (gemäß Formular USt 1 A Version 08.18)", "h1");

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
    var tableStyle = stylesheet.addStyle("table");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle("table td", "padding-bottom: 2px; padding-top: 3px");
    stylesheet.addStyle("table td", "border:thin solid black;");
    stylesheet.addStyle("table td.amount", "text-align:right;");
    stylesheet.addStyle("table td.first", "padding-top: 10px");
    stylesheet.addStyle("table td.total", "padding-top: 5px;padding-bottom: 5px;");
    stylesheet.addStyle(".col1", "width:50%");
    stylesheet.addStyle(".col2", "width:17%");
    stylesheet.addStyle(".col3", "width:16%");
    stylesheet.addStyle(".col4", "width:15%");

    return stylesheet;
}

/* Function that creates and prints the report */
function createVatReport(startDate, endDate) {

    /* 1) Load parameters and texts */
    loadParam(startDate, endDate);

    /* 2) Load vat amounts */
    loadData();

    /* 3) Create the report */
    var report = Banana.Report.newReport(param.reportName);
    var table = report.addTable("table");
    var col1 = table.addColumn("col1");
    var col2 = table.addColumn("col2");
    var col3 = table.addColumn("col3");
    var col4 = table.addColumn("col4");

    var headerRow = table.getHeader().addRow();
    headerRow.addCell("Code", "bold");
    headerRow.addCell("Bemessungsgrundlage (vatTaxable)", "bold amount");
    headerRow.addCell("Steuer (vatPosted)", "bold amount");
    headerRow.addCell("ZM", "bold amount");

	var totals = {};
    var mainSumCol1 = "";
    var mainSumCol2 = "";
    var mainSumCol3 = "";

    for (var group in param.gr2List) {
		var sumGroup = {};
        sumGroup.sumCol1 = "";
        sumGroup.sumCol2 = "";
        sumGroup.sumCol3 = "";
        for (var i = 0; i < param.gr2List[group].length; i++) {
            var gr = [];
            gr.push(group);
            var gr2 = [];
            gr2.push(param.gr2List[group][i]);
            var vatCodes = findVatCodes(gr, gr2);
            var vatAmounts = Banana.document.vatCurrentBalance(vatCodes.join("|"), param.startDate, param.endDate);
            //Banana.console.debug(JSON.stringify(vatAmounts));
            var vatAmountCol1 = "";
            var vatAmountCol2 = "";
            var vatAmountCol3 = "";
            var gr2List = param.gr2List[group][i].split(";");
            if (gr2List.length > 0) {
                if (gr2List[0] == "ZM") {
                    vatAmountCol3 = vatAmounts.vatTaxable;
                }
                else {
                    if (group == "4" || group == "5")
                        vatAmountCol2 = vatAmounts.vatPosted;
                    else
                        vatAmountCol1 = vatAmounts.vatTaxable;
                }
            }
            if (gr2List.length > 1) {
                if (gr2List[1] == "ZM") {
                    vatAmountCol3 = vatAmounts.vatPosted;
                }
                else {
                    vatAmountCol2 = vatAmounts.vatPosted;
                }
            }

            //if (vatAmountCol1.length<=0 && vatAmountCol2.length<=0 && vatAmountCol3.length<=0)
            //	continue;

            sumGroup.sumCol1 = Banana.SDecimal.add(sumGroup.sumCol1, Banana.Converter.toInternalNumberFormat(vatAmountCol1));
            sumGroup.sumCol2 = Banana.SDecimal.add(sumGroup.sumCol2, Banana.Converter.toInternalNumberFormat(vatAmountCol2));
            sumGroup.sumCol3 = Banana.SDecimal.add(sumGroup.sumCol3, Banana.Converter.toInternalNumberFormat(vatAmountCol3));

            var tableRow = table.addRow();
            var firstRow = " first";
            if (i > 0)
                firstRow = "";
            tableRow.addCell(param.gr2List[group][i], "description" + firstRow, 1);
            tableRow.addCell(formatNumber(vatAmountCol1), "amount" + firstRow, 1);
            tableRow.addCell(formatNumber(vatAmountCol2), "amount" + firstRow, 1);
            tableRow.addCell(formatNumber(vatAmountCol3), "amount" + firstRow, 1);
        }
		totals[group] = sumGroup;
    }
	
    table.addPageBreak();

    for (var group in totals) {
        // Group Description
        var description = group;
        var tableVatCodes = Banana.document.table("VatCodes");
        if (tableVatCodes) {
            var row = tableVatCodes.findRowByValue('Group', group);
            if (row)
                description = row.value("Description").toString();
        }
        // Group Total
        var tableTotalRow = table.addRow();
        tableTotalRow.addCell(description, "description bold total", 1);
        tableTotalRow.addCell(formatNumber(totals[group].sumCol1), "amount bold total", 1);
        tableTotalRow.addCell(formatNumber(totals[group].sumCol2), "amount bold total", 1);
        tableTotalRow.addCell(formatNumber(totals[group].sumCol3), "amount bold total", 1);

        mainSumCol1 = Banana.SDecimal.add(mainSumCol1, Banana.Converter.toInternalNumberFormat(totals[group].sumCol1));
        mainSumCol2 = Banana.SDecimal.add(mainSumCol2, Banana.Converter.toInternalNumberFormat(totals[group].sumCol2));
        mainSumCol3 = Banana.SDecimal.add(mainSumCol3, Banana.Converter.toInternalNumberFormat(totals[group].sumCol3));
	}

    // Main Total
    var tableMainTotalRow = table.addRow();
    tableMainTotalRow.addCell("Total", "description bold total", 1);
    tableMainTotalRow.addCell(formatNumber(mainSumCol1), "amount bold total", 1);
    tableMainTotalRow.addCell(formatNumber(mainSumCol2), "amount bold total", 1);
    tableMainTotalRow.addCell(formatNumber(mainSumCol3), "amount bold total", 1);

    //Add Header and footer
    addHeader(report);
    addFooter(report, param);

    return report;
}

function findVatCodes(code1, code2) {
    var vatCodes = [];
    var tableVatCodes = Banana.document.table("VatCodes");
    if (!tableVatCodes)
        return vatCodes;
    for (var rowNr = 0; rowNr < tableVatCodes.rowCount; rowNr++) {
        var rowValue1 = tableVatCodes.value(rowNr, "Gr").toString();
        var rowValue2 = tableVatCodes.value(rowNr, "Gr2").toString();
        if ((arrayContains(code1, rowValue1) || code1.length <= 0) && (arrayContains(code2, rowValue2) || code2.length <= 0)) {
            var vatCode = tableVatCodes.value(rowNr, "VatCode");
            vatCodes.push(vatCode);
        }
    }
    return vatCodes;
}

function loadData() {
    var tableVatCodes = Banana.document.table("VatCodes");
    if (!tableVatCodes)
        return;

    //Look at column Gr2 for codes
    param.gr2List = {};
    for (var i = 0; i < tableVatCodes.rowCount; i++) {
        var tRow = tableVatCodes.row(i);
        var gr = tRow.value('Gr').toString();
        var gr2 = tRow.value('Gr2').toString();
        if (gr.length <= 0)
            continue;
        /*if (gr.length <= 0 || gr2.length <= 0)
            continue;*/
        if (!param.gr2List[gr]) {
            param.gr2List[gr] = [];
        }
        if (gr2.length > 0 && param.gr2List[gr].indexOf(gr2) < 0) {
            param.gr2List[gr].push(gr2);
        }
    }
	//Banana.console.debug(JSON.stringify(param.gr2List, null, 2));
}

/* Function that loads some parameters */
function loadParam(startDate, endDate) {
    param = {};
    if (Banana.document) {
        param = {
            "scriptVersion": "20180529",
            "headerLeft": Banana.document.info("Base", "HeaderLeft"),
            "vatNumber": Banana.document.info("AccountingDataBase", "VatNumber"),
            "company": Banana.document.info("AccountingDataBase", "Company"),
            "name": Banana.document.info("AccountingDataBase", "Name"),
            "familyName": Banana.document.info("AccountingDataBase", "FamilyName"),
            "startDate": startDate,
            "endDate": endDate,
            "grColumn": "Gr1",
            "rounding": 2
        };
    }
}

/* The purpose of this function is to convert the value to local format */
function formatNumber(amount, convZero) {
    if (!amount) { //if undefined return 0.00
        amount = 0;
    }
    return Banana.Converter.toLocaleNumberFormat(amount, 2, convZero);
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
