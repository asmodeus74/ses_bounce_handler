console.log("Start test:\r\n");
var getEmails = require('get-emails');
var text = '<orma@statoilhydro.com> "BounceSimulator" <bounce@simulator.amazonses.com> "BounceSimulator" <bounce@simulator.amazonses.com> kjeppeson@bis.tepsco.com one+two@gmail.com';

var results = getEmails(text);

for(var i=0, len=results.length; i<len; i++) {
  results[i]=stripThans(results[i]);
}
//results.forEach(stripThans);

function stripThans(item) {
  if(item.indexOf('<')==0 && item.indexOf('>')==item.length-1) {
    item=item.substring(1,item.length-1);
  }
  return item;
}

console.log(results);
