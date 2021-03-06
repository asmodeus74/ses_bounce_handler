var aws = require('aws-sdk');
var ddb = new aws.DynamoDB({params: {TableName: 'SesSuppressionList'}});
var getEmails = require('get-emails');

exports.handler = function(event, context) {
//  console.log("Received Event: "+JSON.stringify(event, null, 2)); //DEBUG
  var MessageContent = JSON.parse(event.Records[0].Sns.Message);
  console.log("MessageContent: "+JSON.stringify(MessageContent, null, 2));      //DEBUG

  // This starts the process. Calls parse function to get data from SNS message with the
  // DynamoDB put function as the callback.
  parseMessageContent(null, MessageContent, putSuppressedItem);

  // parseMessageContent builds the JSON for the DynamoDB put function based on
  // if the event is a Bounce, a Complaint, or both and retreives multiple email addresses.
  function parseMessageContent(err, message, callback) {
    var items = [];
    if (message.notificationType == "Bounce") {
      if(message.bounce.bounceType != "Transient") {  // Transient bounces can be tried again in the future.
        for(var i=0, len=message.bounce.bouncedRecipients.length; i<len; i++ ) {
          items[i] = {
            Item: {
              SesFailedTarget: {S: sanitizeEmail(message.bounce.bouncedRecipients[i].emailAddress)},
              SesMessageTimestamp: {S: message.mail.timestamp},
              SesMessageId: {S: message.mail.messageId},
              SesNotificationType: {S: message.notificationType},
              SesNotificationTimestamp: {S: message.bounce.timestamp},
              SesNotificationfeedbackId: {S: message.bounce.feedbackId},
              SnsMessage: {S: JSON.stringify(message, null, 2)}
            }
          };
          // diagnosticCode is optional, only add SesError to Item if it exists.
          if(message.bounce.bouncedRecipients[i].diagnosticCode) items[i].Item.SesError = {S: message.bounce.bouncedRecipients[i].diagnosticCode};
        }
        callback(items);
      }
    } else if (message.notificationType == "Complaint") {
      for(var i=0, len=message.complaint.complainedRecipients.length; i<len; i++ ) {
        items[i] = {
          Item: {
            SesFailedTarget: {S: sanitizeEmail(message.complaint.complainedRecipients[i].emailAddress)},
            SesMessageTimestamp: {S: message.mail.timestamp},
            SesMessageId: {S: message.mail.messageId},
            SesNotificationType: {S: message.notificationType},
            SesNotificationTimestamp: {S: message.complaint.timestamp},
            SesNotificationfeedbackId: {S: message.complaint.feedbackId},
            SnsMessage: {S: JSON.stringify(message, null, 2)}
          }
        };
        // complaintFeedbackType is optional, only add SesError to Item if it exists.
        if(message.complaint.complaintFeedbackType) items[i].Item.SesError = {S: message.complaint.complaintFeedbackType};
      }
      callback(items);
    } else {
      console.log("Nothing to do: EOL");
      context.done(null,'');
    }
  } //parseMessageContent

  // If email is of the format <auser@domain.com> this will return auser@domain.com
  function stripThans(item, callback) {
    if(item.indexOf('<')==0 && item.indexOf('>')==item.length-1) {
      item=item.substring(1,item.length-1);
    }
    return item;
  } //stripThans

  // If email is of the format ""'Firstname Lastname' <auser@domain.com>" this will return only <auser@domain.com>
  function sanitizeEmail(item, callback) {
    item=stripThans(getEmails(item)[0]);  //getEmails returns array, but we're only feeding single recipients
    return item;
  } //sanitizeEmails

  //Receives an array of items from parseMessageContent and puts them in SesSuppressionList table.
  function putSuppressedItem(items, callback) {
    for(var j=0, lenj=items.length; j<lenj; j++) {
//      console.log("items["+j+"]: "+JSON.stringify(items[j], null, 2));  //DEBUG
      ddb.putItem(items[j], function(err,data) {
        if (err) {
          console.log('error','putting item in dynamodb failed: '+err);
          context.done(null,'');
        } else {
          console.log('great success: '+JSON.stringify(data, null, '  '));
          context.done(null,'');
        }
      });
    }
  } //putSuppressedItem

};
