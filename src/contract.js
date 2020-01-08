import { Client, LocalAddress, CryptoUtils, LoomProvider } from "loom-js";
import BN from "bn.js";
import Web3 from "web3";
import DIDContract from "./contracts/DIDContract.json";

export default class Contract {
  async loadContract() {
    this.onEvent = null;
    this._createClient();
    this._createCurrentUserAddress();
    this._createWebInstance();
    await this._createContractInstance();
  }

  _createClient() {
    this.privateKey = CryptoUtils.generatePrivateKey();
    this.publicKey = CryptoUtils.publicKeyFromPrivateKey(this.privateKey);
    let writeUrl = "ws://127.0.0.1:46658/websocket";
    let readUrl = "ws://127.0.0.1:46658/queryws";
    let networkId = "default";
    if (process.env.NETWORK == "extdev") {
      writeUrl = "ws://extdev-plasma-us1.dappchains.com:80/websocket";
      readUrl = "ws://extdev-plasma-us1.dappchains.com:80/queryws";
      networkId = "extdev-plasma-us1";
    }

    this.client = new Client(networkId, writeUrl, readUrl);

    this.client.on("error", msg => {
      console.error("Error on connect to client", msg);
      console.warn("Please verify if loom command is running");
    });
  }

  _createCurrentUserAddress() {
    this.currentUserAddress = LocalAddress.fromPublicKey(
      this.publicKey
    ).toString();
  }

  _createWebInstance() {
    this.web3 = new Web3(new LoomProvider(this.client, this.privateKey));
  }

  async _createContractInstance() {
    const networkId = await this._getCurrentNetwork();
    this.currentNetwork = DIDContract.networks[networkId];
    if (!this.currentNetwork) {
      throw Error("Contract not deployed on DAppChain");
    }

    const ABI = DIDContract.abi;
    this.didContractInstance = new this.web3.eth.Contract(
      ABI,
      this.currentNetwork.address,
      {
        from: this.currentUserAddress
      }
    );

    this.didContractInstance.events.NewValueSet(
      { filter: { _value: 10 } },
      (err, event) => {
        if (err) console.error("Error on event", err);
        else {
          if (this.onEvent) {
            this.onEvent(event.returnValues);
          }
        }
      }
    );

    this.didContractInstance.events.NewValueSetAgain(
      { filter: { _value: 47 } },
      (err, event) => {
        if (err) console.error("Error on event", err);
        else {
          setTimeout(() => alert("Loooomy help me :)"));
          if (this.onEvent) {
            this.onEvent(event.returnValues);
          }
        }
      }
    );
  }

  addEventListener(fn) {
    this.onEvent = fn;
  }

  _getCurrentNetwork() {
    if (process.env.NETWORK == "extdev") {
      return "9545242630824";
    } else {
      const web3 = new Web3();
      const chainIdHash = web3.utils
        .soliditySha3(this.client.chainId)
        .slice(2) // Removes 0x
        .slice(0, 13); // Produces safe Number less than 9007199254740991
      const chainId = new BN(chainIdHash).toString();
      return chainId;
    }
  }

  async setValue(value) {
    // Just a small test with Loomy
    if (value == 47) {
      return await this.didContractInstance.methods.setAgain(value).send({
        from: this.currentUserAddress
      });
    }

    return await this.didContractInstance.methods.set(value).send({
      from: this.currentUserAddress
    });
  }

  async getValue() {
    return await this.didContractInstance.methods.get().call({
      from: this.currentUserAddress
    });
  }
}
