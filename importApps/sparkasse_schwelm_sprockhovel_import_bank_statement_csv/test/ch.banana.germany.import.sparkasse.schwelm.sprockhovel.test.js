
// @id = ch.banana.germany.import.sparkasse.schwelm.sprockhovel
// @api = 1.0
// @pubdate = 2024-07-10
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.germany.import.sparkasse.schwelm.sprockhovel>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.germany.import.sparkasse.schwelm.sprockhovel.sbaa/import.utilities.js
// @includejs = ../ch.banana.germany.import.sparkasse.schwelm.sprockhovel.sbaa/ch.banana.germany.import.sparkasse.schwelm.sprockhovel.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportSparkasseSchwelmSprockhovel());

// Here we define the class, the name of the class is not important
function TestImportSparkasseSchwelmSprockhovel() {
}

// This method will be called at the beginning of the test case
TestImportSparkasseSchwelmSprockhovel.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportSparkasseSchwelmSprockhovel.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportSparkasseSchwelmSprockhovel.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportSparkasseSchwelmSprockhovel.prototype.cleanup = function () {

}

TestImportSparkasseSchwelmSprockhovel.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv_sss_example_format1_20240701.csv");

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