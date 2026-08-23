import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import { ethers } from "ethers";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_PATH = path.join(__dirname, "..", "contracts", "MockUSDT.sol");
const INITIAL_SUPPLY = 1_000_000; // 1,000,000 USDT de prueba (6 decimales aplicados en el contrato)

function compile() {
  const source = fs.readFileSync(CONTRACT_PATH, "utf8");
  const input = {
    language: "Solidity",
    sources: { "MockUSDT.sol": { content: source } },
    settings: {
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
      optimizer: { enabled: true, runs: 200 },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  const errors = (output.errors || []).filter((e) => e.severity === "error");
  if (errors.length) {
    for (const e of errors) console.error(e.formattedMessage);
    throw new Error("Solidity compilation failed");
  }

  const contract = output.contracts["MockUSDT.sol"]["MockUSDT"];
  return { abi: contract.abi, bytecode: contract.evm.bytecode.object };
}

async function main() {
  const rpcUrl = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) throw new Error("Falta DEPLOYER_PRIVATE_KEY en contracts/.env");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deploying MockUSDT from:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  if (balance === 0n) {
    throw new Error(`La wallet ${wallet.address} no tiene ETH de testnet. Fondeala en https://faucets.chain.link/sepolia`);
  }

  const { abi, bytecode } = compile();
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(wallet.address, INITIAL_SUPPLY);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("MockUSDT deployed at:", address);
  console.log(`Explorer: https://sepolia.etherscan.io/address/${address}`);

  fs.writeFileSync(
    path.join(__dirname, "..", "deployed.json"),
    JSON.stringify({ address, network: "sepolia", deployer: wallet.address }, null, 2),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
