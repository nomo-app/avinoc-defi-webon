import "@/util/i18n";
import { avinocDeFiLogo, ethLogo, zeniqLogo } from "@/asset-paths";
import { navigateToClaimingPage, navigateToMintingPage } from "@/web3/navigation";
import { nomo } from "nomo-webon-kit";
import { useLocation, useNavigate } from "react-router-dom";
import "./minting/ui/MintingPage.css";
import "./WelcomePage.scss";
import { useEffect, useState } from "react";
import { useEvmAddress } from "@/web3/web3-common";
import { fetchStakingTokenIDs } from "@/web3/nft-fetching";
import ErrorDetails from "@/common/ErrorDetails";
import { StakingNft, computeUnclaimedRewards, fetchStakingNft, submitClaimTransaction } from "@/web3/web3-minting";
import { CongratDialogSlide } from "./minting/ui/CongratDialog";
import { formatAVINOCAmount, formatTokenDollarPrice, useAvinocPrice } from "@/util/use-avinoc-price";
import { useTranslation } from "react-i18next";

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

  console.error("pageState", pageState);
  return pageState.startsWith("ERROR");
}


export default function Home() {
  const navigate = useNavigate();
  const { evmAddress } = useEvmAddress();
  const [chain, setChain] = useState('ethereum');
  const location = useLocation();
  const [pageState, setPageState] = useState<PageState>(
    "PENDING_TOKENID_FETCH"
  );
  const { t } = useTranslation();
  const avinocPrice = useAvinocPrice();
  const [tokenIDs, setTokenIDs] = useState<Array<bigint>>([]);
  const [fetchError, setFetchError] = useState<Error | null>(null);
  const [stakingNFTs, setStakingNFTs] = useState<
    Record<string, StakingNft>
  >({});
  const [congratDialogOpen, setCongratDialogOpen] = useState(false);

  const updateUrlWithChain = (currentChain: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("network", currentChain);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const [totalUnclaimedRewards, setTotalUnclaimedRewards] = useState<bigint>(0n);

  useEffect(() => {
    updateUrlWithChain(chain);
  }, [chain]);

  console.log("url", window.location.href);
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
  }, [evmAddress, chain]);

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

  console.log("evmAddress", evmAddress);
  console.log("fetchError", fetchError);

  useEffect(() => {
    const totalRewards = Object.values(stakingNFTs).reduce((total, nft) => {
      return total + computeUnclaimedRewards(nft);
    }, 0n);
    setTotalUnclaimedRewards(totalRewards);
  }, [stakingNFTs]);

  console.log("totalUnclaimedRewards", totalUnclaimedRewards);

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
  return (
    <div className="welcome-page-content">
      <div className="welcome-page-header">
        <img src={avinocDeFiLogo} className="avinoc-icon" />
        <h2 style={{ fontFamily: "Helvetica", color: "var(--nomoPrimary)" }}>AVINOC DeFi</h2>
      </div>

      <div className="cardBody">

        <div className="welcome-page-body">
          <div className="card">
            <button className={`chainselect-button ${chain === 'zeniq-smart-chain' ? 'selected' : ''}`} onClick={() => {
              // navigateToMintingPage("zeniq-smart-chain", navigate) 
              setChain('zeniq-smart-chain')
            }}>
              <img src={zeniqLogo} alt="ZENIQ Logo" className="chainselect-logo" />
              <div className="chainselect-text">
                <span>ZEN20</span>
                <div className="span-divider"> </div>
                <span>(ZENIQ Smartchain)</span>
              </div>
            </button>

            <button className={`chainselect-button-eth ${chain === 'ethereum' ? 'selected' : ''}`}
              onClick={() => {
                // navigateToMintingPage("ethereum", navigate) 
                setChain('ethereum')
              }}>
              <img src={ethLogo} alt="Ethereum Logo" className="chainselect-logo" />
              <div className="chainselect-text-eth">
                <span>ERC20</span>
                <div className="span-divider"> </div>
                <span>(Ethereum)</span>
              </div>
            </button>
          </div>
        </div>
        <div className="unclaimed-rewards-card">
          {!!fetchError && <ErrorDetails error={fetchError} />}
          <h3>   {t("reward.unclaimedRewards")}</h3>
          <div className="unclaimed-rewards-amount">
            {formatAVINOCAmount({ tokenAmount: totalUnclaimedRewards })} {chain === "ethereum" ? "ERC20" : "ZEN20"}</div>
          <div className="unclaimed-rewards-amount-currency">{formatTokenDollarPrice({ tokenAmount: totalUnclaimedRewards, tokenPrice: avinocPrice.avinocPrice })}</div>
          <button className="claim-all-button" onClick={() => {
            onClickClaimAll();
          }}>
            {t("reward.claimAll")}
          </button>
        </div>
        <button className="stake-button" onClick={() => {
          if (chain === 'ethereum') {
            navigateToMintingPage("ethereum", navigate);
          }
          else {
            navigateToMintingPage("zeniq-smart-chain", navigate);
          }
        }}>
          Stake {chain === "ethereum" ? "ERC20" : "ZEN20"}
        </button>
        <button className="view-staking-button" onClick={() => navigateToClaimingPage(navigate)}>
          View Staking NFT's
        </button>
        <div className="welcome-page-footer">
          <button className="migrate-button" onClick={installMigrationWebOn}>
            Perform Migration
            <div className="migration-info">
              Migrate from ERC20 to ZEN20
            </div>
          </button>
          <div className="migrate-button-divider"></div>
          <button className="migrate-button" onClick={openSmartchainFaucet}>
            Smartchain Faucet
            <div className="migration-info">
              Obtain free ZENIQ for paying transaction fees
            </div>
          </button>
        </div>
      </div>
      <CongratDialogSlide
        isOpen={congratDialogOpen}
        handleClose={() => {
          setCongratDialogOpen(false);
        }}
        translationKey={"reward.DialogSuccess"}
      />
    </div>
  );
}

async function installMigrationWebOn() {
  nomo.installWebOn({
    deeplink: "https://nomo.app/webon/avinoc-migration.nomo.app",
    navigateBack: false,
    skipPermissionDialog: true,
  });
}

async function openSmartchainFaucet() {
  nomo.installWebOn({
    deeplink: "https://nomo.app/webon/w.nomo.app/faucet/nomo.tar.gz",
    navigateBack: false,
    skipPermissionDialog: true,
  });
}
