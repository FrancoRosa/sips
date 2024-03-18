const { colors } = require("./colors");

const processPayload = (payload) => {
  if (payload) {
    if (payload.includes(">print")) {
      console.log(colors.red, "_____ printing _______");
      console.log(colors.red, payload);
      //generate temp pdf
      console.log(colors.red, getFileName());

      //move file to usb (date time printed)
      //print pdf
      console.log(colors.red, "_____ ________ _______");
    } else {
      console.log(colors.cyan, "_____ Append to log & update pdf _______");

      console.log(colors.cyan, payload);
      console.log(colors.red, getDateFromTx(payload));

      console.log(colors.cyan, "_____ ________ _______");
    }
  }
};

const getFileName = () => {
  const date = new Date().toLocaleDateString("sv");
  const time = new Date().toLocaleTimeString("sv");
  return `${date.split("-").join("")}_${time.split(":").join("")}.pdf`;
};

const getDateFromTx = (payload) => {
  const lines = payload.split("\n");
  console.log({ lines });
  let name;
  lines.forEach((line) => {
    const info = line.replace(/ +/g, " ").split(" ");
    console.log({ info });
    if (info.length == 9) {
      name = `${info[1]}.pdf`;
      return;
    }
  });
  return name;
};

exports.processPayload = processPayload;
