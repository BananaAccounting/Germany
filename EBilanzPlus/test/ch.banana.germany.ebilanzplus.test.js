// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.germany.ebilanzplus.test
// @api = 1.0
// @pubdate = 2026-05-13
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.germany.ebilanzplus.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.germany.ebilanzplus.sbaa/ch.banana.germany.ebilanzplus.js
// @timeout = -1


/*

  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report



  virtual void addTestBegin(const QString& key, const QString& comment = QString());
  virtual void addTestEnd();

  virtual void addSection(const QString& key);
  virtual void addSubSection(const QString& key);
  virtual void addSubSubSection(const QString& key);

  virtual void addComment(const QString& comment);
  virtual void addInfo(const QString& key, const QString& value1, const QString& value2 = QString(), const QString& value3 = QString());
  virtual void addFatalError(const QString& error);
  virtual void addKeyValue(const QString& key, const QString& value, const QString& comment = QString());
  virtual void addReport(const QString& key, QJSValue report, const QString& comment = QString());
  virtual void addTable(const QString& key, QJSValue table, QStringList colXmlNames = QStringList(), const QString& comment = QString());

**/

// Register test case to be executed
Test.registerTestCase(new EBilanzPlusTest());

// Here we define the class, the name of the class is not important
function EBilanzPlusTest() {

}

// This method will be called at the beginning of the test case
EBilanzPlusTest.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;

   this.fileNameList = [];
   this.fileNameList.push("file:script/../test/testcases/doubleentry_multicurrency_2026.ac2");
}

// This method will be called at the end of the test case
EBilanzPlusTest.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
EBilanzPlusTest.prototype.init = function () {

}

// This method will be called after every test method is executed
EBilanzPlusTest.prototype.cleanup = function () {

}

EBilanzPlusTest.prototype.getParams = function () {
   //Param for exporting Transactions
   var param = {};
   return param;
}

//Function that creates the report for the test
EBilanzPlusTest.prototype.test1 = function () {
   var parentLogger = this.testLogger;
   this.progressBar.start(this.fileNameList.length);
   for (var i = 0; i < this.fileNameList.length; i++) {
      var fileName = this.fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));
      var banDocument = Banana.application.openDocument(fileName);
      if (banDocument) {
         var param = this.getParams();
         //imposta anno nei parametri
         /*var nAnno = banDocument.info("AccountingDataBase", "OpeningDate");
         if (nAnno != banDocument.info("AccountingDataBase", "ClosureDate"))
            nAnno = banDocument.info("AccountingDataBase", "ClosureDate");
         if (nAnno.length >= 10)
            nAnno = nAnno.substring(0, 4);*/
         var exporter = new EBilanzExporter(banDocument);
         //var paramString = JSON.stringify(param);
         //exporter.setParam(paramString);
         var header = exporter.getHeader();
         var rows = exporter.getRows();
         var csvContent = exporter.tableToCsv([header].concat(rows));
         this.outputData(fileName, csvContent);

      } else {
         this.testLogger.addFatalError("File not found: " + fileName);
      }
      this.testLogger.close();
      this.testLogger = parentLogger;
      if (!this.progressBar.step())
         break;
   }
   this.progressBar.finish();
}

//Function that creates the report for the test
EBilanzPlusTest.prototype.outputData = function (fileName, data) {

   var headerFields = [];
   var rows = data.split(/\r?\n/);
   if (rows.length > 0) {
      headerFields = rows[0].split(';')
   }
   for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var fields = row.split(';');
      if (fields.length !== headerFields.length)
         continue;
      for (var j = 0; j < fields.length; j++) {
         this.testLogger.addKeyValue("Row_" + i + '_' + headerFields[j], fields[j]);
      }
   }

}

