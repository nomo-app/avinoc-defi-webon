import React from "react";
import { nomo } from "nomo-webon-kit";
import { getNomoEvmNetwork, getTokenStandard } from "@/web3/navigation";
import { avinocContractAddress } from "@/web3/web3-minting";

export function useAvinocPrice() {
  const [avinocPrice, setAvinocPrice] = React.useState<number | null>(null);
  React.useEffect(() => {
    fetchAvinocPrice();
  }, []);

  async function fetchAvinocPrice() {
    try {
      const network = getNomoEvmNetwork();
      const priceState = await nomo.getAssetPrice({
        symbol: "AVINOC",
        contractAddress: avinocContractAddress,
        network,
      });
      setAvinocPrice(priceState.price);
    } catch (e) {
      console.error(e);
    }
  }

  return { avinocPrice };
}

export function formatAVINOCAmount(args: { tokenAmount: bigint }): string {
  const inpreciseTokenAmount = Number(args.tokenAmount) / 1e18;
  const tokenStandard = getTokenStandard();
  const visibleAmount = inpreciseTokenAmount.toFixed(2);
  return visibleAmount + " AVINOC " + tokenStandard;
}

export function formatTokenDollarPrice(args: {
  tokenPrice: number | null;
  tokenAmount: bigint;
}): string {
  if (!args.tokenPrice) {
    return "-";
  }
  const inpreciseTokenAmount = Number(args.tokenAmount) / 1e18;
  const fixedPrice =
    args.tokenAmount >= 10000
      ? (args.tokenPrice * inpreciseTokenAmount).toFixed(0)
      : (args.tokenPrice * inpreciseTokenAmount).toFixed(2);
  return "$" + fixedPrice;
}
