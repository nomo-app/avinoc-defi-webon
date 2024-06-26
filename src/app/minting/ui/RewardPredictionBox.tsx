import { Card } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { getApyValues } from "@/app/minting/logic/staking-rewards";
import { BonusBox } from "./MintingComponents";
import { AvinocDollarRewardLabel } from "./MintingComponents";
import { AvinocRewardLabel } from "./MintingComponents";
import { AvinocYearsLabel } from "./MintingComponents";
import {
  formatAVINOCAmount,
  formatTokenDollarPrice,
} from "@/util/use-avinoc-price";
import { avinoc } from "@/asset-paths";

export const RewardPredictionBox: React.FC<{
  years: bigint;
  avinocAmount: bigint;
  avinocPrice: number | null;
  networkBonus: boolean;
  network: string;
}> = (props) => {
  const { t } = useTranslation();

  function getApy(years: bigint): number {
    if (props.networkBonus) {
      return getApyValues(years).apyWithBonus;
    } else {
      return getApyValues(years).apyWithoutBonus;
    }
  }

  function getRewardAmount(years: bigint): bigint {
    const apy = getApy(years);
    const scaledApy = BigInt(apy * 1e18);

    return (years * props.avinocAmount * scaledApy) / BigInt(1e18);
  }

  const apyLabel = props.networkBonus
    ? "+" + 100 * getApy(props.years) + "%"
    : t("reward.disabled");

  function getRewardLabel(years: bigint): string {
    if (props.avinocAmount === 0n) {
      return t("staking.enterAmount");
    } else {
      const rewards = getRewardAmount(years);
      return formatAVINOCAmount({ tokenAmount: rewards, showStandard: false });
    }
  }

  function getRewardDollarPrice(years: bigint): string {
    if (props.avinocAmount === 0n) {
      return t("staking.enterAmount");
    } else {
      const amount = getRewardAmount(years);
      return `${formatTokenDollarPrice({
        tokenPrice: props.avinocPrice,
        tokenAmount: amount,
      })} `;
    }
  }

  function getYearsName(years: bigint): string {
    if (years === 1n) {
      return years + " " + t("staking.year");
    } else {
      return years + " " + t("staking.years");
    }
  }

  const maxYears = 10n;
  // const isMaxYears: boolean = props.years === maxYears;

  return (
    <Card
      variant={"elevation"}
      elevation={0}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: "10px",
      }}
      sx={{
        backgroundColor: '#323F6B',
      }}
    >
      {/*row 1 network bonus*/}
      <BonusBox apyLabel={apyLabel} networkBonus={props.networkBonus} />

      {/*ro2 your rewards */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          padding: "1rem",
          // minHeight: "1rem",
          color: "white",
          // marginTop: ".25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "start",
            justifyContent: "center",
            rowGap: ".5rem",
          }}
        >
          {/* {isMaxYears ? ( */}
          <div style={{ display: "none" }} />
          {/* ) : ( */}
          <img src={avinoc} alt="AVINOC" style={{ width: "2rem", paddingRight: ".5rem" }} />
          {/* )} */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              rowGap: ".2rem",
              justifyContent: "center",
              fontSize: "medium",
              // paddingTop: ".1rem",
              fontWeight: "bold",
            }}>
            <AvinocRewardLabel label={getRewardLabel(props.years)} />
            <div style={{
              fontSize: "small",
              fontWeight: "bold",
              color: "#D2D2D2",
            }}>
              {props.network}
            </div>
          </div>

          {/* )} */}
          {/* <AvinocRewardLabel label={getRewardLabel(maxYears)} /> */}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            rowGap: ".5rem",
            justifyContent: "left",
            fontSize: "1rem"
          }}
        >
          {/* {isMaxYears ? (
            <div style={{ display: "none" }} />
          ) : ( */}
          <AvinocYearsLabel label={getYearsName(props.years)} />
          {/* )} */}
          {/* <AvinocYearsLabel label={getYearsName(maxYears)} /> */}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            rowGap: "8px",
            flexShrink: "10",
          }}
        >
          {/* {isMaxYears ? ( */}
          <div style={{ display: "none" }} />
          {/* ) : ( */}
          <AvinocDollarRewardLabel
            label={getRewardDollarPrice(props.years)}
          />
          {/* )} */}
          {/* <AvinocDollarRewardLabel label={getRewardDollarPrice(maxYears)} /> */}
        </div>
      </div>
    </Card >
  );
};
