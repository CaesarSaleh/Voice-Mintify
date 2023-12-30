console.clear();
require("dotenv").config();
const { Client, AccountId, PrivateKey} = require("@hashgraph/sdk")
const createFirstNft = require('./mintonly');
const transferNft = require('./txonly');

// Configure accounts and, and generate needed
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
let tokenRecord;
let tokenRecords = [];

(async () => {
  try {
    tokenRecord = await createFirstNft();
    console.log(`Token ID created: ${tokenRecord}`);
    tokenRecords.push(tokenRecord);

    tokenRecord = await createFirstNft();
    console.log(`Token ID created: ${tokenRecord}`);
    tokenRecords.push(tokenRecord);

    while (tokenRecords.length > 0){
    tokenRecord = tokenRecords.pop();
    await transferNft(tokenRecord);
    }
    
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();