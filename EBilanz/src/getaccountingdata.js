function checkAccounts(context, accounts)
{
  var currentDocument = context.document;
  if (!currentDocument)
    return;
	
  var tableAccounts = currentDocument.table('Accounts');
  if (!tableAccounts)
    return;

  var fileName = currentDocument.info("Base","FileName");

  for (var i = 0; i < tableAccounts.rowCount; i++) 
  {
	var accountId = tableAccounts.value(i, "DatevAccount");
	if (accountId === undefined || accountId.length<=0)
		accountId = tableAccounts.value(i, "Account");
	if (accountId.length<=0)
	  continue;
	var formattedAccountId = accountId.replace(/^0+/, '');
	var accountsList = getAccountsWithAccountId(formattedAccountId, accounts);
	if (accountsList.length<=0)
	{
	  //check amount, if balance is empty no warning is made
      var currentBal = currentDocument.currentBalance(accountId, context.startdate, context.enddate);
      if (currentBal.total!=0 || currentBal.balance!=0)
	  {
        var msg = getErrorMessage(ID_ERR_XBRL_MISSING);
        msg = msg.replace("%1", accountId );
        msg = msg.replace("%2", fileName);
        currentDocument.table('Accounts').addMessage(msg, i, "Account", ID_ERR_XBRL_MISSING);
	  }
	}
  }
}

function getAccountingData(param, contextList)
{  
  for (var i in contextList)
  {
    checkAccounts(contextList[i], param.accounts);
  }  
  
  for (var role in param.taxonomy)
  {
    for (var i in contextList)
    {
      initContext(param.taxonomy[role], contextList[i]['name']);
      loadAmounts(param.taxonomy[role], contextList[i], param.accounts);
      loadNetIncomeLoss(role, contextList[i], param);
	  if (role == 'role_balanceSheet')
		sum_role_balanceSheet(contextList[i]['name'], param.taxonomy);
	  else if (role == 'role_incomeStatement')
		sum_role_incomeStatement(contextList[i]['name'], param.taxonomy);
    }
  }

}

function getAccountsWithXbrlId(xbrlId, accounts)
{
  return accounts.filter(function(el) {
	return (el.debit === xbrlId || el.credit === xbrlId);
  });
}

function getAccountsWithAccountId(accountId, accounts)
{
  return accounts.filter(function(el) {
    return el.accountid === accountId;
  });
}

function initContext(roleObject, contextname)
{
  if (roleObject === undefined)
    return;
  for (var key in roleObject)
  {
    if (typeof roleObject[key] === 'object')
    {
      roleObject[key][contextname] = 0;
    };
  };
}

function loadAmounts(roleObject, context, accounts)
{
  if (roleObject === undefined || context === undefined)
    return;
  var accStartDate = context.startdate;
  var accEndDate = context.enddate;
  var contextName = context.name;
  var currentDocument = context.document;
  
  if (!currentDocument)
    return;

  var tableAccounts = currentDocument.table('Accounts');
  if (!tableAccounts)
    return;

  for (var i = 0; i < tableAccounts.rowCount; i++) 
  {
	var accountId = tableAccounts.value(i, "Account");
	var bClass = tableAccounts.value(i, "BClass");
	if (accountId === undefined || accountId.length<=0)
	  continue;

    var currentBal = currentDocument.currentBalance(accountId, accStartDate, accEndDate);
    if (currentBal.balance==0 && currentBal.total==0)
	  continue;
	  
	var accountIdDatev = tableAccounts.value(i, "DatevAccount");
	if (accountIdDatev)
	  accountId=accountIdDatev;
    accountId = accountId.replace(/^0+/, '');
	var accountsList = getAccountsWithAccountId(accountId, accounts);
	if (accountsList.length <= 0)
	  continue;
	  
	var xbrlIdDebit = '';
	var xbrlIdCredit = '';
	
	if (accountsList[0].debit)
		xbrlIdDebit = accountsList[0].debit;
	if (accountsList[0].credit)
		xbrlIdCredit = accountsList[0].credit;
	// it is the same if specified only xbrlIdDebit or xbrlIdCredit
	if (!xbrlIdDebit && xbrlIdCredit) {
		xbrlIdDebit = xbrlIdCredit;
	}
	
	var periodtype = '';
	var xbrlCurrent = xbrlIdDebit;
	// we assume period is same for xbrlIdDebit and xbrlIdCredit
	if (roleObject[xbrlCurrent]){
		periodtype = roleObject[xbrlCurrent].periodtype;
	}
	else {
		// var fileName = currentDocument.info("Base","FileName");
        // var msg = getErrorMessage(ID_ERR_XBRL_NOTFOUND);
        // msg = msg.replace("%1", accountId );
        // msg = msg.replace("%2", xbrlCurrent );
        // msg = msg.replace("%3", fileName);
        // Banana.document.table('Accounts').addMessage(msg, i, "Account", ID_ERR_XBRL_NOTFOUND);
		continue;
	}
	var amount = currentBal.balance;
	if (periodtype == 'duration') 
		amount = currentBal.total;
	if ( xbrlIdCredit && amount < 0)  {
		xbrlCurrent = xbrlIdCredit;
	}
	if (bClass=='2' || (roleObject[xbrlCurrent] && roleObject[xbrlCurrent].balance == 'credit')) {
		amount = amount*-1;
	}
	if (roleObject[xbrlCurrent])
	{
		amount = amount*roleObject[xbrlCurrent].weight;
		amount = Banana.SDecimal.round(amount, {'decimals':2});
		roleObject[xbrlCurrent][contextName] = Banana.SDecimal.add(roleObject[xbrlCurrent][contextName], amount);
	}
  }
}

function loadNetIncomeLoss(role, context, param)
{
  if (role.length<=0 || context === undefined)
    return;

  var accStartDate = context.startdate;
  var accEndDate = context.enddate;
  var contextName = context.name;
  var currentDocument = context.document;
  
  if (!currentDocument)
    return;

  //TODO: not compatible with journal and period
  /*var netIncomeLossGroup = param.netincomeLossGroup;
  var currentBalance = currentDocument.currentBalance("Gr="+netIncomeLossGroup, accStartDate, accEndDate);*/
  var tableTotals = currentDocument.table('Totals');
  var currentBalance=0;
  if (tableTotals)
  {
    for (var i = 0; i < tableTotals.rowCount; i++) 
    {
      var groupId = tableTotals.value(i, "Group");
	  if (groupId=="02")
	  {
        currentBalance = tableTotals.value(i, "Balance")*-1;
	    break;
	  }
    }
  }
  
  for (var i in param.factVariables)
  {
    var variableName = param.factVariables[i].name;
    var elementRole = param.factVariables[i].role;
	var elementid = param.factVariables[i].elementid;
    if ( variableName == "VARIABLE_NETINCOMELOSS" && elementRole == role && elementid.length>0)
	{
	  if (param.taxonomy[role][elementid])
        param.taxonomy[role][elementid][contextName] = Banana.SDecimal.round(currentBalance, {'decimals':2});
	}
  }
  return;
}
