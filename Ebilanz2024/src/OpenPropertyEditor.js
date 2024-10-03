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
        this.nameElementDialogEbilanz = [];
        this.valueElementDialogEbilanz = [];
        this.levelElementDialogEBilanz = [];
        this.dataDialog = {name: [], value: [], level: []};
        }
    initParam() {
        var param = {};
        param.field = "";
        param.value = "";
        return param;
    }

    settingsDialog(typeEBilanz) {
        
        this.stringJSONValueDialogEBilanz = "";

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

        if (typeEBilanz === 'EBilanz54PersG' || typeEBilanz === 'EBilanz54EinzelU' || typeEBilanz === 'EBilanz54KapG') {
            //creazione dialogo con parametri
            convertedParam = this.createParameterDialog54(param);
        }
        else if (typeEBilanz === 'EBilanz61KapG') {
            convertedParam = this.createParameterDialog61(param);
        }
        else if (typeEBilanz === 'EBilanz67KapG') {
            convertedParam = this.createParameterDialog67(param);
        }
        else if(typeEBilanz === 'EBilanz68KapG'){
            convertedParam = this.createParameterDialog68(param);
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
            
            //Banana.console.debug("typeof value "+ typeof value);
            this.stringJSONValueDialogEBilanz = Banana.document.getScriptSettings();
            //Banana.console.debug("this.stringJSONValueDialogEBilanz "+ this.stringJSONValueDialogEBilanz);
            //this.stringJSONValueDialogEBilanz = Banana.document.setScriptSettings(paramToString)
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
            Banana.console.debug("createParameter readValue param[options.paramName]: "+param[options.paramName] +" this.value "+this.value);
            param[options.paramName] = this.value;
            };
           
            this.saveElementsDialogData(options, (() => this.getDefaultValue(param, options))());

            Banana.console.debug("createParameter: currentparam Level: "+options.level +" currentparam key "+options.paramName);
            if(!(options.paramName ==="value" || options.paramName ==="field")){
                this.saveLevelElementDialogData(options.level);
            }

        return currentParameter;
    }

    saveElementsDialogData(options, value) {
        this.dataDialog.name.push(options.paramName);
        this.dataDialog.value.push(value);
        this.dataDialog.level.push(options.level);

    }
    getElementsDialogData(){
        return this.dataDialog;
    }
    
    saveLevelElementDialogData(level) {
        this.levelElementDialogEBilanz.push(level);
    }

    getArrayLevelDialogData(){
        Banana.console.debug("length levelelemtndialogEbilanz"+this.levelElementDialogEBilanz.length);
        return this.levelElementDialogEBilanz;
    }
    
    getDefaultValue(param, options) {
        if (options.paramType === 'string' || options.paramType === 'date') {
            return param[options.paramName] ? param[options.paramName] : options.defaultValueMessage;
        } else if (options.paramType === 'bool') {
            return param[options.paramName] ? param[options.paramName] : options.defaultValueMessage = false;
        }
        return undefined;
    }

    jsonToArrayConverter(JSONStringData) {
        Banana.console.debug("JSONStringData: "+JSONStringData);
        const dataObject = JSON.parse(JSONStringData);
        const resultsArray = [];
        Banana.console.debug(Object.keys(dataObject));
        // Iterare attraverso le proprietà dell'oggetto
        for (const key in dataObject) {
            //if (dataObject.hasOwnProperty(key)) {
                // Estrarre il valore
                const value = dataObject[key];
                // Aggiungere il valore e la chiave all'array
                if(!(key ==="value" || key ==="field")){
                Banana.console.debug("JsonConverter: "+key);
                    resultsArray.push({ key: key, value: value });
                }
            //}
        }
        Banana.console.debug("lenght to jsonArrayCOnverter: "+resultsArray.length);
        return resultsArray;
    }

    normalizeData(data) {
        return data.map(item => ({
            key: item.key,
            value: item.value,
        }));
    }
    //Methods for creations the dialog based from taxonomy (5.4,6.1)
    

    createParameterDialog54(param) {

        var lang = 'de';

        var convertedParam = { data: [] };
        convertedParam.version = '1.0';
        
        //Mussfeld
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
            level: "1"
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
        //Mussfeld
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Fertigstellungsstatus des Berichts',
            paramTitle: 'Fertigstellungsstatus des Berichts',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsFertigstellungsstatus,
            level: "1"
        }));

        let itemsStatusBerichts = [
            'erstmalig', 'berichtigt', 'geändert', 'berichtigt und geändert', 'identischer Abschluss mit differenzierteren Informationen'
        ];
        //Mussfeld
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Status des Berichts',
            paramTitle: 'Status des Berichts',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsStatusBerichts,
            level: "1"
        }));
        //Mussfeld
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
            paramName: 'Kapitalkontenentwicklung für Personenhandelsgesellschaften',
            paramTitle:'Kapitalkontenentwicklung für Personenhandelsgesellschaften',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        //Mussfeld
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
        //mussfeld
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
        //mussfeld
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanz enthält Ausweis des Bilanzgewinns',
            paramTitle:'Bilanz enthält Ausweis des Bilanzgewinns',
            paramType: 'bool',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        //Mussfeld
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
        //Mussfeld
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
        //mussfeld
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
        //Mussfeld
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
            paramName: 'Gesamthand 13stellige Steuernummer',
            paramTitle:'Gesamthand 13stellige Steuernummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
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
            defaultValueMessage: '[Name des Unternehmens]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Rechtsform',
            paramTitle:'Rechtsform',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Rechtsform]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Straße, Firmensitz',
            paramTitle:'Straße, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Straße, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hausnummer, Firmensitz',
            paramTitle:'Hausnummer, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Hausnummer, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Postleitzahl, Firmensitz',
            paramTitle:'Postleitzahl, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Postleitzahl, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ort, Firmensitz',
            paramTitle:'Ort, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Ort, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land, Firmensitz',
            paramTitle:'Land, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Land, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Iso-Code Land, Firmensitz',
            paramTitle:'Iso-Code Land, Firmensitz',
            paramType: 'string',
            paramParent: 'Land, Firmensitz',
            defaultValueMessage: '[Iso-Code Land, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennnummern',
            paramTitle:'Unternehmenskennnummern',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Unternehmenskennnummern]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennumern 13stellige Steuernummer',
            paramTitle:'Unternehmenskennumern 13stellige Steuernummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[13stellige Steuernummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche IdNr.',
            paramTitle:'steuerliche IdNr.',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[steuerliche IdNr.]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '4stellige Bundesfinanzamtsnummer',
            paramTitle:'4stellige Bundesfinanzamtsnummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[4stellige Bundesfinanzamtsnummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Zuordnung zur Einkunftsart',
            paramTitle:'Zuordnung zur Einkunftsart',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Einkünfte aus Land- und Forstwirtschaft',
            paramTitle:'Einkünfte aus Land- und Forstwirtschaft',
            paramType: 'string',
            paramParent: 'Zuordnung zur Einkunftsart',
            defaultValueMessage: '[Einkünfte aus Land- und Forstwirtschaft]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Einkünfte aus Gewerbebetrieb',
            paramTitle:'Einkünfte aus Gewerbebetrieb',
            paramType: 'string',
            paramParent: 'Zuordnung zur Einkunftsart',
            defaultValueMessage: '[Einkünfte aus Gewerbebetrieb]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Einkünfte aus selbständiger Arbeit',
            paramTitle:'Einkünfte aus selbständiger Arbeit',
            paramType: 'string',
            paramParent: 'Zuordnung zur Einkunftsart',
            defaultValueMessage: '[Einkünfte aus selbständiger Arbeit]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        const itemInlandischeBetribsstatte = [
            'Zweigniederlassung nach Handelsrecht',
            'Übrige Betriebsstättenart'
        ];
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramTitle:'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemInlandischeBetribsstatte,
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafter/ Sonder- Mitunternehmer',
            paramTitle:'Gesellschafter/ Sonder- Mitunternehmer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name des Gesellschafters',
            paramTitle:'Name des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Name des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Vorname des Gesellschafters',
            paramTitle:'Vorname des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Gesellschafter/(Sonder-)Mitunternehmer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramTitle:'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            paramTitle:'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Nummer des Beteiligten aus Feststellungserklärung (Vordruck FB)',
            paramTitle:'Nummer des Beteiligten aus Feststellungserklärung (Vordruck FB)',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Nummer des Beteiligten aus Feststellungserklärung (Vordruck FB)]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '13stellige Steuernummer des Gesellschafters',
            paramTitle:'13stellige Steuernummer des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[13stellige Steuernummer des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche IDNr.',
            paramTitle:'steuerliche IDNr.',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[steuerliche IDNr.]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Rechtsform des Gesellschafters',
            paramTitle:'Rechtsform des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Rechtsform des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'natürliche Person - Privatvermögen',
            paramTitle:'natürliche Person - Privatvermögen',
            paramType: 'string',
            paramParent: 'Rechtsform des Gesellschafters',
            defaultValueMessage: '[natürliche Person - Privatvermögen]',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'natürliche Person - Betriebsvermögen',
            paramTitle:'natürliche Person - Betriebsvermögen',
            paramType: 'string',
            paramParent: 'Rechtsform des Gesellschafters',
            defaultValueMessage: '[natürliche Person - Betriebsvermögen]',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Personengesellschaft',
            paramTitle:'Personengesellschaft',
            paramType: 'string',
            paramParent: 'Rechtsform des Gesellschafters',
            defaultValueMessage: '[Personengesellschaft]',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Körperschaft',
            paramTitle:'Körperschaft',
            paramType: 'string',
            paramParent: 'Rechtsform des Gesellschafters',
            defaultValueMessage: '[Körperschaft]',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Sonderbilanz benötigt?',
            paramTitle:'Sonderbilanz benötigt?',
            paramType: 'bool',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ergänzungsbilanz benötigt?',
            paramTitle:'Ergänzungsbilanz benötigt?',
            paramType: 'bool',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        Banana.console.debug("convertedParam.data.length "+convertedParam.data.length);

        //this.saveElementsDialogData(convertedParam);
        
        return convertedParam;
    }

















    createParameterDialog61(param){
        var lang = 'de';

        var convertedParam = { data: [] };
        convertedParam.version = '1.0';
        
        //Mussfeld
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
            level: "1"
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
            level: "1"
        }));

        let itemsStatusBerichts = [
            'erstmalig', 'berichtigt', 'geändert', 'berichtigt und geändert', 'identischer Abschluss mit differenzierteren Informationen, Korrektur durch Finanzverwaltung, sonstige Korrektur'
        ];
        //Mussfeld
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Status des Berichts',
            paramTitle: 'Status des Berichts',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsStatusBerichts,
            level: "1"
        }));
        //Mussfeld
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
            paramName: 'Kapitalkontenentwicklung für Personenhandelsgesellschaften',
            paramTitle:'Kapitalkontenentwicklung für Personenhandelsgesellschaften',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        //Mussfeld
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
        //mussfeld
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
        //mussfeld
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Bilanz enthält Ausweis des Bilanzgewinns/Bilanzverlustes',
            paramTitle:'Bilanz enthält Ausweis des Bilanzgewinns/Bilanzverlustes',
            paramType: 'bool',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        //Mussfeld
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
        //Mussfeld
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
        //mussfeld
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
        //Mussfeld
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
            paramName: 'Gesamthand 13stellige Steuernummer',
            paramTitle:'Gesamthand 13stellige Steuernummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '4stellige Bundesfinanzamtsnummer, Gesamthand',
            paramTitle:'4stellige Bundesfinanzamtsnummer, Gesamthand',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Abschlussstichtag, Gesamthand',
            paramTitle:'Abschlussstichtag, Gesamthand',
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
            defaultValueMessage: '[Name des Unternehmens]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Rechtsform',
            paramTitle:'Rechtsform',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Rechtsform]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Straße, Firmensitz',
            paramTitle:'Straße, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Straße, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hausnummer, Firmensitz',
            paramTitle:'Hausnummer, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Hausnummer, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Postleitzahl, Firmensitz',
            paramTitle:'Postleitzahl, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Postleitzahl, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ort, Firmensitz',
            paramTitle:'Ort, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Ort, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land, Firmensitz',
            paramTitle:'Land, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Land, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennnummern',
            paramTitle:'Unternehmenskennnummern',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Unternehmenskennnummern]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '13stellige Steuernummer',
            paramTitle:'13stellige Steuernummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[13stellige Steuernummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche IdNr.',
            paramTitle:'steuerliche IdNr.',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[steuerliche IdNr.]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '4stellige Bundesfinanzamtsnummer',
            paramTitle:'4stellige Bundesfinanzamtsnummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[4stellige Bundesfinanzamtsnummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Zuordnung zur Einkunftsart',
            paramTitle:'Zuordnung zur Einkunftsart',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Einkünfte aus Land- und Forstwirtschaft',
            paramTitle:'Einkünfte aus Land- und Forstwirtschaft',
            paramType: 'string',
            paramParent: 'Zuordnung zur Einkunftsart',
            defaultValueMessage: '[Einkünfte aus Land- und Forstwirtschaft]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Einkünfte aus Gewerbebetrieb',
            paramTitle:'Einkünfte aus Gewerbebetrieb',
            paramType: 'string',
            paramParent: 'Zuordnung zur Einkunftsart',
            defaultValueMessage: '[Einkünfte aus Gewerbebetrieb]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Einkünfte aus selbständiger Arbeit',
            paramTitle:'Einkünfte aus selbständiger Arbeit',
            paramType: 'string',
            paramParent: 'Zuordnung zur Einkunftsart',
            defaultValueMessage: '[Einkünfte aus selbständiger Arbeit]',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        const itemUnternehmenGeschaftsbetribe = 
        ["nicht steuerbegünstigte Körperschaft mit wirtschaftlichen Geschäftsbetrieb/en",
        "steuerbegünstigte Körperschaft mit wirtschaftlichen Geschäftsbetrieb/en",
        "juristische Person des öffentlichen Rechts mit Betrieb/en gewerblicher Art",
        "Unternehmen mit Gewinnermittlung bei Handelsschiffen im internationalen Verkehr"
        ];
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmen mit Gewinnermittlung für besondere Fälle',
            paramTitle:'Unternehmen mit Gewinnermittlung für besondere Fälle',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: itemUnternehmenGeschaftsbetribe,
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramTitle:'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Zweigniederlassung nach Handelsrecht',
            paramTitle:'Zweigniederlassung nach Handelsrecht',
            paramType: 'bool',
            paramParent: 'Inländische Betriebsstätte eines ausländischen Unternehmens',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Übrige Betriebsstättenart',
            paramTitle:'Übrige Betriebsstättenart',
            paramType: 'bool',
            paramParent: 'Inländische Betriebsstätte eines ausländischen Unternehmens',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafter/ Sonder- Mitunternehmer',
            paramTitle:'Gesellschafter/ Sonder- Mitunternehmer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name des Gesellschafters',
            paramTitle:'Name des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Name des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Vorname des Gesellschafters',
            paramTitle:'Vorname des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Gesellschafter/(Sonder-)Mitunternehmer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramTitle:'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            paramTitle:'Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Gesellschaftergruppe (Kapitalkontenentwicklung für Personenhandelsgesellschaften und andere Mitunternehmerschaften, Vollhafter)]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Nummer des Beteiligten aus Feststellungserklärung (Vordruck FB)',
            paramTitle:'Nummer des Beteiligten aus Feststellungserklärung (Vordruck FB)',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Nummer des Beteiligten aus Feststellungserklärung (Vordruck FB)]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '13stellige Steuernummer des Gesellschafters',
            paramTitle:'13stellige Steuernummer des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[13stellige Steuernummer des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche IDNr.',
            paramTitle:'steuerliche IDNr.',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[steuerliche IDNr.]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Rechtsform des Gesellschafters',
            paramTitle:'Rechtsform des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Rechtsform des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Sonderbilanz benötigt?',
            paramTitle:'Sonderbilanz benötigt?',
            paramType: 'bool',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ergänzungsbilanz benötigt?',
            paramTitle:'Ergänzungsbilanz benötigt?',
            paramType: 'bool',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        return convertedParam;
    }















    createParameterDialog67(param){

        var lang = 'de';

        var convertedParam = { data: [] };
        convertedParam.version = '1.0';
            
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
            level: "1"
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
            level: "1"
        }));

        let itemsStatusBerichts = [
            'erstmalig', 'berichtigt', 'geändert', 'berichtigt und geändert', 'identischer Abschluss mit differenzierteren Informationen, Korrektur durch Finanzverwaltung, sonstige Korrektur'
        ];

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Status des Berichts',
            paramTitle: 'Status des Berichts',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsStatusBerichts,
            level: "1"
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
            paramName: 'Steuerlicher Betriebsvermögensvergleich',
            paramTitle:'Steuerlicher Betriebsvermögensvergleich',
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
            paramName: 'Anlagenspiegel (brutto)',
            paramTitle: 'Anlagenspiegel (brutto)',
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
            paramName: 'steuerliche Gewinnermittlung',
            paramTitle:'steuerliche Gewinnermittlung',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche Gewinnermittlung bei Feststellungsverfahren',
            paramTitle:'steuerliche Gewinnermittlung bei Feststellungsverfahren',
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
            paramName: 'Bilanz enthält Ausweis des Bilanzgewinns/Bilanzverlustes',
            paramTitle:'Bilanz enthält Ausweis des Bilanzgewinns/Bilanzverlustes',
            paramType: 'bool',
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
            paramName: 'JAbschlVUV',
            paramTitle:'JAbschlVUV',
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
            paramName: 'Gesamthand 13stellige Steuernummer',
            paramTitle:'Gesamthand 13stellige Steuernummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: '4stellige Bundesfinanzamtsnummer, Gesamthand',
            paramTitle:'4stellige Bundesfinanzamtsnummer, Gesamthand',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '[4stellige Bundesfinanzamtsnummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Abschlussstichtag, Gesamthand',
            paramTitle:'Abschlussstichtag, Gesamthand',
            paramType: 'date',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
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
            defaultValueMessage: '[Name des Unternehmens]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'frühere Unternehmensnamen',
            paramTitle:'frühere Unternehmensnamen',
            paramType: 'string',
            paramParent: 'Name des Unternehmens',
            defaultValueMessage: '[frühere Unternehmensnamen]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'letztes Änderungsdatum, Name des Unternehmens',
            paramTitle:'letztes Änderungsdatum, Name des Unternehmens',
            paramType: 'date',
            paramParent: 'Name des Unternehmens',
            defaultValueMessage: '[letztes Änderungsdatum, Name des Unternehmens]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        const itemsRechstsform =
        ['Partner',
        'Person mit Beteiligungen an gewerbl. Personengesellschaften',
        'Sonstige natürliche Person',
        'Aktiengesellschaft',
        'Rechtsform, Aktiengesellschaft',
        'gemeinnützige Aktiengesellschaft (gAG)',
        'Anstalt des öffentlichen Rechts',
        'Betriebsstätte/Niederlassung eines ausländischen Versicherungsunternehmens',
        'Eingetragene Genossenschaft',
        'Eingetragener Verein',
        'Gebietskörperschaft',
        'Gesellschaft mit beschränkter Haftung',
        'gemeinnützige Gesellschaft mit beschränkter Haftung (gGmbH)',
        'Handelsrechtlich andere juristische Person',
        'Komplementär GmbH',
        'sonstige juristische Person des öffentlichen Rechts',
        'Limited',
        'Nichtrechtsfähiger Verein, Anstalt, Stiftung oder anderes Zweckvermögen',
        'Öffentl.-rechtl. Religionsgesellschaft',
        'Öffentl.-rechtl. Versorgungs-, Verkehrs- oder Hafenbetrieb',
        'Öffentliche oder unter Staatsaufsicht stehende Sparkasse',
        'Öffentlich-rechtliches Versicherungsunternehmen',
        'Realgemeinde',
        'REIT AG/SE',
        'Seerechtliche Gesellschaft/ Partenreederei',
        'Societas Cooperativa Europaea',
        'Societas Europaea',
        'Societas Europaea & Co KGaA',
        'Sonstige / ausländische Rechtsform Typ Körperschaft',
        'Sonstige juristische Person des privaten Rechts',
        'Sonstige Kreditanstalt des öffentlichen Rechts',
        'Staatsbank',
        'Stiftung (bürgerlichen Rechts)',
        'Unternehmergesellschaft (haftungsbeschränkt)',
        'Versicherungsverein auf Gegenseitigkeit',
        'Aktiengesellschaft & Co KGaA',
        'GmbH & Co KGaA',
        'Kommanditgesellschaft auf Aktien',
        'Mitunternehmer',
        'Rechtsform ausländischen Rechts GenR',
        'Rechtsform ausländischen Rechts HRA',
        'Rechtsform ausländischen Rechts HRB',
        'Rechtsform ausländischen Rechts PR',
        'Sonstige Rechtsform'
        ];
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Rechtsform',
            paramTitle:'Rechtsform',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsRechstsform,
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
            defaultValueMessage: '[Straße, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hausnummer, Firmensitz',
            paramTitle:'Hausnummer, Firmensitz',
            paramType: 'string',
            paramParent: 'Firmensitz',
            defaultValueMessage: '[Hausnummer, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Postleitzahl, Firmensitz',
            paramTitle:'Postleitzahl, Firmensitz',
            paramType: 'string',
            paramParent: 'Firmensitz',
            defaultValueMessage: '[Postleitzahl, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ort, Firmensitz',
            paramTitle:'Ort, Firmensitz',
            paramType: 'string',
            paramParent: 'Firmensitz',
            defaultValueMessage: '[Ort, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land, Firmensitz',
            paramTitle:'Land, Firmensitz',
            paramType: 'string',
            paramParent: 'Firmensitz',
            defaultValueMessage: '[Land, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennnummern',
            paramTitle:'Unternehmenskennnummern',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Unternehmenskennnummern]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennumern 13stellige Steuernummer',
            paramTitle:'Unternehmenskennumern 13stellige Steuernummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[13stellige Steuernummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche IdNr.',
            paramTitle:'steuerliche IdNr.',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[steuerliche IdNr.]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '4stellige Bundesfinanzamtsnummer',
            paramTitle:'4stellige Bundesfinanzamtsnummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[4stellige Bundesfinanzamtsnummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Geschäftstätigkeit',
            paramTitle:'Geschäftstätigkeit',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Geschäftstätigkeit]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        const itemsZuordnungEinkunftsart = 
        ['Einkünfte aus Land- und Forstwirtschaft',
            'Einkünfte aus Gewerbebetrieb',
            'Einkünfte aus selbständiger Arbeit',
            'Sonstige Fälle'
        ];
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Zuordnung zur Einkunftsart',
            paramTitle:'Zuordnung zur Einkunftsart',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Zuordnung zur Einkunftsart]',
            paramEditable: true,
            items: itemsZuordnungEinkunftsart,
            level: "1"
        }));
        const itemUnternehmenGeschaftsbetribe = 
        ["nicht steuerbegünstigte Körperschaft mit wirtschaftlichen Geschäftsbetrieb/en",
        "steuerbegünstigte Körperschaft mit wirtschaftlichen Geschäftsbetrieb/en",
        "juristische Person des öffentlichen Rechts mit Betrieb/en gewerblicher Art",
        "Unternehmen mit Gewinnermittlung bei Handelsschiffen im internationalen Verkehr"
        ];
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmen mit Gewinnermittlung für besondere Fälle',
            paramTitle:'Unternehmen mit Gewinnermittlung für besondere Fälle',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: itemUnternehmenGeschaftsbetribe,
            level: "1"
        }));
        const itemInlandischeBetribsstatte = [
            'Zweigniederlassung nach Handelsrecht',
            'Übrige Betriebsstättenart'
        ];
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramTitle:'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemInlandischeBetribsstatte,
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafter/ Sonder- Mitunternehmer',
            paramTitle:'Gesellschafter/ Sonder- Mitunternehmer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name des Gesellschafters',
            paramTitle:'Name des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Name des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramTitle:'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '13stellige Steuernummer des Gesellschafters',
            paramTitle:'13stellige Steuernummer des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[13stellige Steuernummer des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche IDNr.',
            paramTitle:'steuerliche IDNr.',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[steuerliche IDNr.]',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        //single choice da verificare cosa dev'essere inserito
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Rechtsform des Gesellschafters',
            paramTitle:'Rechtsform des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Rechtsform des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));

        //sequenza sottostante da verificare
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Beteiligungsschlüssel Gesellschafter',
            paramTitle:'Beteiligungsschlüssel Gesellschafter',
            paramType: 'string',
            paramParent: 'Beteiligungsschlüssel Gesellschafter',
            defaultValueMessage: '[Zähler/Nenner]',
            paramEditable: true,
            items: [],
            level: "1"
        }));


        return convertedParam;
    }


createParameterDialog68(param){

        var lang = 'de';

        var convertedParam = { data: [] };
        convertedParam.version = '1.0';
            
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
            level: "1"
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
            level: "1"
        }));

        let itemsStatusBerichts = [
            'erstmalig', 'berichtigt', 'geändert', 'berichtigt und geändert', 'identischer Abschluss mit differenzierteren Informationen, Korrektur durch Finanzverwaltung, sonstige Korrektur'
        ];

        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Status des Berichts',
            paramTitle: 'Status des Berichts',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsStatusBerichts,
            level: "1"
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
            paramName: 'Steuerlicher Betriebsvermögensvergleich',
            paramTitle:'Steuerlicher Betriebsvermögensvergleich',
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
            paramName: 'Anlagenspiegel (brutto)',
            paramTitle: 'Anlagenspiegel (brutto)',
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
            paramName: 'steuerliche Gewinnermittlung',
            paramTitle:'steuerliche Gewinnermittlung',
            paramType: 'bool',
            paramParent: 'Berichtsbestandteile',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche Gewinnermittlung bei Feststellungsverfahren',
            paramTitle:'steuerliche Gewinnermittlung bei Feststellungsverfahren',
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
            paramName: 'Bilanz enthält Ausweis des Bilanzgewinns/Bilanzverlustes',
            paramTitle:'Bilanz enthält Ausweis des Bilanzgewinns/Bilanzverlustes',
            paramType: 'bool',
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
            paramName: 'JAbschlVUV',
            paramTitle:'JAbschlVUV',
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
            paramName: 'Gesamthand 13stellige Steuernummer',
            paramTitle:'Gesamthand 13stellige Steuernummer',
            paramType: 'bool',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '',
            paramEditable: true,
            items: [],
            level: "3"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: '4stellige Bundesfinanzamtsnummer, Gesamthand',
            paramTitle:'4stellige Bundesfinanzamtsnummer, Gesamthand',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
            defaultValueMessage: '[4stellige Bundesfinanzamtsnummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Abschlussstichtag, Gesamthand',
            paramTitle:'Abschlussstichtag, Gesamthand',
            paramType: 'date',
            paramParent: 'Unternehmenskennnummern, Gesamthand',
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
            defaultValueMessage: '[Name des Unternehmens]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'frühere Unternehmensnamen',
            paramTitle:'frühere Unternehmensnamen',
            paramType: 'string',
            paramParent: 'Name des Unternehmens',
            defaultValueMessage: '[frühere Unternehmensnamen]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'letztes Änderungsdatum, Name des Unternehmens',
            paramTitle:'letztes Änderungsdatum, Name des Unternehmens',
            paramType: 'date',
            paramParent: 'Name des Unternehmens',
            defaultValueMessage: '[letztes Änderungsdatum, Name des Unternehmens]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        const itemsRechstsform =
        ['Partner',
        'Person mit Beteiligungen an gewerbl. Personengesellschaften',
        'Sonstige natürliche Person',
        'Aktiengesellschaft',
        'Rechtsform, Aktiengesellschaft',
        'gemeinnützige Aktiengesellschaft (gAG)',
        'Anstalt des öffentlichen Rechts',
        'Betriebsstätte/Niederlassung eines ausländischen Versicherungsunternehmens',
        'Eingetragene Genossenschaft',
        'Eingetragener Verein',
        'Gebietskörperschaft',
        'Gesellschaft mit beschränkter Haftung',
        'gemeinnützige Gesellschaft mit beschränkter Haftung (gGmbH)',
        'Handelsrechtlich andere juristische Person',
        'Komplementär GmbH',
        'sonstige juristische Person des öffentlichen Rechts',
        'Limited',
        'Nichtrechtsfähiger Verein, Anstalt, Stiftung oder anderes Zweckvermögen',
        'Öffentl.-rechtl. Religionsgesellschaft',
        'Öffentl.-rechtl. Versorgungs-, Verkehrs- oder Hafenbetrieb',
        'Öffentliche oder unter Staatsaufsicht stehende Sparkasse',
        'Öffentlich-rechtliches Versicherungsunternehmen',
        'Realgemeinde',
        'REIT AG/SE',
        'Seerechtliche Gesellschaft/ Partenreederei',
        'Societas Cooperativa Europaea',
        'Societas Europaea',
        'Societas Europaea & Co KGaA',
        'Sonstige / ausländische Rechtsform Typ Körperschaft',
        'Sonstige juristische Person des privaten Rechts',
        'Sonstige Kreditanstalt des öffentlichen Rechts',
        'Staatsbank',
        'Stiftung (bürgerlichen Rechts)',
        'Unternehmergesellschaft (haftungsbeschränkt)',
        'Versicherungsverein auf Gegenseitigkeit',
        'Aktiengesellschaft & Co KGaA',
        'GmbH & Co KGaA',
        'Kommanditgesellschaft auf Aktien',
        'Mitunternehmer',
        'Rechtsform ausländischen Rechts GenR',
        'Rechtsform ausländischen Rechts HRA',
        'Rechtsform ausländischen Rechts HRB',
        'Rechtsform ausländischen Rechts PR',
        'Sonstige Rechtsform'
        ];
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Rechtsform',
            paramTitle:'Rechtsform',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemsRechstsform,
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Straße, Firmensitz',
            paramTitle:'Straße, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Straße, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Hausnummer, Firmensitz',
            paramTitle:'Hausnummer, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Hausnummer, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Postleitzahl, Firmensitz',
            paramTitle:'Postleitzahl, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Postleitzahl, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Ort, Firmensitz',
            paramTitle:'Ort, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Ort, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Land, Firmensitz',
            paramTitle:'Land, Firmensitz',
            paramType: 'string',
            paramParent: 'Rechtsform',
            defaultValueMessage: '[Land, Firmensitz]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennnummern',
            paramTitle:'Unternehmenskennnummern',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Unternehmenskennnummern]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennumern 13stellige Steuernummer',
            paramTitle:'Unternehmenskennumern 13stellige Steuernummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[13stellige Steuernummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmenskennnummern steuerliche IdNr.',
            paramTitle:'Unternehmenskennnummern steuerliche IdNr.',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[steuerliche IdNr.]',
            paramEditable: true,
            items: [],
            level: "2"
        })); 
        convertedParam.data.push(this.createParameter(param, {
            paramName: '4stellige Bundesfinanzamtsnummer',
            paramTitle:'4stellige Bundesfinanzamtsnummer',
            paramType: 'string',
            paramParent: 'Unternehmenskennnummern',
            defaultValueMessage: '[4stellige Bundesfinanzamtsnummer]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Geschäftstätigkeit',
            paramTitle:'Geschäftstätigkeit',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Geschäftstätigkeit]',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        const itemsZuordnungEinkunftsart = 
        ['Einkünfte aus Land- und Forstwirtschaft',
            'Einkünfte aus Gewerbebetrieb',
            'Einkünfte aus selbständiger Arbeit',
            'Sonstige Fälle'
        ];
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Zuordnung zur Einkunftsart',
            paramTitle:'Zuordnung zur Einkunftsart',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Zuordnung zur Einkunftsart]',
            paramEditable: true,
            items: itemsZuordnungEinkunftsart,
            level: "1"
        }));
        const itemUnternehmenGeschaftsbetribe = 
        ["nicht steuerbegünstigte Körperschaft mit wirtschaftlichen Geschäftsbetrieb/en",
        "steuerbegünstigte Körperschaft mit wirtschaftlichen Geschäftsbetrieb/en",
        "juristische Person des öffentlichen Rechts mit Betrieb/en gewerblicher Art",
        "Unternehmen mit Gewinnermittlung bei Handelsschiffen im internationalen Verkehr"
        ];
        
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Unternehmen mit Gewinnermittlung für besondere Fälle',
            paramTitle:'Unternehmen mit Gewinnermittlung für besondere Fälle',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: itemUnternehmenGeschaftsbetribe,
            level: "1"
        }));
        const itemInlandischeBetribsstatte = [
            'Zweigniederlassung nach Handelsrecht',
            'Übrige Betriebsstättenart'
        ];
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramTitle:'Inländische Betriebsstätte eines ausländischen Unternehmens',
            paramType: 'combobox',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: true,
            items: itemInlandischeBetribsstatte,
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafter/ Sonder- Mitunternehmer',
            paramTitle:'Gesellschafter/ Sonder- Mitunternehmer',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '',
            paramEditable: false,
            items: [],
            level: "1"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Name des Gesellschafters',
            paramTitle:'Name des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Name des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramTitle:'Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[Gesellschafterschlüssel, unternehmensbezogenes / betriebsinternes Zuordnungsmerkmal]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: '13stellige Steuernummer des Gesellschafters',
            paramTitle:'13stellige Steuernummer des Gesellschafters',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[13stellige Steuernummer des Gesellschafters]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'steuerliche IDNr.',
            paramTitle:'steuerliche IDNr.',
            paramType: 'string',
            paramParent: 'Gesellschafter/ Sonder- Mitunternehmer',
            defaultValueMessage: '[steuerliche IDNr.]',
            paramEditable: true,
            items: [],
            level: "2"
        }));
        convertedParam.data.push(this.createParameter(param, {
            paramName: 'Gesellschafter',
            paramTitle:'Gesellschafter',
            paramType: 'string',
            paramParent: '',
            defaultValueMessage: '[Zähler]/[Nenner] ',
            paramEditable: true,
            items: [],
            level: "1"
        }));
        return convertedParam;
    }
}
