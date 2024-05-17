const { jsPDF } = require("jspdf");

const { colors } = require("./colors");
const sample1 = `
00001 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00002 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00003 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00004 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00005 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00006 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00007 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00008 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00009 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00010 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00011 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00012 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00013 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00014 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00015 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00016 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00017 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****

00018 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
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

const groupArr = (arr, groupSize = 23) => {
  let results = [];
  for (let i = 0; i < arr.length; i += groupSize) {
    results.push(arr.slice(i, i + groupSize));
  }
  return results;
};

const getPdf = (payload, file, linesPerPage = 36) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter",
  });

  doc.setFont("courier", "normal");

  const drawPageNumber = (count, pages) => {
    doc.setFontSize(12);
    doc.setTextColor(160);
    doc.text(`${count + 1}/${pages.length}`, 264, 206);
  };

  const pages = groupArr(payload.split("\n"), linesPerPage);
  pages.forEach((page, count) => {
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text(page.join("\n"), 10, 10);
    drawPageNumber(count, pages);

    if (count < pages.length - 1) {
      doc.addPage();
    }
  });
  console.log(colors.green, ".... creating pdf");
  doc.save(file);
  console.log(colors.green, ".... successfully created pdf");
};

exports.getPdf = getPdf;
