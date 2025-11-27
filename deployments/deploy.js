const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎲 Deploying Number Guessing Game...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString(), "\n");

  // Deploy NumberGuessingGame contract
  console.log("1. Deploying NumberGuessingGame contract...");
  const NumberGuessingGame = await hre.ethers.getContractFactory("NumberGuessingGame");
  const game = await NumberGuessingGame.deploy();
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("✅ NumberGuessingGame deployed to:", gameAddress, "\n");

  // Fund the treasury for rewards
  const initialFunding = hre.ethers.parseEther("0.01"); // 0.01 ETH (reduced)
  console.log("2. Funding contract treasury...");
  const fundTx = await game.fundTreasury({ value: initialFunding });
  await fundTx.wait();
  console.log("✅ Funded treasury with:", hre.ethers.formatEther(initialFunding), "ETH\n");

  // Verify contract settings
  console.log("3. Verifying contract settings...");
  const guessCost = await game.GUESS_COST();
  const rewardAmount = await game.REWARD_AMOUNT();
  const freeAttempts = await game.FREE_ATTEMPTS();
  const numberRange = await game.NUMBER_RANGE();
  const treasury = await game.getTreasuryBalance();

  console.log("   - Guess Cost:", hre.ethers.formatEther(guessCost), "ETH");
  console.log("   - Reward Amount:", hre.ethers.formatEther(rewardAmount), "ETH");
  console.log("   - Free Attempts:", freeAttempts.toString());
  console.log("   - Number Range: 0 -", (Number(numberRange) - 1).toString());
  console.log("   - Treasury Balance:", hre.ethers.formatEther(treasury), "ETH");
  console.log("✅ Contract verification complete\n");

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      NumberGuessingGame: gameAddress
    },
    config: {
      guessCost: guessCost.toString(),
      rewardAmount: rewardAmount.toString(),
      freeAttempts: freeAttempts.toString(),
      numberRange: numberRange.toString(),
      treasuryBalance: treasury.toString()
    },
    deployedAt: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, "addresses.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📝 Deployment info saved to:", deploymentPath, "\n");

  // Summary
  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", gameAddress);
  console.log("\nGame Rules:");
  console.log("• Number Range: 0-31 (32 possible numbers)");
  console.log("• First 3 guesses: FREE 🆓");
  console.log("• 4th guess onwards: 0.0001 ETH per guess 💰");
  console.log("• Correct guess reward: 0.0001 ETH 🎁");
  console.log("• Encrypted comparisons with hints 🔐");
  console.log("\nGame Flow:");
  console.log("1. Player starts new game");
  console.log("2. Contract generates encrypted random number");
  console.log("3. Player submits encrypted guess");
  console.log("4. Contract returns encrypted comparison results");
  console.log("5. Player decrypts hints (too big/small)");
  console.log("6. If correct, player claims victory and gets reward");
  console.log("\nNext Steps:");
  console.log("1. Update frontend config with contract address");
  console.log("2. Test the game flow");
  console.log("3. Players can start guessing!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });