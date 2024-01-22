import { AbstractProvider, ethers, Signer } from "ethers";
import { EthersjsNomoSigner, zscProvider } from "ethersjs-nomo-webons";
import { nomo } from "nomo-webon-kit";
import { useEffect, useState } from "react";
import { getNomoEvmNetwork } from "./navigation";

export const ethProviderInstance = ethers.getDefaultProvider("mainnet");

export function getEthersProvider(): AbstractProvider {
  const network = getNomoEvmNetwork();
  if (network === "ethereum") {
    return ethProviderInstance;
  } else if (network === "zeniq-smart-chain") {
    return zscProvider;
  } else {
    throw Error("unsupported network " + network);
  }
}

export function getEthersSigner(): Signer {
  const network = getNomoEvmNetwork();
  const publicTestMnemonicHello =
    "hello upon mirror situate cradle execute cute negative sudden city mean square";

  const fallbackMnemonic =
    import.meta.env.VITE_FALLBACK_MNEMONIC ?? publicTestMnemonicHello;
  if (network === "ethereum") {
    const provider = getEthersProvider();
    return new EthersjsNomoSigner(provider, fallbackMnemonic);
  } else if (network === "zeniq-smart-chain") {
    return new EthersjsNomoSigner(zscProvider, fallbackMnemonic);
  } else {
    throw Error("unsupported network " + network);
  }
}

export type Web3Error =
  | "ERROR_INSUFFICIENT_ETH"
  | "ERROR_TX_FAILED"
  | "ERROR_MISSING_WALLET_BACKUP";

export function useEvmAddress(): { evmAddress: string | null } {
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  useEffect(() => {
    const signer = getEthersSigner();
    signer.getAddress().then((res: string) => {
      setEvmAddress(res);
    });
  }, []);
  return { evmAddress };
}

export async function waitForConfirmationOrThrow(txResponse: any) {
  const provider = getEthersProvider();
  console.log("txResponse", txResponse);
  await txResponse.wait(1);
  const txHash = txResponse.hash;
  const txReceipt = await provider.getTransactionReceipt(txHash);
  console.log("txReceipt", txReceipt);
}

export async function fetchEthGasPriceWithTip(
  provider: AbstractProvider
): Promise<bigint> {
  const feeData = await provider.getFeeData();
  const rawGasPrice = feeData.gasPrice;
  if (!rawGasPrice) {
    throw Error("failed to fetch gasPrice");
  }
  // we add a tip of 10% to prevent situations that the ETH-gasPrice raises too fast while a users is reading the "approve transaction dialog"
  const gasPrice = (rawGasPrice * 11n) / 10n;
  return gasPrice;
}

export async function fetchEthereumBalance(args: { ethAddress: string }) {
  const provider = getEthersProvider();
  const ethBalance = await provider.getBalance(args.ethAddress);
  return ethBalance;
}

export async function checkIfGasCanBePaid(args: {
  ethAddress: string;
  gasLimit: bigint;
}): Promise<"ERROR_INSUFFICIENT_ETH" | null> {
  const provider = getEthersProvider();
  const [ethBalance, gasPrice] = await Promise.all([
    fetchEthereumBalance({
      ethAddress: args.ethAddress,
    }),
    fetchEthGasPriceWithTip(provider),
  ]);
  const costEstimation = args.gasLimit * gasPrice;
  console.log("costEstimation", costEstimation);
  if (ethBalance < costEstimation) {
    return "ERROR_INSUFFICIENT_ETH";
  } else {
    return null;
  }
}

export function isValidEthereumAddress(str: string): boolean {
  try {
    ethers.getAddress(str);
    return true;
  } catch (e) {
    return false;
  }
}
