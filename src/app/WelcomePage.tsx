import "@/util/i18n";
import { avinocDeFiLogo } from "@/asset-paths";
import { navigateToMintingPage } from "@/web3/navigation";
import { nomo } from "nomo-webon-kit";
import { useNavigate } from "react-router-dom";
import "./minting/ui/MintingPage.css";
import "./WelcomePage.scss";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();

  const [chain, setChain] = useState('ethereum');



  return (
    <div className="welcome-page-content">
      <div className="welcome-page-header">
        <img src={avinocDeFiLogo} className="avinoc-icon" />
        <h2 style={{ fontFamily: "Helvetica", color: "var(--nomoPrimary)" }}>AVINOC DeFi</h2>
      </div>

      <div className="cardBody">

        <div className="welcome-page-body">
          <div className="card">
            <button className="chainselect-button" onClick={() => {
              // navigateToMintingPage("zeniq-smart-chain", navigate) 
              setChain('zeniq-smart-chain')
            }}>
              <span>ZEN20</span>
              <div className="span-divider"> </div>
              <span>(ZENIQ Smartchain)</span></button>
            <button className="chainselect-button" onClick={() => {
              // navigateToMintingPage("ethereum", navigate) 
              setChain('ethereum')
            }}>
              <span>ERC20</span>
              <div className="span-divider"> </div>
              <span>(Ethereum)</span>
            </button>
          </div>
        </div>
        <div className="unclaimed-rewards-card">
          <h3>Unclaimed Rewards</h3>

          <div className="unclaimed-rewards-amount">
            0.024855 AVINOC ERC 20</div>
          <div className="unclaimed-rewards-amount-currency">$0.4</div>
          <button className="claim-all-button">
            Claim All
          </button>
        </div>
        <button className="stake-button">
          Stake ERC20
        </button>

        <button className="view-staking-button">
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
