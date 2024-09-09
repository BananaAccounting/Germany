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

    getDataJSONDialog() {
        return this.stringJSONValueDialogEBilanz;
    }

    /**
     * 
     * @param {*} param 
     * @param {*} options 
     * @returns 
     */
    createParameter(param, options) {
        var currentParameter = {
            name: options.paramName,
            title: options.paramTitle,
            type: options.paramType,
            parentObject: options.paramParent,
            editable: options.paramEditable,
            items: options.items.length > 0 ? options.items.slice() : undefined,
            value: (() => this.getDefaultValue(param, options))()
        };
    
        currentParameter.readValue = function () {
            param[options.paramName] = this.value;
        };
    
        return currentParameter;
    }
    
    getDefaultValue(param, options) {
        if (options.paramType === 'string') {
            return param[options.paramName] ? param[options.paramName] : options.defaultValueMessage;
        } else if (options.paramType === 'bool') {
            return param[options.paramName] ? param[options.paramName] : options.defaultValueMessage = false;
        }
        return undefined;
    }
    

    convertParamEB54PersG(param) {

        var lang = 'en';

        var convertedParam = { data: [] };
        convertedParam.version = '1.0';

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentinformation',
            paramTitle: 'Dokumentinformation',
            paramType: 'string',
            paramParent: 'Dokumentinformation',
            defaultValueMessage: '',
            paramEditable: false,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Identifikationsmerkmale des Dokuments',
            paramTitle: 'Identifikationsmerkmale des Dokuments',
            paramType: 'string',
            paramParent: 'Dokumentinformation',
            defaultValueMessage: '',
            paramEditable: false,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Erstellungsdatum',
            paramTitle: 'Erstellungsdatum',
            paramType: 'date',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Anlass zur Erstellung des Dokuments',
            paramTitle: 'Anlass zur Erstellung des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Anlass zur Erstellung des Dokuments]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Inhalt des Dokuments',
            paramTitle: 'Inhalt des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Inhalt des Dokuments]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ursprungssprache des Dokuments',
            paramTitle: 'Ursprungssprache des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Ursprungssprache des Dokuments]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokument veröffentlichungsfähig?',
            paramTitle: 'Dokument veröffentlichungsfähig?',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Dokument veröffentlichungsfähig? JA/NEIN]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentersteller',
            paramTitle: 'Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '',
            paramEditable: false,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmens-Identifikationsnummer',
            paramTitle: 'Unternehmens-Identifikationsnummer',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Schreiben Sie die Unternehmens-Identifikationsnummer]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentersteller, Name',
            paramTitle: 'Dokumentersteller, Name',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Dokumentersteller, Name]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Funktion, Dokumentersteller',
            paramTitle: 'Funktion, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Funktion, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kontaktperson des Unternehmens',
            paramTitle: 'Kontaktperson des Unternehmens',
            paramType: 'string',
            paramParent: 'Funktion, Dokumentersteller',
            defaultValueMessage: '[Kontaktperson des Unternehmens]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Steuerberater',
            paramTitle: 'Steuerberater',
            paramType: 'string',
            paramParent: 'Steuerberater',
            defaultValueMessage: '[Steuerberater]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Firmenname, Dokumentersteller',
            paramTitle: 'Firmenname, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Firmenname, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Straße, Dokumentersteller',
            paramTitle: 'Straße, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Straße, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hausnummer, Dokumentersteller',
            paramTitle: 'Hausnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Hausnummer, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Postleitzahl, Dokumentersteller',
            paramTitle: 'Postleitzahl, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Postleitzahl, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ort, Dokumentersteller',
            paramTitle: 'Ort, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Ort, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land, Dokumentersteller',
            paramTitle: 'Land, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Land, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Iso Code Land, Dokumentersteller',
            paramTitle: 'Iso Code Land, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Land, Dokumentersteller',
            defaultValueMessage: '[Iso Code Land, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Telefonnummer, Dokumentersteller',
            paramTitle: 'Telefonnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Telefonnummer, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Faxnummer, Dokumentersteller',
            paramTitle: 'Faxnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Faxnummer, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'e-mail Adresse, Dokumentersteller',
            paramTitle: 'e-mail Adresse, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[e-mail Adresse, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hauptansprechpartner, Dokumentersteller',
            paramTitle: 'Hauptansprechpartner, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Hauptansprechpartner, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentrevisionen',
            paramTitle: 'Dokumentrevisionen',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Dokumentrevisionen]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Liste Dokumentrevisionen mit Datum',
            paramTitle: 'Liste Dokumentrevisionen mit Datum',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[Liste Dokumentrevisionen mit Datum]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'aktuelle Versionsnummer Dokument',
            paramTitle: 'aktuelle Versionsnummer Dokument',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[aktuelle Versionsnummer Dokument]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Änderungsdatum Dokument',
            paramTitle: 'Änderungsdatum Dokument',
            paramType: 'date',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Veranlasser der Änderung im Dokument',
            paramTitle: 'Veranlasser der Änderung im Dokument',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[Veranlasser der Änderung im Dokument]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'nutzerspezifische Dokumentinformationen',
            paramTitle: 'nutzerspezifische Dokumentinformationen',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[nutzerspezifische Dokumentinformationen]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Informationen zum Bericht',
            paramTitle: 'Informationen zum Bericht',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Informationen zum Bericht]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Sachverständige',
            paramTitle: 'Sachverständige',
            paramType: 'string',
            paramParent: 'Informationen zum Bericht',
            defaultValueMessage: '[Sachverständige]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gutachter für Pensionsrückstellung',
            paramTitle: 'Gutachter für Pensionsrückstellung',
            paramType: 'string',
            paramParent: 'Sachverständige',
            defaultValueMessage: '[Gutachter für Pensionsrückstellung]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'sonstige Gutachter',
            paramTitle: 'sonstige Gutachter',
            paramType: 'string',
            paramParent: 'Sachverständige',
            defaultValueMessage: '[sonstige Gutachter (z.B. für Gutachter zur Bewertung von Beteiligungen oder Grundstücken)]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Identifikationsmerkmale des Berichts',
            paramTitle: 'Identifikationsmerkmale des Berichts',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Identifikationsmerkmale des Berichts]',
            paramEditable: true,
            items: []
        }));

        let items = [
            'Geschäftsbericht', 'Jahresfinanzbericht', 'Verkaufsprospekt',
            'Prüfungsbericht', 'Erstellungsbericht', 'Jahresabschluss',
            'Einnahmeüberschussrechnung', 'Halbjahresfinanzbericht',
            'Gutachten', 'Quartalsfinanzbericht', 'sonstiger Bericht'
        ];
    
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Art des Berichts',
            paramTitle: 'Art des Berichts',
            paramType: 'combobox',
            paramParent: 'Identifikationsmerkmale des Berichts',
            defaultValueMessage: '',
            paramEditable: true,
            items: items
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum',
            paramTitle: 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '[Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum]',
            paramEditable: true,
            items: []
        })); 

        return convertedParam;
    }

    convertParamEB54EinzelU(param) {
        var lang = 'en';

        
        var convertedParam = { data: [] };
        convertedParam.version = '1.0';

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentinformation',
            paramTitle: 'Dokumentinformation',
            paramType: 'string',
            paramParent: 'Dokumentinformation',
            defaultValueMessage: '',
            paramEditable: false,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Identifikationsmerkmale des Dokuments',
            paramTitle: 'Identifikationsmerkmale des Dokuments',
            paramType: 'string',
            paramParent: 'Dokumentinformation',
            defaultValueMessage: '',
            paramEditable: false,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Erstellungsdatum',
            paramTitle: 'Erstellungsdatum',
            paramType: 'date',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Anlass zur Erstellung des Dokuments',
            paramTitle: 'Anlass zur Erstellung des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Anlass zur Erstellung des Dokuments]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Inhalt des Dokuments',
            paramTitle: 'Inhalt des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Inhalt des Dokuments]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ursprungssprache des Dokuments',
            paramTitle: 'Ursprungssprache des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Ursprungssprache des Dokuments]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokument veröffentlichungsfähig?',
            paramTitle: 'Dokument veröffentlichungsfähig?',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Dokument veröffentlichungsfähig? JA/NEIN]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentersteller',
            paramTitle: 'Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '',
            paramEditable: false,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmens-Identifikationsnummer',
            paramTitle: 'Unternehmens-Identifikationsnummer',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Schreiben Sie die Unternehmens-Identifikationsnummer]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentersteller, Name',
            paramTitle: 'Dokumentersteller, Name',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Dokumentersteller, Name]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Funktion, Dokumentersteller',
            paramTitle: 'Funktion, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Funktion, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kontaktperson des Unternehmens',
            paramTitle: 'Kontaktperson des Unternehmens',
            paramType: 'string',
            paramParent: 'Funktion, Dokumentersteller',
            defaultValueMessage: '[Kontaktperson des Unternehmens]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Steuerberater',
            paramTitle: 'Steuerberater',
            paramType: 'string',
            paramParent: 'Steuerberater',
            defaultValueMessage: '[Steuerberater]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Firmenname, Dokumentersteller',
            paramTitle: 'Firmenname, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Firmenname, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Straße, Dokumentersteller',
            paramTitle: 'Straße, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Straße, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hausnummer, Dokumentersteller',
            paramTitle: 'Hausnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Hausnummer, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Postleitzahl, Dokumentersteller',
            paramTitle: 'Postleitzahl, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Postleitzahl, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ort, Dokumentersteller',
            paramTitle: 'Ort, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Ort, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land, Dokumentersteller',
            paramTitle: 'Land, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Land, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Iso Code Land, Dokumentersteller',
            paramTitle: 'Iso Code Land, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Land, Dokumentersteller',
            defaultValueMessage: '[Iso Code Land, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Telefonnummer, Dokumentersteller',
            paramTitle: 'Telefonnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Telefonnummer, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Faxnummer, Dokumentersteller',
            paramTitle: 'Faxnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Faxnummer, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'e-mail Adresse, Dokumentersteller',
            paramTitle: 'e-mail Adresse, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[e-mail Adresse, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hauptansprechpartner, Dokumentersteller',
            paramTitle: 'Hauptansprechpartner, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Hauptansprechpartner, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentrevisionen',
            paramTitle: 'Dokumentrevisionen',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Dokumentrevisionen]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Liste Dokumentrevisionen mit Datum',
            paramTitle: 'Liste Dokumentrevisionen mit Datum',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[Liste Dokumentrevisionen mit Datum]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'aktuelle Versionsnummer Dokument',
            paramTitle: 'aktuelle Versionsnummer Dokument',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[aktuelle Versionsnummer Dokument]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Änderungsdatum Dokument',
            paramTitle: 'Änderungsdatum Dokument',
            paramType: 'date',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Veranlasser der Änderung im Dokument',
            paramTitle: 'Veranlasser der Änderung im Dokument',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[Veranlasser der Änderung im Dokument]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'nutzerspezifische Dokumentinformationen',
            paramTitle: 'nutzerspezifische Dokumentinformationen',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[nutzerspezifische Dokumentinformationen]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Informationen zum Bericht',
            paramTitle: 'Informationen zum Bericht',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Informationen zum Bericht]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Sachverständige',
            paramTitle: 'Sachverständige',
            paramType: 'string',
            paramParent: 'Informationen zum Bericht',
            defaultValueMessage: '[Sachverständige]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gutachter für Pensionsrückstellung',
            paramTitle: 'Gutachter für Pensionsrückstellung',
            paramType: 'string',
            paramParent: 'Sachverständige',
            defaultValueMessage: '[Gutachter für Pensionsrückstellung]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'sonstige Gutachter',
            paramTitle: 'sonstige Gutachter',
            paramType: 'string',
            paramParent: 'Sachverständige',
            defaultValueMessage: '[sonstige Gutachter (z.B. für Gutachter zur Bewertung von Beteiligungen oder Grundstücken)]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Identifikationsmerkmale des Berichts',
            paramTitle: 'Identifikationsmerkmale des Berichts',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Identifikationsmerkmale des Berichts]',
            paramEditable: true,
            items: []
        }));

        let items = [
            'Geschäftsbericht', 'Jahresfinanzbericht', 'Verkaufsprospekt',
            'Prüfungsbericht', 'Erstellungsbericht', 'Jahresabschluss',
            'Einnahmeüberschussrechnung', 'Halbjahresfinanzbericht',
            'Gutachten', 'Quartalsfinanzbericht', 'sonstiger Bericht'
        ];
    
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Art des Berichts',
            paramTitle: 'Art des Berichts',
            paramType: 'combobox',
            paramParent: 'Identifikationsmerkmale des Berichts',
            defaultValueMessage: '',
            paramEditable: true,
            items: items
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum',
            paramTitle: 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '[Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum]',
            paramEditable: true,
            items: []
        })); 

        // dati proprietario ditta individuale

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name des Firmeninhabers',
            paramTitle: 'Name des Firmeninhabers',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Name des Firmeninhabers]',
            paramEditable: true,
            items: []
        }));

        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Adresse des Firmeninhabers',
            paramTitle: 'Adresse des Firmeninhabers',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Adresse des Firmeninhabers]',
            paramEditable: true,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Geburtsdatum des Firmeninhabers',
            paramTitle: 'Geburtsdatum des Firmeninhabers',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));

        //dati ditta
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Firmenname',
            paramTitle: 'Firmenname',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));

        //dati ditta

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Adresse',
            paramTitle: 'Adresse',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Adresse]',
            paramEditable: true,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Art des Unternehmens',
            paramTitle: 'Art des Unternehmens',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Art des Unternehmens]',
            paramEditable: true,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Steuernummer',
            paramTitle: 'Steuernummer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Steuernummer]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Umsatzsteueridentifikationsnummer',
            paramTitle: 'Umsatzsteueridentifikationsnummer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Umsatzsteueridentifikationsnummer]',
            paramEditable: true,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'print_preview',
            paramTitle: 'print_preview',
            paramType: 'bool',
            paramParent: '',
            defaultValueMessage: false,
            paramEditable: true,
            items: []
        }));

        return convertedParam;
    }

    convertParamEB54KapG(param) {
        var lang = 'en';
        var convertedParam = { data: [] };
        convertedParam.version = '1.0';

        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentinformation',
            paramTitle: 'Dokumentinformation',
            paramType: 'string',
            paramParent: 'Dokumentinformation',
            defaultValueMessage: '',
            paramEditable: false,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Identifikationsmerkmale des Dokuments',
            paramTitle: 'Identifikationsmerkmale des Dokuments',
            paramType: 'string',
            paramParent: 'Dokumentinformation',
            defaultValueMessage: '',
            paramEditable: false,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Erstellungsdatum',
            paramTitle: 'Erstellungsdatum',
            paramType: 'date',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Anlass zur Erstellung des Dokuments',
            paramTitle: 'Anlass zur Erstellung des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Anlass zur Erstellung des Dokuments]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Inhalt des Dokuments',
            paramTitle: 'Inhalt des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Inhalt des Dokuments]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ursprungssprache des Dokuments',
            paramTitle: 'Ursprungssprache des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Ursprungssprache des Dokuments]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokument veröffentlichungsfähig?',
            paramTitle: 'Dokument veröffentlichungsfähig?',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Dokument veröffentlichungsfähig? JA/NEIN]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentersteller',
            paramTitle: 'Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '',
            paramEditable: false,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmens-Identifikationsnummer',
            paramTitle: 'Unternehmens-Identifikationsnummer',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Schreiben Sie die Unternehmens-Identifikationsnummer]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentersteller, Name',
            paramTitle: 'Dokumentersteller, Name',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Dokumentersteller, Name]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Funktion, Dokumentersteller',
            paramTitle: 'Funktion, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Funktion, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kontaktperson des Unternehmens',
            paramTitle: 'Kontaktperson des Unternehmens',
            paramType: 'string',
            paramParent: 'Funktion, Dokumentersteller',
            defaultValueMessage: '[Kontaktperson des Unternehmens]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Steuerberater',
            paramTitle: 'Steuerberater',
            paramType: 'string',
            paramParent: 'Steuerberater',
            defaultValueMessage: '[Steuerberater]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Firmenname, Dokumentersteller',
            paramTitle: 'Firmenname, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Firmenname, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Straße, Dokumentersteller',
            paramTitle: 'Straße, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Straße, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hausnummer, Dokumentersteller',
            paramTitle: 'Hausnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Hausnummer, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Postleitzahl, Dokumentersteller',
            paramTitle: 'Postleitzahl, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Postleitzahl, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ort, Dokumentersteller',
            paramTitle: 'Ort, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Ort, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land, Dokumentersteller',
            paramTitle: 'Land, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Land, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Iso Code Land, Dokumentersteller',
            paramTitle: 'Iso Code Land, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Land, Dokumentersteller',
            defaultValueMessage: '[Iso Code Land, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Telefonnummer, Dokumentersteller',
            paramTitle: 'Telefonnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Telefonnummer, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Faxnummer, Dokumentersteller',
            paramTitle: 'Faxnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Faxnummer, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'e-mail Adresse, Dokumentersteller',
            paramTitle: 'e-mail Adresse, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[e-mail Adresse, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hauptansprechpartner, Dokumentersteller',
            paramTitle: 'Hauptansprechpartner, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Hauptansprechpartner, Dokumentersteller]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentrevisionen',
            paramTitle: 'Dokumentrevisionen',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Dokumentrevisionen]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Liste Dokumentrevisionen mit Datum',
            paramTitle: 'Liste Dokumentrevisionen mit Datum',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[Liste Dokumentrevisionen mit Datum]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'aktuelle Versionsnummer Dokument',
            paramTitle: 'aktuelle Versionsnummer Dokument',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[aktuelle Versionsnummer Dokument]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Änderungsdatum Dokument',
            paramTitle: 'Änderungsdatum Dokument',
            paramType: 'date',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Veranlasser der Änderung im Dokument',
            paramTitle: 'Veranlasser der Änderung im Dokument',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[Veranlasser der Änderung im Dokument]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'nutzerspezifische Dokumentinformationen',
            paramTitle: 'nutzerspezifische Dokumentinformationen',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[nutzerspezifische Dokumentinformationen]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Informationen zum Bericht',
            paramTitle: 'Informationen zum Bericht',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Informationen zum Bericht]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Sachverständige',
            paramTitle: 'Sachverständige',
            paramType: 'string',
            paramParent: 'Informationen zum Bericht',
            defaultValueMessage: '[Sachverständige]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gutachter für Pensionsrückstellung',
            paramTitle: 'Gutachter für Pensionsrückstellung',
            paramType: 'string',
            paramParent: 'Sachverständige',
            defaultValueMessage: '[Gutachter für Pensionsrückstellung]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'sonstige Gutachter',
            paramTitle: 'sonstige Gutachter',
            paramType: 'string',
            paramParent: 'Sachverständige',
            defaultValueMessage: '[sonstige Gutachter (z.B. für Gutachter zur Bewertung von Beteiligungen oder Grundstücken)]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Identifikationsmerkmale des Berichts',
            paramTitle: 'Identifikationsmerkmale des Berichts',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Identifikationsmerkmale des Berichts]',
            paramEditable: true,
            items: []
        }));

        let items = [
            'Geschäftsbericht', 'Jahresfinanzbericht', 'Verkaufsprospekt',
            'Prüfungsbericht', 'Erstellungsbericht', 'Jahresabschluss',
            'Einnahmeüberschussrechnung', 'Halbjahresfinanzbericht',
            'Gutachten', 'Quartalsfinanzbericht', 'sonstiger Bericht'
        ];
    
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Art des Berichts',
            paramTitle: 'Art des Berichts',
            paramType: 'combobox',
            paramParent: 'Identifikationsmerkmale des Berichts',
            defaultValueMessage: '',
            paramEditable: true,
            items: items
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum',
            paramTitle: 'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '[Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum]',
            paramEditable: true,
            items: []
        })); 

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name der Gesellschaft',
            paramTitle: 'Name der Gesellschaft',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Name der Gesellschaft]',
            paramEditable: true,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Rechtsform',
            paramTitle: 'Rechtsform',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Rechtsform]',
            paramEditable: true,
            items: []
        }));

        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Adresse des Firmensitzes',
            paramTitle: 'Adresse des Firmensitzes',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Adresse des Firmensitzes]',
            paramEditable: true,
            items: []
        }));
        
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Handelsregisternummer',
            paramTitle: 'Handelsregisternummer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Handelsregisternummer]',
            paramEditable: true,
            items: []
        }));

        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Registergericht',
            paramTitle: 'Registergericht',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Registergericht]',
            paramEditable: true,
            items: []
        }));

        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Steuernummer',
            paramTitle: 'Steuernummer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Steuernummer]',
            paramEditable: true,
            items: []
        }));


        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Umsatzsteuer-Identifikationsnummer',
            paramTitle: 'Umsatzsteuer-Identifikationsnummer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Umsatzsteuer-Identifikationsnummer]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Legal Entity Identifier (LEI)',
            paramTitle: 'Legal Entity Identifier (LEI)',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Legal Entity Identifier (LEI)]',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Beginn des Geschäftsjahres',
            paramTitle: 'Beginn des Geschäftsjahres',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ende des Geschäftsjahres',
            paramTitle: 'Ende des Geschäftsjahres',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: []
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'print_preview',
            paramTitle: 'print_preview',
            paramType: 'bool',
            paramParent: '',
            defaultValueMessage: false,
            paramEditable: true,
            items: []
        }));
        
        return convertedParam;
    }

    convertParamEB61KapG(param) {
        var lang = 'en';
        var convertedParam = { data: [] };
        convertedParam.version = '1.0';

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name der Firma',
            paramTitle: 'Name der Firma',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Name der Firma]',
            paramEditable: true,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Firmenadresse',
            paramTitle: 'Firmenadresse',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Firmenadresse]',
            paramEditable: true,
            items: []
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Umsatzsteuer-Identifikationsnummer',
            paramTitle: 'Umsatzsteuer-Identifikationsnummer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Umsatzsteuer-Identifikationsnummer]',
            paramEditable: true,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Steuernummer',
            paramTitle: 'Steuernummer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Steuernummer]',
            paramEditable: true,
            items: []
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'print_preview',
            paramTitle: 'print_preview',
            paramType: 'bool',
            paramParent: '',
            defaultValueMessage: false,
            paramEditable: true,
            items: []
        }));

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
