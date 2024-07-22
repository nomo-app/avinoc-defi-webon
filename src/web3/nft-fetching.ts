import { getStakingContractAddress } from "./web3-minting";
import { ERC721Entity, nomoFetchERC721 } from "ethersjs-nomo-webons";
import { getEthersSigner } from "./web3-common";

export async function fetchStakingTokenIDs(args: {
  ethAddress: string;
}): Promise<Array<bigint>> {
  const nftContractAddress = getStakingContractAddress();
  const stakingNFTs: ERC721Entity[] = await nomoFetchERC721({
    provider: getEthersSigner().provider!,
    evmAddress: args.ethAddress,
    nftContractAddress,
  });
  console.log("stakingNFTs", stakingNFTs);

  const tokenIDs = stakingNFTs.map((nft: ERC721Entity) => BigInt(nft.tokenID));
  console.log("tokenIDs", tokenIDs);
  return tokenIDs;
}
