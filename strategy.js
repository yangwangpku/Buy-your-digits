const fs = require('fs');
const msgpack = require('@msgpack/msgpack');

// Load the MessagePack file
const data = fs.readFileSync('1-1.msgpack');
const strategy = msgpack.decode(data);

console.log("Strategy loaded from strategy.msgpack:", strategy);
