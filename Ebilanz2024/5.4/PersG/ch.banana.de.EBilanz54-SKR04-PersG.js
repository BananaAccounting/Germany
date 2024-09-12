// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.de.EBilanz54-SKR04-PersG
// @doctype = *.*
// @publisher = Banana.ch SA
// @pubdate = 2024-04-24
// @description = E-Bilanz Taxonomie 5.4 SKR04 Personengesellschaften
// @task = app.command
// @inputdatasource = none
// @encoding = utf-8
// @timeout = -1
// @includejs = Main.js
// @includejs = OpenPropertyEditor.js

function exec(inData, options) {
  var main = new Main();
  var openEditor = new openPropertyEditor();
  if (!openEditor.settingsDialog('EBilanz54PersG')) {
    return '@Cancel';
  }
  openEditor.initParam();
  var JSONdataDialog = openEditor.getDataJSONDialog();
  var arrayDataDialog = openEditor.jsonToArrayConverter(JSONdataDialog);
  var elementArrayDataDialog = openEditor.getArryLevelDialogData();
  /* Banana.console.debug("JSONDATADIALOG: ");
  Banana.console.debug(Object.entries(JSON.parse(JSONdataDialog)));
  Banana.console.debug("arrayDataDialog: ");
  Banana.console.debug(arrayDataDialog.forEach(item => { Banana.console.debug(`Key: ${item.key}, Value: ${item.value}`) })); */
  var output = main.mainExecutionEBilanz54PersG("", "", arrayDataDialog, elementArrayDataDialog);

  return output;
}