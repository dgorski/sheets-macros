
// https://docs.google.com/spreadsheets/d/1MUTlvo1D6GIPn04j45LiMSOWBVGu9WHXEzEbrdJL3-w/edit?gid=0#gid=0
const sheetid = '1MUTlvo1D6GIPn04j45LiMSOWBVGu9WHXEzEbrdJL3-w';

// called by http interface
function doGet(e) {

  if(!e || !(typeof e == "object")) {
    let msg = "Bad request: no data";
    let result = { result: "error", message: msg };

    Logger.log(msg);
    return ContentService.createTextOutput(JSON.stringify(result));
  }

  if(!e.hasOwnProperty("parameters") || !(typeof e.parameters == "object")) {
    let msg = "Bad request: no data";
    let result = { result: "error", message: msg };

    Logger.log(msg);
    return ContentService.createTextOutput(JSON.stringify(result));
  }

  if(!e.parameters.hasOwnProperty("userid")) {
    let msg = "Bad request: no user";
    let result = { result: "error", message: msg };

    Logger.log(msg);
    return ContentService.createTextOutput(JSON.stringify(result));
  }

  var userid = e.parameters.userid;

  // if coins are specified - update the account.  Otherwise just fetch
  var coins = undefined;
  if(e.parameters.hasOwnProperty("coins")) {
    coins = e.parameters.coins;
  }

  // open the sheet
  var sheet = SpreadsheetApp.openById(sheetid).getSheets()[0];

  // get the first column only
  var range = sheet.getRange("A:A");

  // search the first column for a full match on the userid
  var match = range.createTextFinder(userid).matchEntireCell(true).findNext();

  if(match) {
    var u = match.getValue()
    var r = match.getRow();

    Logger.log("found user id: " + u + " on row " + r);

    var bank = sheet.getRange(r, 2); // second column of the row containing the userid

    if(coins !== undefined) {
      bank.setValue(coins);
    } else {
      coins = bank.getValue();
    }

    Logger.log("user coins: " + coins);

    let result = { result: "success", coins: coins };
    return ContentService.createTextOutput(JSON.stringify(result));
  } else {
    let msg = "Bad request: no such user";
    Logger.log(msg);

    let result = { result: "error", message: msg };
    return ContentService.createTextOutput(JSON.stringify(result));
  }

}
