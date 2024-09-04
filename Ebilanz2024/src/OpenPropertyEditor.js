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
        this.stringJSONValueDialogEBilanz = null;
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
            this.stringJSONValueDialogEBilanz = Banana.document.getScriptSettings();
            this.getDataJSONDialog(this.stringJSONValueDialogEBilanz);
        }

        return true;
    }

    getDataJSONDialog(){
        return this.stringJSONValueDialogEBilanz;
    }

    /**
     * 
     * @param {*} param 
     * @param {*} paramName 
     * @param {*} paramTitle 
     * @param {*} paramType 
     * @param {*} paramParent 
     * @param {*} defaultValueMessage 
     * @param {*} paramEditable 
     * @returns 
     */
    createParameter(param, paramName, paramTitle, paramType, paramParent, defaultValueMessage, paramEditable, items) {
        var currentParameter = {};
        currentParameter.name = paramName;
        currentParameter.title = paramTitle;
        currentParameter.type = paramType;
        currentParameter.parentObject = paramParent;
        currentParameter.editable = paramEditable;
        if(items.length > 0){
            Banana.console.debug("Control items length");
            currentParameter.items = items.slice();
        }
        if (paramType === 'string') {
            currentParameter.value = param[paramName] ? param[paramName] : defaultValueMessage;
            Banana.console.debug("Control paramType string");
        }
        else if (paramType === 'bool') {
            currentParameter.value = param[paramName] ? param[paramName] : false;
            Banana.console.debug("Control bool");
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

        var currentParam = this.createParameter(param, 'Dokumentinformation', 'Dokumentinformation', 'string', 'Dokumentinformation', '', false, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Identifikationsmerkmale des Dokuments', 'Identifikationsmerkmale des Dokuments', 'string', 'Dokumentinformation', '', false, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Erstellungsdatum', 'Erstellungsdatum', 'date', 'Identifikationsmerkmale des Dokuments', '' , true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Anlass zur Erstellung des Dokuments', 'Anlass zur Erstellung des Dokuments', 'string', 'Identifikationsmerkmale des Dokuments', '[Anlass zur Erstellung des Dokuments]', true,'');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Inhalt des Dokuments', 'Inhalt des Dokuments', 'string', 'Identifikationsmerkmale des Dokuments', '[Inhalt des Dokuments]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Ursprungssprache des Dokuments', 'Ursprungssprache des Dokuments', 'string', 'Identifikationsmerkmale des Dokuments', '[Ursprungssprache des Dokuments]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokument veröffentlichungsfähig?', 'Dokument veröffentlichungsfähig?', 'string', 'Identifikationsmerkmale des Dokuments', '[Dokument veröffentlichungsfähig? JA/NEIN]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentersteller', 'Dokumentersteller', 'string', 'Dokumentersteller', '', false, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Unternehmens-Identifikationsnummer', 'Unternehmens-Identifikationsnummer', 'string', 'Dokumentersteller', '[Schreiben Sie die Unternehmens-Identifikationsnummer]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentersteller, Name', 'Dokumentersteller, Name', 'string', 'Dokumentersteller', '[Dokumentersteller, Name]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Funktion, Dokumentersteller', 'Funktion, Dokumentersteller', 'string', 'Dokumentersteller', '[Funktion, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Kontaktperson des Unternehmens', 'Kontaktperson des Unternehmens', 'string', 'Funktion, Dokumentersteller', '[Kontaktperson des Unternehmens]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Steuerberater', 'Steuerberater', 'string', 'Steuerberater', '[Steuerberater]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Firmenname, Dokumentersteller', 'Firmenname, Dokumentersteller', 'string', 'Dokumentersteller', '[Firmenname, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Straße, Dokumentersteller', 'Straße, Dokumentersteller', 'string', 'Dokumentersteller', '[Straße, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Hausnummer, Dokumentersteller', 'Hausnummer, Dokumentersteller', 'string', 'Dokumentersteller', '[Hausnummer, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Postleitzahl, Dokumentersteller', 'Postleitzahl, Dokumentersteller', 'string', 'Dokumentersteller', '[Postleitzahl, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Ort, Dokumentersteller', 'Ort, Dokumentersteller', 'string', 'Dokumentersteller', '[Ort, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Land, Dokumentersteller', 'Land, Dokumentersteller', 'string', 'Dokumentersteller', '[Land, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Iso Code Land, Dokumentersteller', 'Iso Code Land, Dokumentersteller', 'string', 'Land, Dokumentersteller', '[Iso Code Land, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Telefonnummer, Dokumentersteller', 'Telefonnummer, Dokumentersteller', 'string', 'Dokumentersteller', '[Telefonnummer, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Faxnummer, Dokumentersteller', 'Faxnummer, Dokumentersteller', 'string', 'Dokumentersteller', '[Faxnummer, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'e-mail Adresse, Dokumentersteller', 'e-mail Adresse, Dokumentersteller', 'string', 'Dokumentersteller', '[e-mail Adresse, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Hauptansprechpartner, Dokumentersteller', 'Hauptansprechpartner, Dokumentersteller', 'string', 'Dokumentersteller', '[Hauptansprechpartner, Dokumentersteller]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Dokumentrevisionen', 'Dokumentrevisionen', 'string', '', '[Dokumentrevisionen]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Liste Dokumentrevisionen mit Datum', 'Liste Dokumentrevisionen mit Datum', 'string', 'Dokumentrevisionen', '[Liste Dokumentrevisionen mit Datum]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'aktuelle Versionsnummer Dokument', 'aktuelle Versionsnummer Dokument', 'string', 'Dokumentrevisionen', '[aktuelle Versionsnummer Dokument]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Änderungsdatum Dokument', 'Änderungsdatum Dokument', 'date', 'Dokumentrevisionen', '', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Veranlasser der Änderung im Dokument', 'Veranlasser der Änderung im Dokument', 'string', 'Dokumentrevisionen', '[Veranlasser der Änderung im Dokument]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'nutzerspezifische Dokumentinformationen', 'nutzerspezifische Dokumentinformationen', 'string', '', '[nutzerspezifische Dokumentinformationen]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Informationen zum Bericht', 'Informationen zum Bericht', 'string', '', '[Informationen zum Bericht]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Sachverständige', 'Sachverständige', 'string', 'Informationen zum Bericht', '[Sachverständige]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Gutachter für Pensionsrückstellung', 'Gutachter für Pensionsrückstellung', 'string', 'Sachverständige', '[Gutachter für Pensionsrückstellung]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'sonstige Gutachter', 'sonstige Gutachter', 'string', 'Sachverständige', '[sonstige Gutachter (z.B. für Gutachter zur Bewertung von Beteiligungen oder Grundstücken)]', true, '');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Identifikationsmerkmale des Berichts', 'Identifikationsmerkmale des Berichts', 'string', '', '[Identifikationsmerkmale des Berichts]', true,'');
        convertedParam.data.push(currentParam);

        let items = [];
        items.push('Geschäftsbericht','Jahresfinanzbericht', 'Verkaufsprospekt', 'Prüfungsbericht', 'Erstellungsbericht', 'Jahresabschluss', 'Einnahmeüberschussrechnung', 'Halbjahresfinanzbericht', 'Gutachten', 'Quartalsfinanzbericht', 'sonstiger Bericht');
        var currentParam = this.createParameter(param, 'Art des Berichts', 'Art des Berichts', 'combobox', 'Identifikationsmerkmale des Berichts','', true, items);
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum', 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum', 'date', '','', true, '');
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

        var currentParam = this.createParameter(param, 'Geburtsdatum des Firmeninhabers', 'Geburtsdatum des Firmeninhabers', 'date', '');
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
