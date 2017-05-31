function init_param()
{
  var param = {
  'contextId' : 'yourContextId',
  'companyId' : 'yourCompanyId',
  'identifierScheme' : 'http://scheme.xbrl.org',
  'profitLossGroup' : '02',
  'accountingBasicCurrency' : '',
  'accountingOpeningDate' : '',
  'accountingClosureDate' : '',
  'accountingYear' : 0,
  };
  
  if (Banana.document)
  {
    param.accountingBasicCurrency = Banana.document.info("AccountingDataBase", "BasicCurrency");
    param.accountingOpeningDate = Banana.document.info("AccountingDataBase", "OpeningDate");
    param.accountingClosureDate = Banana.document.info("AccountingDataBase", "ClosureDate");

    var openingYear = 0;
    var closureYear = 0;
    if (param.accountingOpeningDate.length >= 10)
        openingYear = param.accountingOpeningDate.substring(0, 4);
    if (param.accountingClosureDate.length >= 10)
        closureYear = param.accountingClosureDate.substring(0, 4);
    if (openingYear > 0 && openingYear === closureYear)
        param.accountingYear = openingYear;
  }
 
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();
  param.taxonomy = init_taxonomy();
  param.accounts = init_accounts();
  param.factVariables = init_factvariables();
  return param;
}
