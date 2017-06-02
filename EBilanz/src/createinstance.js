function createInstance(param, contextList)
{
  var xbrlContent = '';
  var attrsIdentifier = {
	  scheme: param['identifierScheme']
  };  
  var xbrlIdentifier = xml_createElement("xbrli:identifier", param['companyId'], attrsIdentifier);

  for (var j in param['schemaRefs'])
  {
    if (param['schemaRefs'][j].length>0) {
      var attrsSchemaRef = {
      'xlink:type': 'simple',
      'xlink:href': param['schemaRefs'][j]
      };  
      xbrlContent += '\n' + xml_createElement("link:schemaRef", "", attrsSchemaRef);
    }
  }  

  for (var i in contextList)
  {
    var attrsInstant = {
	  id: "i-" + contextList[i].name
	};  
	var xbrlInstant = '\n' + xml_createElement("xbrli:instant", contextList[i].enddate) + '\n';
	var xbrlString = '\n' + xml_createElement("xbrli:entity", xbrlIdentifier);
	xbrlString += '\n' + xml_createElement("xbrli:period", xbrlInstant) + '\n';
    xbrlContent += '\n' + xml_createElement("xbrli:context", xbrlString, attrsInstant);

    var attrsDuration = {
	  id: "d-" + contextList[i].name
	};  
	var xbrlDuration = '\n' + xml_createElement("xbrli:startDate", contextList[i].startdate) + '\n';
	xbrlDuration += xml_createElement("xbrli:endDate", contextList[i].enddate) + '\n';
	xbrlString = '\n' + xml_createElement("xbrli:entity", xbrlIdentifier);
	xbrlString += '\n' + xml_createElement("xbrli:period", xbrlDuration) + '\n';
    xbrlContent += '\n' + xml_createElement("xbrli:context", xbrlString, attrsDuration);
  }   

  var accountingBasicCurrency = Banana.document.info("AccountingDataBase", "BasicCurrency");
  var accountingDecimals = Banana.document.info("Base", "DecimalsAmounts");
  var xbrlMeasure = '\n' + xml_createElement("xbrli:measure", "iso4217:"+accountingBasicCurrency) + '\n';
  var xbrlUnit = '\n' + xml_createElement("xbrli:unit", xbrlMeasure, {'id':'BaseCurrency'}) + '\n';
  xbrlContent += xbrlUnit;
 
  for (var role in param.taxonomy)
  {
    for (var object in param.taxonomy[role])
    {
      if (typeof param.taxonomy[role][object] === 'string')
        continue;
      var print = false;
      for (var i in contextList)
      {
        var contextname = contextList[i]['name'];
        if (param.taxonomy[role][object][contextname] != 0)
          print = true;
      }
      if (print == false)
        continue;

      for (var i in contextList)
      {
		var contextname = contextList[i]['name'];
	    if (param.taxonomy[role][object][contextname] != 0)
		{
		  var periodtype = param.taxonomy[role][object]['periodtype'];
		  if (periodtype.length>=1)
		    periodtype = periodtype.substr(0,1);
		  var contextref = periodtype + '-' + contextname;  
		  var attrs = {'contextRef':contextref,'unitRef':'BaseCurrency','decimals':accountingDecimals};
		  xbrlContent += xml_createElement(param.taxonomy[role][object]['qname'], Banana.SDecimal.round(param.taxonomy[role][object][contextname], {'decimals':2}), attrs) + '\n';
		}
      }
    }
  }
  var results = [];
  results.push("<?xml version='1.0' encoding='UTF-8'?>");
  
  var attrsNamespaces = {};
  for (var j in param.namespaces)
  {
    var prefix = param.namespaces[j]['prefix'];
	var namespace = param.namespaces[j]['namespace'];
	if (prefix.length > 0)
      attrsNamespaces[prefix] = namespace;
  }

  results.push(xml_createElement("xbrli:xbrl", xbrlContent, attrsNamespaces));
  return results.join ('\n');
   
}

