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
// @id = ch.banana.de.EBilanz54-SKR04-PersG.test
// @doctype = *.*
// @publisher = Banana.ch SA
// @pubdate = 2024-03-01
// @description = Test für E-Bilanz Taxonomie 5.4 SKR04 Personengesellschaften
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.de.EBilanz54-SKR04-PersG.js
// Register this test case to be executed
Test.registerTestCase(new EBilanzTestFramework());

// Define the test class, the name of the class is not important
function EBilanzTestFramework() {
}

// This method will be called at the beginning of the test case
EBilanzTestFramework.prototype.initTestCase = function () {
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
EBilanzTestFramework.prototype.cleanupTestCase = function () {
}

// This method will be called before every test method is executed
EBilanzTestFramework.prototype.init = function () {
}

// This method will be called after every test method is executed
EBilanzTestFramework.prototype.cleanup = function () {
}

// Every method with the prefix 'test' are executed automatically as test method
// You can defiend as many test methods as you need

EBilanzTestFramework.prototype.testVerifyMethods = function () {
   var banDoc = Banana.application.openDocument("file:script/../test/testcases/EBilanz5.4-SKR04-PersG.ac2");
   var initParameter = init_param();
   var openingYear = 0;
   var closureYear = 0;
   var accountingOpeningDate = Banana.document.startPeriod();
   var accountingClosureDate = Banana.document.endPeriod();
   var accountingCurrentYear = '';
   if (accountingOpeningDate.length >= 10)
      openingYear = accountingOpeningDate.substring(0, 4);
   if (accountingClosureDate.length >= 10)
      closureYear = accountingClosureDate.substring(0, 4);
   if (openingYear > 0 && openingYear === closureYear)
      accountingCurrentYear = openingYear;
   if (accountingCurrentYear.length <= 0)
      accountingCurrentYear = 'aktjahr';

   var contextList = [
      {
         'name': accountingCurrentYear,
         'startdate': accountingOpeningDate,
         'enddate': accountingClosureDate,
         'document': Banana.document
      }];
   getAccountingData(initParameter, contextList);
   var output = createInstance(initParameter, contextList);

   var report = Banana.Report.newReport(banDoc, initParameter);
   var stylesheet = Banana.Report.newStyleSheet();
   for (var i in contextList) {
      printEBilanzReport(report, stylesheet, initParameter, contextList[i]);
   }
   Banana.Report.preview(report, stylesheet);
}