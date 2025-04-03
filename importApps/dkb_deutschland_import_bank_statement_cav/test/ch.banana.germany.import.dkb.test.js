
// @id = ch.banana.germany.import.dkbdeutschland.test
// @api = 1.0
// @pubdate = 2025-04-03
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.germany.import.dkbdeutschland.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.germany.import.dkb.sbaa/import.utilities.js
// @includejs = ../ch.banana.germany.import.dkb.sbaa/ch.banana.germany.import.dkb.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportDKB());

// Here we define the class, the name of the class is not important
function TestImportDKB() {
}

// This method will be called at the beginning of the test case
TestImportDKB.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportDKB.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportDKB.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportDKB.prototype.cleanup = function () {

}

TestImportDKB.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv_dkb_deutschland_example_format1_20250331.csv");

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