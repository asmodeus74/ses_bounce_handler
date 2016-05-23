var aws = require('aws-sdk');
var ddb = new aws.DynamoDB({params: {TableName: 'SesSuppressionList'}});

exports.handler = function(event, context) {
  var SnsMessage = event.Records[0].Sns.Message;
  var LambdaReceiveTime = new Date().toString();
  var MessageContent = JSON.parse(SnsMessage);
  console.log("MessageContent: "+JSON.stringify(MessageContent, null, 2));      //DEBUG
  var SesNotify = MessageContent.notificationType;
  if (SesNotify == "Bounce") {
    var SesFailedTarget = MessageContent.bounce.bouncedRecipients[0].emailAddress;
    var SesFailedCode = MessageContent.bounce.bouncedRecipients[0].diagnosticCode;
    var SesNotificationTimestamp = MessageContent.bounce.timestamp;
    var SesNotificationfeedbackId = MessageContent.bounce.feedbackId;
  } else if (SesNotify == "Complaint") {
    var SesFailedTarget = MessageContent.complaint.complainedRecipients[0].emailAddress;
    var SesFailedCode = MessageContent.complaint.complaintFeedbackType;
    var SesNotificationTimestamp = MessageContent.complaint.timestamp;
    var SesNotificationfeedbackId = MessageContent.complaint.feedbackId;
  } else {
    context.done(null,'');
  }
  var SesMessageTimestamp = MessageContent.mail.timestamp;
  var SesMessageId = MessageContent.mail.messageId;

  var itemParams = {
    Item: {
      SesFailedTarget: {S: SesFailedTarget},
      SesMessageTimestamp: {S: SesMessageTimestamp},
      SesMessageId: {S: SesMessageId},
      SesNotificationType: {S: SesNotify},
      SesError: {S: SesFailedCode},
      SesNotificationTimestamp: {S: SesNotificationTimestamp},
      SesNotificationfeedbackId: {S: SesNotificationfeedbackId},
      LambdaReceiveTime: {S: LambdaReceiveTime},
      SnsMessage: {S: SnsMessage}
    }
  };

  ddb.putItem(itemParams, function(err, data) {
    if (err) {
        console.log('error','putting item into dynamodb failed: '+err);
    }
    else {
        console.log('great success: '+JSON.stringify(data, null, '  '));
        context.done(null,'');
    }
  });
};
