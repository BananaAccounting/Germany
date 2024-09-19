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
    printEBilanzReport(report, stylesheet, param, context, dataCompany, dataLevelCompany) {
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
        //stile dei dataCompany
        stylesheet.addStyle("td.data", "border:1px solid #dddddd;padding:3px;");
        stylesheet.addStyle(".data.level1", "padding-left:0px;font-weight: bold;");
        stylesheet.addStyle(".data.level2", "padding-left:10px;");
        stylesheet.addStyle(".data.level3", "padding-left:20px;");
        stylesheet.addStyle(".data.level4", "padding-left:30px;");
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
        this.printDataCompany(report, dataCompany, dataLevelCompany);
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
            //Banana.console.debug("RowlevelReport className: "+className);
            var amount = Banana.SDecimal.round(param.taxonomy[role][object][contextname], { 'decimals': 2 });
            //var amount = Math.round(param.taxonomy[role][object][contextname] * 100) / 100;
            amount = Banana.Converter.toLocaleNumberFormat(amount);
            row.addCell(param.taxonomy[role][object]['label']['de'], className);
            row.addCell(amount, className + " amount");
        }
    }
    printDataCompany(report, dataCompany, dataLevelCompany) {

        //Data Rows
        var table3 = report.addTable("table3");
        var headerRow = table3.getHeader().addRow();
        var title = 'Global Common Data';
        headerRow.addCell(title, "mainTitle");

        //Column names
        headerRow = table3.getHeader().addRow();
        headerRow.addCell("Feld", "title description");
        headerRow.addCell("Wert", "title description");
        let counter = 0;
        //Banana.console.debug("Lenght datacompany: "+dataCompany.length);
        //Banana.console.debug("length of dataLevelCOmpany: "+dataLevelCompany.length);
        let level;
        for (const item of dataCompany) {
            
            //Banana.console.debug("lvl: "+level+" counter: "+counter);
            //Banana.console.debug("item.key: "+(item.key) +" item.value: "+ (item.value));
            Banana.console.debug("item.key: "+(item.key) +" item.value: "+ (item.value));
            level = dataLevelCompany[counter];
            var row = table3.addRow();
            var itemKey = `${item.key}`;
            var itemValue = `${item.value}`;
            
            row.addCell(itemKey, "data level" + level);
            row.addCell(itemValue, "data level" + level);
            counter++;
        }
        counter ++;
        /* for (let i = 0; i < dataCompany.name.length; i++) {
            Banana.console.debug(`Name: ${dataCompany.name[i]}, Value: ${dataCompany.value[i]}, Level: ${dataCompany.level[i]}`);
            var row = table3.addRow();
            let levelRow = `${dataCompany.level[i]}`;
            let nameRow = `${dataCompany.name[i]}`;
            let valueRow = `${dataCompany.value[i]}`;;
            
            row.addCell(nameRow, "data level" + levelRow);
            row.addCell(valueRow, "data level" + levelRow);
        } */
    }
}