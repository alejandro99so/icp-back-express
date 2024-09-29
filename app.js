const express = require("express");
const { Web3 } = require("web3");
const CryptoJS = require("crypto-js");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
const port = 3001;
const TTPChainRpc =
  // "https://humble-potato-v6gwx47w56qxhrqj-9652.app.github.dev/ext/bc/TTPChain/rpc";
  "https://subnets.avacloud.io/d7725473-29c7-4fb3-918d-993d889f5fdc";
const constants = require("./constants.json");

app.get("/new-wallet", async (req, res) => {
  const secretWord = "mi_clave_secreta_123";
  const web3 = new Web3();
  const { address, privateKey } = web3.eth.accounts.create();
  var cipherAddress = CryptoJS.AES.encrypt(address, secretWord).toString();
  var cipherPrivateKey = CryptoJS.AES.encrypt(
    privateKey,
    secretWord
  ).toString();

  res.send({ message: "Wallet Created!", cipherAddress, cipherPrivateKey });
});

app.get("/balance-owner", async (req, res) => {
  const web3 = new Web3(TTPChainRpc);
  const getBalance = await web3.eth.getBalance(constants.adminAddress);
  console.log({ getBalance });
  res.send({ message: "Hello!", balance: getBalance });
});

app.post("/mint", async (req, res) => {
  const data = req.body;
  const { receivers, uri } = data;
  console.log({ data });
  const web3 = new Web3(TTPChainRpc);
  const account = web3.eth.accounts.wallet.add(constants.adminPrivateKey);
  console.log({ receivers, uri });
  const nft = new web3.eth.Contract(
    constants.abiErc721,
    constants.addressErc721
  );
  const trx = await nft.methods.safeMintBatch(receivers, uri).send({
    from: account[0].address,
  });
  console.log({ trx });
  res.send({ message: "Hello!", trx: trx.blockHash });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
