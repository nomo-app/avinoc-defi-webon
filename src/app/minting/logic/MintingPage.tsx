import "@/util/i18n"; // needed to initialize i18next
import React, { useEffect } from "react";
import "@/common/colors.css";
import { SelectChangeEvent } from "@mui/material/Select";
import { CongratDialogSlide } from "@/app/minting/ui/CongratDialog";
import { ConfirmDialogSlide } from "@/app/minting/ui/ConfirmDialog";
import { StakeError, submitStakeTransaction, useAvinocBalance, useSafirAvinocSig } from "@/web3/web3-minting";
import { RewardPredictionBox } from "@/app/minting/ui/RewardPredictionBox";
import { StatusBox } from "@/app/minting/ui/MintingComponents";
import { StakeButton } from "@/app/minting/ui/MintingComponents";
import { SwitchToRewardPageButton } from "@/app/minting/ui/MintingComponents";
import { StakingTitleBar } from "@/app/minting/ui/MintingComponents";
import { AvinocAmountInput } from "@/app/minting/ui/MintingComponents";
import { SelectYears } from "@/app/minting/ui/MintingComponents";
import { formatAVINOCAmount, useAvinocPrice } from "@/util/use-avinoc-price";
import { useEvmAddress } from "@/web3/web3-common";
import ErrorDetails from "@/common/ErrorDetails";
import { useTranslation } from "react-i18next";
import "./MintingPage.scss";
import { getTokenStandard } from "@/web3/navigation";

export type PageState = "IDLE" | "PENDING_SUBMIT_TX" | "ERROR_FETCH_FAILED" | StakeError;

function isPendingState(pageState: PageState) {
  return pageState.startsWith("PENDING");
}

const MintingPage: React.FC = () => {

  const { avinocPrice } = useAvinocPrice();
  const { evmAddress: ethAddress } = useEvmAddress();
  const { avinocBalance, fetchError: balanceFetchError } = useAvinocBalance({
    ethAddress,
  });
  const { safirSig } = useSafirAvinocSig();
  const [avinocAmount, setAvinocAmount] = React.useState<bigint>(-1n);
  const [years, setYears] = React.useState<bigint>(10n);
  const [pageState, setPageState] = React.useState<PageState>("IDLE");
  const [txError, setTxError] = React.useState<Error | null>(null);
  const networkBonus = !!safirSig;


  console.log("url", window.location.href);
  const { t } = useTranslation();
  useEffect(() => {
    if (balanceFetchError) {
      setPageState("ERROR_FETCH_FAILED");
      setTxError(balanceFetchError);
    }
  }, [balanceFetchError]);

  useEffect(() => {
    if (avinocBalance) {
      const roundedAvinocBalance = avinocBalance - (avinocBalance % 10n ** 18n);
      setAvinocAmount(roundedAvinocBalance);
    }
  }, [avinocBalance]);

  const handleYearChange = (event: SelectChangeEvent) => {
    const yearString: string = event.target.value as string;
    const yearNumber: bigint = BigInt(parseInt(yearString));
    setYears(yearNumber);
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);

  function onClickStakeButton() {
    if (avinocAmount <= 0n) {
      setPageState("ERROR_INSUFFICIENT_AVINOC");
      return;
    }
    setConfirmDialogOpen(true);
  }

  const tokenStandard = getTokenStandard();
  console.log("tokenStandard", tokenStandard);

  const availableText = avinocBalance !== null && avinocBalance !== undefined
    ? `${formatAVINOCAmount({
      tokenAmount: avinocBalance,
    })} ${t("staking.available")}`
    : t("staking.loadBalance");

  function submitStaking() {

    setConfirmDialogOpen(false);
    if (!ethAddress) {
      setPageState("ERROR_CANNOT_PAY_FEE");
      return;
    }

    setPageState("PENDING_SUBMIT_TX");
    submitStakeTransaction({ avinocAmount, years, safirSig, ethAddress })
      .then((stakeError) => {
        if (stakeError) {
          setPageState(stakeError);
        } else {
          setPageState("IDLE");
          setSuccessDialogOpen(true);
        }
      })
      .catch((e) => {
        setPageState("ERROR_TX_FAILED");
        setTxError(e);
        console.error(e);
      });
  }

  return (
    <div className="minting-page-content">
      <div className="staking-title-bar">
        <StakingTitleBar />
      </div>

      <div className="minting-status-box">
        <StatusBox pageState={pageState} />
      </div>
      {!!txError && (
        <div className="minting-error-details">
          <ErrorDetails error={txError} />
        </div>
      )}
      <div className="minting-card">
        <div className="minting-input">
          <h3>{t("staking.amountStaking")}</h3>
          <AvinocAmountInput value={avinocAmount} maxValue={avinocBalance} onChange={(value) => setAvinocAmount(value)} />
          <div className="available-amount">
            {availableText}
          </div>
          <h3>{t("reward.stakingPeriod")}</h3>
        </div>
        <div className="select-years">
          <button className={`${years === 1n ? 'selected' : ''}`} onClick={
            () => {
              setYears(1n);
            }
          }>
            1 yr
          </button>
          <button className={`${years === 3n ? 'selected' : ''}`} onClick={
            () => {
              setYears(3n);
            }
          }>
            3 yr
          </button>
          <button className={`${years === 5n ? 'selected' : ''}`} onClick={
            () => {
              setYears(5n);
            }
          }>
            5 yr
          </button>
          <button className={`${years === 10n ? 'selected' : ''}`} onClick={
            () => {
              setYears(10n);
            }
          }>
            10 yr
          </button>
        </div>

        <div className="minting-reward-prediction-box">
          <RewardPredictionBox
            years={years}
            avinocAmount={avinocAmount}
            avinocPrice={avinocPrice}
            networkBonus={networkBonus}
            network={tokenStandard}
          />
        </div>

        <div className="minting-footer">
          <StakeButton disabled={isPendingState(pageState) || avinocAmount <= 0n || avinocBalance == 0n} onClick={onClickStakeButton} />
          {/* <SwitchToRewardPageButton disabled={isPendingState(pageState)} /> */}
        </div>
      </div>



      <ConfirmDialogSlide
        isOpen={confirmDialogOpen}
        years={years}
        network={tokenStandard}
        selectedAmount={avinocAmount}
        networkBonus={networkBonus}
        handleClose={() => setConfirmDialogOpen(false)}
        handleConfirm={() => submitStaking()}
      />
      <CongratDialogSlide
        isOpen={successDialogOpen}
        handleClose={() => setSuccessDialogOpen(false)}
        translationKey={"staking.DialogSuccess"}
      />
    </div>
  );
};

export default MintingPage;
