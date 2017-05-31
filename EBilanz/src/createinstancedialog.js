/**
* Dialog's functions declaration
*/
var dialog = Banana.Ui.createUi("createinstancedialog.ui");

dialog.enableButtons = function () {
    if (dialog.periodGroupBox.accountingyearRadioButton.checked) {
        dialog.periodGroupBox.quarterComboBox.enabled = false;
        dialog.periodGroupBox.quarterComboBox.update();
        dialog.periodGroupBox.monthComboBox.enabled = false;
        dialog.periodGroupBox.monthComboBox.update();
        dialog.periodGroupBox.fromDateEdit.enabled = false;
        dialog.periodGroupBox.fromDateEdit.update();
        dialog.periodGroupBox.toLabelText.enabled = false;
        dialog.periodGroupBox.toLabelText.update();
        dialog.periodGroupBox.toDateEdit.enabled = false;
        dialog.periodGroupBox.toDateEdit.update();
    }
    else if (dialog.periodGroupBox.quarterRadioButton.checked) {
        dialog.periodGroupBox.quarterComboBox.enabled = true;
        dialog.periodGroupBox.quarterComboBox.update();
        dialog.periodGroupBox.monthComboBox.enabled = false;
        dialog.periodGroupBox.monthComboBox.update();
        dialog.periodGroupBox.fromDateEdit.enabled = false;
        dialog.periodGroupBox.fromDateEdit.update();
        dialog.periodGroupBox.toLabelText.enabled = false;
        dialog.periodGroupBox.toLabelText.update();
        dialog.periodGroupBox.toDateEdit.enabled = false;
        dialog.periodGroupBox.toDateEdit.update();
    }
    else if (dialog.periodGroupBox.monthRadioButton.checked) {
        dialog.periodGroupBox.quarterComboBox.enabled = false;
        dialog.periodGroupBox.quarterComboBox.update();
        dialog.periodGroupBox.monthComboBox.enabled = true;
        dialog.periodGroupBox.monthComboBox.update();
        dialog.periodGroupBox.fromDateEdit.enabled = false;
        dialog.periodGroupBox.fromDateEdit.update();
        dialog.periodGroupBox.toLabelText.enabled = false;
        dialog.periodGroupBox.toLabelText.update();
        dialog.periodGroupBox.toDateEdit.enabled = false;
        dialog.periodGroupBox.toDateEdit.update();
    }
    else if (dialog.periodGroupBox.dateRadioButton.checked) {
        dialog.periodGroupBox.quarterComboBox.enabled = false;
        dialog.periodGroupBox.quarterComboBox.update();
        dialog.periodGroupBox.monthComboBox.enabled = false;
        dialog.periodGroupBox.monthComboBox.update();
        dialog.periodGroupBox.fromDateEdit.enabled = true;
        dialog.periodGroupBox.fromDateEdit.update();
        dialog.periodGroupBox.toLabelText.enabled = true;
        dialog.periodGroupBox.toLabelText.update();
        dialog.periodGroupBox.toDateEdit.enabled = true;
        dialog.periodGroupBox.toDateEdit.update();
    }

}

dialog.checkdata = function () {
    var valid = true;
    var contextIdLabelError = "";
    var companyIdLabelError = "";
    var identifierSchemeLabelError = "";
    var profitLossLabelError = "";

    if (dialog.contextIdGroupBox.contextIdLineEdit.text.length <= 0) {
        contextIdLabelError = "The field Context ID is empty";
        valid = false;
    }

    if (dialog.entityGroupBox.companyIdLineEdit.text.length <= 0) {
        companyIdLabelError = "The field CompanyId is empty";
        valid = false;
    }

    if (dialog.entityGroupBox.identifierSchemeLineEdit.text.length <= 0) {
        identifierSchemeLabelError = "The field Scheme is empty";
        valid = false;
    }

    if (dialog.profitLossGroupBox.profitLossComboBox.text.length <= 0) {
        profitLossLabelError = "The field Profit/Loss Group is empty";
        valid = false;
    }

    if (valid) {
        dialog.accept();
    }
    else {
        dialog.contextIdGroupBox.contextIdLineEdit.text = contextIdLabelError;
        dialog.entityGroupBox.companyIdLabelError.text = companyIdLabelError;
        dialog.entityGroupBox.identifierSchemeLineEdit.text = identifierSchemeLabelError;
        dialog.profitLossGroupBox.profitLossComboBox.text = profitLossLabelError;
    }
}

dialog.showHelp = function () {
    Banana.Ui.showHelp("createinstancedialog.ui");
}

/**
* Dialog's events declaration
*/
dialog.buttonBox.accepted.connect(dialog, "checkdata");
dialog.buttonBox.helpRequested.connect(dialog, "showHelp");
dialog.periodGroupBox.accountingyearRadioButton.clicked.connect(dialog, "enableButtons");
dialog.periodGroupBox.quarterRadioButton.clicked.connect(dialog, "enableButtons");
dialog.periodGroupBox.monthRadioButton.clicked.connect(dialog, "enableButtons");
dialog.periodGroupBox.dateRadioButton.clicked.connect(dialog, "enableButtons");


/**
* Calls the dialog in order to set variables
*/
function dialogExec(param) {

    if (Banana.document) {
        var data = Banana.document.scriptReadSettings();
        if (data.length > 0) {
            param = JSON.parse(data);
        }
    }

    dialog.contextIdGroupBox.contextIdLineEdit.text = param["contextId"];
    dialog.contextIdGroupBox.contextIdLineEdit.cursorPosition = 0;
    dialog.contextIdGroupBox.contextIdLabelError.text = "";
	
    dialog.entityGroupBox.companyIdLineEdit.text = param["companyId"];
    dialog.entityGroupBox.companyIdLineEdit.cursorPosition = 0;
    dialog.entityGroupBox.companyIdLabelError.text = "";
	
    dialog.entityGroupBox.identifierSchemeLineEdit.text = param["identifierScheme"];
    dialog.entityGroupBox.identifierSchemeLineEdit.cursorPosition = 0;
    dialog.entityGroupBox.identifierSchemeLabelError.text = "";
	
	dialog.profitLossGroupBox.profitLossComboBox.currentIndex = param["profitLossGroup"];
    dialog.profitLossGroupBox.profitLossLabelError.text = "";

    if (param["periodSelected"] == "true")
        dialog.periodGroupBox.accountingyearRadioButton.checked = true;
    else
        dialog.periodGroupBox.accountingyearRadioButton.checked = false;
    dialog.periodGroupBox.accountingyearLabel.setText((param.accountingYear).toString());
    if (param["quarterSelected"] == "true")
        dialog.periodGroupBox.quarterRadioButton.checked = true;
    else
        dialog.periodGroupBox.quarterRadioButton.checked = false;
    dialog.periodGroupBox.quarterComboBox.currentIndex = param["quarterValue"];
    if (param["monthSelected"] == "true")
        dialog.periodGroupBox.monthRadioButton.checked = true;
    else
        dialog.periodGroupBox.monthRadioButton.checked = false;
    dialog.periodGroupBox.monthComboBox.currentIndex = param["monthValue"];
    if (param["dateSelected"] == "true")
        dialog.periodGroupBox.dateRadioButton.checked = true;
    else
        dialog.periodGroupBox.dateRadioButton.checked = false;

    //check if dates are valid
    var fromDate = Banana.Converter.stringToDate(param["fromDate"], "DD.MM.YYYY");
    var toDate = Banana.Converter.stringToDate(param["toDate"], "DD.MM.YYYY");
    if (fromDate.getFullYear() != param.accountingYear || toDate.getFullYear() != param.accountingYear) {
        fromDate = Banana.Converter.stringToDate(param.accountingOpeningDate, "YYYY-MM-DD");
        toDate = Banana.Converter.stringToDate(param.accountingClosureDate, "YYYY-MM-DD");
    }
    dialog.periodGroupBox.fromDateEdit.setDate(fromDate);
    dialog.periodGroupBox.toDateEdit.setDate(toDate);


    Banana.application.progressBar.pause();
    dialog.enableButtons();
    var dlgResult = dialog.exec();
    Banana.application.progressBar.resume();

    if (dlgResult !== 1)
        return false;

    param["contextId"] = dialog.contextIdGroupBox.contextIdLineEdit.text;
    param["companyId"] = dialog.entityGroupBox.companyIdLineEdit.text;
    param["identifierScheme"] = dialog.entityGroupBox.identifierSchemeLineEdit.text;
    param["profitLossGroup"] = dialog.profitLossGroupBox.profitLossComboBox.currentIndex.toString();

    if (dialog.periodGroupBox.accountingyearRadioButton.checked)
        param["accountingYearSelected"] = "true";
    else
        param["accountingYearSelected"] = "false";
    if (dialog.periodGroupBox.quarterRadioButton.checked)
        param["quarterSelected"] = "true";
    else
        param["quarterSelected"] = "false";
    param["quarterValue"] = dialog.periodGroupBox.quarterComboBox.currentIndex.toString();
    if (dialog.periodGroupBox.monthRadioButton.checked)
        param["monthSelected"] = "true";
    else
        param["monthSelected"] = "false";
    param["monthValue"] = dialog.periodGroupBox.monthComboBox.currentIndex.toString();
    if (dialog.periodGroupBox.dateRadioButton.checked)
        param["dateSelected"] = "true";
    else
        param["dateSelected"] = "false";
    param["fromDate"] = dialog.periodGroupBox.fromDateEdit.text < 10 ? "0" + dialog.periodGroupBox.fromDateEdit.text : dialog.periodGroupBox.fromDateEdit.text;
    param["toDate"] = dialog.periodGroupBox.toDateEdit.text < 10 ? "0" + dialog.periodGroupBox.toDateEdit.text : dialog.periodGroupBox.toDateEdit.text;

    //set period
    if (param["dateSelected"] == "true" || param["quarterSelected"] == "true" || param["monthSelected"] == "true") {
        param["periodSelected"] = "true";
        if (param["dateSelected"] === "true") {
            param["periodStart"] = param["fromDate"];
            param["periodEnd"] = param["toDate"];
        }
        else if (param["quarterSelected"] === "true") {
            if (param["quarterValue"] === "0") {
                param["periodStart"] = "01.01." + accountingYear.toString();
                param["periodEnd"] = "31.03." + accountingYear.toString();
            }
            else if (param["quarterValue"] === "1") {
                param["periodStart"] = "01.04." + accountingYear.toString();
                param["periodEnd"] = "30.06." + accountingYear.toString();
            }
            else if (param["quarterValue"] === "2") {
                param["periodStart"] = "01.07." + accountingYear.toString();
                param["periodEnd"] = "30.09." + accountingYear.toString();
            }
            else if (param["quarterValue"] === "3") {
                param["periodStart"] = "01.10." + accountingYear.toString();
                param["periodEnd"] = "31.12." + accountingYear.toString();
            }
        }
        else if (param["monthSelected"] === "true") {
            var month = parseInt(param["monthValue"]) + 1;
            //months with 30 days
            if (month === 11 || month === 4 || month === 6 || month === 9) {
                param["periodStart"] = "01." + zeroPad(month, 2) + "." + accountingYear.toString();
                param["periodEnd"] = "30." + zeroPad(month, 2) + "." + accountingYear.toString();
            }
                //month with 28 or 29 days
            else if (month === 2) {
                var day = 28;
                if (accountingYear % 4 == 0 && (accountingYear % 100 != 0 || accountingYear % 400 == 0)) {
                    day = 29;
                }
                param["periodStart"] = "01.02." + accountingYear.toString();
                param["periodEnd"] = day.toString() + ".02." + accountingYear.toString();
            }
                //months with 31 days
            else {
                param["periodStart"] = "01." + zeroPad(month, 2) + "." + accountingYear.toString();
                param["periodEnd"] = "31." + zeroPad(month, 2) + "." + accountingYear.toString();
            }
        }
    }
    else {
        param["periodSelected"] = "false";
        param["periodStart"] = "";
        param["periodEnd"] = "";
    }


    var paramToString = JSON.stringify(param);
    var value = Banana.document.scriptSaveSettings(paramToString);

    return true;
}

