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
//

/* function exec(inData, options) {
    // Banana.Ui.showText("testing multiselection property");
    settingsDialog();
} */
var openPropertyEditor = class openPropertyEditor {
    constructor() {
    }
    initParam() {
        var param = {};
        param.field = "";
        param.value = "";
        return param;
    }

    settingsDialog(typeEBilanz) {

        var param = this.initParam();
        var savedParam;
        if (Banana.document)
            savedParam = Banana.document.getScriptSettings();
        if (savedParam.length > 0) {

            param = JSON.parse(savedParam);
        }

        //verifyParam(param);

        var dialogTitle = 'Settings of Global Common Data';
        var convertedParam;

        //creazione dialoghi con parametri per ogni tipologia di Ebilanz

        if (typeEBilanz === 'EBilanz54PersG') {
            //creazione dialogo con parametri
            convertedParam = this.convertParamEB54PersG(param);

        }
        else if (typeEBilanz === 'EBilanz54EinzelU') {
            convertedParam = this.convertParamEB54EinzelU(param);

        }
        else if (typeEBilanz === 'EBilanz54KapG') {
            convertedParam = this.convertParamEB54KapG(param);
        }
        else if (typeEBilanz === 'EBilanz61KapG') {
            convertedParam = this.convertParamEB61KapG(param);
        }
        var pageAnchor = 'dlgSettings';
        if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
            return false;
        for (var i = 0; i < convertedParam.data.length; i++) {
            // Read values to param (through the readValue function)
            if (typeof (convertedParam.data[i].readValue) == "function")
                convertedParam.data[i].readValue();
        }

        var paramToString = JSON.stringify(param);

        if (Banana.document) {
            var value = Banana.document.setScriptSettings(paramToString);
            var stringJSONValueDialog = Banana.document.getScriptSettings();
        }

        return stringJSONValueDialog;
    }


    /**
     * 
     * @param {object of array} param 
     * @param {name of object} paramName 
     * @param {title of object} paramTitle 
     * @param {type of object} paramType 
     * @param {default message of object} defaultValueMessage 
     * @returns 
     */
    createParameter(param, paramName, paramTitle, paramType, defaultValueMessage) {
        var currentParameter = {};
        currentParameter.name = paramName;
        currentParameter.title = paramTitle;
        currentParameter.type = paramType;
        if (paramType === 'string') {
            currentParameter.value = param[paramName] ? param[paramName] : defaultValueMessage;
        }
        else if (paramType === 'bool') {
            currentParameter.value = param[paramName] ? param[paramName] : false;
        }
        currentParameter.readValue = function () {
            param[paramName] = this.value;
        };
        return currentParameter;

    }

    convertParamEB54PersG(param) {

        var lang = 'en';

        var convertedParam = {};
        convertedParam.version = '1.0';
        convertedParam.data = [];

        var currentParam = this.createParameter(param, 'Identifikationsmerkmale des Dokuments', 'Identifikationsmerkmale des Dokuments', 'string', '[Identifikationsmerkmale des Dokuments]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Erstellungsdatum', 'Erstellungsdatum', 'string', '[Erstellungsdatum]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Anlass zur Erstellung des Dokuments', 'Anlass zur Erstellung des Dokuments', 'string', '[Anlass zur Erstellung des Dokuments]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Inhalt des Dokuments', 'Inhalt des Dokuments', 'string', '[Inhalt des Dokuments]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Ursprungssprache des Dokuments', 'Ursprungssprache des Dokuments', 'string', '[Ursprungssprache des Dokuments]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokument veröffentlichungsfähig?', 'Dokument veröffentlichungsfähig?', 'string', '[Dokument veröffentlichungsfähig?]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Unternehmens-Identifikationsnummer', 'Unternehmens-Identifikationsnummer', 'string', '[Schreiben Sie die Unternehmens-Identifikationsnummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentersteller', 'Dokumentersteller', 'string', '[Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentersteller, Name', 'Dokumentersteller, Name', 'string', '[Dokumentersteller, Name]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Funktion, Dokumentersteller', 'Funktion, Dokumentersteller', 'string', '[Funktion, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Kontaktperson des Unternehmens', 'Kontaktperson des Unternehmens', 'string', '[Kontaktperson des Unternehmens]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Steuerberater', 'Steuerberater', 'string', '[Steuerberater]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Firmenname, Dokumentersteller', 'Firmenname, Dokumentersteller', 'string', '[Firmenname, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Straße, Dokumentersteller', 'Straße, Dokumentersteller', 'string', '[Straße, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Hausnummer, Dokumentersteller', 'Hausnummer, Dokumentersteller', 'string', '[Hausnummer, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Postleitzahl, Dokumentersteller', 'Postleitzahl, Dokumentersteller', 'string', '[Postleitzahl, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Ort, Dokumentersteller', 'Ort, Dokumentersteller', 'string', '[Ort, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Land, Dokumentersteller', 'Land, Dokumentersteller', 'string', '[Land, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Iso Code Land, Dokumentersteller', 'Iso Code Land, Dokumentersteller', 'string', '[Iso Code Land, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Telefonnummer, Dokumentersteller', 'Telefonnummer, Dokumentersteller', 'string', '[Telefonnummer, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Faxnummer, Dokumentersteller', 'Faxnummer, Dokumentersteller', 'string', '[Faxnummer, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'e-mail Adresse, Dokumentersteller', 'e-mail Adresse, Dokumentersteller', 'string', '[e-mail Adresse, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Hauptansprechpartner, Dokumentersteller', 'Hauptansprechpartner, Dokumentersteller', 'string', '[Hauptansprechpartner, Dokumentersteller]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentabsender', 'Dokumentabsender', 'string', '[Dokumentabsender]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Document sender, type of ID', 'Document sender, type of ID', 'string', '[Document sender, type of ID]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentabsender, Wert der ID', 'Dokumentabsender, Wert der ID', 'string', '[Dokumentabsender, Wert der ID]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentabsender, Straße', 'Dokumentabsender, Straße', 'string', '[Dokumentabsender, Straße]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentabsender, Hausnummer', 'Dokumentabsender, Hausnummer', 'string', '[Dokumentabsender, Hausnummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentabsender, Postleitzahl', 'Dokumentabsender, Postleitzahl', 'string', '[Dokumentabsender, Postleitzahl]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentabsender, Ort', 'Dokumentabsender, Ort', 'string', '[Dokumentabsender, Ort]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentabsender, Firmenname', 'Dokumentabsender, Firmenname', 'string', '[Dokumentabsender, Firmenname]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentrevisionen', 'Dokumentrevisionen', 'string', '[Dokumentrevisionen]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Liste Dokumentrevisionen mit Datum', 'Liste Dokumentrevisionen mit Datum', 'string', '[Liste Dokumentrevisionen mit Datum]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'aktuelle Versionsnummer Dokument', 'aktuelle Versionsnummer Dokument', 'string', '[aktuelle Versionsnummer Dokument]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Änderungsdatum Dokument', 'Änderungsdatum Dokument', 'string', '[Änderungsdatum Dokument]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Veranlasser der Änderung im Dokument', 'Veranlasser der Änderung im Dokument', 'string', '[Veranlasser der Änderung im Dokument]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'nutzerspezifische Dokumentinformationen', 'nutzerspezifische Dokumentinformationen', 'string', '[nutzerspezifische Dokumentinformationen]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Informationen zum Bericht', 'Informationen zum Bericht', 'string', '[Informationen zum Bericht]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Sachverständige', 'Sachverständige', 'string', '[Sachverständige]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Gutachter für Pensionsrückstellung', 'Gutachter für Pensionsrückstellung', 'string', '[Gutachter für Pensionsrückstellung]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'sonstige Gutachter', 'sonstige Gutachter', 'string', '[sonstige Gutachter (z.B. für Gutachter zur Bewertung von Beteiligungen oder Grundstücken)]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Identifikationsmerkmale des Berichts', 'Identifikationsmerkmale des Berichts', 'string', '[Identifikationsmerkmale des Berichts]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Art des Berichts', 'Art des Berichts', 'string', '[Art des Berichts: Geschäftsbericht, Jahresfinanzbericht, Verkaufsprospekt, Prüfungsbericht, Erstellungsbericht, Einnahmenüberschussrechnung, Halbjahresfinanzbericht, Gutachten, Quartalsfinanzbericht,  sonstiger Bericht]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum', 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum', 'string', '[Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum', 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum', 'string', '[Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum]');
        convertedParam.data.push(currentParam);

        return convertedParam;
    }

    convertParamEB54EinzelU(param) {
        var lang = 'en';

        var convertedParam = {};
        convertedParam.data = [];
        convertedParam.version = '1.0';
        // dati proprietario ditta individuale
        var currentParam = this.createParameter(param, 'Name des Firmeninhabers', 'Name des Firmeninhabers', 'string', '[name]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Adresse des Firmeninhabers', 'Adresse des Firmeninhabers', 'string', '[Addresse]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Geburtsdatum des Firmeninhabers', 'Geburtsdatum des Firmeninhabers', 'string', '[xx.xx.xxxx]');
        convertedParam.data.push(currentParam);

        //dati ditta
        var currentParam = this.createParameter(param, 'Firmenname', 'Firmenname', 'string', '[Firmenname]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Adresse', 'Adresse', 'string', '[Adresse]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Art des Unternehmens', 'Art des Unternehmens', 'string', '[Art des Unternehmens]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Steuernummer', 'Steuernummer', 'string', '[Steuernummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Umsatzsteueridentifikationsnummer', 'Umsatzsteueridentifikationsnummer', 'string', '[Umsatzsteueridentifikationsnummer]');
        convertedParam.data.push(currentParam);

        //stampa preview
        var currentParam = this.createParameter(param, 'print_preview', 'Print preview', 'bool', '');
        convertedParam.data.push(currentParam);

        return convertedParam;

    }

    convertParamEB54KapG(param) {
        var lang = 'en';
        var convertedParam = {};
        convertedParam.data = [];
        convertedParam.version = '1.0';

        var currentParam = this.createParameter(param, 'Name der Gesellschaft', 'Name der Gesellschaft', 'string', '[Name der Gesellschaft]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Rechtsform', 'Rechtsform', 'string', '[Rechtsform]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Adresse des Firmensitzes', 'Adresse des Firmensitzes', 'string', '[Adresse des Firmensitzes]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Handelsregisternummer', 'Handelsregisternummer', 'string', '[Handelsregisternummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Registergericht', 'Registergericht', 'string', '[Registergericht]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Steuernummer', 'Steuernummer', 'string', '[Steuernummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Umsatzsteuer-Identifikationsnummer', 'Umsatzsteuer-Identifikationsnummer', 'string', '[Umsatzsteuer-Identifikationsnummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Legal Entity Identifier (LEI)', 'Legal Entity Identifier (LEI)', 'string', '[Legal Entity Identifier (LEI)]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Beginn des Geschäftsjahres', 'Beginn des Geschäftsjahres', 'string', '[Beginn des Geschäftsjahres]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Ende des Geschäftsjahres', 'Ende des Geschäftsjahres', 'string', '[Ende des Geschäftsjahres]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'print_preview', 'Print preview', 'bool', '');
        convertedParam.data.push(currentParam);

        return convertedParam;
    }

    convertParamEB61KapG(param) {
        var lang = 'en';
        var convertedParam = {};
        convertedParam.data = [];
        convertedParam.version = '1.0';

        var currentParam = this.createParameter(param, 'Name der Firma ', 'Name der Firma', 'string', '[Schreiben Sie den Name der Firma]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Firmenadresse  ', 'Firmenadresse ', 'string', '[Schreiben Sie die Firmenadresse]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Umsatzsteuer-Identifikationsnummer ', 'Umsatzsteuer-Identifikationsnummer', 'string', '[Schreiben Sie Ihre Umsatzsteuer-Identifikationsnummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Steuernummer ', 'Steuernummer', 'string', '[Schreiben Sie Ihre Steuernummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'print_preview', 'Print preview', 'bool', '');
        convertedParam.data.push(currentParam);

        return convertedParam;

    }
    jsonToArrayConverter(JSONStringData) {
        const dataObject = JSON.parse(JSONStringData);
        const resultsArray = [];

        // Iterare attraverso le proprietà dell'oggetto
        for (const key in dataObject) {
            if (dataObject.hasOwnProperty(key)) {
                // Estrarre il valore
                const value = dataObject[key];
                // Aggiungere il valore e la chiave all'array
                resultsArray.push({ key: key, value: value });
            }
        }
        return resultsArray;
    }
}
