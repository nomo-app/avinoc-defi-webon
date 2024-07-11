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

export function formatAVINOCAmount(args: {
  tokenAmount: bigint;
  ultraPrecision?: boolean;
  showStandard?: boolean;
  showPrecisionForDay?: boolean;
}): string {

  const inpreciseTokenAmount = Number(args.tokenAmount) / 1e18;
  const tokenStandard = getTokenStandard();

  const showStandard = args.showStandard ?? true;


  if (args.ultraPrecision && inpreciseTokenAmount > 0) {
    let precision: number;
    if (inpreciseTokenAmount < 0.1) {
      precision = 9;
    } else if (inpreciseTokenAmount < 1) {
      precision = 8;
    } else if (inpreciseTokenAmount < 10) {
      precision = 7;
    } else if (inpreciseTokenAmount < 100) {
      precision = 6;
    } else if (inpreciseTokenAmount < 1000) {
      precision = 5;
    } else if (inpreciseTokenAmount < 10000) {
      precision = 4;
    } else if (inpreciseTokenAmount < 100000) {
      precision = 3;
    } else {
      precision = 2;
    }

    return inpreciseTokenAmount.toFixed(precision) + " AVINOC " + tokenStandard;
  }

  if (args.showPrecisionForDay && inpreciseTokenAmount > 0) {

    let precision: number;
    if (inpreciseTokenAmount < 0.1) {
      precision = 5;
    } else if (inpreciseTokenAmount < 1) {
      precision = 5;
    } else if (inpreciseTokenAmount < 10) {
      precision = 4;
    } else if (inpreciseTokenAmount < 100) {
      precision = 4;
    } else if (inpreciseTokenAmount < 1000) {
      precision = 5;
    } else if (inpreciseTokenAmount < 10000) {
      precision = 4;
    } else if (inpreciseTokenAmount < 100000) {
      precision = 3;
    } else {
      precision = 2;
    }

    return inpreciseTokenAmount.toFixed(precision) + " " + tokenStandard + "/Day";
  }

  const visibleAmount = inpreciseTokenAmount.toFixed(2);


  return visibleAmount + (showStandard ? " AVINOC " : "");
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
