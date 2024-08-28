// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
//@includejs = OpenPropertyEditor.js

var Report = class Report {
    constructor() {
    }
    printEBilanzReport(report, stylesheet, param, context, dataCompany) {
        // Styles
        stylesheet.addStyle("@page", "size:portrait;margin-top:1em;font-size: 10px; ");
        stylesheet.addStyle(".amount", "text-align: right;");
        stylesheet.addStyle(".center", "text-align: center;");
        stylesheet.addStyle(".mainTitle", "font-weight: bold;font-size:14px;padding-bottom:10px;");
        stylesheet.addStyle(".right", "text-align: right;");
        stylesheet.addStyle(".row.level1", "padding-left:0px;font-weight: bold;");
        stylesheet.addStyle(".row.level2", "padding-left:10px;font-weight: bold;");
        stylesheet.addStyle(".row.level3", "padding-left:20px;font-weight: bold;");
        stylesheet.addStyle(".row.level4", "padding-left:40px;");
        stylesheet.addStyle(".row.level5", "padding-left:50px;");
        stylesheet.addStyle(".row.level6", "padding-left:60px;");
        stylesheet.addStyle(".row.level7", "padding-left:70px;");
        stylesheet.addStyle(".row.level8", "padding-left:80px;");
        stylesheet.addStyle(".row.level9", "padding-left:80px;");
        stylesheet.addStyle(".row.level10", "padding-left:80px;");
        stylesheet.addStyle(".table1", "margin-top:2em;width:100%;");
        stylesheet.addStyle(".table1 thead", "font-weight: bold;background-color:#eeeeee;");
        stylesheet.addStyle(".table2", "margin-top:2em;width:100%;");
        stylesheet.addStyle(".title", "font-weight: bold;");
        stylesheet.addStyle(".warning", "color: red;font-size:8px;");
        stylesheet.addStyle("td.row", "border:1px solid #dddddd;padding:3px;");
        stylesheet.addStyle("td.title", "border:1px solid #dddddd;padding:3px;");

        //Footer
        var reportFooter = report.getFooter();
        reportFooter.addClass("center");
        reportFooter.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()) + " Page ").addFieldPageNr();

        //Header 
        var reportHeader = report.getHeader();
        var table = reportHeader.addTable("table1");
        var headerRow = table.getHeader().addRow();

        //Header Address
        var currentDocument = context.document;
        if (currentDocument) {
            var cell = headerRow.addCell("", "address");
            var paragraph = cell.addParagraph("");
            if (currentDocument.info("AccountingDataBase", "Company").length) {
                paragraph.addText(currentDocument.info("AccountingDataBase", "Company"), "address");
                paragraph.addLineBreak();
            }
            if (currentDocument.info("AccountingDataBase", "Name").length || currentDocument.info("AccountingDataBase", "FamilyName").length) {
                paragraph.addText(currentDocument.info("AccountingDataBase", "Name") + ' ' + currentDocument.info("AccountingDataBase", "FamilyName"), "address");
                paragraph.addLineBreak();
            }
            if (currentDocument.info("AccountingDataBase", "Address1").length) {
                paragraph.addText(currentDocument.info("AccountingDataBase", "Address1"), "address");
                paragraph.addLineBreak();
            }
            if (currentDocument.info("AccountingDataBase", "Zip").length || currentDocument.info("AccountingDataBase", "City").length) {
                paragraph.addText(currentDocument.info("AccountingDataBase", "Zip") + ' ' + currentDocument.info("AccountingDataBase", "City"), "address");
                paragraph.addLineBreak();
            }
            /*if (currentDocument.info("AccountingDataBase","VatNumber").length) {
              paragraph.addText(currentDocument.info("AccountingDataBase","VatNumber"), "address");
              paragraph.addLineBreak();
            }
            if (currentDocument.info("AccountingDataBase","FiscalNumber").length) {
              paragraph.addText(currentDocument.info("AccountingDataBase","FiscalNumber"), "address");
              paragraph.addLineBreak();
            }*/
        }

        //Header Period
        var cell = headerRow.addCell("", "period");
        var paragraph = cell.addParagraph("Periode:");
        paragraph.addLineBreak();
        paragraph.addText(Banana.Converter.toLocaleDateFormat(context.startdate));
        paragraph.addText(" - " + Banana.Converter.toLocaleDateFormat(context.enddate));

        //Header Version
        cell = headerRow.addCell("", "version");
        paragraph = cell.addParagraph("Version:");
        paragraph.addLineBreak();
        paragraph.addText("HGB 5.4");

        this.printEBilanzReport_table(report, stylesheet, param, context, 'role_balanceSheet');
        this.printEBilanzReport_table(report, stylesheet, param, context, 'role_incomeStatement');
        this.printDataCompany(report, dataCompany);

    }

    printEBilanzReport_table(report, stylesheet, param, context, role) {
        //Data Rows
        var table2 = report.addTable("table2");
        var headerRow = table2.getHeader().addRow();
        var title = 'Bilanz';
        if (role == 'role_incomeStatement')
            title = 'Gewinn- und Verlustrechnung';
        headerRow.addCell(title + " (E-Bilanz)", "mainTitle");

        //Column names
        headerRow = table2.getHeader().addRow();
        headerRow.addCell("Name", "title description");
        headerRow.addCell("Wert", "title amount");

        //First row
        var row = table2.addRow();
        row.addCell(title, "row level0");
        row.addCell("", "row level0 amount");

        //Rows
        for (var object in param.taxonomy[role]) {
            if (typeof param.taxonomy[role][object] === 'string')
                continue;
            var print = false;
            var contextname = context['name'];
            if (param.taxonomy[role][object][contextname] == 0)
                continue;

            var periodtype = param.taxonomy[role][object]['periodtype'];
            if (periodtype.length >= 1)
                periodtype = periodtype.substr(0, 1);
            row = table2.addRow();
            var className = "row level" + param.taxonomy[role][object]['level'];
            var amount = Banana.SDecimal.round(param.taxonomy[role][object][contextname], { 'decimals': 2 });
            //var amount = Math.round(param.taxonomy[role][object][contextname] * 100) / 100;
            amount = Banana.Converter.toLocaleNumberFormat(amount);
            row.addCell(param.taxonomy[role][object]['label']['de'], className);
            row.addCell(amount, className + " amount");
        }
    }
    printDataCompany(report, dataCompany) {
        var data = [];
        /* for (var elem in dataCompany) {
            data.push(elem);
        } */
        //Data Rows
        var table3 = report.addTable("table3");
        var headerRow = table3.getHeader().addRow();
        var title = 'Company personal data';
        headerRow.addCell(title, "mainTitle");

        //Column names
        headerRow = table3.getHeader().addRow();
        headerRow.addCell("Field", "title description");
        headerRow.addCell("Value", "title description");

        //First row
        var row = table3.addRow();

        //Banana.console.debug("dataCompany "+Object.keys(dataCompany));
        //Rows
        Banana.console.debug("JSON.stringify(dataCompany)");
        Banana.console.debug(JSON.stringify(dataCompany));

        // Itera su dataCompany per ottenere chiavi e valori
        for (var key in dataCompany) {
            if (dataCompany.hasOwnProperty(key)) {

                var value = dataCompany[key]['value'] ? dataCompany[key][value] : dataCompany[key];
                Banana.console.debug("value:");
                Banana.console.debug(dataCompany[key]['value']);
                // Aggiungi un oggetto con chiave e valore all'array data
                data.push({ name: key, value: value });
            }
        }
        // Data Rows
        var table3 = report.addTable("table3");
        var headerRow = table3.getHeader().addRow();
        var title = 'Company personal data';
        headerRow.addCell(title, "mainTitle");

        // Nomi delle colonne
        headerRow = table3.getHeader().addRow();
        headerRow.addCell("Field", "title description");
        headerRow.addCell("Value", "title description");
        //Banana.console.debug("data " + JSON.stringify(data)); // Stampa i dati in formato JSON
        for (let index = 0; index < data.length; index++) {
            const element = JSON.stringify(data[index]);
            var indiceInizio = element.indexOf('{');
            var oggettoStringa = element.substring(indiceInizio);

            Banana.console.debug("oggettoStringa");
            Banana.console.debug(oggettoStringa);
            try {
                const elementValue = JSON.parse(oggettoStringa)["value"];
                const arrayElement = elementValue.split(": ")[1];
                const oggetto = JSON.parse(arrayElement);
                const elementValueArray = oggetto['value'];
                const elementFieldArray = oggetto['name'];
                Banana.console.debug("elementValue");
                Banana.console.debug(elementValue);

                Banana.console.debug("elementArray");
                Banana.console.debug(elementValueArray);

                Banana.console.debug("oggetto");
                Banana.console.debug(oggetto);
                Banana.console.debug("elementValue");
                Banana.console.debug(elementValue);

                Banana.console.debug("elementArray");
                Banana.console.debug(elementValueArray);

                Banana.console.debug("oggetto");
                Banana.console.debug(oggetto);

                var row = table3.addRow();
                row.addCell(elementFieldArray, "row level0");
                row.addCell(elementValueArray, "row level0");
                //const elementValue = JSON.parse(oggettoStringa)["value"];
                //const arrayElement = elementValue.split(": ")[1];
                //const oggetto = JSON.parse(arrayElement);
                //const elementArray = oggetto['value'];
            } catch (error) {
                Banana.console.debug("error: " + error);
            }

        }



        // Aggiungi righe alla tabella
        /* for (var i = 0; i < data.length; i++) {
            var row = table3.addRow();
            row.addCell(data[i].field, "row level0"); // Aggiungi il campo
             // Aggiungi il valore

        } */



        //Banana.console.debug("Object.keys(row) "+Object.keys(row));
        //Banana.console.debug("report dataCompany: "+Object.keys(dataCompany));
        //Banana.console.debug(JSON.stringify(dataCompany));

        /* for (let chiave in dataCompany) {
            if (dataCompany.hasOwnProperty(chiave)) { 
                row = table3.addRow();
                var field = `${chiave}`;
                var value = `${JSON.stringify(dataCompany[chiave])}`;
                row.addCell(field,"Field");
                row.addCell(value, "Value");
            }
        }  */
    }
}