import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import WelcomePage from "./app/WelcomePage";
import MintingPage from "./app/minting/logic/MintingPage";
import "./app/globals.css";
import ClaimRewardsPage from "./app/claiming/logic/ClaimRewardsPage";
import { HashRouter } from "react-router-dom";
import { nomo } from "nomo-webon-kit";

// async function removeDuplicateWebOns() {
//   const { manifests } = await nomo.getInstalledWebOns();
//   const ownManifest: NomoManifest = await nomo.getManifest();
//   const duplicateManifests = manifests.filter(
//     (manifest) =>
//       manifest.webon_id === "com.avinoc.defi" &&
//       manifest.webon_url !== ownManifest.webon_url
//   );
//   for (const manifest of duplicateManifests) {
//     await nomo.uninstallWebOn(manifest);
//     console.log(`Removed duplicate WebOn: ${manifest.webon_url}`);
//   }
// }

const App: React.FC = () => {
  useEffect(() => {
    // removeDuplicateWebOns();
    nomo.fallbackQRCode();
    nomo.registerOnWebOnVisible((_args: { cardMode: boolean }) => {
      nomo.checkForWebOnUpdate();
    });
  }, []);
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/minting" element={<MintingPage />} />
        <Route path="/claiming" element={<ClaimRewardsPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
