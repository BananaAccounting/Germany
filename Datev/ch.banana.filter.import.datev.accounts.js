// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.filter.import.datev.accounts
// @api = 1.0
// @pubdate = 2019-01-15
// @publisher = Banana.ch SA
// @description = DATEV Import Konten (*.csv)
// @task = import.accounts
// @doctype = *
// @docproperties =
// @inputdatasource = openfiledialog
// @inputfilefilter = CSV (*.csv);;All files (*.*)
// @inputfilefilter.de = CSV (*.csv);;Alle Dateien (*.*)
// @includejs = ch.banana.filter.import.datev.js

//Main function
function exec(inData) {

   if (!Banana.document)
      return "@Cancel";

   var output = '';
   if (Banana.script.getParamValue('task') === 'import.accounts') {
      var datevImport = new DatevImport(Banana.document);
      output = datevImport.importAccounts(inData);
   }
   else if (Banana.script.getParamValue('task') === 'import.transactions') {
      var datevImport = new DatevImport(Banana.document);
      output = datevImport.importTransactions(inData);
   }

   //TO DEBUG SHOW THE INTERMEDIARY TEXT
   //Banana.Ui.showText(output);

   return output;

}

