function init_param()
{
  var param = {
  'accountingBasicCurrency' : '',
  'companyId' : '',
  'identifierScheme' : 'http://scheme.xbrl.org',
  };
  
  if (Banana.document)
  {
    param.accountingBasicCurrency = Banana.document.info("AccountingDataBase", "BasicCurrency");
    var company = '';
    if (Banana.document.info("AccountingDataBase","Company").length) {
      company = Banana.document.info("AccountingDataBase","Company");
    }
    if (Banana.document.info("AccountingDataBase","Name").length || Banana.document.info("AccountingDataBase","FamilyName").length) {
      company = Banana.document.info("AccountingDataBase","Name") + ' ' + Banana.document.info("AccountingDataBase","FamilyName");
    }
    param.companyId = company;
  }
 
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();
  param.taxonomy = init_taxonomy();
  param.accounts = init_accounts();
  param.factVariables = init_factvariables();
  return param;
}
