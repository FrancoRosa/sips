const pdf = require("pdf-creator-node");
const { readFileSync } = require("fs");
const { colors } = require("./colors");
const html = readFileSync(__dirname + "/template.html", "utf8");
const sample1 = `
5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

`;

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

const options = {
  format: "A4",
  orientation: "landscape",
  border: "5mm",

  footer: {
    height: "5mm",
    contents: {
      default: "<p>{{page}}/{{pages}}<p>",
    },
  },
};

const getPdf = async (payload) => {
  console.log(colors.green, "... creating pdf");
  let response;
  try {
    response = await pdf.create(
      {
        html,
        data: { payload },
        path: "./output.pdf",
        type: "",
      },
      options
    );
  } catch (error) {
    console.error("... error generating pdf");
    console.error(error);
  }
  if (response) {
    return response.filename;
  }
};

exports.getPdf = getPdf;
