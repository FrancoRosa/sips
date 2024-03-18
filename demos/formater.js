const pdf = require("pdf-creator-node");
const { readFileSync } = require("fs");
var html = readFileSync("template.html", "utf8");
const sample = `
5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****`;

const records = [];

for (let index = 0; index < 20; index++) {
  records.push(sample);
}

const date = new Date().toLocaleString("sv");

const options = {
  format: "A4",
  orientation: "landscape",
  border: "8mm",

  footer: {
    height: "5mm",
    contents: {
      default:
        '<p><span style="color: #444;">{{page}}</span>/<span>{{pages}}</span><p>', // fallback value
    },
  },
};

const document = {
  html: html,
  data: {
    date,
    records,
  },
  path: "./output.pdf",
  type: "",
};

pdf
  .create(document, options)
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.error(error);
  });
