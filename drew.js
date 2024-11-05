
const sheetid = '1MUTlvo1D6GIPn04j45LiMSOWBVGu9WHXEzEbrdJL3-w';

function doPost(e) {
  return doGet(e);
}

// called by http interface
function doGet(e) {
  let apikey = undefined;
  let userid = undefined;
  let coins  = undefined;
  let items  = undefined;

  // for producing JSON output
  let content = ContentService.createTextOutput();
  content.setMimeType(ContentService.MimeType.JSON);

  // ** handle web service inputs ** //

  try { apikey = e.parameters.apikey; } catch(e) { }

  if(apikey !== "0f76f840fb699e61c5440e3e64419250") {
    msg = "Bad request: api error";
    Logger.log(msg);
    let result = { result: "error", message: msg };
    return content.append(JSON.stringify(result));
  }

  try { userid = e.parameters.userid; } catch(e) { }

  if(userid === undefined) {
    let msg = "Bad request: no user";
    Logger.log(msg);
    let result = { result: "error", message: msg };
    return content.append(JSON.stringify(result));
  } else {
    userid = "" + userid;
  }

  // optional inputs
  try { coins = e.parameters.coins; } catch(e) { }
  try { items = e.parameters.items; } catch(e) { }

  // ** handle spreadsheet actions ** //

  // open the sheet
  var sheet = SpreadsheetApp.openById(sheetid).getSheets()[0];

  // get the first column only
  var range = sheet.getRange("A:A");

  // search the first column for a full match on the userid
  var match = range.createTextFinder(userid).matchEntireCell(true).findNext();

  if(match) {
    var r = match.getRow();
    var bank = sheet.getRange(r, 2); // second column of the row containing the userid
    var chest = sheet.getRange(r, 3); // third column stores items

    if(coins !== undefined) {
      bank.setValue(coins);    // set
    } else {
      coins = bank.getValue(); // get
    }

    if(items !== undefined) {
      chest.setValue(items);    // set
    } else {
      items = chest.getValue(); // get
    }

  } else {
    if(coins === undefined) {
      coins = "0";
    }
    sheet.appendRow([userid, coins]);
  }

  let result = { result: "success", coins: coins, items: items };
  Logger.log(JSON.stringify(result));
  return content.append(JSON.stringify(result));
}
