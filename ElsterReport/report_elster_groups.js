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
// @pubdate = 2016-12-23
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

	param = {

		/* Get some basic accounting information */
		"headerLeft": Banana.document.info("Base", "HeaderLeft"), 					 // Get the info from File->File properties->Header left
		"headerRight": Banana.document.info("Base", "HeaderRight"), 				 // Get the info from File->File properties->Header right
		"startDate": Banana.document.info("AccountingDataBase", "OpeningDate"), 	 // Get the start date of the accounting period
		"endDate": Banana.document.info("AccountingDataBase", "ClosureDate"), 		 // Get the end date of the accounting period
		"basicCurrency": Banana.document.info("AccountingDataBase", "BasicCurrency"),// Get the basic currency of the accounting
		
		/* Specify some settings */
		"grColumn": "ElsterFeld", 													 // Specify the column (Gr, Gr1, Gr2 or something other)
		"formatNumber": true, 	  													 // Specify if convert all the values into the local format
		"rounding": 2,            													 // Specify the rounding of the sums
		
		/* Report's name */
		"reportName" 			: "Report Elster Groups", 							 // Define the name of the report
		
		/* The font of the text */
		"styleFontText" 		: "Arial",											 // Define the font for the report

		/* General styles */
		"styleHeader" 			: "font12 bold",									 // Define the style for the header of the page
		"stylePageNumber" 		: "alignRight italic",								 // Define the style for the page number
		"styleFooter" 			: "alignRight font8",								 // Define the style for the footer of the page
		"styleTitle" 			: "font16 bold",									 // Define the style for the title of the page

		/* Styles of the table */
		//Header
		"columHeaders" 			: [ "Id", "Description", "Amount1", "Amount2" ], 	 // Define the name for the columns of the table
		"columWidth" 			: [ "10%", "60%", "15%", "15%" ], 					 // Define the width for the columns of the table
		"styleTableHeader" 		: "backgroundColorBlue text-color-white alignCenter",// Define the style for the header of the table
		"styleColorBorderTable" : "#2C4068",										 // Define the background color for the header of the table

		//Table rows
		"styleTextTable" 		: "alignLeft",										 // Define the style for the non-total texts of the table
		"styleAmountTable" 		: "alignRight",										 // Define the style for the non-total amounts of the table
		"styleTextTotal" 		: "alignLeft bold backgroundColorGrey",				 // Define the style for the total texts of the table
		"styleAmountTotal" 		: "alignRight bold backgroundColorGrey",			 // Define the style for the total amounts of the table

		/* Style for the text outside of the table */
		"styleNotes" 			: "font12",											 // Define the style for the texts after the table

	};
}




//The purpose of this function is to load the structure that contains the data used to create the report
function loadForm() {

	/* HEADER */
	form.push({
		"headerText": "Elster Report",
		"pageText": "Seite",
	});

	/* FOOTER */
	form.push({
		"footerText": "Banana Accounting",
	});

	/* TITLE */
	form.push({
	    "title": param.headerLeft + " - " + "Elster Report Jahr 2016",
	});

	/* INCOME */
	form.push({
	    "id": "E106",
	    "gr": "106",
	    "bClass": "4",
	    "description": "106 Elster...",
	});
	form.push({
	    "id": "E108",
	    "gr": "108",
	    "bClass": "4",
	    "description": "108 Elster...",
	});
	form.push({
	    "id": "E112",
	    "gr": "112",
	    "bClass": "4",
	    "description": "112 Elster...",
	});
	form.push({
	    "id": "E",
	    "description": "TOTAL Erträge",
	    "sum": "E106;E108;E112",
	});

	//EXPENSES
	form.push({
	    "id": "K224",
	    "gr": "224",
	    "bClass": "3",
	    "description": "224 Elser...",
	});
	form.push({
	    "id": "K175",
	    "gr": "175",
	    "bClass": "3",
	    "description": "175 Elser...",
	});
	form.push({
	    "id": "K",
	    "description": "TOTALE Kosten",
	    "sum": "K224;K175",
	});

	//PROFIT / LOSS
	form.push({
	    "id": "UP",
	    "description": "Gewinn",
	    "sum": "E;-K",
	});
	

	/* PAGE BREAK. Can only be inserted after the table */
	form.push({
	    "pageBreak": true
	});

	/* NOTES. Can only be inserted after the table */
	form.push({
	    "notes" : "This is a text that can be added after the table.",
	});

	/* EMPTY PARAGRAPH. Can only be inserted after the table */
	form.push({
		"emptyParagraph" : true,
	});

	/* NOTES. Can only be inserted after the table */
	form.push({
	    "notes" : "This is an other text that can be added after the table.",
	});
}





/* The main purpose of this function is to create styles for the report print */
function loadStyleSheet(stylesheet) {
	
	stylesheet.addStyle("@page", "margin:10mm 10mm 10mm 20mm");
	stylesheet.addStyle("body", "font-family:" + param.styleFontText);

	//Define lines
	stylesheet.addStyle(".horizontalLine", "border-bottom:thin solid black");

	//Define some font styles
	stylesheet.addStyle(".bold", "font-weight:bold");
	stylesheet.addStyle(".italic", "font-style:italic");
	stylesheet.addStyle(".font8", "font-size:8px");
	stylesheet.addStyle(".font12", "font-size:12px");
	stylesheet.addStyle(".font16", "font-size:16px");

	//Define some background colors
	stylesheet.addStyle(".backgroundColorBlue", "background-color:#2C4068");
	stylesheet.addStyle(".backgroundColorGrey", "background-color:#eeeeee");

	//Define text colors (by default it's black)
	stylesheet.addStyle(".text-color-white", "color:#fff");

	//Define text alignments
	stylesheet.addStyle(".alignRight", "text-align:right");
	stylesheet.addStyle(".alignCenter", "text-align:center");
	stylesheet.addStyle(".alignLeft", "text-align:left");


	//Define columns width
	stylesheet.addStyle(".col1", "width:" + param.columWidth[0]);
	stylesheet.addStyle(".col2", "width:" + param.columWidth[1]);
	stylesheet.addStyle(".col3", "width:" + param.columWidth[2]);
	stylesheet.addStyle(".col4", "width:" + param.columWidth[3]);

	//Define table style
	style = stylesheet.addStyle("table");
	style.setAttribute("width", "100%");
	stylesheet.addStyle("table.table td", "border:thin solid " + param.styleColorBorderTable);

	return stylesheet;
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
	postProcess();

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
function postProcess() {

}

//The purpose of this function is to create and print the report
function printReport() {

	var report = Banana.Report.newReport(param.reportName);

	/* Add a title */
	for (var k = 0; k < form.length; k++) {
		if (!form[k]["id"] && form[k]["title"]) {
			report.addParagraph(form[k]["title"], param.styleTitle);
		}
	}

	/* Define all the columns */
	var table = report.addTable("table");
	var col1 = table.addColumn("col1");
	var col2 = table.addColumn("col2");
	var col3 = table.addColumn("col3");
	var col4 = table.addColumn("col4");

	/* Add the header of the table using the defined styles */
	tableRow = table.addRow();
	tableRow.addCell(param.columHeaders[0], param.styleTableHeader, 1);
	tableRow.addCell(param.columHeaders[1], param.styleTableHeader, 1);
	tableRow.addCell(param.columHeaders[2], param.styleTableHeader, 1);
	tableRow.addCell(param.columHeaders[3], param.styleTableHeader, 1);

	/* For each element of the form add a row to the table and fill it with the form element data */
	for (var k = 0; k < form.length; k++) {

		//Only elements with an ID has to be inserted in the table
		if (form[k]["id"]) { 

			//Add a row to the table
			tableRow = table.addRow();
			
			//Take the amount value
			if (param.formatNumber) {
				var amount = form[k]["amount_formatted"];
			} else {
				var amount = form[k]["amount"];
			}

			//Fill the row of the table
			if (!form[k]["sum"]) {
				tableRow.addCell(form[k]["id"], param.styleTextTable, 1);
				tableRow.addCell(form[k]["description"], param.styleTextTable, 1);
				tableRow.addCell(amount, param.styleAmountTable, 1);
				tableRow.addCell(" ", param.styleAmountTable, 1);
			} else {
				tableRow.addCell(form[k]["id"], param.styleTextTotal, 1);
				tableRow.addCell(form[k]["description"], param.styleTextTotal, 1);
				tableRow.addCell(" ",  param.styleAmountTotal, 1);
				tableRow.addCell(amount,  param.styleAmountTotal, 1);
			}
		}
		
		if (form[k]["pageBreak"]) {
			report.addPageBreak();
		}

		if (form[k]["emptyParagraph"]) {
			report.addParagraph(" ", "");
		}

		if (form[k]["notes"]) {
			report.addParagraph(form[k]["notes"], param.styleNotes);
		}
	}

	//Add a footer to the report
	addHeader(report);
	addFooter(report);

	//Print the report
	var stylesheet = loadStyleSheet(Banana.Report.newStyleSheet());
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
	for (var k = 0; k < form.length; k++) {
		if (form[k]["footerText"]) {
			var pageFooter = report.getFooter();
			pageFooter.addClass("footer");
			pageFooter.addParagraph(form[k]["footerText"], param.styleFooter);		
		}
	}
}

//This function adds an Header to the report
function addHeader(report) {
	for (var k = 0; k < form.length; k++) {
		if (form[k]["headerText"]) {
			var pageHeader = report.getHeader();
			pageHeader.addClass("header");
			pageHeader.addParagraph(form[k]["headerText"], param.styleHeader);
			pageHeader.addParagraph(form[k]["pageText"] + " ", param.stylePageNumber).addFieldPageNr();
			pageHeader.addParagraph(" ", "horizontalLine");
			pageHeader.addParagraph(" ");
			pageHeader.addParagraph(" ");
		}
	}
}
