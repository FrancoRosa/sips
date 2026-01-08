const { SerialPort, ReadlineParser } = require("serialport");
const { serial, sips_id } = require("./settings.json");
const { inspectPayload } = require("./js/helpers");
const { now } = require("./js/time");

const port = new SerialPort(serial);

console.log(`${colors.yellow}... ${now()}`);
console.log("... starting process");
console.log("... id: " + sips_id);
console.log("... serial: " + Object.values(serial).join(" "));

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

let count = 0;
let payload = "";

setInterval(() => {
  count++;
  if (count > 5 && payload.length > 1) {
    console.log(`${colors.magenta}... ${now()}`);

    console.log(colors.magenta, payload);
    inspectPayload(payload, sips_id);

    payload = "";
    count = 0;
  }
}, 1000);

const handleSerial = (data) => {
  count = 0;
  payload = payload + data + "\n";
};

parser.on("data", handleSerial);
