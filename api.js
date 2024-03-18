const { SerialPort, ReadlineParser } = require("serialport");
const { processPayload } = require("./js/helpers");

const port = new SerialPort({ path: "/dev/pts/4", baudRate: 1200 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

let count = 0;
let payload = "";

setInterval(() => {
  count++;
  if (count > 5) {
    processPayload(payload);
    payload = "";
    count = 0;
  }
}, 1000);

const handleSerial = (data) => {
  count = 0;
  payload = payload + data;
};

parser.on("data", handleSerial);
