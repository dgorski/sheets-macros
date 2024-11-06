
const sheetid = '1MUTlvo1D6GIPn04j45LiMSOWBVGu9WHXEzEbrdJL3-w';

function doPost(e) {
  return doGet(e);
}

function jsonError(msg) {
  let json = JSON.stringify({ result: "error", message: msg });
  let type = ContentService.MimeType.JSON;

  Logger.log("Error: " + msg);
  return ContentService.createTextOutput(json).setMimeType(type);
}

function jsonResult(res) {
  res["result"] = "success";
  delete res["apikey"];
  let json = JSON.stringify(res);
  let type = ContentService.MimeType.JSON;

  Logger.log("Success: " + json);
  return ContentService.createTextOutput(json).setMimeType(type);
}

// called by http interface
function doGet(request) {

  // ** handle web request ** //

  Logger.log("doGet with params: " + JSON.stringify(request));

  let args = undefined;

  // should not fail, doGet/doPost should get args in every case
  try { args = request.parameter; } catch(ex) { }

  if(args === undefined) {
    return jsonError("Bad request: input error");
  }

  if(args["apikey"] !== "0f76f840fb699e61c5440e3e64419250") {
    return jsonError("Bad request: api error");
  }

  if(args["userid"] === undefined) {
    return jsonError("Bad request: no user specified");
  }


  // ** handle spreadsheet actions ** //

  // open the workbook, get first sheet
  var sheet = SpreadsheetApp.openById(sheetid).getSheets()[0];

  // get a range containing the first column only
  var firstCol = sheet.getRange("A:A");

  // search the first column for a full match on the userid
  var match = firstCol.createTextFinder(args["userid"]).matchEntireCell(true).findNext();


  // ** handle user data ** //

  if(match) { // existing user found

    var row = match.getRow();
    var coins = sheet.getRange(row, 2); // second column of the row containing the userid
    var items = sheet.getRange(row, 3); // third column stores items
    var eula =  sheet.getRange(row, 4); // fourth column stores EULA agreement

    if(args["eula"] !== undefined) {
      eula.setValue(args["eula"]);    // set
    } else {
      args["eula"] = eula.getValue(); // get
    }

    if(args["eula"] !== "Y") {
      return jsonError("Bad request: user has not agreed to EULA");
    }

    if(args["coins"] !== undefined) {
      coins.setValue(args["coins"]);    // set
    } else {
      args["coins"] = coins.getValue(); // get
    }

    if(args["items"] !== undefined) {
      items.setValue(JSON.stringify(args["items"]));    // set
    } else {
      args["items"] = JSON.parse(items.getValue()); // get
    }

  } else { // not found: new user

    if(args["eula"] !== "Y") {
      return jsonError("Bad request: user has not agreed to EULA");
    }

    if(args["coins"] === undefined) {
      args["coins"] = "0";
    }
    if(args["items"] === undefined) {
      args["items"] = "null";
    }

    sheet.appendRow([
      args["userid"], args["coins"], args["items"], args["eula"]
    ]);
  }

  return jsonResult(args);
}
