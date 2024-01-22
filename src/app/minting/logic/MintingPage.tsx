import "@/util/i18n"; // needed to initialize i18next
import React, { useEffect } from "react";
import "@/common/colors.css";
import { SelectChangeEvent } from "@mui/material/Select";
import { Card } from "@mui/material";
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
import { mintingMainFlexBox } from "@/app/minting/ui/minting-style";
import { useAvinocPrice } from "@/util/use-avinoc-price";
import { useEvmAddress } from "@/web3/web3-common";
import ErrorDetails from "@/common/ErrorDetails";
import { useNomoTheme } from "@/util/util";
import "./MintingPage.scss";

export type PageState = "IDLE" | "PENDING_SUBMIT_TX" | "ERROR_FETCH_FAILED" | StakeError;

function isPendingState(pageState: PageState) {
  return pageState.startsWith("PENDING");
}

const MintingPage: React.FC = () => {
  useNomoTheme();

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

  function submitStaking() {
    setConfirmDialogOpen(false);
    if (!ethAddress) {
      setPageState("ERROR_INSUFFICIENT_ETH");
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
        <AvinocAmountInput value={avinocAmount} maxValue={avinocBalance} onChange={(value) => setAvinocAmount(value)} />
        <SelectYears years={years} onChange={handleYearChange} />
      </div>
      <div className="minting-reward-prediction-box">
        <RewardPredictionBox
          years={years}
          avinocAmount={avinocAmount}
          avinocPrice={avinocPrice}
          networkBonus={networkBonus}
        />
      </div>

      <div className="minting-footer">
        <StakeButton disabled={isPendingState(pageState)} onClick={onClickStakeButton} />
        <SwitchToRewardPageButton disabled={isPendingState(pageState)} />
      </div>

      <ConfirmDialogSlide
        isOpen={confirmDialogOpen}
        years={years}
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
