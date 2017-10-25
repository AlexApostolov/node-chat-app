var moment = require('moment');

// var date = new Date();
// console.log(date.getMonth());

// Instead use moment to return a unix epic timestamp
var someTimestamp = moment().valueOf();
console.log(someTimestamp);

// Create new moment object for current moment in time
var date = moment();
date.add(1, 'years');
console.log(date.format('MMM Do YYYY'));
console.log(date.format('h:mm a'));
