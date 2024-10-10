// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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
// @api = 1.0
// @id = ch.banana.script.EBilanz67-SKR03-KapG
// @doctype = *.*
// @publisher = Banana.ch SA
// @pubdate = 2024-09-24
// @description = E-Bilanz Taxonomie 6.7 SKR03 Kapitalgesellschaften
// @task = app.command
// @inputdatasource = none
// @encoding = utf-8
// @timeout = -1
// @includejs = Main.js
// @includejs = OpenPropertyEditor.js

function exec(inData, options) {
    var main = new Main();
    var openEditor = new openPropertyEditor();
    
    if(!openEditor.settingsDialog('EBilanz67KapGSKR03')){
      return '@Cancel';
    }
    openEditor.initParam();
    var JSONdataDialog = openEditor.getDataJSONDialog();
    var arrayDataDialog = openEditor.jsonToArrayConverter(JSONdataDialog);
    var arrayDataLevelDialog = openEditor.getArrayLevelDialogData();
    Banana.console.debug("arrayDataLevelDialog: "+arrayDataLevelDialog.length);
    Banana.console.debug("arrayDataDialog length:"+arrayDataDialog.length);
    var output = main.mainExecutionEBilanz67KapG("", "", arrayDataDialog, arrayDataLevelDialog);

    return output;
}
