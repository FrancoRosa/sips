const { SerialPort, ReadlineParser } = require("serialport");
const { processPayload } = require("./js/helpers");

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 1200,
  parity: "even",
  dataBits: 7,
});

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
  payload = payload + data + "\n";
  console.log(data);
};

parser.on("data", handleSerial);
