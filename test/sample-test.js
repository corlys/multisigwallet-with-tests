const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Testing MultiSigWallet", () => {
  let multiSigWallet;
  let testContract;

  it("Should deploy the TestContract contract", async () => {
    const TestContract = await ethers.getContractFactory("TestContract");
    testContract = await TestContract.deploy();
    await testContract.deployed();
    console.log(`Greeter contract deployed to ${testContract.address}`);
    const testContractAddress = testContract.address;
    // eslint-disable-next-line no-unused-expressions
    expect(testContractAddress).to.be.not.null;
  });

  it("Should deploy the MultiSigWallet contract", async () => {
    const [owner1, owner2] = await ethers.getSigners();
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    multiSigWallet = await MultiSigWallet.deploy(
      [owner1.address, owner2.address],
      2
    );
    await multiSigWallet.deployed();
    console.log(
      `MultiSigWallet contract deployed to ${multiSigWallet.address}`
    );
    const getOwnerLength = await multiSigWallet.getOwnerLength();
    console.log(getOwnerLength);
    expect(getOwnerLength).to.equal(2);
  });

  it("It Should submit the transaction", async () => {
    // Get the bytes data from testContract
    // const data = await testContract.getData();

    const ABI = ["function callMe(uint256 j)"];
    const iface = new ethers.utils.Interface(ABI);
    const data = iface.encodeFunctionData("callMe", [122]);
    console.log(data);
    const transaction = await multiSigWallet.submitTransaction(
      testContract.address,
      0,
      data
    );
    await transaction.wait();
    // eslint-disable-next-line no-unused-expressions
    expect(transaction.hash).to.be.not.null;
  });

  it("First owner try to confirm to the transaction", async () => {
    const confirmation = await multiSigWallet.confirmTransaction(0);
    await confirmation.wait();
    // eslint-disable-next-line no-unused-expressions
    expect(confirmation.hash).to.be.not.null;
  });

  it("Second owner try to confirm to the transaction", async () => {
    // eslint-disable-next-line no-unused-vars
    const [_, owner2] = await ethers.getSigners();
    const secondConfirmation = await multiSigWallet
      .connect(owner2)
      .confirmTransaction(0);
    await secondConfirmation.wait();
    // eslint-disable-next-line no-unused-expressions
    expect(secondConfirmation.hash).to.be.not.null;
  });

  it("Execute Transaciton", async () => {
    let getIValue = await testContract.i();
    const iBefore = getIValue.toNumber();

    console.log(`i value before is ${iBefore}`);

    const executeTransaction = await multiSigWallet.executeTransaction(0);
    await executeTransaction.wait();

    getIValue = await testContract.i();
    const iAfter = getIValue.toNumber();

    console.log(`i value after is ${iAfter}`);

    // eslint-disable-next-line no-unused-expressions
    expect(iAfter).to.be.greaterThan(iBefore);
  });
});
