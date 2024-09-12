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
        this.levelElementDialogEBilanz = [];
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
            value: (() => this.getDefaultValue(param, options))(),
            level: options.level
        };
    
        currentParameter.readValue = function () {
            param[options.paramName] = this.value;
        };

        this.saveLevelElementDialogData(currentParameter);
        
        return currentParameter;

    }
    saveLevelElementDialogData(arrayParameter) {
            this.levelElementDialogEBilanz.push(arrayParameter.level);
    }

    getArryLevelDialogData(){
        for (let index = 0; index < this.levelElementDialogEBilanz.length; index++) {
            const element = this.levelElementDialogEBilanz[index];
            Banana.console.debug("element levelElementDialogEBilanz:");
            Banana.console.debug(element);
            
        }
        return this.levelElementDialogEBilanz;
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
            items: [],
            level: "1"
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Identifikationsmerkmale des Dokuments',
            paramTitle: 'Identifikationsmerkmale des Dokuments',
            paramType: 'string',
            paramParent: 'Dokumentinformation',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Erstellungsdatum',
            paramTitle: 'Erstellungsdatum',
            paramType: 'date',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Anlass zur Erstellung des Dokuments',
            paramTitle: 'Anlass zur Erstellung des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Anlass zur Erstellung des Dokuments]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Inhalt des Dokuments',
            paramTitle: 'Inhalt des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Inhalt des Dokuments]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ursprungssprache des Dokuments',
            paramTitle: 'Ursprungssprache des Dokuments',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Ursprungssprache des Dokuments]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokument veröffentlichungsfähig?',
            paramTitle: 'Dokument veröffentlichungsfähig?',
            paramType: 'string',
            paramParent: 'Identifikationsmerkmale des Dokuments',
            defaultValueMessage: '[Dokument veröffentlichungsfähig? JA/NEIN]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentersteller',
            paramTitle: 'Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmens-Identifikationsnummer',
            paramTitle: 'Unternehmens-Identifikationsnummer',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Schreiben Sie die Unternehmens-Identifikationsnummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentersteller, Name',
            paramTitle: 'Dokumentersteller, Name',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Dokumentersteller, Name]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Funktion, Dokumentersteller',
            paramTitle: 'Funktion, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Funktion, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kontaktperson des Unternehmens',
            paramTitle: 'Kontaktperson des Unternehmens',
            paramType: 'string',
            paramParent: 'Funktion, Dokumentersteller',
            defaultValueMessage: '[Kontaktperson des Unternehmens]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Steuerberater',
            paramTitle: 'Steuerberater',
            paramType: 'string',
            paramParent: 'Steuerberater',
            defaultValueMessage: '[Steuerberater]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Firmenname, Dokumentersteller',
            paramTitle: 'Firmenname, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Firmenname, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Straße, Dokumentersteller',
            paramTitle: 'Straße, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Straße, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hausnummer, Dokumentersteller',
            paramTitle: 'Hausnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Hausnummer, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Postleitzahl, Dokumentersteller',
            paramTitle: 'Postleitzahl, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Postleitzahl, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ort, Dokumentersteller',
            paramTitle: 'Ort, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Ort, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land, Dokumentersteller',
            paramTitle: 'Land, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Land, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Iso Code Land, Dokumentersteller',
            paramTitle: 'Iso Code Land, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Land, Dokumentersteller',
            defaultValueMessage: '[Iso Code Land, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Telefonnummer, Dokumentersteller',
            paramTitle: 'Telefonnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Telefonnummer, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Faxnummer, Dokumentersteller',
            paramTitle: 'Faxnummer, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Faxnummer, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'e-mail Adresse, Dokumentersteller',
            paramTitle: 'e-mail Adresse, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[e-mail Adresse, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hauptansprechpartner, Dokumentersteller',
            paramTitle: 'Hauptansprechpartner, Dokumentersteller',
            paramType: 'string',
            paramParent: 'Dokumentersteller',
            defaultValueMessage: '[Hauptansprechpartner, Dokumentersteller]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Dokumentrevisionen',
            paramTitle: 'Dokumentrevisionen',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Dokumentrevisionen]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Liste Dokumentrevisionen mit Datum',
            paramTitle: 'Liste Dokumentrevisionen mit Datum',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[Liste Dokumentrevisionen mit Datum]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'aktuelle Versionsnummer Dokument',
            paramTitle: 'aktuelle Versionsnummer Dokument',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[aktuelle Versionsnummer Dokument]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Änderungsdatum Dokument',
            paramTitle: 'Änderungsdatum Dokument',
            paramType: 'date',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Veranlasser der Änderung im Dokument',
            paramTitle: 'Veranlasser der Änderung im Dokument',
            paramType: 'string',
            paramParent: 'Dokumentrevisionen',
            defaultValueMessage: '[Veranlasser der Änderung im Dokument]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'nutzerspezifische Dokumentinformationen',
            paramTitle: 'nutzerspezifische Dokumentinformationen',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[nutzerspezifische Dokumentinformationen]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Informationen zum Bericht',
            paramTitle: 'Informationen zum Bericht',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Informationen zum Bericht]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Sachverständige',
            paramTitle: 'Sachverständige',
            paramType: 'string',
            paramParent: 'Informationen zum Bericht',
            defaultValueMessage: '[Sachverständige]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gutachter für Pensionsrückstellung',
            paramTitle: 'Gutachter für Pensionsrückstellung',
            paramType: 'string',
            paramParent: 'Sachverständige',
            defaultValueMessage: '[Gutachter für Pensionsrückstellung]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'sonstige Gutachter',
            paramTitle: 'sonstige Gutachter',
            paramType: 'string',
            paramParent: 'Sachverständige',
            defaultValueMessage: '[sonstige Gutachter (z.B. für Gutachter zur Bewertung von Beteiligungen oder Grundstücken)]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Identifikationsmerkmale des Berichts',
            paramTitle: 'Identifikationsmerkmale des Berichts',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Identifikationsmerkmale des Berichts]',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        let itemsArtBerichts = [
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
            items: itemsArtBerichts,
            level: "2"
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Feststellungsdatum / Veröffentlichungsdatum',
            paramTitle: 'Feststellungsdatum / Veröffentlichungsdatum',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        })); 

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Datum, Feststellung',
            paramTitle: 'Datum, Feststellung',
            paramType: 'date',
            paramParent: 'Feststellungsdatum / Veröffentlichungsdatum',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        })); 

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Veröffentlichung vor Feststellung zur Fristwahrung',
            paramTitle: 'Veröffentlichung vor Feststellung zur Fristwahrung',
            paramType: 'date',
            paramParent: 'Feststellungsdatum / Veröffentlichungsdatum',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Datum, Veröffentlichung',
            paramTitle: 'Datum, Veröffentlichung',
            paramType: 'date',
            paramParent: 'Feststellungsdatum / Veröffentlichungsdatum',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        let itemsFertigstellungsstatus = [
            'vorläufig', 'endgültig'
        ];

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Fertigstellungsstatus des Berichts',
            paramTitle: 'Fertigstellungsstatus des Berichts',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsFertigstellungsstatus,
            level: "2"
        }));

        let itemsStatusBerichts = [
            'erstmalig', 'berichtigt', 'geändert', 'berichtigt und geändert', 'identischer Abschluss mit differenzierteren Informationen'
        ];
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Status des Berichts',
            paramTitle: 'Status des Berichts',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsStatusBerichts,
            level: "2"
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Berichtsbestandteile',
            paramTitle: 'Berichtsbestandteile',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanz',
            paramTitle: 'Bilanz',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Eröffnungsbilanz ohne GuV',
            paramTitle: 'Eröffnungsbilanz ohne GuV',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Zwischenlagebericht',
            paramTitle: 'Zwischenlagebericht',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanz Passiva',
            paramTitle: 'Bilanz Passiva',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'GuV',
            paramTitle: 'GuV',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'GuV nach MicroBilG',
            paramTitle: 'GuV nach MicroBilG',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Angaben unterhalb der Bilanz',
            paramTitle: 'Angaben unterhalb der Bilanz',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Brutto-Anlagenspiegel mit Entwicklung der Abschreibungen',
            paramTitle: 'Brutto-Anlagenspiegel mit Entwicklung der Abschreibungen',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Brutto-Anlagenspiegel ohne Entwicklung der Abschreibungen',
            paramTitle: 'Brutto-Anlagenspiegel ohne Entwicklung der Abschreibungen',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Netto Anlagenspiegel',
            paramTitle: 'Netto Anlagenspiegel',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ergebnisverwendung',
            paramTitle: 'Ergebnisverwendung',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Cash-Flow Statement',
            paramTitle: 'Cash-Flow Statement',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Eigenkapitalentwicklung',
            paramTitle: 'Eigenkapitalentwicklung',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche Überleitungsrechnung',
            paramTitle: 'steuerliche Überleitungsrechnung',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kontensalden zu einer oder mehreren Positionen',
            paramTitle: 'Kontensalden zu einer oder mehreren Positionen',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Sonder-/Ergänzungsbilanzen als Freitext',
            paramTitle: 'Sonder-/Ergänzungsbilanzen als Freitext',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Berichtigung des Gewinns bei Wechsel der Gewinnermittlungsart',
            paramTitle: 'Berichtigung des Gewinns bei Wechsel der Gewinnermittlungsart',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche Gewinnermittlung bei Personengesellschaften',
            paramTitle: 'steuerliche Gewinnermittlung bei Personengesellschaften',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche Gewinnermittlung für besondere Fälle',
            paramTitle:'steuerliche Gewinnermittlung für besondere Fälle',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kapitalkontenentwicklung für Personenhandelsgesellschaften',
            paramTitle:'Kapitalkontenentwicklung für Personenhandelsgesellschaften',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'andere Anhangangaben',
            paramTitle:'andere Anhangangaben',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Segmentbericht',
            paramTitle:'Segmentbericht',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bestätigungsvermerk',
            paramTitle:'Bestätigungsvermerk',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bericht des Aufsichtsrats',
            paramTitle:'Bericht des Aufsichtsrats',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Einnahmenüberschussrechnung betrieblich',
            paramTitle:'Einnahmenüberschussrechnung betrieblich',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Einnahmenüberschussrechnung steuerlich',
            paramTitle:'Einnahmenüberschussrechnung steuerlich',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Andere Berichtsbestandteile',
            paramTitle:'Andere Berichtsbestandteile',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanzart',
            paramTitle:'Bilanzart',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Jahresabschluss',
            paramTitle:'Jahresabschluss',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Umwandlungsbilanz, zugleich Jahresabschluss',
            paramTitle:'Umwandlungsbilanz, zugleich Jahresabschluss',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Statusauswertung',
            paramTitle:'Statusauswertung',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Planzahlen',
            paramTitle:'Planzahlen',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Eröffnungsbilanz',
            paramTitle:'Eröffnungsbilanz',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Zwischenabschluss',
            paramTitle:'Zwischenabschluss',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'unterjährige Zahlen',
            paramTitle:'unterjährige Zahlen',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'unbekannte Abschlusszahlen',
            paramTitle:'unbekannte Abschlusszahlen',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'aufgestellt nach KWG',
            paramTitle:'aufgestellt nach KWG',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'festgestellt nach KWG',
            paramTitle:'festgestellt nach KWG',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Umwandlungsbilanz',
            paramTitle:'Umwandlungsbilanz',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Liquidationsanfangsbilanz',
            paramTitle:'Liquidationsanfangsbilanz',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Liquidationseröffnungsbilanz',
            paramTitle:'Liquidationseröffnungsbilanz',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Liquidationszwischenbilanz',
            paramTitle:'Liquidationszwischenbilanz',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Liquidationsschlussbilanz',
            paramTitle:'Liquidationsschlussbilanz',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Aufgabebilanz (i.S.d. § 16 EStG)',
            paramTitle:'Aufgabebilanz (i.S.d. § 16 EStG)',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'sonstige Auswertung',
            paramTitle:'sonstige Auswertung',
            paramType: 'bool',
            paramParent: 'Bilanzart',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanzart steuerlich bei PersG / Mitunternehmerschaften',
            paramTitle:'Bilanzart steuerlich bei PersG / Mitunternehmerschaften',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesamthandsbilanz',
            paramTitle:'Gesamthandsbilanz',
            paramType: 'bool',
            paramParent: 'Bilanzart steuerlich bei PersG / Mitunternehmerschaften',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Sonderbilanz',
            paramTitle:'Sonderbilanz',
            paramType: 'bool',
            paramParent: 'Bilanzart steuerlich bei PersG / Mitunternehmerschaften',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ergänzungsbilanz',
            paramTitle:'Ergänzungsbilanz',
            paramType: 'bool',
            paramParent: 'Bilanzart steuerlich bei PersG / Mitunternehmerschaften',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanz enthält Ausweis des Bilanzgewinns',
            paramTitle:'Bilanz enthält Ausweis des Bilanzgewinns',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanzierungsstandard',
            paramTitle:'Bilanzierungsstandard',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'deutsches Handelsrecht vor BilMoG',
            paramTitle:'deutsches Handelsrecht vor BilMoG',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'deutsches Handelsrecht',
            paramTitle:'deutsches Handelsrecht',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'deutsches Handelsrecht (sog. Einheitsbilanz)',
            paramTitle:'deutsches Handelsrecht (sog. Einheitsbilanz)',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'HGB mit IAS/IFRS-Nomenklatur',
            paramTitle:'HGB mit IAS/IFRS-Nomenklatur',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'HGB mit US GAAP-Nomenklatur',
            paramTitle:'HGB mit US GAAP-Nomenklatur',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'HGB und KapCoRiLiG',
            paramTitle:'HGB und KapCoRiLiG',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'deutsches Steuerrecht',
            paramTitle:'deutsches Steuerrecht',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'IAS/IFRS',
            paramTitle:'IAS/IFRS',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'US GAAP',
            paramTitle:'US GAAP',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'lokales ausländisches Handelsrecht',
            paramTitle:'lokales ausländisches Handelsrecht',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'lokales ausländisches Steuerrecht',
            paramTitle:'lokales ausländisches Steuerrecht',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'sonstiger Rechnungslegungsstandard',
            paramTitle:'sonstiger Rechnungslegungsstandard',
            paramType: 'bool',
            paramParent: 'Bilanzierungsstandard',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Branchen',
            paramTitle:'Branchen',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kerntaxonomie',
            paramTitle:'Kerntaxonomie',
            paramType: 'bool',
            paramParent: 'Branchen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'RechKredV',
            paramTitle:'RechKredV',
            paramType: 'bool',
            paramParent: 'Branchen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'RechZahlV',
            paramTitle:'RechZahlV',
            paramType: 'bool',
            paramParent: 'Branchen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'RechVersV',
            paramTitle:'RechVersV',
            paramType: 'bool',
            paramParent: 'Branchen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'PBV',
            paramTitle:'PBV',
            paramType: 'bool',
            paramParent: 'Branchen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'KHBV',
            paramTitle:'KHBV',
            paramType: 'bool',
            paramParent: 'Branchen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Eigenbetriebsverordnung',
            paramTitle:'Eigenbetriebsverordnung',
            paramType: 'bool',
            paramParent: 'Branchen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'JAbschlWUV',
            paramTitle:'JAbschlWUV',
            paramType: 'bool',
            paramParent: 'Branchen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land- und Forstwirtschaft',
            paramTitle:'Land- und Forstwirtschaft',
            paramType: 'bool',
            paramParent: 'Branchen',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'GuV Format',
            paramTitle:'GuV Format',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesamtkostenverfahren',
            paramTitle:'Gesamtkostenverfahren',
            paramType: 'bool',
            paramParent: 'GuV Format',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Umsatzkostenverfahren',
            paramTitle:'Umsatzkostenverfahren',
            paramType: 'bool',
            paramParent: 'GuV Format',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'anderes Gewinnermittlungsverfahren',
            paramTitle:'anderes Gewinnermittlungsverfahren',
            paramType: 'bool',
            paramParent: 'GuV Format',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Erläutertungen zum GuV Format, anderes Gewinnermittlungsverfahren',
            paramTitle:'Erläutertungen zum GuV Format, anderes Gewinnermittlungsverfahren',
            paramType: 'bool',
            paramParent: 'GuV Format',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Konsolidierungsumfang',
            paramTitle:'Konsolidierungsumfang',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'nicht konsolidiert/ Einzelabschluss',
            paramTitle:'nicht konsolidiert/ Einzelabschluss',
            paramType: 'bool',
            paramParent: 'Konsolidierungsumfang',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Konzernabschluss',
            paramTitle:'Konzernabschluss',
            paramType: 'bool',
            paramParent: 'Konsolidierungsumfang',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'nicht konsolidiert/ Einzelabschluss',
            paramTitle:'nicht konsolidiert/ Einzelabschluss',
            paramType: 'bool',
            paramParent: 'Konsolidierungsumfang',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Konzernabschluss Inland',
            paramTitle:'Konzernabschluss Inland',
            paramType: 'bool',
            paramParent: 'Konsolidierungsumfang',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Konzernabschluss Welt',
            paramTitle:'Konzernabschluss Welt',
            paramType: 'bool',
            paramParent: 'Konsolidierungsumfang',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Teilkonzernabschluss',
            paramTitle:'Teilkonzernabschluss',
            paramType: 'bool',
            paramParent: 'Konsolidierungsumfang',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gruppenbilanz',
            paramTitle:'Gruppenbilanz',
            paramType: 'bool',
            paramParent: 'Konsolidierungsumfang',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Konsolidierungsart unbekannt',
            paramTitle:'Konsolidierungsart unbekannt',
            paramType: 'bool',
            paramParent: 'Konsolidierungsumfang',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'anderer Konsolidierungsgrad',
            paramTitle:'anderer Konsolidierungsgrad',
            paramType: 'bool',
            paramParent: 'Konsolidierungsumfang',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bericht gehört zu',
            paramTitle:'Bericht gehört zu',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name Gesamthand',
            paramTitle:'Name Gesamthand',
            paramType: 'bool',
            paramParent: 'Bericht gehört zu',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennnummern, Gesamthand',
            paramTitle:'Unternehmenskennnummern, Gesamthand',
            paramType: 'bool',
            paramParent: 'Bericht gehört zu',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennnummern, Gesamthand',
            paramTitle:'Unternehmenskennnummern, Gesamthand',
            paramType: 'bool',
            paramParent: 'Bericht gehört zu',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Handelsregisternummer',
            paramTitle:'Handelsregisternummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Umsatzsteuer-Identifikationsnummer',
            paramTitle:'Umsatzsteuer-Identifikationsnummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '13stellige Steuernummer',
            paramTitle:'13stellige Steuernummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '13stellige Steuernummer',
            paramTitle:'13stellige Steuernummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche W-IdNr.',
            paramTitle:'steuerliche W-IdNr.',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '4stellige Bundesfinanzamtsnummer',
            paramTitle:'4stellige Bundesfinanzamtsnummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bundesbank Konzernnummer',
            paramTitle:'Bundesbank Konzernnummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'individuelle Kennnummer',
            paramTitle:'individuelle Kennnummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kennnummer Empfänger',
            paramTitle:'Kennnummer Empfänger',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kennnummer Sender',
            paramTitle:'Kennnummer Sender',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'andere Kennnummer',
            paramTitle:'andere Kennnummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Erläuterungen zu Unternehmenskennnummern, Gesamthand, andere Kennnummer',
            paramTitle:'Erläuterungen zu Unternehmenskennnummern, Gesamthand, andere Kennnummer',
            paramType: 'bool',
            paramParent: 'Bericht gehört zu',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Abschlussstichstag , Gesamthand',
            paramTitle:'Abschlussstichstag , Gesamthand',
            paramType: 'bool',
            paramParent: 'Bericht gehört zu',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Beginn des Wirtschaftsjahres',
            paramTitle:'Beginn des Wirtschaftsjahres',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ende des Wirtschaftsjahres',
            paramTitle:'Ende des Wirtschaftsjahres',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanzstichtag',
            paramTitle:'Bilanzstichtag',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Beginn des Wirtschaftsjahres (Vorjahr)',
            paramTitle:'Beginn des Wirtschaftsjahres (Vorjahr)',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ende des Wirtschaftsjahres (Vorjahr)',
            paramTitle:'Ende des Wirtschaftsjahres (Vorjahr)',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanzstichtag (Vorjahr)',
            paramTitle:'Bilanzstichtag (Vorjahr)',
            paramType: 'date',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name des Unternehmens',
            paramTitle:'Name des Unternehmens',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'frühere Unternehmensnamen',
            paramTitle:'frühere Unternehmensnamen',
            paramType: 'string',
            paramParent: 'Name des Unternehmens',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'letztes Änderungsdatum, Name des Unternehmens',
            paramTitle:'letztes Änderungsdatum, Name des Unternehmens',
            paramType: 'string',
            paramParent: 'Name des Unternehmens',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Rechtsform',
            paramTitle:'Rechtsform',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Firmensitz',
            paramTitle:'Firmensitz',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Straße, Firmensitz',
            paramTitle:'Straße, Firmensitz',
            paramType: 'string',
            paramParent: 'Firmensitz',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hausnummer, Firmensitz',
            paramTitle:'Hausnummer, Firmensitz',
            paramType: 'string',
            paramParent: 'Firmensitz',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Postleitzahl, Firmensitz',
            paramTitle:'Postleitzahl, Firmensitz',
            paramType: 'string',
            paramParent: 'Firmensitz',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ort, Firmensitz',
            paramTitle:'Ort, Firmensitz',
            paramType: 'string',
            paramParent: 'Firmensitz',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land, Firmensitz',
            paramTitle:'Land, Firmensitz',
            paramType: 'string',
            paramParent: 'Firmensitz',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Iso-Code Land, Firmensitz',
            paramTitle:'Iso-Code Land, Firmensitz',
            paramType: 'string',
            paramParent: 'Land, Firmensitz',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennnummern',
            paramTitle:'Unternehmenskennnummern',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Handelsregisternummer',
            paramTitle:'Handelsregisternummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Umsatzsteuer-Identifikationsnummer',
            paramTitle:'Umsatzsteuer-Identifikationsnummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '13stellige Steuernummer',
            paramTitle:'13stellige Steuernummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche IdNr.',
            paramTitle:'steuerliche IdNr.',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '4stellige Bundesfinanzamtsnummer',
            paramTitle:'4stellige Bundesfinanzamtsnummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bundesbank Konzernnummer',
            paramTitle:'Bundesbank Konzernnummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bundesbank Kreditnehmernummer',
            paramTitle:'Bundesbank Kreditnehmernummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'individuelle Kennnummer',
            paramTitle:'individuelle Kennnummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kennnummer Empfänger',
            paramTitle:'Kennnummer Empfänger',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Kennnummer Sender',
            paramTitle:'Kennnummer Sender',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'andere Kennnummer',
            paramTitle:'andere Kennnummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        const itemsGewinnermittlung = 
        ["nicht steuerbegünstigte Körperschaft mit wirtschaftlichen Geschäftsbetrieb/en",
        "steuerbegünstigte Körperschaft mit wirtschaftlichen Geschäftsbetrieb/en",
        "juristische Person des öffentlichen Rechts mit Betrieb/en gewerblicher Art",
        "Unternehmen mit Gewinnermittlung bei Handelsschiffen im internationalen Verkehr"];

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmen mit Gewinnermittlung für besondere Fälle',
            paramTitle:'Unternehmen mit Gewinnermittlung für besondere Fälle',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsGewinnermittlung,
            level: "1"
        }));

        const itemsAuslandBetriebsstätte = 
        ["Zweigniederlassung nach Handelsrecht",
        "Übrige Betriebsstättenart"];

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramTitle:'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsAuslandBetriebsstätte,
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafter/(Sonder-)Mitunternehmer',
            paramTitle:'Gesellschafter/(Sonder-)Mitunternehmer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name des Gesellschafters',
            paramTitle:'Name des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/(Sonder-)Mitunternehmer',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name des Gesellschafters',
            paramTitle:'Name des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/(Sonder-)Mitunternehmer',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Vorname des Gesellschafters',
            paramTitle:'Vorname des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/(Sonder-)Mitunternehmer',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramTitle:'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramType: 'string',
            paramParent: 'Gesellschafter/(Sonder-)Mitunternehmer',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            paramTitle:'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            paramType: 'string',
            paramParent: 'Gesellschafter/(Sonder-)Mitunternehmer',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Vollhafter',
            paramTitle:'Vollhafter',
            paramType: 'string',
            paramParent: 'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Teilhafter',
            paramTitle:'Teilhafter',
            paramType: 'string',
            paramParent: 'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Mittelbar beteiligte Gesellschafter',
            paramTitle:'Mittelbar beteiligte Gesellschafter',
            paramType: 'string',
            paramParent: 'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ausgeschiedene Gesellschafter und deren Rechtsnachfolger',
            paramTitle:'Ausgeschiedene Gesellschafter und deren Rechtsnachfolger',
            paramType: 'string',
            paramParent: 'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        Banana.console.debug(convertedParam.data.length);
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
        Banana.console.debug(Object.keys(dataObject));
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
