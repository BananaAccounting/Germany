// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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
// @api = 1.0
// @id = ch.banana.germany.ebilanzplus
// @description = Export to eBilanz+ (CSV)
// @doctype = 100.*;110.*;130.*
// @encoding = Windows-1252
// @exportfilename = companyname-ebilanzplus-<Date>
// @exportfiletype = csv
// @inputdatasource = none
// @pubdate = 2026-04-07
// @publisher = Banana.ch SA
// @task = export.file
// @timeout = -1

function exec() {
    
    if (!Banana.document) {
        return "@Cancel";
    }

    //Checks Banana version and license
    var isCurrentBananaVersionSupported = bananaRequiredVersion("10.1");
    if (!isCurrentBananaVersionSupported) {
        return "@Cancel";
    }

    var exporter = new EBilanzExporter(Banana.document);
    var header = exporter.getHeader();
    var rows = exporter.getRows();
    var csvContent = exporter.tableToCsv([header].concat(rows));
    return csvContent;
}

/* Function that checks Banana version and license type */
function bananaRequiredVersion(requiredVersion) {

    if (!Banana.document)
        return false;
    
    var language = "";
    if (Banana.document.locale) {
        language = Banana.document.locale;
    }
    if (language && language.length > 2) {
        language = language.substr(0, 2);
    }

    var msg = "";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
        switch(language) {
            case "en":
                msg = "The extension requires Banana Accounting Plus (version "+ requiredVersion + " or later)";
                break;

            case "it":
                msg = "L'estensione richiede Banana Contabilità Plus (versione "+ requiredVersion + " o successiva)";
                break;

            case "fr":
                msg = "L'extension nécessite de Banana Comptabilité Plus (version "+ requiredVersion + " ou plus récente)";
                break;

            case "de":
                msg = "Die Erweiterung erfordert Banana Buchhaltung Plus (Version "+ requiredVersion + " oder neuer)";
                break;

            case "nl":
                msg = "De extensie vereist Banana Boekhouding Plus (versie "+ requiredVersion + " of meer recent)";
                break;

            case "pt":
                msg = "A extensão requer Banana Contabilidade Plus (versão "+ requiredVersion + " ou posterior)";
                break;

            default:
                msg = "The extension requires Banana Accounting Plus (version "+ requiredVersion + " or later)";
                break;
        }
        Banana.application.showMessages(msg);
        Banana.document.addMessage(msg);
        return false;
    }
    return true;
}

function EBilanzExporter(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;
    this.separator = ";";
}

EBilanzExporter.prototype.getAccounts = function () {
    var result = [];
    if (!this.banDocument)
        return result;

    let isIncomeExpensesAccounting = false;
    let debitColumnName = "Debit";
    let creditColumnName = "Credit";
    let balanceColumnName = "Balance";

    if (this.banDocument.table("Categories")) {
        isIncomeExpensesAccounting = true;
        debitColumnName = "Income";
        creditColumnName = "Expenses";
    }

    //Accounts table
    var table = this.banDocument.table("Accounts");
    if (table) {
        for (var rowNr = 0; rowNr < table.rowCount; rowNr++) {
            var row = table.row(rowNr);
            if (row) {
                if (row.value("Account") && row.value("Account").length > 0) {
                    let acceptRow = false;
                    if (!Banana.SDecimal.isZero(row.value(debitColumnName)))
                        acceptRow = true;
                    else if (!Banana.SDecimal.isZero(row.value(creditColumnName)))
                        acceptRow = true;
                    else if (!Banana.SDecimal.isZero(row.value(balanceColumnName)))
                        acceptRow = true;
                    let firstChar = row.value("Account")[0];
                    if (firstChar === ":" || firstChar === ";" || firstChar === "," || firstChar === ".")
                        acceptRow = false;

                    if (acceptRow) {
                        result.push({
                            account: row.value("Account"),
                            description: row.value("Description"),
                            debit: row.value(debitColumnName),
                            credit: row.value(creditColumnName),
                            balance: row.value(balanceColumnName)
                        });
                    }
                }
            }
        }
    }

    //Categories table
    if (isIncomeExpensesAccounting) {
        table = this.banDocument.table('Categories');
        for (var rowNr = 0; rowNr < table.rowCount; rowNr++) {
            var row = table.row(rowNr);
            if (row) {
                if (row.value("Category") && row.value("Category").length > 0) {
                    let acceptRow = false;
                    if (!Banana.SDecimal.isZero(row.value(debitColumnName)))
                        acceptRow = true;
                    else if (!Banana.SDecimal.isZero(row.value(creditColumnName)))
                        acceptRow = true;
                    else if (!Banana.SDecimal.isZero(row.value(balanceColumnName)))
                        acceptRow = true;
                    let firstChar = row.value("Category")[0];
                    if (firstChar === ":" || firstChar === ";" || firstChar === "," || firstChar === ".")
                        acceptRow = false;

                    if (acceptRow) {

                        result.push({
                            account: row.value("Category"),
                            description: row.value("Description"),
                            debit: row.value(debitColumnName),
                            credit: row.value(creditColumnName),
                            balance: row.value(balanceColumnName)
                        });
                    }
                }
            }
        }
    }

    return result;
};

EBilanzExporter.prototype.getHeader = function () {
    var fields = [];
    fields.push("Konto");
    fields.push("Beschreibung");
    fields.push("Soll");
    fields.push("Haben");
    fields.push("Balance");
    return fields;
}

EBilanzExporter.prototype.getRows = function () {
    let rows = [];

    let accounts = this.getAccounts();
    for (var i = 0; i < accounts.length; i++) {
        var row = [];
        row.push(accounts[i].account);
        row.push(accounts[i].description);
        row.push(accounts[i].debit);
        row.push(accounts[i].credit);
        row.push(accounts[i].balance);
        rows.push(row);
    }

    return rows;
};

/**
 * Converts an array of rows to a CSV string.
 * Fields containing separator, quotes or line breaks are quoted.
 * Double quotes inside fields are escaped by doubling them.
 */
EBilanzExporter.prototype.tableToCsv = function (table) {
    var result = "";
    if (!table)
        return result;

    for (var i = 0; i < table.length; i++) {
        var values = table[i];
        for (var j = 0; values && j < values.length; j++) {
            if (j > 0)
                result += this.separator;
            var value = values[j];
            value = this.escapeValue(value);
            result += value;
        }
        result += "\r\n";
    }
    return result;
}

EBilanzExporter.prototype.escapeValue = function(value) {
    if (value === null || value === undefined)
        return "";

    value = value.toString();

    if (value.indexOf('"') >= 0)
        value = value.replace(/"/g, '""');

    if (value.indexOf(this.separator) >= 0 || value.indexOf("\n") >= 0 || value.indexOf("\r") >= 0 || value.indexOf('"') >= 0)
        value = '"' + value + '"';

    return value;
};