import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

describe("Deal", function () {
  let deal;
  let buyer;
  let seller;
  let other;

  beforeEach(async function () {
    [buyer, seller, other] = await ethers.getSigners();

    const Deal = await ethers.getContractFactory("Deal", buyer);

    deal = await Deal.deploy();
    await deal.waitForDeployment();
  });

  it("debe crear un depósito correctamente", async function () {
    const amount = ethers.parseEther("1");

    await deal
      .connect(buyer)
      .createDeposit(seller.address, { value: amount });

    const deposit = await deal.getDeposit(0);

    expect(deposit.buyer).to.equal(buyer.address);
    expect(deposit.seller).to.equal(seller.address);
    expect(deposit.amount).to.equal(amount);
    expect(deposit.status).to.equal(0);
  });

  it("debe bloquear el depósito", async function () {
    const amount = ethers.parseEther("1");

    await deal
      .connect(buyer)
      .createDeposit(seller.address, { value: amount });

    await deal.connect(buyer).lockDeposit(0);

    const deposit = await deal.getDeposit(0);

    expect(deposit.status).to.equal(1);
  });

  it("no debe permitir que otra cuenta bloquee el depósito", async function () {
    const amount = ethers.parseEther("1");

    await deal
      .connect(buyer)
      .createDeposit(seller.address, { value: amount });

    await expect(
      deal.connect(other).lockDeposit(0)
    ).to.be.revertedWith("Only buyer");
  });

  it("debe permitir un reembolso completo", async function () {
    const amount = ethers.parseEther("1");

    await deal
      .connect(buyer)
      .createDeposit(seller.address, { value: amount });

    await deal.connect(buyer).lockDeposit(0);

    await deal.connect(buyer).refundFull(0);

    const deposit = await deal.getDeposit(0);

    expect(deposit.status).to.equal(3);
  });

  it("debe ejecutar un splitRelease correctamente", async function () {
    const amount = ethers.parseEther("1");
    const repair = ethers.parseEther("0.3");
    const refund = ethers.parseEther("0.7");

    await deal
      .connect(buyer)
      .createDeposit(seller.address, { value: amount });

    await deal.connect(buyer).lockDeposit(0);

    await deal
      .connect(buyer)
      .splitRelease(0, repair, refund);

    const deposit = await deal.getDeposit(0);

    expect(deposit.repairAmount).to.equal(repair);
    expect(deposit.refundAmount).to.equal(refund);
    expect(deposit.status).to.equal(4);
  });

  it("no debe permitir splitRelease con cantidades incorrectas", async function () {
    const amount = ethers.parseEther("1");
    const repair = ethers.parseEther("0.3");
    const refund = ethers.parseEther("0.5");

    await deal
      .connect(buyer)
      .createDeposit(seller.address, { value: amount });

    await deal.connect(buyer).lockDeposit(0);

    await expect(
      deal
        .connect(buyer)
        .splitRelease(0, repair, refund)
    ).to.be.revertedWith("Amounts must equal deposit");
  });
});