// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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
// @id = UStVoranmeldung.test
// @api = 1.0
// @pubdate = 2024-09-05
// @publisher = Banana.ch SA
// @description = <TEST UStVoranmeldung.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../UStVoranmeldung.js
// @timeout = -1



// Register test case to be executed
Test.registerTestCase(new ReportTest());

// Here we define the class, the name of the class is not important
function ReportTest() {

}

// This method will be called at the beginning of the test case
ReportTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportTest.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportTest.prototype.cleanup = function() {

}

// Generate the expected (correct) file
ReportTest.prototype.test1 = function() {

  var file1 = "file:script/../test/testcases/reversecharge_transactions.ac2";
  var userParam = {
    "selectionStartDate": "20240801",
    "selectionEndDate": "20240831",
    "selectionChecked": "false"
  };

  // Test reverse charge transactions
  var banDoc = Banana.application.openDocument(file1);
  Test.assert(banDoc);
  var report = createVatReport(banDoc, userParam.selectionStartDate, userParam.selectionEndDate);
  Test.logger.addComment("**** test #1 reverse charge transactions ****");
  Test.logger.addReport("Whole year report", report);

}
