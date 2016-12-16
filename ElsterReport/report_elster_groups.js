// Copyright [2015] [Banana.ch SA - Lugano Switzerland]
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
// @id = de.banana.app.elster_report_groups
// @api = 1.0
// @pubdate = 2016-12-16
// @publisher = Banana.ch SA
// @description = Elster report groups
// @task = app.command
// @doctype = 100.100;110.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1


//Global variables
var param = {};
var form = [];

//Create the param object with some parameters
function loadParam() {
	var openingDate = Banana.Converter.toDate(Banana.document.info("AccountingDataBase", "OpeningDate"))
		var year = "";
	if (openingDate) {
		openingDate.getFullYear();
	}
	param = {
		"reportName": "Report Elster Groups", // Save the report's name
		"headerLeft": Banana.document.info("Base", "HeaderLeft"), // Get the info from File->File properties->Header left
		"headerRight": Banana.document.info("Base", "HeaderRight"), // Get the info from File->File properties->Header right
		"startDate": Banana.document.info("AccountingDataBase", "OpeningDate"), // Get the start date of the accounting period
		"endDate": Banana.document.info("AccountingDataBase", "ClosureDate"), // Get the end date of the accounting period
		"year": year, // Get the year from the accounting period
		"basicCurrency": Banana.document.info("AccountingDataBase", "BasicCurrency"), // Get the basic currency of the accounting
		"grColumn": "ElsterFeld", // Specify the column ("Gr1" or "Gr2")
		"formatNumber": true, // Specify if convert all the values into the local format
		"rounding": 2, // Specify the rounding of the sums
		"columHeaders": ["Id", "Id2", "Description", "Amount1", "Amount2"],
		"columWidth": ["Id", "Id2", "Description", "Amount1", "Amount2"],
	};
}

//The purpose of this function is to create and load the structure that will contains all the data used to create the report
function loadForm() {

	/** CONTO ECONOMICO **/
	//INCOME
	form.push({
		"title": "Income",
		"style": "test"
	});
	form.push({
		"id": "E106",
		"gr": "106",
		"bClass": "4",
		"description": "106 Elster"
	});
	form.push({
		"id": "E108",
		"gr": "108",
		"bClass": "4",
		"description": "108 Elster"
	});
	form.push({
		"id": "E112",
		"gr": "112",
		"bClass": "4",
		"description": "112 Elster .."
	});
	form.push({
		"id": "E",
		"description": "TOTAL Erträge",
		"sum": "E106;E108;E112",
		"column": 4
	});
	form.push({
		"pageBreak": true,
		"column": 4
	});

	//EXPENSES
	form.push({
		"id": "K224",
		"gr": "224",
		"bClass": "3",
		"description": "224 Elser ..."
	});
	form.push({
		"id": "K175",
		"gr": "175",
		"bClass": "3",
		"description": "175 Elser ..."
	});
	form.push({
		"id": "K",
		"description": "TOTALE Kosten",
		"sum": "K224;K175"
	});

	//RISULTATO D'ESERCIZIO
	form.push({
		"id": "UP",
		"description": "Gewinn",
		"sum": "E;-K"
	});

}

//Main function
function exec(string) {

	//Check if we are on an opened document
	if (!Banana.document) {
		return;
	}

	// 1. Create and load the parameters and the form
	loadParam();
	loadForm();

	// 2. Extract the data, calculate and load the balances
	getGrBalances();
	preProcess();

	// 3. Calculate the totals
	calcTotals(["amount"]);

	// 4. Do some operations before the format
	//postProcess();

	// 5. Format all the values
	formatValues(["amount"]);

	// 6. Create and print the report
	printReport();

}

//The purpose of this function is to do some operations before the calculation of the totals
function preProcess() {
	/* Eventually add some values to the form */
}

//The purpose of this function is to do some operations before the values are converted
function postProcess() {}

//The purpose of this function is to create and print the report
function printReport() {

	var report = Banana.Report.newReport(param.reportName);
	var thisYear = Banana.Converter.toDate(Banana.document.info("AccountingDataBase", "OpeningDate")).getFullYear();

	/** TABLE CONTO ECONOMICO **/
	report.addParagraph(param.headerLeft + " - " + "Elster Report Jahr " + thisYear, "heading2");

	var table = report.addTable("table");
	tableRow = table.addRow();
	tableRow.addCell("Id", "styleTableHeader", 1);
	tableRow.addCell("Id", "styleTableHeader", 1);
	tableRow.addCell(param.columHeaders[2], "styleTableHeader", 1);
	tableRow.addCell("", "styleTableHeader", 1);
	tableRow.addCell("", "styleTableHeader", 1);
	tableRow.addCell("Teilbeträge", "styleTableHeader", 1);
	tableRow.addCell("Gesamtbeträge", "styleTableHeader", 1);

	for (var k = 0; k < form.length; k++) {

		if (form[k]["id"] &&
			(form[k]["id"].substring(0, 1) === "E" || form[k]["id"].substring(0, 1) === "K" || form[k]["id"].substring(0, 2) === "UP")) {

			//Titles
			if (form[k]["id"] === "Rt" || form[k]["id"] === "Ct") {
				tableRow = table.addRow();
				tableRow.addCell(form[k]["description"], "styleTitleCell", 7);
			}
			//Totals
			else if (form[k]["id"] === "E" || form[k]["id"] === "K" || form[k]["id"] === "UP") {
				tableRow = table.addRow();
				tableRow.addCell(form[k]["id"], "valueTotal", 1);
				tableRow.addCell(form[k]["description"], "valueTotal", 4);
				tableRow.addCell(" ", "valueTotal", 1);
				tableRow.addCell(form[k]["amount_formatted"], "alignRight bold valueTotal", 1);
			}
			//Details
			else {
				tableRow = table.addRow();
				tableRow.addCell(" ", "", 1);
				tableRow.addCell(form[k]["id"], "", 1);
				tableRow.addCell(form[k]["description"], "", 3);
				tableRow.addCell(form[k]["amount_formatted"], "alignRight", 1);
				tableRow.addCell(" ", "", 1);
			}
		}
	}

	//report.addPageBreak();


	//Add a footer to the report
	addHeader(report);
	addFooter(report);

	//Print the report
	var stylesheet = createStyleSheet();
	Banana.Report.preview(report, stylesheet);
}

//The purpose of this function is to load all the balances and save the values into the form
function getGrBalances() {

	for (var i in form) {
		if (form[i].id) {
			form[i].id = form[i].id.trim();
		}
		if (form[i].gr) {
			form[i].gr = form[i].gr.trim();
		}
		//Check if there are "vatClass" properties, then load VAT balances
		if (form[i]["vatClass"]) {
			if (form[i]["gr"]) {
				form[i]["amount"] = getGrBalances_Vat(form[i]["gr"], form[i]["vatClass"], param["grColumn"], param["startDate"], param["endDate"]);
			}
		}

		//Check if there are "bClass" properties, then load balances
		if (form[i]["bClass"]) {
			if (form[i]["gr"]) {
				form[i]["amount"] = getGrBalances_Account(form[i]["gr"], form[i]["bClass"], param["grColumn"], param["startDate"], param["endDate"]);
			}
		}
	}
}

//The purpose of this function is to calculate all the balances of the accounts belonging to the same group (grText)
function getGrBalances_Account(grText, bClass, grColumn, startDate, endDate) {

	var accounts = getAccountListForGr(Banana.document.table("Accounts"), grText, "Account", grColumn);
	accounts += "|" + getAccountListForGr(Banana.document.table("Categories"), grText, "Category", grColumn);

	debugger;
	//Sum the amounts of opening, debit, credit, total and balance for all transactions for this accounts
	var currentBal = Banana.document.currentBalance(accounts, startDate, endDate);

	//The "bClass" decides which value to use
	if (bClass === "0") {
		return currentBal.amount;
	} else if (bClass === "1") {
		return currentBal.balance;
	} else if (bClass === "2") {
		return Banana.SDecimal.invert(currentBal.balance);
	} else if (bClass === "3") {
		if (!Banana.document.table("Categories")) {
			return currentBal.total;
		} else {
			return Banana.SDecimal.invert(currentBal.total);
		}
	} else if (bClass === "4") {
		if (!Banana.document.table("Categories")) {
			return Banana.SDecimal.invert(currentBal.total);
		} else {
			return currentBal.total;
		}
	}
}

//The main purpose of this function is to create an array with all the values of a given column of the table (codeColumn) belonging to the same group (grText)
function getAccountListForGr(table, grText, codeColumn, grColumn) {

	if (table === undefined || !table) {
		return "";
	}
	if (!grColumn) {
		grColumn = "Gr1";
	}

	var accounts = [];

	//Loop to take the values of each rows of the table
	for (var i = 0; i < table.rowCount; i++) {
		var tRow = table.row(i);
		var codeString = tRow.value(grColumn);
		if (codeString) {
			//If Gr1 column contains other characters (in this case ";") we know there are more values
			//We have to split them and take all values separately
			//If there are only alphanumeric characters in Gr1 column we know there is only one value
			var arrCodeString = codeString.split(";");
			for (var j = 0; j < arrCodeString.length; j++) {
				var codeString1 = arrCodeString[j];
				if (codeString1 === grText) {
					accounts.push(tRow.value(codeColumn));
				}
			}
		}
	}

	//Removing duplicates
	for (var i = 0; i < accounts.length; i++) {
		for (var x = i + 1; x < accounts.length; x++) {
			if (accounts[x] === accounts[i]) {
				accounts.splice(x, 1);
				--x;
			}
		}
	}
	return accounts.join("|");
}

//The purpose of this function is to return a specific whole object
function getFormObjectById(form, id) {
	for (var i = 0; i < form.length; i++) {
		if (form[i]["id"] === id) {
			return form[i];
		}
	}
	Banana.document.addMessage("Couldn't find object with id: " + id);
}

//The purpose of this function is to get a specific value from the object
function getFormValueById(source, id, field) {
	for (var i = 0; i < source.length; i++) {
		if (source[i].id === id) {
			return source[i][field];
		}
	}
	Banana.document.addMessage("Couldn't find object with id: " + id);
}

//The purpose of this function is to get the Description from an object
function getDescription(id) {
	var searchId = id.trim();
	for (var i = 0; i < form.length; i++) {
		if (form[i]["id"] === searchId) {
			return form[i]["description"];
		}
	}
	Banana.document.addMessage("Couldn't find object with id: " + id);
}

//The purpose of this function is to get the Balance from an object
function getBalance(id) {
	var searchId = id.trim();
	for (var i = 0; i < form.length; i++) {
		if (form[i]["id"] === searchId) {
			return form[i]["amount"];
		}
	}
	Banana.document.addMessage("Couldn't find object with id: " + id);
}

//The purpose of this function is to convert all the values from the given list to local format
function formatValues(fields) {
	for (i = 0; i < form.length; i++) {
		for (var j = 0; j < fields.length; j++) {
			var fieldName = fields[j];  
			form[i][fieldName + "_formatted"] = Banana.Converter.toLocaleNumberFormat(form[i] [fieldName]);
		}
	}
}

//The purpose of this function is to calculate all totals of the form with one call of the function only
function calcTotals(fields) {
	for (var i = 0; i < form.length; i++) {
		calcTotal(form[i].id, fields);
	}
}

//Calculate a single total of the form
function calcTotal(id, fields) {

	var valueObj = getFormObjectById(form, id);
	if (!valueObj || valueObj[fields[0]]) { //first field is present
		return; //calc already done, return
	}

	if (valueObj.sum) {
		var sumElements = valueObj.sum.split(";");

		for (var k = 0; k < sumElements.length; k++) {
			var entry = sumElements[k].trim();
			if (entry.length <= 0) {
				return true;
			}

			var isNegative = false;
			if (entry.indexOf("-") >= 0) {
				isNegative = true;
				entry = entry.substring(1);
			}

			//Calulate recursively
			calcTotal(entry, fields);

			for (var j = 0; j < fields.length; j++) {
				var fieldName = fields[j];
				var fieldValue = getFormValueById(form, entry, fieldName);
				if (fieldValue) {
					if (isNegative) {
						//Invert sign
						fieldValue = Banana.SDecimal.invert(fieldValue);
					}
					valueObj[fieldName] = Banana.SDecimal.add(valueObj[fieldName], fieldValue, {
							'decimals': param.rounding
						});
				}
			}
		}
	} else if (valueObj.gr) {
		//Already calculated in getGrBalances()
	}
}

//This function adds a Footer to the report
function addFooter(report) {
	report.getFooter().addClass("footer");
	var versionLine = report.getFooter().addText("Banana Accounting - ", "description");
	report.getFooter().addText("Pagina ", "description");
	report.getFooter().addFieldPageNr();
}

function addHeader(report) {
	var pageHeader = report.getHeader();
	pageHeader.addClass("header");
	pageHeader.addParagraph("Elster report", "header1 bold");
	pageHeader.addParagraph("", "header2 right").addFieldPageNr();
	pageHeader.addParagraph(" ", "horizontalLine");
	pageHeader.addParagraph(" ");
	pageHeader.addParagraph(" ");
}

//The main purpose of this function is to create styles for the report print
function createStyleSheet() {
	var stylesheet = Banana.Report.newStyleSheet();

	var pageStyle = stylesheet.addStyle("@page");
	pageStyle.setAttribute("margin", "5mm 10mm 5mm 10mm");

	stylesheet.addStyle("body", "font-family : Helvetica");

	var style = stylesheet.addStyle(".description");
	style.setAttribute("padding-bottom", "5px");
	style.setAttribute("padding-top", "5px");
	style.setAttribute("font-size", "8px");

	style = stylesheet.addStyle(".right");
	style.setAttribute("text-align", "right");

	// style = stylesheet.addStyle(".descriptionBold");
	// style.setAttribute("font-size", "8px");
	// style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".footer");
	style.setAttribute("text-align", "right");
	style.setAttribute("font-size", "8px");
	style.setAttribute("font-family", "Courier New");

	style = stylesheet.addStyle(".heading1");
	style.setAttribute("font-size", "16px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading2");
	style.setAttribute("font-size", "12px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading3");
	style.setAttribute("font-size", "10px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".heading4");
	style.setAttribute("font-size", "9px");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".header1");
	style.setAttribute("font-size", "10px");
	style.setAttribute("font-family", "Times New Roman");

	style = stylesheet.addStyle(".header2");
	style.setAttribute("font-size", "7px");
	style.setAttribute("font-family", "Times New Roman");

	style = stylesheet.addStyle(".horizontalLine");
	style.setAttribute("border-bottom", "thin solid black");

	// style = stylesheet.addStyle(".rowNumber");
	// style.setAttribute("font-size", "9px");

	// style = stylesheet.addStyle(".valueAmount");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px");
	// style.setAttribute("background-color", "#eeeeee");
	// style.setAttribute("text-align", "right");

	// style = stylesheet.addStyle(".valueDate");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px");
	// style.setAttribute("background-color", "#eeeeee");

	// style = stylesheet.addStyle(".valueText");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px");
	// style.setAttribute("padding-top", "5px");
	// style.setAttribute("background-color", "#eeeeee");

	// style = stylesheet.addStyle(".valueTitle");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// //style.setAttribute("padding-bottom", "5px");
	// //style.setAttribute("padding-top", "5px");
	// style.setAttribute("background-color", "#000000");
	// style.setAttribute("color", "#fff");

	// style = stylesheet.addStyle(".valueTitle1");
	// style.setAttribute("font-size", "9px");
	// style.setAttribute("font-weight", "bold");
	// style.setAttribute("padding-bottom", "5px");
	// style.setAttribute("padding-top", "5px");


	style = stylesheet.addStyle(".valueTotal");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("background-color", "#eeeeee");

	style = stylesheet.addStyle(".valueTotal1");
	style.setAttribute("background-color", "#eeeeee");

	//Table
	style = stylesheet.addStyle("table");
	style.setAttribute("width", "100%");
	style.setAttribute("font-size", "8px");
	stylesheet.addStyle("table.table td", "border: thin solid #2C4068");

	style = stylesheet.addStyle(".styleTableHeader");
	//style.setAttribute("font-weight", "bold");
	style.setAttribute("background-color", "#2C4068");
	style.setAttribute("border-bottom", "1px double black");
	style.setAttribute("color", "#fff");

	style = stylesheet.addStyle(".styleTitleCell");
	style.setAttribute("font-weight", "bold");
	style.setAttribute("background-color", "#FFD100");
	style.setAttribute("border-bottom", "1px double black");
	style.setAttribute("color", "#2C4068");

	style = stylesheet.addStyle(".background");
	style.setAttribute("padding-bottom", "5px");
	style.setAttribute("padding-top", "5px");
	style.setAttribute("background-color", "#eeeeee");

	style = stylesheet.addStyle(".borderLeft");
	style.setAttribute("border-left", "thin solid black");

	style = stylesheet.addStyle(".borderBottom");
	style.setAttribute("border-bottom", "thin solid black");

	style = stylesheet.addStyle(".bold");
	style.setAttribute("font-weight", "bold");

	style = stylesheet.addStyle(".italic");
	style.setAttribute("font-style", "italic");

	style = stylesheet.addStyle(".alignRight");
	style.setAttribute("text-align", "right");

	style = stylesheet.addStyle(".alignCenter");
	style.setAttribute("text-align", "center");

	//Image style
	style = stylesheet.addStyle(".img");
	style.setAttribute("height", "170");
	style.setAttribute("width", "170");

	return stylesheet;
}
