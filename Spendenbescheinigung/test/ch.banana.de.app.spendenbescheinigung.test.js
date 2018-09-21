// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.de.app.spendenbescheinigung.test
// @api = 1.0
// @pubdate = 2018-09-19
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.de.app.spendenbescheinigung.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.de.app.spendenbescheinigung.js
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
ReportTest.prototype.testBananaApp = function() {

  //Test file 1
  var file = "file:script/../test/testcases/test001.ac2";
  var donorsList = [";S001",";S002",";S003",";S004"];
  
  var userParam = {};
  userParam.costcenter = donorsList;
  userParam.account = '';
  userParam.transactions = true;
  userParam.text01 = 'Aaa Bbb SA';
  userParam.text02 = 'Via Boschetto 3';
  userParam.text03 = '6500 Bellinzona';
  userParam.localityAndDate = 'Bellinzona, giugno 2018';
  userParam.signature = 'Mario Rossi';
  userParam.printLogo = 0;

  var banDoc = Banana.application.openDocument(file);
  Test.assert(banDoc);
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, donorsList, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", userParam, donorsList, "First semester report");
  this.report_test(banDoc, "2018-07-01", "2018-12-31", userParam, donorsList, "Second semester report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, donorsList, "First quarter report");
  this.report_test(banDoc, "2018-04-01", "2018-06-30", userParam, donorsList, "Second quarter report");
  this.report_test(banDoc, "2018-07-01", "2018-09-30", userParam, donorsList, "Third quarter report");
  this.report_test(banDoc, "2018-10-01", "2018-12-31", userParam, donorsList, "Fourth quarter report");
  
  //Test file 2
  var file = "file:script/../test/testcases/test002.ac2";
  var donorsList = [";MEYER",";10001",";BARTUSCH",";VOIT"];
  
  var userParam = {};
  userParam.costcenter = donorsList;
  userParam.account = '';
  userParam.transactions = true;
  userParam.text01 = 'Ursula Beier - Sri Lanka Hilfe e. V.';
  userParam.text02 = 'Langschwander Weg 355';
  userParam.text03 = '87477 Sulberg-Moostbach';
  userParam.localityAndDate = 'Lugano, settembre 2018';
  userParam.signature = 'Ursula Beier';
  userParam.printLogo = 0;

  var banDoc = Banana.application.openDocument(file);
  Test.assert(banDoc);
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, donorsList, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", userParam, donorsList, "First semester report");
  this.report_test(banDoc, "2018-07-01", "2018-12-31", userParam, donorsList, "Second semester report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, donorsList, "First quarter report");
  this.report_test(banDoc, "2018-04-01", "2018-06-30", userParam, donorsList, "Second quarter report");
  this.report_test(banDoc, "2018-07-01", "2018-09-30", userParam, donorsList, "Third quarter report");
  this.report_test(banDoc, "2018-10-01", "2018-12-31", userParam, donorsList, "Fourth quarter report");

}

//Function that create the report for the test
ReportTest.prototype.report_test = function(banDoc, startDate, endDate, userParam, donorsList, reportName) {
  var report = createReport(banDoc, startDate, endDate, userParam, donorsList);
  Test.logger.addReport(reportName, report);
}

ReportTest.prototype.testVerifyMethods = function() {

  // numToWork(xx) => converted values
  // "xx" expected (correct) values

  Test.assertIsEqual(numToWords(0),"");
  Test.assertIsEqual(numToWords(1),"eins");
  Test.assertIsEqual(numToWords(2),"zwei");
  Test.assertIsEqual(numToWords(3),"drei");
  Test.assertIsEqual(numToWords(4),"vier");
  Test.assertIsEqual(numToWords(5),"fünf");
  Test.assertIsEqual(numToWords(6),"sechs");
  Test.assertIsEqual(numToWords(7),"sieben");
  Test.assertIsEqual(numToWords(8),"acht");
  Test.assertIsEqual(numToWords(9),"neun");
  Test.assertIsEqual(numToWords(10),"zehn");
  Test.assertIsEqual(numToWords(11),"elf");
  Test.assertIsEqual(numToWords(12),"zwölf");
  Test.assertIsEqual(numToWords(13),"dreizehn");
  Test.assertIsEqual(numToWords(14),"vierzehn");
  Test.assertIsEqual(numToWords(15),"fünfzehn");
  Test.assertIsEqual(numToWords(16),"sechzehn");
  Test.assertIsEqual(numToWords(17),"siebzehn");
  Test.assertIsEqual(numToWords(18),"achtzehn");
  Test.assertIsEqual(numToWords(19),"neunzehn");
  Test.assertIsEqual(numToWords(20),"zwanzig");
  Test.assertIsEqual(numToWords(21),"einundzwanzig");
  Test.assertIsEqual(numToWords(22),"zweiundzwanzig");
  Test.assertIsEqual(numToWords(23),"dreiundzwanzig");
  Test.assertIsEqual(numToWords(24),"vierundzwanzig");
  Test.assertIsEqual(numToWords(25),"fünfundzwanzig");
  Test.assertIsEqual(numToWords(26),"sechsundzwanzig");
  Test.assertIsEqual(numToWords(27),"siebenundzwanzig");
  Test.assertIsEqual(numToWords(28),"achtundzwanzig");
  Test.assertIsEqual(numToWords(29),"neunundzwanzig");
  Test.assertIsEqual(numToWords(30),"dreißig");
  Test.assertIsEqual(numToWords(31),"einunddreißig");
  Test.assertIsEqual(numToWords(32),"zweiunddreißig");
  Test.assertIsEqual(numToWords(33),"dreiunddreißig");
  Test.assertIsEqual(numToWords(34),"vierunddreißig");
  Test.assertIsEqual(numToWords(35),"fünfunddreißig");
  Test.assertIsEqual(numToWords(36),"sechsunddreißig");
  Test.assertIsEqual(numToWords(37),"siebenunddreißig");
  Test.assertIsEqual(numToWords(38),"achtunddreißig");
  Test.assertIsEqual(numToWords(39),"neununddreißig");
  Test.assertIsEqual(numToWords(40),"vierzig");
  Test.assertIsEqual(numToWords(41),"einundvierzig");
  Test.assertIsEqual(numToWords(42),"zweiundvierzig");
  Test.assertIsEqual(numToWords(43),"dreiundvierzig");
  Test.assertIsEqual(numToWords(44),"vierundvierzig");
  Test.assertIsEqual(numToWords(45),"fünfundvierzig");
  Test.assertIsEqual(numToWords(46),"sechsundvierzig");
  Test.assertIsEqual(numToWords(47),"siebenundvierzig");
  Test.assertIsEqual(numToWords(48),"achtundvierzig");
  Test.assertIsEqual(numToWords(49),"neunundvierzig");
  Test.assertIsEqual(numToWords(50),"fünfzig");
  Test.assertIsEqual(numToWords(51),"einundfünfzig");
  Test.assertIsEqual(numToWords(52),"zweiundfünfzig");
  Test.assertIsEqual(numToWords(53),"dreiundfünfzig");
  Test.assertIsEqual(numToWords(54),"vierundfünfzig");
  Test.assertIsEqual(numToWords(55),"fünfundfünfzig");
  Test.assertIsEqual(numToWords(56),"sechsundfünfzig");
  Test.assertIsEqual(numToWords(57),"siebenundfünfzig");
  Test.assertIsEqual(numToWords(58),"achtundfünfzig");
  Test.assertIsEqual(numToWords(59),"neunundfünfzig");
  Test.assertIsEqual(numToWords(60),"sechzig");
  Test.assertIsEqual(numToWords(61),"einundsechzig");
  Test.assertIsEqual(numToWords(62),"zweiundsechzig");
  Test.assertIsEqual(numToWords(63),"dreiundsechzig");
  Test.assertIsEqual(numToWords(64),"vierundsechzig");
  Test.assertIsEqual(numToWords(65),"fünfundsechzig");
  Test.assertIsEqual(numToWords(66),"sechsundsechzig");
  Test.assertIsEqual(numToWords(67),"siebenundsechzig");
  Test.assertIsEqual(numToWords(68),"achtundsechzig");
  Test.assertIsEqual(numToWords(69),"neunundsechzig");
  Test.assertIsEqual(numToWords(70),"siebzig");
  Test.assertIsEqual(numToWords(71),"einundsiebzig");
  Test.assertIsEqual(numToWords(72),"zweiundsiebzig");
  Test.assertIsEqual(numToWords(73),"dreiundsiebzig");
  Test.assertIsEqual(numToWords(74),"vierundsiebzig");
  Test.assertIsEqual(numToWords(75),"fünfundsiebzig");
  Test.assertIsEqual(numToWords(76),"sechsundsiebzig");
  Test.assertIsEqual(numToWords(77),"siebenundsiebzig");
  Test.assertIsEqual(numToWords(78),"achtundsiebzig");
  Test.assertIsEqual(numToWords(79),"neunundsiebzig");
  Test.assertIsEqual(numToWords(80),"achtzig");
  Test.assertIsEqual(numToWords(81),"einundachtzig");
  Test.assertIsEqual(numToWords(82),"zweiundachtzig");
  Test.assertIsEqual(numToWords(83),"dreiundachtzig");
  Test.assertIsEqual(numToWords(84),"vierundachtzig");
  Test.assertIsEqual(numToWords(85),"fünfundachtzig");
  Test.assertIsEqual(numToWords(86),"sechsundachtzig");
  Test.assertIsEqual(numToWords(87),"siebenundachtzig");
  Test.assertIsEqual(numToWords(88),"achtundachtzig");
  Test.assertIsEqual(numToWords(89),"neunundachtzig");
  Test.assertIsEqual(numToWords(90),"neunzig");
  Test.assertIsEqual(numToWords(91),"einundneunzig");
  Test.assertIsEqual(numToWords(92),"zweiundneunzig");
  Test.assertIsEqual(numToWords(93),"dreiundneunzig");
  Test.assertIsEqual(numToWords(94),"vierundneunzig");
  Test.assertIsEqual(numToWords(95),"fünfundneunzig");
  Test.assertIsEqual(numToWords(96),"sechsundneunzig");
  Test.assertIsEqual(numToWords(97),"siebenundneunzig");
  Test.assertIsEqual(numToWords(98),"achtundneunzig");
  Test.assertIsEqual(numToWords(99),"neunundneunzig");
  Test.assertIsEqual(numToWords(100),"einhundert");
  Test.assertIsEqual(numToWords(101),"einhunderteins");
  Test.assertIsEqual(numToWords(110),"einhundertzehn");
  Test.assertIsEqual(numToWords(111),"einhundertelf");
  Test.assertIsEqual(numToWords(199),"einhundertneunundneunzig");
  Test.assertIsEqual(numToWords(200),"zweihundert");
  Test.assertIsEqual(numToWords(300),"dreihundert");
  Test.assertIsEqual(numToWords(400),"vierhundert");
  Test.assertIsEqual(numToWords(500),"fünfhundert");
  Test.assertIsEqual(numToWords(900),"neunhundert");
  Test.assertIsEqual(numToWords(999),"neunhundertneunundneunzig");
  Test.assertIsEqual(numToWords(1000),"eintausend");
  Test.assertIsEqual(numToWords(1001),"eintausendeins");
  Test.assertIsEqual(numToWords(1010),"eintausendzehn");
  Test.assertIsEqual(numToWords(1111),"eintausendeinhundertelf");
  Test.assertIsEqual(numToWords(1500),"eintausendfünfhundert");
  Test.assertIsEqual(numToWords(2000),"zweitausend");
  Test.assertIsEqual(numToWords(10000),"zehntausend");
  Test.assertIsEqual(numToWords(10001),"zehntausendeins");
  Test.assertIsEqual(numToWords(10011),"zehntausendelf");
  Test.assertIsEqual(numToWords(10100),"zehntausendeinhundert");
  Test.assertIsEqual(numToWords(10101),"zehntausendeinhunderteins");
  Test.assertIsEqual(numToWords(10106),"zehntausendeinhundertsechs");
  Test.assertIsEqual(numToWords(10111),"zehntausendeinhundertelf");
  Test.assertIsEqual(numToWords(10112),"zehntausendeinhundertzwölf");
  Test.assertIsEqual(numToWords(20011),"zwanzigtausendelf");
  Test.assertIsEqual(numToWords(30100),"dreißigtausendeinhundert");
  Test.assertIsEqual(numToWords(40101),"vierzigtausendeinhunderteins");
  Test.assertIsEqual(numToWords(50106),"fünfzigtausendeinhundertsechs");
  Test.assertIsEqual(numToWords(60111),"sechzigtausendeinhundertelf");
  Test.assertIsEqual(numToWords(90112),"neunzigtausendeinhundertzwölf");
  Test.assertIsEqual(numToWords(100000),"einhunderttausend");
  Test.assertIsEqual(numToWords(100001),"einhunderttausendeins");
  Test.assertIsEqual(numToWords(100011),"einhunderttausendelf");
  Test.assertIsEqual(numToWords(100111),"einhunderttausendeinhundertelf");
  Test.assertIsEqual(numToWords(101111),"einhunderteintausendeinhundertelf");
  Test.assertIsEqual(numToWords(111111),"einhundertelftausendeinhundertelf");
  Test.assertIsEqual(numToWords(200002),"zweihunderttausendzwei");
  Test.assertIsEqual(numToWords(300033),"dreihunderttausenddreiunddreißig");
  Test.assertIsEqual(numToWords(400444),"vierhunderttausendvierhundertvierundvierzig");
  Test.assertIsEqual(numToWords(505555),"fünfhundertfünftausendfünfhundertfünfundfünfzig");
  Test.assertIsEqual(numToWords(999999),"neunhundertneunundneunzigtausendneunhundertneunundneunzig");
  Test.assertIsEqual(numToWords(1000000),"eine Million");
  Test.assertIsEqual(numToWords(1000001),"eine Million eins");
  Test.assertIsEqual(numToWords(1000011),"eine Million elf");
  Test.assertIsEqual(numToWords(1000111),"eine Million einhundertelf");
  Test.assertIsEqual(numToWords(1001111),"eine Million eintausendeinhundertelf");
  Test.assertIsEqual(numToWords(1011111),"eine Million elftausendeinhundertelf");
  Test.assertIsEqual(numToWords(1101111),"eine Million einhunderteintausendeinhundertelf");
  Test.assertIsEqual(numToWords(1111111),"eine Million einhundertelftausendeinhundertelf");
  Test.assertIsEqual(numToWords(9000009),"neun Millionen neun");
  Test.assertIsEqual(numToWords(7000077),"sieben Millionen siebenundsiebzig");
  Test.assertIsEqual(numToWords(6000666),"sechs Millionen sechshundertsechsundsechzig");
  Test.assertIsEqual(numToWords(5005555),"fünf Millionen fünftausendfünfhundertfünfundfünfzig");
  Test.assertIsEqual(numToWords(3033333),"drei Millionen dreiunddreißigtausenddreihundertdreiunddreißig");
  Test.assertIsEqual(numToWords(1234567),"eine Million zweihundertvierunddreißigtausendfünfhundertsiebenundsechzig");
  Test.assertIsEqual(numToWords(9876541),"neun Millionen achthundertsechsundsiebzigtausendfünfhunderteinundvierzig");
  Test.assertIsEqual(numToWords(10000000),"zehn Millionen");
  Test.assertIsEqual(numToWords(10000001),"zehn Millionen eins");
  Test.assertIsEqual(numToWords(10000011),"zehn Millionen elf");
  Test.assertIsEqual(numToWords(10000111),"zehn Millionen einhundertelf");
  Test.assertIsEqual(numToWords(10001111),"zehn Millionen eintausendeinhundertelf");
  Test.assertIsEqual(numToWords(10011111),"zehn Millionen elftausendeinhundertelf");
  Test.assertIsEqual(numToWords(10111111),"zehn Millionen einhundertelftausendeinhundertelf");
  Test.assertIsEqual(numToWords(11111111),"elf Millionen einhundertelftausendeinhundertelf");
  Test.assertIsEqual(numToWords(12345678),"zwölf Millionen dreihundertfünfundvierzigtausendsechshundertachtundsiebzig");
  Test.assertIsEqual(numToWords(23456789),"dreiundzwanzig Millionen vierhundertsechsundfünfzigtausendsiebenhundertneunundachtzig");
  Test.assertIsEqual(numToWords(34567890),"vierunddreißig Millionen fünfhundertsiebenundsechzigtausendachthundertneunzig");
  Test.assertIsEqual(numToWords(45678901),"fünfundvierzig Millionen sechshundertachtundsiebzigtausendneunhunderteins");
  Test.assertIsEqual(numToWords(56789012),"sechsundfünfzig Millionen siebenhundertneunundachtzigtausendzwölf");
  Test.assertIsEqual(numToWords(67890123),"siebenundsechzig Millionen achthundertneunzigtausendeinhundertdreiundzwanzig");
  Test.assertIsEqual(numToWords(78901234),"achtundsiebzig Millionen neunhunderteintausendzweihundertvierunddreißig");
  Test.assertIsEqual(numToWords(87654321),"siebenundachtzig Millionen sechshundertvierundfünfzigtausenddreihunderteinundzwanzig");
  Test.assertIsEqual(numToWords(99999999),"neunundneunzig Millionen neunhundertneunundneunzigtausendneunhundertneunundneunzig");
  Test.assertIsEqual(numToWords(100000000),"einhundert Millionen");
  Test.assertIsEqual(numToWords(100000001),"einhundert Millionen eins");
  Test.assertIsEqual(numToWords(100000011),"einhundert Millionen elf");
  Test.assertIsEqual(numToWords(100000111),"einhundert Millionen einhundertelf");
  Test.assertIsEqual(numToWords(100001111),"einhundert Millionen eintausendeinhundertelf");
  Test.assertIsEqual(numToWords(100011111),"einhundert Millionen elftausendeinhundertelf");
  Test.assertIsEqual(numToWords(100111111),"einhundert Millionen einhundertelftausendeinhundertelf");
  Test.assertIsEqual(numToWords(101111111),"einhunderteine Millionen einhundertelftausendeinhundertelf");
  Test.assertIsEqual(numToWords(111111111),"einhundertelf Millionen einhundertelftausendeinhundertelf");
  Test.assertIsEqual(numToWords(201000000),"zweihunderteine Millionen");
  Test.assertIsEqual(numToWords(301456789),"dreihunderteine Millionen vierhundertsechsundfünfzigtausendsiebenhundertneunundachtzig");
  Test.assertIsEqual(numToWords(401123456),"vierhunderteine Millionen einhundertdreiundzwanzigtausendvierhundertsechsundfünfzig");
  Test.assertIsEqual(numToWords(901008700),"neunhunderteine Millionen achttausendsiebenhundert");
  Test.assertIsEqual(numToWords(102000000),"einhundertzwei Millionen");
  Test.assertIsEqual(numToWords(103111333),"einhundertdrei Millionen einhundertelftausenddreihundertdreiunddreißig");
  Test.assertIsEqual(numToWords(105123456),"einhundertfünf Millionen einhundertdreiundzwanzigtausendvierhundertsechsundfünfzig");
  Test.assertIsEqual(numToWords(107000980),"einhundertsieben Millionen neunhundertachtzig");
  Test.assertIsEqual(numToWords(101010101),"einhunderteine Millionen zehntausendeinhunderteins");
  Test.assertIsEqual(numToWords(999999999),"neunhundertneunundneunzig Millionen neunhundertneunundneunzigtausendneunhundertneunundneunzig");
}





