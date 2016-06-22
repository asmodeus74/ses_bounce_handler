# ses_bounce_handler
Lambda function to handle SES bounce/complaint and save them in DynamoDB table.

# About
This function receives SES bounces or complaints via SNS, and processes the message to the SesSuppressionList DynamoDB Table.
Your code can then check the DDB table before sending emails to ensure that suppressed recipients are not sent to again.

The following information is extracted from the SNS message:
* **SesFailedTarget:** "The email address that bounced or complained."
* **SesMessageTimestamp:** "The timestamp for the email."
* **SesMessageId:** "Message ID from the sent email. This can be compared if you store IDs for messages sent in SES."
* **SesNotificationType:** "Bounce or Complaint. This determines how to retreive the remaining items."
* **SesError:** "The Bounce or Complaint diagnostic code or feedback type."
* **SesNotificationTimestamp:** "The timestamp for when SES received the bounce or complaint."
* **SesNotificationfeedbackID:** "The feedbackID for this bounce or complaint."
* **SnsMessage:** "The entire SNS message. This could be omitted, I left it in for debugging purposes."

# Notes
* A single message can actually contain multiple email addresses, such as when you send an email to both 
complaint@simulator.amazonses.com and bounce@simulator.amazonses.com. This will iterate through the various
recipients and store them all to DynamoDB. 
* There exists more than one type of bounce, from hard bounces (email address does not exist) to soft bounces (recipient 
mailbox full). You may not want to permanently suppress soft bounces but as of right now this script does not discern 
between the types of bounce and adds all to the suppression list.
[Bounce Types](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html#bounce-types)

# Credits
By no means did I come  up with this myself. I simply expanded upon an already excellent idea. The link to the original post is 
below, which also includes step by step instructions for the SNS, SES, DDB, and IAM services that need to be configured.
[https://help.github.com/articles/basic-writing-and-formatting-syntax/](https://help.github.com/articles/basic-writing-and-formatting-syntax/)
