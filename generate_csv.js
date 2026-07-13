const fs = require('fs');
let csv = 'transactionRef,amount,type,category,description,transactionDate\n';
for(let i = 0; i < 10000; i++) {
  csv += `REF-${Date.now()}-${i},${(Math.random()*10000).toFixed(2)},${i%2===0?'INCOME':'EXPENSE'},${['Sales','Ops','HR','Tech'][i%4]},Test record ${i},${new Date().toISOString().split('T')[0]}\n`;
}
fs.writeFileSync('test_10k.csv', csv);
console.log('Generated test_10k.csv');
