
// @id = ch.banana.germany.import.deutschebank
// @api = 1.0
// @pubdate = 2024-02-02
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.germany.import.deutschebank>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.germany.import.deutschebank.sbaa/import.utilities.js
// @includejs = ../ch.banana.germany.import.deutschebank.sbaa/ch.banana.germany.import.deutschebank.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportDeutscheBank());

// Here we define the class, the name of the class is not important
function TestImportDeutscheBank() {
}

// This method will be called at the beginning of the test case
TestImportDeutscheBank.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportDeutscheBank.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportDeutscheBank.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportDeutscheBank.prototype.cleanup = function () {

}

TestImportDeutscheBank.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv_deutschebank_example_format1_20190904.csv");
   fileNameList.push("file:script/../test/testcases/csv_deutschebank_example_format2_20140803.csv");
   fileNameList.push("file:script/../test/testcases/csv_deutschebank_example_format3_20240131.csv");

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