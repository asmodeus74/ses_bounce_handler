var aws = require('aws-sdk');
var ddb = new aws.DynamoDB({params: {TableName: 'SesSuppressionList'}});
var getEmails = require('get-emails');

exports.handler = function(event, context) {
  var SnsMessage = event.Records[0].Sns.Message;
  var LambdaReceiveTime = new Date().toString();
  var MessageContent = JSON.parse(SnsMessage);
  console.log("MessageContent: "+JSON.stringify(MessageContent, null, 2));      //DEBUG
  parseMessageContent(null, MessageContent, putSuppressedItem);


  function parseMessageContent(err, message, callback) {
    console.log("parseMessageContent");   //DEBUG
    var items = [];
    if (message.notificationType == "Bounce") {
      console.log("Bounce");    //DEBUG
      for(var i=0, len=message.bounce.bouncedRecipients.length; i<len; i++ ) {
        items[i] = {
          Item: {
            SesFailedTarget: {S: sanitizeEmail(message.bounce.bouncedRecipients[i].emailAddress)},
            SesMessageTimestamp: {S: message.mail.timestamp},
            SesMessageId: {S: message.mail.messageId},
            SesNotificationType: {S: message.notificationType},
            SesError: {S: message.bounce.bouncedRecipients[i].diagnosticCode},
            SesNotificationTimestamp: {S: message.bounce.timestamp},
            SesNotificationfeedbackId: {S: message.bounce.feedbackId},
            SnsMessage: {S: message}
          }
        };
      }
      callback(items);
    } else if (message.notificationType == "Complaint") {
      console.log("Complaint");   //DEBUG
      for(var i=0, len=message.complaint.complainedRecipients.length; i<len; i++ ) {
        items[i] = {
          Item: {
            SesFailedTarget: {S: sanitizeEmail(message.complaint.complainedRecipients[i].emailAddress)},
            SesMessageTimestamp: {S: message.mail.timestamp},
            SesMessageId: {S: message.mail.messageId},
            SesNotificationType: {S: message.notificationType},
            SesError: {S: message.complaint.complaintFeedbackType},
            SesNotificationTimestamp: {S: message.bounce.timestamp},
            SesNotificationfeedbackId: {S: message.bounce.feedbackId},
            SnsMessage: {S: message}
          }
        };
      }
      callback(items);
    } else {
      console.log("No Bounce, No Complaint");   //DEBUG
      context.done(null,'');
    }
  } //parseMessageContent

  function stripThans(item, callback) {
    console.log("stripThans: "+item);   //DEBUG
    if(item.indexOf('<')==0 && item.indexOf('>')==item.length-1) {
      item=item.substring(1,item.length-1);
    }
    return item;
  } //stripThans

  function sanitizeEmail(item, callback) {
    console.log("sanitizeEmail: "+item);
    item=stripThans(getEmails(item));
    return item;
  } //sanitizeEmails

  function putSuppressedItem(items, callback) {
    for(var j=0, lenj=items.length; j<lenj; j++) {
      ddb.putItem(items[j], function(err,data) {
        if (err) {
          console.log('error','putting item in dynamodb failed: '+err);
        } else {
          console.log('great success: '+JSON.stringify(data, null, '  '));
          context.done(null,'');
        }
      });
    }
  } //putSuppressedItem

};
