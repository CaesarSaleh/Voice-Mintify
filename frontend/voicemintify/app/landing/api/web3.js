'use client'
require("dotenv").config();

const {
  AccountId,
  PrivateKey,
  Client,
  Hbar,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  TokenAssociateTransaction,
} = require("@hashgraph/sdk");

// Configure accounts and client, and generate needed keys

const marshalKey = PrivateKey.fromString(process.env.NEXT_PUBLIC_Treasury_PVKEY);

const operators = [
 [
     '302e020100300506032b6570042204204b7a717128838c016055c65ea5edcdbe60a09dfc5dff1b2e552f34492940baea',
     '0.0.6861612'
 ],
 [
     '3030020100300706052b8104000a042204201e013db345087ee056292c54829d183d6374556384a59ee71c55ec0c68fa888b',
     '0.0.6288966'
 ],
 [
     '3030020100300706052b8104000a04220420bbd2b24627d3fc3adeebcec0448da4b792b1ef5ff069cebfb4c326b9aae1a780',
     '0.0.6290475'
 ],
//  [
//      '3030020100300706052b8104000a04220420d765f656a10df2435e8a7b3bf133503f183287acd45fdedf5344ae88fbee3e63',
//      '0.0.6290878'
//  ], 
//  ['3030020100300706052b8104000a04220420f44dcbadd993eb35a511d077d937f8e1e5268824b740f55b58da7fe2f65f8616',
//  '0.0.6299508'
//  ],
//  ['3030020100300706052b8104000a042204208eb3f1b5a11b4ef0879b46f4ba3be2a1ca1c7af945a80200f192c50b6c071ae3',
//  '0.0.7137764'
//  ],
//  [
//   '3030020100300706052b8104000a04220420171255f57c227cb1795b884b92fa50a22e9e8c2ddba8b0be3160d64b578ed295',
//   '0.0.7137895'
//  ]
];

const supplyKey = PrivateKey.generate();

function generateRandomWord() {
  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let word = '';
 
  for (let i = 0; i < 4; i++) {
     let randomIndex = Math.floor(Math.random() * letters.length);
     word += letters[randomIndex];
  }
 
  return word;
 }


function getRandomOperator() {
  const randomIndex = Math.floor(Math.random() * operators.length);
  return operators[randomIndex];
}


const mintNFT = async (id1, personId, personKey) => {
  const pair = getRandomOperator();
  const operatorKey = pair[0];
  const operatorId = pair[1];
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  const id = AccountId.fromString(personId);
  const key = PrivateKey.fromString(personKey);
    console.log("Minting NFTs... I got called!")
    //Create the NFT
    const symbol = generateRandomWord();
    const nftCreate = await new TokenCreateTransaction()
      .setTokenName(symbol)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)

      .setTreasuryAccountId(id)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(250)
      .setSupplyKey(supplyKey)
      .freezeWith(client);
      
      console.log(1)
    //Sign the transaction with the person key
    const nftCreateTxSign = await nftCreate.sign(key);
    
    console.log(2)
    //Submit the transaction to a Hedera network
    const nftCreateSubmit = await nftCreateTxSign.execute(client);
    console.log(3)

    //Get the transaction receipt
    const nftCreateRx = await nftCreateSubmit.getReceipt(client);
    console.log(4)

    //Get the token ID
    const tokenId = nftCreateRx.tokenId;
    await addToSql(tokenId.toString());
    console.log(5)

    //Log the token ID
    console.log(`- Created NFT with Token ID: ${tokenId} \n`);
    console.log(6)

    
    // Max transaction fee as a constant
    const maxTransactionFee = new Hbar(20);

    console.log(7)
    
    //IPFS content identifiers for which we will create a NFT
    const CID = [
      Buffer.from(id1)
    ];

    console.log(8)
    
    // MINT NEW BATCH OF NFTs
    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata(CID) //Batch minting - UP TO 10 NFTs in single tx
      .setMaxTransactionFee(maxTransactionFee)
      .freezeWith(client);

    console.log(9)
    
    //Sign the transaction with the supply key
    const mintTxSign = await mintTx.sign(supplyKey);

    console.log(10)
    
    //Submit the transaction to a Hedera network
    const mintTxSubmit = await mintTxSign.execute(client);

    console.log(11)
    
    //Get the transaction receipt
    const mintRx = await mintTxSubmit.getReceipt(client);
    
    //Log the serial number
    console.log(
      `- Created NFT ${tokenId} with serial: ${mintRx.serials[0].low} \n`
    );


    console.log(tokenId)
    return tokenId.toString();
}

const sellNFT = async (sellerId, sellerKey, buyerId) => {
  const pair = getRandomOperator();
  const operatorKey = pair[0];
  const operatorId = pair[1];
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  sellerId = AccountId.fromString(sellerId);
  buyerId = AccountId.fromString(buyerId);
  sellerKey = PrivateKey.fromString(sellerKey);
  buyerKey = PrivateKey.fromString(process.env.NEXT_PUBLIC_CAESAR_PVKEY);
  // tokenId = '0.0.7154350';

  token = await getFromSql();
  tokenId = token.tokenId;
  //Create the associate transaction and sign with Caesar's key
  const associateBuyerTx = await new TokenAssociateTransaction()
  .setAccountId(buyerId)
  .setTokenIds([tokenId])
  .freezeWith(client)
  .sign(buyerKey); //process.env.NEXT_PUBLIC_CAESAR_KEY
  
  console.log('after associateCaesarTx!!!')
  
  // Submit the transaction to a Hedera network
  const associateBuyerTxSubmit = await associateBuyerTx.execute(client);
  
  console.log('after associateCaesarTxSubmit!!!')
  
  console.log('in sellNFT!!!')
  //Get the transaction receipt
  const associateBuyerRx = await associateBuyerTxSubmit.getReceipt(client);
  console.log(22)

  // Confirm the transaction was successful
  console.log(
    `- NFT association with Caesar's account: ${associateBuyerRx.status}\n`
  );




  // Check the balance before the transfer for the treasury account
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(sellerId)
    .execute(client);
  console.log(
    `- Treasury balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId} \n {balanceCheckTx.hbars} Hbars`
  );

  // Check the balance before the transfer for Caesar's account
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(buyerId)
    .execute(client);
  console.log(
    `- Caesar's balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId}`
  );


  // Transfer the NFT from treasury to Caesar
  // Sign with the treasury key to authorize the transfer
  const tokenTransferTx = await new TransferTransaction()
    .addNftTransfer(tokenId, 1, sellerId, buyerId)
    .addHbarTransfer(sellerId, 100)
    .addHbarTransfer(buyerId, -100)
    .freezeWith(client)
    .sign(sellerKey);

    console.log('after tokenTransferTx!!!')

    const tokenTransferTxSign = await tokenTransferTx.sign(buyerKey);

    console.log('after tokenTransferTxSign!!!')

  const tokenTransferSubmit = await tokenTransferTxSign.execute(client);

  console.log('after tokenTransferSubmit!!!')
  const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

  console.log(
    `\n- NFT transfer from Treasury to Caesar: ${tokenTransferRx.status} \n`
  );


  // Check the balance of the treasury account after the transfer
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(sellerId)
    .execute(client);
  console.log(
    `- Treasury balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId} \n ${balanceCheckTx.hbars} Hbars`
  );

  // Check the balance of Caesar's account after the transfer
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(buyerId)
    .execute(client);
  console.log(
    `- Caesar's balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId} \n ${balanceCheckTx.hbars} Hbars`
  );
}


getFromSql = async () => {
fetch(`http://127.0.0.1:4000/get_from_sql`)
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    return data.value;
  })
  .catch(error => console.error('Error fetching data:', error));
}

addToSql = async (tokenId) => {
  const data = { tokenId: tokenId };
  fetch('http://127.0.0.1:4000/add_to_sql', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}
// mintNFT("QmbbZaToL2WYK2tKJuqtgTQAuwRpBqMgkh95ynxyd1iqgS", process.env.NEXT_PUBLIC_MARSHAL_ID, process.env.NEXT_PUBLIC_MARSHAL_PVKEY)
// sellNFT(process.env.NEXT_PUBLIC_MARSHAL_ID, process.env.NEXT_PUBLIC_MARSHAL_PVKEY, process.env.NEXT_PUBLIC_CAESAR_ID)

// getFromSql();
// addToSql('0.0.715fjdifkd0');
module.exports = {
  mintNFT,
  sellNFT,
  getRandomOperator
}