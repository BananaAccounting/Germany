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
// @id = openpropertyeditor.js
// @api = 1.0
// @pubdate = 2024-04-18
// @publisher = Banana.ch SA
// @description = Test openpropertyeditor
// @task = app.command
// @doctype = *
// @timeout = -1

/* function exec(inData, options) {
    // Banana.Ui.showText("testing multiselection property");
    settingsDialog();
} */
var openPropertyEditor = class openPropertyEditor {
    constructor() {

    }
    initParam() {
        var param = {};
        param.last_name = "";
        param.first_name = "";
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

        var dialogTitle = 'Settings';
        var convertedParam ;
        if(typeEBilanz === 'EBilanz54PersG'){
            convertedParam = this.convertParamEB54PersG(param);
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
        Banana.console.debug(JSON.stringify(paramToString));
        if (Banana.document) {
            var value = Banana.document.setScriptSettings(paramToString);
        }

        return true;
    }

    createParameter(param, paramName, paramTitle, paramType, defaultValueMessage){
        var currentParameter = {};
        currentParameter.name = paramName;
        currentParameter.title = paramTitle;
        currentParameter.type = paramType;
        currentParameter.value = param[paramName]? param[paramName]: defaultValueMessage;
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

        var currentParam = this.createParameter(param, 'Firmenbezeichnung','Firmenbezeichnung','string','[Schreiben Sie die Firmenbezeichnung]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Firmenadresse','Firmenadresse','string','[Schreiben Sie die Firmenbezeichnung Firmenadresse]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Steuernummer','Steuernummer','string','[Schreiben Sie die Firmenbezeichnung Firmenadresse]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Unternehmens-Identifikationsnummer','Unternehmens-Identifikationsnummer','string','[Schreiben Sie die Unternehmens-Identifikationsnummer]');
        convertedParam.data.push(currentParam);

        var currentParam = this.createParameter(param,'Rechtsform des Unternehmens','Rechtsform des Unternehmens','string','[Schreiben Sie die Rechtsform des Unternehmens]');
        convertedParam.data.push(currentParam);
        
        var currentParam = this.createParameter(param,'Angaben zu den Gesellschaftern','Angaben zu den Gesellschaftern','string','[Schreiben Sie die Angaben zu den Gesellschaftern, Namen, Adressen und Beteiligungsquoten der Gesellschafter]');
        convertedParam.data.push(currentParam);

        return convertedParam;
    }
}
