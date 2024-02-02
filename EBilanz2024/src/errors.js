/**
* ErrorId List
*/
var ID_ERR_XBRL_MISSING = "ID_ERR_XBRL_MISSING";
var ID_ERR_XBRL_NOTFOUND = "ID_ERR_XBRL_NOTFOUND";

/**
* return the text error message according to error id
*/
function getErrorMessage(errorId) {
    switch (errorId) {
        case ID_ERR_XBRL_MISSING:
            return "Das Konto %1 hat keine gültige Xbrl-Position und wird nicht berücksichtigt. Filename: %2";
        case ID_ERR_XBRL_NOTFOUND:
            return "Das Konto %1 hat keine gültige Xbrl-Position und wird nicht berücksichtigt. Xbrl-Position%2. Filename: %3";
    }
    return "";
}
