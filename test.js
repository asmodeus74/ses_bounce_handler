console.log("Start test:\r\n");
var getEmails = require('get-emails');
var emails = ["<orma@statoilhydro.com>", "'BounceSimulator' <bounce@simulator.amazonses.com>", "'BounceSimulator' <bounce@simulator.amazonses.com>", "kjeppeson@bis.tepsco.com", "one+two@gmail.com"];

for(var i=0, len=emails.length; i<len; i++) {
  email=stripThans(getEmails(emails[i])[0]);
  console.log("Email: "+email);
}
//results.forEach(stripThans);

function stripThans(item) {
  console.log("item: "+item);
  if(item.indexOf('<')==0 && item.indexOf('>')==item.length-1) {
    item=item.substring(1,item.length-1);
  }
  return item;
}

/*
var itemParams = {
  Item: {
    SesFailedTarget: {S: SesFailedTarget},
    SesMessageTimestamp: {S: SesMessageTimestamp},
    SesMessageId: {S: SesMessageId},
    SesNotificationType: {S: SesNotify},
    SesError: {S: SesFailedCode},
    SesNotificationTimestamp: {S: SesNotificationTimestamp},
    SesNotificationfeedbackId: {S: SesNotificationfeedbackId},
    SnsMessage: {S: SnsMessage}
  }
};
*/
