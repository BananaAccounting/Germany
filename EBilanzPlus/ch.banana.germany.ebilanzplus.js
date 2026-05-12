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
// @pubdate = 2026-05-12
// @publisher = Banana.ch SA
// @task = export.file
// @timeout = -1

function exec() {
    if (!Banana.document) {
        return "@Cancel";
    }

    var exporter = new EBilanzExporter(Banana.document);
    if (!exporter.verifyBananaVersion()) {
        return "@Cancel";
    }

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
    this.ID_ERR_BANANA_VERSION_NOTVALID = "ID_ERR_BANANA_VERSION_NOTVALID";
    this.ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";
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

EBilanzExporter.prototype.getErrorMessage = function (errorId, lang) {
    var lang = "en";
    if (this.banDocument && this.banDocument.locale) {
        lang = this.banDocument.locale;
    }
    if (lang.length > 2) {
        lang = lang.substr(0, 2);
    }
    switch (errorId) {
        case this.ID_ERR_BANANA_VERSION_NOTVALID:
            if (lang === 'it')
                return "L'estensione richiede Banana Contabilità+ versione minima %1.\n" +
                    "Per aggiornare o per maggiori informazioni cliccare su Aiuto";
            else if (lang === 'fr')
                return "L'extension nécessite Banana Comptabilité+ version minimale %1.\n" +
                    "Pour mettre à jour ou pour plus d'informations, cliquez sur Aide";
            else if (lang === 'de')
                return "Die Erweiterung erfordert Banana Buchhaltung+ Mindestversion %1.\n" +
                    "Zum Aktualisieren oder für weitere Informationen klicken Sie auf Hilfe";
            else
                return "The extension requires Banana Accounting+ minimum version %1.\n" +
                    "To update or for more information click Help";
        case this.ID_ERR_LICENSE_NOTVALID:
            if (lang === 'it')
                return "Questa estensione richiede Banana Contabilità+ Advanced o Professional.\nPer aggiornare o per maggiori informazioni cliccare su Aiuto";
            else if (lang === 'fr')
                return "Cette extension nécessite Banana Comptabilité+ Advanced ou Professional.\nPour mettre à jour ou pour plus d'informations, cliquez sur Aide";
            else if (lang === 'de')
                return "Diese Erweiterung erfordert Banana Accounting+ Advanced oder Professional.\nKlicken Sie auf Hilfe, um zu aktualisieren oder weitere Informationen zu bekommen";
            else
                return "This extension requires Banana Accounting+ Advanced or Professoinal.\nTo update or for more information click on Help";

    }
};

EBilanzExporter.prototype.verifyBananaVersion = function () {
    if (!this.banDocument)
        return false;

    var requiredVersion = "10.1";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
        var msg = this.getErrorMessage(this.ID_ERR_BANANA_VERSION_NOTVALID);
        msg = msg.replace("%1", requiredVersion);
        this.banDocument.addMessage(msg, this.ID_ERR_BANANA_VERSION_NOTVALID);
        return false;
    }

    // License
    var license = Banana.application.license;
    if (license) {
        if (license.licenseType === "advanced") {
            return true;
        }
        else if (license.licenseType === "professional") {
            return true;
        }
        else if (license.isWithinMaxFreeLines) {
            return true;
        }
    }

    //the license is not valid
    var msg = this.getErrorMessage(this.ID_ERR_LICENSE_NOTVALID);
    this.banDocument.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
    return false;

}
