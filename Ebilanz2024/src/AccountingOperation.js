//@includejs = Errors.js
var AccountingOperation = class AccountingOperation {

    constructor() {
    }

    getAccountsWithAccountId(accountId, accounts) {
        return accounts.filter(function (el) {
            return el.accountid === accountId;
        });
    }

    checkAccounts(context, accounts) {
        var ID_ERR_XBRL_MISSING = "ID_ERR_XBRL_MISSING";
        var errors = new Errors();
        var currentDocument = context.document;
        if (!currentDocument)
            return;

        var tableAccounts = currentDocument.table('Accounts');
        if (!tableAccounts)
            return;

        var fileName = currentDocument.info("Base", "FileName");

        for (var i = 0; i < tableAccounts.rowCount; i++) {
            var accountId = tableAccounts.value(i, "DatevAccount");
            if (accountId === undefined || accountId.length <= 0)
                accountId = tableAccounts.value(i, "Account");
            if (accountId.length <= 0)
                continue;
            var formattedAccountId = accountId.replace(/^0+/, '');
            var accountsList = this.getAccountsWithAccountId(formattedAccountId, accounts);
            if (accountsList.length <= 0) {
                //check amount, if balance is empty no warning is made
                var currentBal = currentDocument.currentBalance(accountId, context.startdate, context.enddate);
                if (currentBal.total != 0 || currentBal.balance != 0) {
                    var msg = errors.getErrorMessage(ID_ERR_XBRL_MISSING);
                    msg = msg.replace("%1", accountId);
                    msg = msg.replace("%2", fileName);
                    currentDocument.table('Accounts').addMessage(msg, i, "Account", ID_ERR_XBRL_MISSING);
                }
            }
        }
    }
    initContext(roleObject, contextname) {
        if (roleObject === undefined)
            return;
        for (var key in roleObject) {
            if (typeof roleObject[key] === 'object') {
                roleObject[key][contextname] = 0;
            };
        };
    }

    loadAmounts(roleObject, context, accounts) {
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

        for (var i = 0; i < tableAccounts.rowCount; i++) {
            var accountId = tableAccounts.value(i, "Account");
            var bClass = tableAccounts.value(i, "BClass");
            if (accountId === undefined || accountId.length <= 0)
                continue;

            var currentBal = currentDocument.currentBalance(accountId, accStartDate, accEndDate);
            if (currentBal.balance == 0 && currentBal.total == 0)
                continue;

            var accountIdDatev = tableAccounts.value(i, "DatevAccount");
            if (accountIdDatev)
                accountId = accountIdDatev;
            accountId = accountId.replace(/^0+/, '');
            var accountsList = this.getAccountsWithAccountId(accountId, accounts);
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
            if (roleObject[xbrlCurrent]) {
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
            if (xbrlIdCredit && amount < 0) {
                xbrlCurrent = xbrlIdCredit;
            }
            if (bClass == '2' || (roleObject[xbrlCurrent] && roleObject[xbrlCurrent].balance == 'credit')) {
                amount = amount * -1;
            }
            if (roleObject[xbrlCurrent]) {
                amount = amount * roleObject[xbrlCurrent].weight;
                amount = Banana.SDecimal.round(amount, { 'decimals': 2 });
                roleObject[xbrlCurrent][contextName] = Banana.SDecimal.add(roleObject[xbrlCurrent][contextName], amount);
            }
        }
    }
    loadNetIncomeLoss(role, context, param) {
        if (role.length <= 0 || context === undefined)
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
        var currentBalance = 0;
        if (tableTotals) {
            for (var i = 0; i < tableTotals.rowCount; i++) {
                var groupId = tableTotals.value(i, "Group");
                if (groupId == "02") {
                    currentBalance = tableTotals.value(i, "Balance") * -1;
                    break;
                }
            }
        }

        for (var i in param.factVariables) {
            var variableName = param.factVariables[i].name;
            var elementRole = param.factVariables[i].role;
            var elementid = param.factVariables[i].elementid;
            if (variableName == "VARIABLE_NETINCOMELOSS" && elementRole == role && elementid.length > 0) {
                if (param.taxonomy[role][elementid])
                    param.taxonomy[role][elementid][contextName] = Banana.SDecimal.round(currentBalance, { 'decimals': 2 });
            }
        }
        return;
    }

    getAccountingDataEBilanz54KapG(param, contextList) {
        var initParamEB54Kapg = new InitParameterEBilanz54KapG();
        for (var i in contextList) {
            this.checkAccounts(contextList[i], param.accounts);
        }

        for (var role in param.taxonomy) {
            for (var i in contextList) {
                this.initContext(param.taxonomy[role], contextList[i]['name']);
                this.loadAmounts(param.taxonomy[role], contextList[i], param.accounts);
                this.loadNetIncomeLoss(role, contextList[i], param);
                if (role == 'role_balanceSheet')
                    initParamEB54Kapg.sum_role_balanceSheet(contextList[i]['name'], param.taxonomy);
                else if (role == 'role_incomeStatement')
                    initParamEB54Kapg.sum_role_incomeStatement(contextList[i]['name'], param.taxonomy);
            }
        }

    }
    getAccountingDataEBilanz61KapG(param, contextList) {
        var initParamEB61Kapg = new InitParameterEBilanz61KapG();
        for (var i in contextList) {
            this.checkAccounts(contextList[i], param.accounts);
        }

        for (var role in param.taxonomy) {
            for (var i in contextList) {
                this.initContext(param.taxonomy[role], contextList[i]['name']);
                this.loadAmounts(param.taxonomy[role], contextList[i], param.accounts);
                this.loadNetIncomeLoss(role, contextList[i], param);
                if (role == 'role_balanceSheet')
                    initParamEB61Kapg.sum_role_balanceSheet(contextList[i]['name'], param.taxonomy);
                else if (role == 'role_incomeStatement')
                    initParamEB61Kapg.sum_role_incomeStatement(contextList[i]['name'], param.taxonomy);
            }
        }

    }
    getAccountingDataEBilanz54PersG(param, contextList) {
        var initParamEB54PersG = new InitParameterEBilanz54PersG();
        for (var i in contextList) {
            this.checkAccounts(contextList[i], param.accounts);
        }

        for (var role in param.taxonomy) {
            for (var i in contextList) {
                this.initContext(param.taxonomy[role], contextList[i]['name']);
                this.loadAmounts(param.taxonomy[role], contextList[i], param.accounts);
                this.loadNetIncomeLoss(role, contextList[i], param);
                if (role == 'role_balanceSheet')
                    initParamEB54PersG.sum_role_balanceSheet(contextList[i]['name'], param.taxonomy);
                else if (role == 'role_incomeStatement')
                    initParamEB54PersG.sum_role_incomeStatement(contextList[i]['name'], param.taxonomy);
            }
        }
    }

    getAccountingDataEBilanz54EinzelU(param, contextList) {
        var initParameterEB54EinzelU = new InitParameterEBilanz54EinzelU();
        for (var i in contextList) {
            this.checkAccounts(contextList[i], param.accounts);
        }
        for (var role in param.taxonomy) {
            for (var i in contextList) {
                this.initContext(param.taxonomy[role], contextList[i]['name']);
                this.loadAmounts(param.taxonomy[role], contextList[i], param.accounts);
                this.loadNetIncomeLoss(role, contextList[i], param);
                if (role == 'role_balanceSheet')
                    initParameterEB54EinzelU.sum_role_balanceSheet(contextList[i]['name'], param.taxonomy);
                else if (role == 'role_incomeStatement')
                    initParameterEB54EinzelU.sum_role_incomeStatement(contextList[i]['name'], param.taxonomy);
            }
        }
    }
    getAccountingDataEBilanz67KapG(param, contextList) {
        var initParameterEBilanz67KapG = new InitParameterEBilanz68SKR04KapG();
        for (var i in contextList) {
            this.checkAccounts(contextList[i], param.accounts);
        }
        for (var role in param.taxonomy) {
            for (var i in contextList) {
                this.initContext(param.taxonomy[role], contextList[i]['name']);
                this.loadAmounts(param.taxonomy[role], contextList[i], param.accounts);
                this.loadNetIncomeLoss(role, contextList[i], param);
                if (role == 'role_balanceSheet')
                    initParameterEBilanz67KapG.sum_role_balanceSheet(contextList[i]['name'], param.taxonomy);
                else if (role == 'role_incomeStatement')
                    initParameterEBilanz67KapG.sum_role_incomeStatement(contextList[i]['name'], param.taxonomy);
            }
        }
    }
    getAccountingDataEBilanz67SKR03KapG(param, contextList) {
        var initParameterEBilanz67KapG = new InitParameterEBilanz67SKR03KapG();
        for (var i in contextList) {
            this.checkAccounts(contextList[i], param.accounts);
        }
        for (var role in param.taxonomy) {
            for (var i in contextList) {
                this.initContext(param.taxonomy[role], contextList[i]['name']);
                this.loadAmounts(param.taxonomy[role], contextList[i], param.accounts);
                this.loadNetIncomeLoss(role, contextList[i], param);
                if (role == 'role_balanceSheet')
                    initParameterEBilanz67KapG.sum_role_balanceSheet(contextList[i]['name'], param.taxonomy);
                else if (role == 'role_incomeStatement')
                    initParameterEBilanz67KapG.sum_role_incomeStatement(contextList[i]['name'], param.taxonomy);
            }
        }
    }
    getAccountingDataEBilanz68SKR04KapG(param, contextList) {
        var initParameterEBilanz68KapG = new InitParameterEBilanz68SKR04KapG();
        for (var i in contextList) {
            this.checkAccounts(contextList[i], param.accounts);
        }
        for (var role in param.taxonomy) {
            for (var i in contextList) {
                this.initContext(param.taxonomy[role], contextList[i]['name']);
                this.loadAmounts(param.taxonomy[role], contextList[i], param.accounts);
                this.loadNetIncomeLoss(role, contextList[i], param);
                if (role == 'role_balanceSheet')
                    initParameterEBilanz68KapG.sum_role_balanceSheet(contextList[i]['name'], param.taxonomy);
                else if (role == 'role_incomeStatement')
                    initParameterEBilanz68KapG.sum_role_incomeStatement(contextList[i]['name'], param.taxonomy);
            }
        }
    }
    getAccountsWithXbrlId(xbrlId, accounts) {
        return accounts.filter(function (el) {
            return (el.debit === xbrlId || el.credit === xbrlId);
        });
    }
}