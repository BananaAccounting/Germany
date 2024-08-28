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
        this.paramEB54PersG = [];

    }
    initParam() {
        var param = {};
        param.last_name = "";
        param.first_name = "";
        return param;
    }

    setParamEB54PersG(parameters){
        for (let index = 0; index < this.paramEB54PersG.length; index++) {
            parameters.push(this.paramEB54PersG[index]);
        }
        return parameters;
        
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

        var dialogTitle = 'Settings';
        var convertedParam ;
        if(typeEBilanz === 'EBilanz54PersG'){
            convertedParam = this.convertParamEB54PersG(param);
            //this.paramEB54PersG = Array.from(convertedParam.data);
            //Banana.console.debug("convertedParam.data "+Object.entries(this.paramEB54PersG));
        }
        else if(typeEBilanz === 'EBilanz54EinzelU'){
            convertedParam = this.convertParamEB54EinzelU(param);

        }
        else if(typeEBilanz === 'EBilanz54KapG'){
            convertedParam = this.convertParamEB54KapG(param);
        }
        else if(typeEBilanz === 'EBilanz61KapG'){
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
        //Banana.console.debug("JSON.stringify(param): "+JSON.stringify(paramToString));
        //Banana.console.debug("paramToString: "+paramToString);
        //Banana.console.debug("Object.keys(oggetto) "+Object.keys(param));
        /* Banana.console.debug(param["Erstellungsdatum"]);
        for (let chiave in param) {
            if (param.hasOwnProperty(chiave)) { // Controlla se la proprietà è dell'oggetto stesso
                Banana.console.debug(`${chiave}: ${param[chiave]}`);
                
            }
        } */
        

        if (Banana.document) {
            var value = Banana.document.setScriptSettings(paramToString);
        }
        
        return true;
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
    createParameter(param, paramName, paramTitle, paramType, defaultValueMessage){
        var currentParameter = {};
        currentParameter.name = paramName;
        currentParameter.title = paramTitle;
        currentParameter.type = paramType;
        if(paramType ==='string'){
            currentParameter.value = param[paramName]? param[paramName]: defaultValueMessage;
        }
        else if(paramType === 'bool'){
            currentParameter.value = param[paramName] ? param[paramName] : false;
        }
        currentParameter.readValue = function() {
            param[paramName] = this.value;
        };
        return currentParameter;

    }

    convertParamEB54PersG(param) {

        var lang = 'en';

        var convertedParam = {};
        convertedParam.version = '1.0';
        convertedParam.data = [];

        var currentParam = this.createParameter(param, 'Identifikationsmerkmale des Dokuments','Identifikationsmerkmale des Dokuments','string','[Identifikationsmerkmale des Dokuments]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Erstellungsdatum','Erstellungsdatum','string','[Erstellungsdatum]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Inhalt des Dokuments','Inhalt des Dokuments','string','[Inhalt des Dokuments]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Unternehmens-Identifikationsnummer','Unternehmens-Identifikationsnummer','string','[Schreiben Sie die Unternehmens-Identifikationsnummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentersteller','Dokumentersteller','string','[Dokumentersteller]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Dokumentersteller, Name','Dokumentersteller, Name','string','[Dokumentersteller, Name]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Document author, department','Document author, department','string','[Document author, department]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Document author, function, contact person in enterprise','Document author, function, contact person in enterprise','string','[Document author, function, contact person in enterprise]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentersteller, Funktion, Steuerberater','Dokumentersteller, Funktion, Steuerberater','string','[Dokumentersteller, Funktion, Steuerberater]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentersteller, Firmenname','Dokumentersteller, Firmenname','string','[Dokumentersteller, Firmenname]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Dokumentersteller, Straße','Dokumentersteller, Straße','string','[Dokumentersteller, Straße]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentersteller, Hausnummer','Dokumentersteller, Hausnummer','string','[Dokumentersteller, Hausnummer]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Dokumentersteller, Postleitzahl','Dokumentersteller, Postleitzahl','string','[Dokumentersteller, Postleitzahl]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentersteller, Ort','Dokumentersteller, Ort','string','[Dokumentersteller, Ort]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentersteller, Land','Dokumentersteller, Land','string','[Dokumentersteller, Land]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Dokumentersteller, Land, ISO Code Land','Dokumentersteller, Land, ISO Code Land','string','[Dokumentersteller, Land, ISO Code Land]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentersteller, Telefonnummer','Dokumentersteller, Telefonnummer','string','[Dokumentersteller, Telefonnummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentersteller, Faxnummer','Dokumentersteller, Faxnummer','string','[Dokumentersteller, Faxnummer]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Dokumentersteller, e-mail Adresse','Dokumentersteller, e-mail Adresse','string','[Dokumentersteller, e-mail Adresse]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Dokumentersteller, Hauptansprechpartner','Dokumentersteller, Hauptansprechpartner','string','[Dokumentersteller, Hauptansprechpartner]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentabsender','Dokumentabsender','string','[Dokumentabsender]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Document sender, type of ID','Document sender, type of ID','string','[Document sender, type of ID]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentabsender, Wert der ID','Dokumentabsender, Wert der ID','string','[Dokumentabsender, Wert der ID]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentabsender, Straße','Dokumentabsender, Straße','string','[Dokumentabsender, Straße]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentabsender, Hausnummer','Dokumentabsender, Hausnummer','string','[Dokumentabsender, Hausnummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentabsender, Postleitzahl','Dokumentabsender, Postleitzahl','string','[Dokumentabsender, Postleitzahl]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentabsender, Ort','Dokumentabsender, Ort','string','[Dokumentabsender, Ort]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Dokumentabsender, Firmenname','Dokumentabsender, Firmenname','string','[Dokumentabsender, Firmenname]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Dokumentrevisionen','Dokumentrevisionen','string','[Dokumentrevisionen]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Liste Dokumentrevisionen mit Datum','Liste Dokumentrevisionen mit Datum','string','[Liste Dokumentrevisionen mit Datum]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'aktuelle Versionsnummer Dokument','aktuelle Versionsnummer Dokument','string','[aktuelle Versionsnummer Dokument]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Änderungsdatum Dokument','Änderungsdatum Dokument','string','[Änderungsdatum Dokument]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Veranlasser der Änderung im Dokument','Veranlasser der Änderung im Dokument','string','[Veranlasser der Änderung im Dokument]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'nutzerspezifische Dokumentinformationen','nutzerspezifische Dokumentinformationen','string','[nutzerspezifische Dokumentinformationen]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Informationen zum Bericht','Informationen zum Bericht','string','[Informationen zum Bericht]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Sachverständige','Sachverständige','string','[Sachverständige]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Gutachter für Pensionsrückstellung','Gutachter für Pensionsrückstellung','string','[Gutachter für Pensionsrückstellung]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'sonstige Gutachter','sonstige Gutachter','string','[sonstige Gutachter (z.B. für Gutachter zur Bewertung von Beteiligungen oder Grundstücken)]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Identifikationsmerkmale des Berichts','Identifikationsmerkmale des Berichts','string','[Identifikationsmerkmale des Berichts]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Art des Berichts','Art des Berichts','string','[Art des Berichts: Geschäftsbericht, Jahresfinanzbericht, Verkaufsprospekt, Prüfungsbericht, Erstellungsbericht, Einnahmenüberschussrechnung, Halbjahresfinanzbericht, Gutachten, Quartalsfinanzbericht,  sonstiger Bericht]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum','Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum','string','[Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum','Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum','string','[Feststellungsdatum / Billigungsdatum / Veröffentlichungsdatum]');
        convertedParam.data.push(currentParam);
        

        var currentParam = this.createParameter(param, 'print_preview', 'Print preview', 'bool','');
        convertedParam.data.push(currentParam);
        
        for (let chiave in convertedParam.data) {
            if (convertedParam.data.hasOwnProperty(chiave)) { 
                this.paramEB54PersG.push(`${chiave}: ${JSON.stringify(convertedParam.data[chiave])}`);
                //Banana.console.debug("this.paramEB54PersG: "+this.paramEB54PersG);
            }
        }
        return convertedParam;
    }

    convertParamEB54EinzelU(param){
        var lang = 'en';

        var convertedParam = {};
        convertedParam.data = [];
        convertedParam.version = '1.0';
        // dati proprietario ditta individuale
        var currentParam = this.createParameter(param, 'Name des Firmeninhabers', 'Name des Firmeninhabers','string','[name]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Adresse des Firmeninhabers', 'Adresse des Firmeninhabers','string','[Addresse]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param, 'Geburtsdatum des Firmeninhabers', 'Geburtsdatum des Firmeninhabers','string','[xx.xx.xxxx]');
        convertedParam.data.push(currentParam);
        
        //dati ditta
        var currentParam = this.createParameter(param, 'Firmenname', 'Firmenname','string','[Firmenname]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param, 'Adresse', 'Adresse','string','[Adresse]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Art des Unternehmens', 'Art des Unternehmens','string','[Art des Unternehmens]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param, 'Steuernummer', 'Steuernummer','string','[Steuernummer]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param, 'Umsatzsteueridentifikationsnummer', 'Umsatzsteueridentifikationsnummer','string','[Umsatzsteueridentifikationsnummer]');
        convertedParam.data.push(currentParam);

        //stampa preview
        var currentParam = this.createParameter(param, 'print_preview', 'Print preview', 'bool','');
        convertedParam.data.push(currentParam);

        return convertedParam;
        
    }

    convertParamEB54KapG(param){
        var lang = 'en';
        var convertedParam = {};
        convertedParam.data = [];
        convertedParam.version = '1.0';

        var currentParam = this.createParameter(param, 'Name des Unternehmens', 'Name des Unternehmens','string','[Name des Unternehmens]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Rechtsform', 'Rechtsform','string','[Rechtsform]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param, 'Anschrift', 'Anschrift','string','[Anschrift]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'print_preview', 'Print preview', 'bool','');
        convertedParam.data.push(currentParam);

        return convertedParam;
    }

    convertParamEB61KapG(param){
        var lang = 'en';
        var convertedParam = {};
        convertedParam.data = [];
        convertedParam.version = '1.0';

        var currentParam = this.createParameter(param, 'Name der Firma ', 'Name der Firma','string','[Schreiben Sie den Name der Firma]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Firmenadresse  ', 'Firmenadresse ','string','[Schreiben Sie die Firmenadresse]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Umsatzsteuer-Identifikationsnummer ', 'Umsatzsteuer-Identifikationsnummer','string','[Schreiben Sie Ihre Umsatzsteuer-Identifikationsnummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'Steuernummer ', 'Steuernummer','string','[Schreiben Sie Ihre Steuernummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param, 'print_preview', 'Print preview', 'bool','');
        convertedParam.data.push(currentParam);

        return convertedParam;

    }
}
