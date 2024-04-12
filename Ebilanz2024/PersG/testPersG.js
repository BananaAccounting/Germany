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
// @id = ch.banana.script.EBilanz61-SKR04-KapG
// @doctype = *.*
// @docproperties = 
// @publisher = Banana.ch SA
// @pubdate = 2019-03-12
// @description = Test E-Bilanz Taxonomie 6.1 SKR04 Kapitalgesellschaften
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
function exec() {
    //Call the function to create the report
    var report = createReport();
 
    //Print the report
    var stylesheet = Banana.Report.newStyleSheet();
    Banana.Report.preview(report, stylesheet);
 }
 
 function createReport() {
     //Create the report
     var report = Banana.Report.newReport("Report title");
 
     //Add a paragraph with the "hello world" text
     report.addParagraph("Hello World!");
 
     //Return the report
     return report;
 }