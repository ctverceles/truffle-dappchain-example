const didContract = artifacts.require("DIDContract");

contract("DIDContract", accounts => {
  let didContractInstance;
  const gatewayAddress = "0xe754d9518bf4a9c63476891ef9AA7d91C8236A5D";

  beforeEach(async () => {
    didContractInstance = await didContract.new(gatewayAddress);
  });

  it("Should have an address for DIDContract", async () => {
    assert(didContractInstance.address);
  });

  // it("Should be able to get nonce for address", async () => {
  //   const result = await didContractInstance.getNonce.call(accounts[1], {
  //     from: accounts[1]
  //   });
  //   assert.equal(result[0], 0);
  // });
});
