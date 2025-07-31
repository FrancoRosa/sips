const { inspectPayload } = require("./js/helpers");

const payload1 = `PROMPTS- 12:****  02:1910  
1721I 28JUL25 11:24p  706970816279376527 SQ:032 PU:10 PD:03 00043.831 MAG-ONLINE
       a: 
       `;
const payload2 = ">print";

const payload3 = `

PROMPTS- 12:****  

     MIDNIGHT TOTALS FOR: JUL 29, 2025
QUANTITIES FOR PCT 1:


POS 1: 1  POS 2: 2  POS 3: 3  POS 4: 4  POS 5: 5  POS 6: 6  POS 7: 9  POS 8: 10
--------- --------- --------- --------- --------- --------- --------- ---------
 1352.800 14173.400     0.000     0.000    78.200   243.630  1530.800   806.770
QUANTITIES FOR PCT 2:


POS 1: 8  POS 2: X  POS 3: X  POS 4: X  POS 5: X  POS 6: X  POS 7: X  POS 8: X 
--------- --------- --------- --------- --------- --------- --------- ---------
    0.000     0.000     0.000     0.000     0.000     0.000     0.000     0.000
QUANTITIES FOR PCT 3:


POS 1: 11 POS 2: 12 POS 3: 13 POS 4: X  POS 5: X  POS 6: X  POS 7: X  POS 8: X 
--------- --------- --------- --------- --------- --------- --------- ---------
    0.000     0.000     0.000     0.000     0.000     0.000     0.000     0.000


    PRODUCT QUANTITIES
         #   NAME         QUANTITY
        ---------------------------
         3   REGULAR UNLEA 2337.570
         4   SEASONAL DIES15769.830
         6   SEASON DIESEL   78.200
`;

// processPayload(payload3);
inspectPayload(payload1 + payload3 + payload1 + payload1 + payload3);

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function processWithDelay(items) {
//   for (const item of items) {
//     console.log("Processing", item);
//     await processPayload(item);
//     await delay(1000); // 1 second delay
//   }
// }

// processWithDelay(updates.split("\n"));
