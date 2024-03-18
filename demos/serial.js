const { SerialPort, ReadlineParser } = require("serialport");
const port = new SerialPort({ path: "/dev/pts/4", baudRate: 1200 });

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

let count = 0;
let payload = "";

const processPayload = (payload) => {
  if (payload) {
    if (payload.includes(">print")) {
      console.log("_____ printing _______");
      console.log(payload);
      console.log("_____ ________ _______");
    } else {
      console.log("_____ Append to log & update pdf _______");
      //get date to create file and json file
      console.log(payload);
      console.log("_____ ________ _______");
    }
  }
};

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
