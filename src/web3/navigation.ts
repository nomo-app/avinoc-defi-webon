import { NomoEvmNetwork } from "nomo-webon-kit";
import { NavigateFunction } from "react-router-dom";
import { StakingNft } from "./web3-minting";

export function navigateToMintingPage(
  network: NomoEvmNetwork,
  navigate: NavigateFunction
) {
  navigate("/minting?network=" + network);
}

export const navigateToClaimingPage = (navigate: NavigateFunction, stakingNFTs: Record<string, StakingNft>) => {
  const searchParams = getSearchParams();

  navigate("/claiming?" + searchParams.toString(), { state: { stakingNFTs: stakingNFTs } });
}

function getSearchParams() {
  const url = window.location.href;
  const searchParams = new URLSearchParams(url.split("?")[1]);
  return searchParams;
}

export const getNomoEvmNetwork = (): NomoEvmNetwork => {
  const searchParams = getSearchParams();
  const network = searchParams.get("network");
  if (!network) {
    console.error("No network specified in URL, defaulting to ethereum");
    return "zeniq-smart-chain"
  }
  return network as NomoEvmNetwork;
};

export const getNFTID = (): bigint | null => {
  const searchParams = getSearchParams();
  const rawNftId = searchParams.get("nftid");
  if (!rawNftId || rawNftId === "null") {
    return null;
  }
  return BigInt(rawNftId);
};

export function getTokenStandard() {
  const network = getNomoEvmNetwork();
  if (network === "ethereum") {
    return "ERC20";
  } else if (network === "zeniq-smart-chain") {
    return "ZEN20";
  } else {
    throw new Error("Unsupported network " + network);
  }
}

export const handleGoBack = () => {
  window.history.back(); // Navigate back using the browser's history API
};
