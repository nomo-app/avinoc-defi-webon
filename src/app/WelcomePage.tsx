import "@/util/i18n";
import { avinocIcon } from "@/asset-paths";
import { navigateToMintingPage } from "@/web3/navigation";
import { nomo } from "nomo-webon-kit";
import { useNavigate } from "react-router-dom";
import "./minting/ui/MintingPage.css";
import "./WelcomePage.scss";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page-content">
      <div className="welcome-page-header">
        <img src={avinocIcon} className="avinoc-icon" />
        <h1 style={{fontFamily: "Helvetica", color: "var(--nomoPrimary)"}}>AVINOC DeFi</h1>
      </div>
      <div className="welcome-page-body">
        <div className="card">
          <button className="chainselect-button" onClick={() => {navigateToMintingPage("zeniq-smart-chain", navigate)}}>ZEN20 (ZENIQ Smartchain)</button>
          <button className="chainselect-button" onClick={() => {navigateToMintingPage("ethereum", navigate)}}>ERC20 (Ethereum)</button>
        </div>
      </div>
      <div className="welcome-page-footer">
        <div className="container">
          <button className="migrate-button" onClick={installMigrationWebOn}>Perform Migration</button>
        </div>
        <div className="migration-info">
          Migrate from ERC20 to ZEN20
        </div>
        <div className="container">
          <button className="migrate-button" onClick={openSmartchainFaucet}>Smartchain Faucet</button>
        </div>
        <div className="migration-info">
          Obtain free ZENIQ for paying transaction fees
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
