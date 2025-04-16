
// @id = ch.banana.germany.import.deutschepostbank
// @api = 1.0
// @pubdate = 2025-04-16
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.germany.import.deutschepostbank>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.germany.import.deutschepostbank.sbaa/import.utilities.js
// @includejs = ../ch.banana.germany.import.deutschepostbank.sbaa/ch.banana.germany.import.deutschepostbank.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportDeutschePostBank());

// Here we define the class, the name of the class is not important
function TestImportDeutschePostBank() {
}

// This method will be called at the beginning of the test case
TestImportDeutschePostBank.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportDeutschePostBank.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportDeutschePostBank.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportDeutschePostBank.prototype.cleanup = function () {

}

TestImportDeutschePostBank.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv_deutschepostbank_example_format1_20250414.csv");

   var parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   for (var i = 0; i < fileNameList.length; i++) {
      var fileName = fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));

      var file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      var transactions = exec(fileContent, true); //takes the exec from the import script.
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}