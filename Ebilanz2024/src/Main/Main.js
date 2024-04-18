//@includejs = AccountingOperation.js
//@includejs = InitParameterEBilanz54KapG.js
//@includejs = InitParameterEBilanz61KapG.js
//@includejs = InitParameterEBilanz54PersG.js
//@includejs = InitParameterEBilanz54EinzelU.js
//@includejs = InstanceXml.js
//@includejs = Report.js

var Main = class Main {
  constructor() {
  }
  mainExecutionEBilanz61KapG(inData, options) {
    var initParam = new InitParameterEBilanz61KapG();
    var accountingData = new AccountingOperation();
    var instanceXml = new InstanceXml();
    var reportPrint = new Report();


    var param = initParam.init_param();
    //var param = init_param();

    //calls dialog if inData contains no param
    /*var rtnDialog = true;
    if (inData && inData.length > 0) {
        param = JSON.parse(inData);
    }
    else if (options && options.useLastSettings) {
        param = JSON.parse(Banana.document.getScriptSettings());
     }
     else {
        rtnDialog = dialogExec(param);
    }
  
    if (!rtnDialog)
    {
      return "@Cancel";
    }*/

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

    //E-Bilanz Online works only with one context (current year)
    /*var fileName = Banana.document.info("AccountingDataBase","FileNamePreviousYear");
    if (fileName.length>0)
    {
      var documentPreviousYear = Banana.application.openDocument(fileName);
      if (documentPreviousYear)
      {
        openingYear = 0;
        closureYear = 0;
        accountingOpeningDate = documentPreviousYear.startPeriod();
        accountingClosureDate = documentPreviousYear.endPeriod();
        accountingCurrentYear = '';
        if (accountingOpeningDate.length >= 10)
          openingYear = accountingOpeningDate.substring(0, 4);
        if (accountingClosureDate.length >= 10)
          closureYear = accountingClosureDate.substring(0, 4);
        if (openingYear > 0 && openingYear === closureYear)
          accountingCurrentYear = openingYear;
        if (accountingCurrentYear.length<=0)
          accountingCurrentYear = 'prevjahr';
  
        contextList.push(
          {
            'name':  accountingCurrentYear,
            'startdate' : accountingOpeningDate,
            'enddate' : accountingClosureDate,
            'document' : documentPreviousYear
          } );
      }
    }*/

    accountingData.getAccountingDataEBilanz61KapG(param, contextList);
    var output = instanceXml.createInstance(param, contextList);

    var report = Banana.Report.newReport("Bilanz / Gewinn- und Verlustrechnung (E-Bilanz)");
    var stylesheet = Banana.Report.newStyleSheet();
    for (var i in contextList) {
      reportPrint.printEBilanzReport(report, stylesheet, param, contextList[i]);
    }
    Banana.Report.preview(report, stylesheet);
    return output;
  }
  mainExecutionEBilanz54KapG(inData, options) {
    var initParam = new InitParameterEBilanz54KapG();
    var accountingData = new AccountingOperation();
    var instanceXml = new InstanceXml();
    var reportPrint = new Report();


    var param = initParam.init_param();
    //var param = init_param();

    //calls dialog if inData contains no param
    /*var rtnDialog = true;
    if (inData && inData.length > 0) {
        param = JSON.parse(inData);
    }
    else if (options && options.useLastSettings) {
        param = JSON.parse(Banana.document.getScriptSettings());
     }
     else {
        rtnDialog = dialogExec(param);
    }
  
    if (!rtnDialog)
    {
      return "@Cancel";
    }*/

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

    //E-Bilanz Online works only with one context (current year)
    /*var fileName = Banana.document.info("AccountingDataBase","FileNamePreviousYear");
    if (fileName.length>0)
    {
      var documentPreviousYear = Banana.application.openDocument(fileName);
      if (documentPreviousYear)
      {
        openingYear = 0;
        closureYear = 0;
        accountingOpeningDate = documentPreviousYear.startPeriod();
        accountingClosureDate = documentPreviousYear.endPeriod();
        accountingCurrentYear = '';
        if (accountingOpeningDate.length >= 10)
          openingYear = accountingOpeningDate.substring(0, 4);
        if (accountingClosureDate.length >= 10)
          closureYear = accountingClosureDate.substring(0, 4);
        if (openingYear > 0 && openingYear === closureYear)
          accountingCurrentYear = openingYear;
        if (accountingCurrentYear.length<=0)
          accountingCurrentYear = 'prevjahr';
  
        contextList.push(
          {
            'name':  accountingCurrentYear,
            'startdate' : accountingOpeningDate,
            'enddate' : accountingClosureDate,
            'document' : documentPreviousYear
          } );
      }
    }*/

    accountingData.getAccountingDataEBilanz54KapG(param, contextList);
    var output = instanceXml.createInstance(param, contextList);

    var report = Banana.Report.newReport("Bilanz / Gewinn- und Verlustrechnung (E-Bilanz)");
    var stylesheet = Banana.Report.newStyleSheet();
    for (var i in contextList) {
      reportPrint.printEBilanzReport(report, stylesheet, param, contextList[i]);
    }
    Banana.Report.preview(report, stylesheet);
    return output;
  }
  mainExecutionEBilanz54PersG(inData, options) {
    var initParam = new InitParameterEBilanz54PersG();
    var accountingData = new AccountingOperation();
    var instanceXml = new InstanceXml();
    var reportPrint = new Report();


    var param = initParam.init_param();
    //var param = init_param();

    //calls dialog if inData contains no param
    /*var rtnDialog = true;
    if (inData && inData.length > 0) {
        param = JSON.parse(inData);
    }
    else if (options && options.useLastSettings) {
        param = JSON.parse(Banana.document.getScriptSettings());
     }
     else {
        rtnDialog = dialogExec(param);
    }
  
    if (!rtnDialog)
    {
      return "@Cancel";
    }*/

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

    //E-Bilanz Online works only with one context (current year)
    /*var fileName = Banana.document.info("AccountingDataBase","FileNamePreviousYear");
    if (fileName.length>0)
    {
      var documentPreviousYear = Banana.application.openDocument(fileName);
      if (documentPreviousYear)
      {
        openingYear = 0;
        closureYear = 0;
        accountingOpeningDate = documentPreviousYear.startPeriod();
        accountingClosureDate = documentPreviousYear.endPeriod();
        accountingCurrentYear = '';
        if (accountingOpeningDate.length >= 10)
          openingYear = accountingOpeningDate.substring(0, 4);
        if (accountingClosureDate.length >= 10)
          closureYear = accountingClosureDate.substring(0, 4);
        if (openingYear > 0 && openingYear === closureYear)
          accountingCurrentYear = openingYear;
        if (accountingCurrentYear.length<=0)
          accountingCurrentYear = 'prevjahr';
  
        contextList.push(
          {
            'name':  accountingCurrentYear,
            'startdate' : accountingOpeningDate,
            'enddate' : accountingClosureDate,
            'document' : documentPreviousYear
          } );
      }
    }*/

    accountingData.getAccountingDataEBilanz54PersG(param, contextList);
    var output = instanceXml.createInstance(param, contextList);

    var report = Banana.Report.newReport("Bilanz / Gewinn- und Verlustrechnung (E-Bilanz)");
    var stylesheet = Banana.Report.newStyleSheet();
    for (var i in contextList) {
      reportPrint.printEBilanzReport(report, stylesheet, param, contextList[i]);
    }
    Banana.Report.preview(report, stylesheet);
    return output;
  }
  mainExecutionEBilanzEBilanz54EinzelU() {
    var initParam = new InitParameterEBilanz54EinzelU();
    var accountingData = new AccountingOperation();
    var instanceXml = new InstanceXml();
    var reportPrint = new Report();


    var param = initParam.init_param();

    //calls dialog if inData contains no param
    /*var rtnDialog = true;
    if (inData && inData.length > 0) {
        param = JSON.parse(inData);
    }
    else if (options && options.useLastSettings) {
        param = JSON.parse(Banana.document.getScriptSettings());
     }
     else {
        rtnDialog = dialogExec(param);
    }
  
    if (!rtnDialog)
    {
    return "@Cancel";
    }*/

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

    //E-Bilanz Online works only with one context (current year)
    /*var fileName = Banana.document.info("AccountingDataBase","FileNamePreviousYear");
    if (fileName.length>0)
    {
      var documentPreviousYear = Banana.application.openDocument(fileName);
      if (documentPreviousYear)
      {
        openingYear = 0;
        closureYear = 0;
        accountingOpeningDate = documentPreviousYear.startPeriod();
        accountingClosureDate = documentPreviousYear.endPeriod();
        accountingCurrentYear = '';
        if (accountingOpeningDate.length >= 10)
          openingYear = accountingOpeningDate.substring(0, 4);
        if (accountingClosureDate.length >= 10)
          closureYear = accountingClosureDate.substring(0, 4);
        if (openingYear > 0 && openingYear === closureYear)
          accountingCurrentYear = openingYear;
        if (accountingCurrentYear.length<=0)
          accountingCurrentYear = 'prevjahr';
  
        contextList.push(
          {
            'name':  accountingCurrentYear,
            'startdate' : accountingOpeningDate,
            'enddate' : accountingClosureDate,
            'document' : documentPreviousYear
          } );
      }
    }*/

    accountingData.getAccountingDataEBilanz54EinzelU(param, contextList);
    var output = instanceXml.createInstance(param, contextList);

    var report = Banana.Report.newReport("Bilanz / Gewinn- und Verlustrechnung (E-Bilanz)");
    var stylesheet = Banana.Report.newStyleSheet();
    for (var i in contextList) {
      reportPrint.printEBilanzReport(report, stylesheet, param, contextList[i]);
    }
    Banana.Report.preview(report, stylesheet);

    return output;
  }
}