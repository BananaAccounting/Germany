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
// @id = ch.banana.script.EBilanz54-SKR04-EinzelU
// @doctype = *.*
// @publisher = Banana.ch SA
// @pubdate = 2019-03-12
// @description = E-Bilanz Taxonomie 5.4 SKR04 Einzelunternehmen
// @task = export.file
// @exportfilename = <Date>_xbrl54gaap_skr04KapG
// @exportfiletype = xml
// @inputdatasource = none
// @encoding = utf-8
// @timeout = -1
// @includejs = Main.js

function exec(inData, options) {
    var main = new Main();
    var output = main.mainExecutionEBilanzEBilanz54EinzelU();
    return output;
  }