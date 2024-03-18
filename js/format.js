const pdf = require("pdf-creator-node");
const { readFileSync } = require("fs");
var html1 = readFileSync("template1.html", "utf8");
var html2 = readFileSync("template2.html", "utf8");
const sample1 = `
5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****`;

const sample2 = `
>print trans 5015

  -ALLOW WRAP AROUND
  -SAVE UNAUTHZ'D USERS ALSO
  -TRANSACTION BUFFER SIZE: 1625
  -NEXT TRANSACTION NUMBER: 5029
   ** HOLLERITH CARDS ONLY **

    *** PRODUCT TOTALS ***


    *** PUMP TOTALS ***


QUANTITIES FOR PCT 1:
POS 1: 1  POS 2: X  POS 3: X  POS 4: X  POS 5: X  POS 6: X  POS 7: X  POS 8: X 
--------- --------- --------- --------- --------- --------- --------- ---------
    0.000     0.000     0.000     0.000     0.000     0.000     0.000     0.000


TRANSACTIONS: 0     GRAND TOTAL: $0.00
           AVERAGE: $0.00

`;

const records = [];

for (let index = 0; index < 20; index++) {
  records.push(sample1);
}

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

const document1 = {
  html: html1,
  data: {
    records,
  },
  path: "./output1.pdf",
  type: "",
};

const document2 = {
  html: html2,
  data: {
    payload: sample2,
  },
  path: "./output2.pdf",
  type: "",
};

const getPdf = (transactions = false) => {
  pdf
    .create(
      {
        html: transactions ? html1 : html2,
        data: {
          payload: sample2,
        },
        path: transactions ? `${getDateFromTx(payload)}.pdf` : getDate(),
        type: "",
      },
      options
    )
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });
};
