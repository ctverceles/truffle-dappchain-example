const DIDERC20 = artifacts.require("./DIDContract.sol");

const gatewayAddress = "0xe754d9518bf4a9c63476891ef9AA7d91C8236A5D";

module.exports = function(deployer, network, accounts) {
  if (network === "rinkeby") {
    return;
  }

  deployer.then(async () => {
    await deployer.deploy(DIDERC20, gatewayAddress);
    const myDIDERC20Instance = await DIDERC20.deployed();

    console.log(
      "\n*************************************************************************\n"
    );
    console.log(`DIDERC20 Contract Address: ${myDIDERC20Instance.address}`);
    console.log(
      "\n*************************************************************************\n"
    );
  });
};
