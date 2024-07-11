import "@/util/i18n"; // needed to initialize i18next
import React, { useEffect } from "react";
import "@/common/colors.css";
import { useAvinocPrice } from "../../../util/use-avinoc-price";
import { useTranslation } from "react-i18next";
import { Alert, CircularProgress } from "@mui/material";
import { CongratDialogSlide } from "@/app/minting/ui/CongratDialog";
import {
  fetchStakingNft,
  StakingNft,
  submitClaimTransaction,
} from "@/web3/web3-minting";
import { UnreachableCaseError } from "../../../util/typesafe";
import { useEvmAddress } from "@/web3/web3-common";
import {
  ClaimAllButton,
  StakingNftBox,
  // TitleBox,
} from "../ui/ClaimRewardsComponents";
import { centeredTitleContainer, claimRewardTitle, claimRewardsMainFlexBox } from "../ui/claim-style";
import { fetchStakingTokenIDs } from "@/web3/nft-fetching";
import ErrorDetails from "@/common/ErrorDetails";
import { getNFTID, getNomoEvmNetwork } from "@/web3/navigation";
import BackButton from "@/common/BackButton";

export type PageState =
  | "PENDING_TOKENID_FETCH"
  | "PENDING_DETAILS_FETCH"
  | "PENDING_SUBMIT_TX"
  | "IDLE"
  | "ERROR_NO_NFTS_CLAIM"
  | "ERROR_CANNOT_PAY_FEE"
  | "ERROR_TX_FAILED"
  | "ERROR_FETCH_FAILED";

export function isPendingState(pageState: PageState) {
  return pageState.startsWith("PENDING");
}

export function isErrorState(pageState: PageState) {
  return pageState.startsWith("ERROR");
}

const ClaimRewardsPage: React.FC = () => {
  const { evmAddress } = useEvmAddress();
  const { avinocPrice } = useAvinocPrice();
  const [pageState, setPageState] = React.useState<PageState>(
    "PENDING_TOKENID_FETCH"
  );
  const [tokenIDs, setTokenIDs] = React.useState<Array<bigint>>([]);
  const [fetchError, setFetchError] = React.useState<Error | null>(null);
  const [stakingNFTs, setStakingNFTs] = React.useState<
    Record<string, StakingNft>
  >({});
  const [congratDialogOpen, setCongratDialogOpen] = React.useState(false);

  useEffect(() => {
    if (evmAddress) {
      fetchStakingTokenIDs({ ethAddress: evmAddress })
        .then((tokenIDs: any) => {
          if (tokenIDs.length) {
            setPageState("PENDING_DETAILS_FETCH");
          } else {
            setPageState("ERROR_NO_NFTS_CLAIM");
          }
          tokenIDs.sort((a: bigint, b: bigint) => Number(a - b));
          setTokenIDs(tokenIDs);
        })
        .catch((e) => {
          console.error(e);
          setFetchError(e);
          setPageState("ERROR_FETCH_FAILED");
        });
    }
  }, [evmAddress]);

  useEffect(() => {
    tokenIDs.forEach((tokenId) => {
      fetchStakingNft({ tokenId })
        .then((stakingNft: any) => {
          setStakingNFTs((prevStakingNFTs) => {
            return {
              ...prevStakingNFTs,
              ["" + tokenId]: stakingNft,
            };
          });
          setPageState("IDLE");
        })
        .catch((e: any) => {
          setPageState("ERROR_FETCH_FAILED");
          console.error(e);
        });
    });
  }, [tokenIDs]);

  function refreshOnChainData() {
    console.log("Refreshing on-chain data...");
    setTokenIDs([...tokenIDs]);
  }

  function doClaim(args: { tokenIDs: Array<bigint> }) {
    if (!evmAddress) {
      setPageState("ERROR_CANNOT_PAY_FEE");
      return;
    }
    setPageState("PENDING_SUBMIT_TX");
    submitClaimTransaction({ tokenIDs: args.tokenIDs, ethAddress: evmAddress })
      .then((error: any) => {
        if (error) {
          setPageState(error);
        } else {
          setPageState("IDLE");
          setCongratDialogOpen(true);
        }
      })
      .catch((e) => {
        setPageState("ERROR_TX_FAILED");
        console.error(e);
      });
  }

  function onClickClaim(stakingNft: StakingNft) {
    doClaim({ tokenIDs: [stakingNft.tokenId] });
  }

  function onClickClaimAll() {
    const allNFTs: StakingNft[] = Object.values(stakingNFTs);
    const claimableNFTs = allNFTs.filter(
      (nft) => nft.lastClaim.getTime() < nft.end.getTime()
    );
    const tokenIDs: bigint[] = claimableNFTs.map((nft) => nft.tokenId);
    doClaim({ tokenIDs });
  }

  const nftID = getNFTID();
  const selectedNFT = nftID ? stakingNFTs[Number(nftID)] : undefined;
  console.log("selectedNFT", selectedNFT);
  const { t } = useTranslation();
  return (
    <div style={claimRewardsMainFlexBox}>
      {/* <div style={{ flexGrow: "10" }} /> */}
      {/* <TitleBox showBackButton={!selectedNFT} /> */}
      <div style={claimRewardTitle}>
        <BackButton />
        <div style={centeredTitleContainer}>
          <span>Staking NFTs</span>
        </div>
      </div>

      {pageState === "IDLE" ? (
        <div />
      ) : (
        // <ClaimedRewards stakingNFTs={stakingNFTs} />
        <StatusBox pageState={pageState} />
      )}
      {!!fetchError && <ErrorDetails error={fetchError} />}

      {selectedNFT ? (
        <StakingNftBox
          key={selectedNFT.tokenId}
          avinocPrice={avinocPrice}
          stakingNft={selectedNFT}
          pageState={pageState as any}
          onClickClaim={onClickClaim}
        />
      ) : (
        <div className={"scroll-container"}>
          {Object.values(stakingNFTs).map((stakingNft) => {
            return (
              <StakingNftBox
                key={stakingNft.tokenId}
                avinocPrice={avinocPrice}
                stakingNft={stakingNft}
                pageState={pageState as any}
                onClickClaim={onClickClaim}
              />
            );
          })}
          {/* {Object.values(stakingNFTs).length >= 1 ? (
            <ClaimAllButton
              disabled={isPendingState(pageState)}
              onClick={onClickClaimAll}
            />
          ) : (
            <div />
          )} */}
        </div>
      )}

      <CongratDialogSlide
        isOpen={congratDialogOpen}
        handleClose={() => {
          setCongratDialogOpen(false);
          refreshOnChainData();
        }}
        translationKey={"reward.DialogSuccess"}
      />
      <div style={{ flexGrow: "50" }} />
    </div>
  );
};

export const StatusBox: React.FC<{ pageState: PageState }> = (props) => {
  const { t } = useTranslation();
  function getStatusMessage() {
    switch (props.pageState) {
      case "ERROR_FETCH_FAILED":
      case "ERROR_TX_FAILED":
      case "ERROR_NO_NFTS_CLAIM":
      case "PENDING_DETAILS_FETCH":
      case "PENDING_TOKENID_FETCH":
      case "PENDING_SUBMIT_TX":
        return t("status." + props.pageState);
      case "IDLE":
        return ""; // should never happen
      case "ERROR_CANNOT_PAY_FEE":
        return getNomoEvmNetwork() === "ethereum"
          ? t("status.ERROR_INSUFFICIENT_ETH")
          : t("status.ERROR_INSUFFICIENT_ZENIQ");
      default:
        throw new UnreachableCaseError(props.pageState);
    }
  }
  if (isErrorState(props.pageState)) {
    console.log("getStatusMessage", getStatusMessage());
    return (
      <div style={{}}>
        <Alert severity={"error"}>{getStatusMessage()}</Alert>
      </div>
    );
  } else {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginBottom: "5px",
        }}
      >

        <CircularProgress />
        <div
          style={{
            fontWeight: "bold",
            marginLeft: "5px",
            display: "flex",
            alignItems: "center",
            color: "white"
          }}
        >
          {getStatusMessage()}
        </div>
      </div>
    );
  }
};

export default ClaimRewardsPage;
