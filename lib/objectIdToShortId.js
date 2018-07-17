var utils = require('./utils');
var BinaryParser = require('./binary_parser').BinaryParser;

function getTimestamp (id) {
  var timestamp = new Date();
  timestamp.setTime(Math.floor(BinaryParser.decodeInt(id.substring(0,4), 32, true, true)) * 1000);
  return timestamp;
}

function toHexString (id) {
  var hexString = ''
      , number
      , value;

  for (var index = 0, len = id.length; index < len; index++) {
    value = BinaryParser.toByte(id[index]);
    number = value <= 15
      ? '0' + value.toString(16)
      : value.toString(16);
    hexString = hexString + number;
  }

  return hexString;
}

function createFromHexString (hexString) {
  var len = hexString.length;

  var result = ''
    , string
    , number;

  for (var index = 0; index < len; index += 2) {
    string = hexString.substr(index, 2);
    number = parseInt(string, 16);
    result += BinaryParser.fromByte(number);
  }

  return result;
}

function ObjectIdToShortId(id) {
  var str = "";

  id = createFromHexString(String(id));

  // creation date
  var date = getTimestamp(id);

  // time in milliseconds (with precision in seconds)
  var time = date.getTime();

  // hexadecimal counter converted to a decimal
  var counter = parseInt(toHexString(id).slice(-6), 16);

  // only use the last 3 digits of the counter to serve as our "milliseconds"
  counter = parseInt(counter.toString().slice(-3), 10);

  // add counter as our millisecond precision to our time
  time = time + counter;

  // convert to 64 base string (not strict base64)
  str = utils.toBase(time, 64);

  // slice off the first, least variating, character
  // this lowers the entropy, but brings us to 6 characters, which is nice.
  // This will cause a roll-over once every two years, but the counter and the rest of the timestamp should make it unique (enough)
  str = str.slice(1);

  // reverse the string so that the first characters have the most variation
  str = utils.reverse(str);

  return str;
}

module.exports = ObjectIdToShortId;
