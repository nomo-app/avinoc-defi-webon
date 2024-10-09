import "@/util/i18n";
import { avinocDeFiLogo, ethLogo, vooCard, vooIcon, zeniqLogo } from "@/asset-paths";
import { navigateToClaimingPage, navigateToMintingPage } from "@/web3/navigation";
import { nomo } from "nomo-webon-kit";
import { useLocation, useNavigate } from "react-router-dom";
import "./minting/ui/MintingPage.css";
import "./WelcomePage.scss";
import { useEffect, useState } from "react";
import { useEvmAddress } from "@/web3/web3-common";
import { fetchStakingTokenIDs } from "@/web3/nft-fetching";
import { StakingNft, computeUnclaimedRewards, fetchStakingNft, submitClaimTransaction } from "@/web3/web3-minting";
import { CongratDialogSlide } from "./minting/ui/CongratDialog";
import { formatAVINOCAmount, formatTokenDollarPrice, useAvinocPrice } from "@/util/use-avinoc-price";
import { useTranslation } from "react-i18next";
import { isPendingState, PageState, StatusBox } from "./claiming/logic/ClaimRewardsPage";
import { CircularProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function Home() {
  const navigate = useNavigate();
  const { evmAddress } = useEvmAddress();
  const [chain, setChain] = useState('zeniq-smart-chain');
  const location = useLocation();
  const [pageState, setPageState] = useState<PageState>(
    "PENDING_TOKENID_FETCH"
  );
  const { t } = useTranslation();
  const avinocPrice = useAvinocPrice();
  const [tokenIDs, setTokenIDs] = useState<Array<bigint>>([]);
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

  const [hasBanner, setHasBanner] = useState<boolean>(() => {
    const bannerState = localStorage.getItem('hasBanner');
    return bannerState !== null ? JSON.parse(bannerState) : true;
  });

  useEffect(() => {
    localStorage.setItem('hasBanner', JSON.stringify(hasBanner));
  }, [hasBanner]);

  useEffect(() => {
    updateUrlWithChain(chain);
    setTokenIDs([]);
    setStakingNFTs({});
    setTotalUnclaimedRewards(0n);
  }, [chain]);

  console.log("url", window.location.href);
  useEffect(() => {

    if (evmAddress) {
      setPageState("PENDING_TOKENID_FETCH");
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

  useEffect(() => {
    // console.log("Calling totla rewards computation!")

    const totalUnclaimedRewards = Object.values(stakingNFTs).reduce((total, nft) => {
      return computeUnclaimedRewards(nft);
    }, 0n);

    setTotalUnclaimedRewards(totalUnclaimedRewards);
  }, [stakingNFTs, chain]);

  const refreshRewards = () => {
    if (evmAddress) {
      fetchStakingTokenIDs({ ethAddress: evmAddress })
        .then((tokenIDs: any) => {
          tokenIDs.sort((a: bigint, b: bigint) => Number(a - b));
          setTokenIDs(tokenIDs);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  function doClaim(args: { tokenIDs: Array<bigint> }) {
    console.log("tokenIDs that get claimed", tokenIDs);
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
          refreshRewards();
        }
      })
      .catch((e) => {
        setPageState("ERROR_TX_FAILED");
        // console.error(e);
      });
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
        <h2 style={{ fontFamily: "Helvetica", color: "white" }}>AVINOC DeFi</h2>
      </div>
      {
        hasBanner && (<div className="voo-banner">
          <div className="voo-banner-title">
            <h4>
              Check VOO/AVINOCs new WebOn!
            </h4>
            <IconButton className="close-button" onClick={() =>
              setHasBanner(false)
            }>
              <CloseIcon />
            </IconButton>
          </div>
          <div style={{ padding: ".5rem" }}></div>
          <img src={vooCard} alt="voo_card" onClick={() => {
            installVooOne();
            setHasBanner(false);
          }} />
        </div>
        )
      }


      {pageState === "IDLE" ? (
        <div />
      ) : (
        <div style={{ paddingBottom: "1rem" }}>
          <StatusBox pageState={pageState} />
        </div>
      )}
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
              </div>
            </button>

            <button className={`chainselect-button ${chain === 'ethereum' ? 'selected' : ''}`}
              onClick={() => {
                setChain('ethereum')
              }}>
              <img src={ethLogo} alt="Ethereum Logo" className="chainselect-logo" />
              <div className="chainselect-text-eth">
                <span>ERC20</span>
              </div>
            </button>
          </div>
        </div>
        <div className="unclaimed-rewards-card">
          <h3>   {t("reward.unclaimedRewards")}</h3>
          {
            pageState === "IDLE" ?
            <div style={{display: "contents"}}>
              <div className="unclaimed-rewards-amount">
                {formatAVINOCAmount({ tokenAmount: totalUnclaimedRewards, ultraPrecision: true })}</div>
              <div className="unclaimed-rewards-amount-currency">
                {formatTokenDollarPrice({ tokenAmount: totalUnclaimedRewards, tokenPrice: avinocPrice.avinocPrice })}
              </div>
              <button className="claim-all-button" onClick={() => {
                onClickClaimAll();
              }}>
                {t("reward.claimAll")}
              </button>
            </div>
              :
            <div>{isPendingState(pageState) ?
              <CircularProgress /> :
              <div>{t("status." + pageState)}</div>}
            </div>
          }
          
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
          View Staking NFTs
        </button>
        <div className="welcome-page-col">
          <img src={vooIcon} className="voo-icon" onClick={
            () => {
              installVooOne();
            }
          } />
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

async function installVooOne() {
  nomo.installWebOn({
    deeplink: "https://nomo.app/webon/voo.one",
    navigateBack: false,
    skipPermissionDialog: true,
  });
}
