import { ethers } from "ethers";

export const rpcUrlsEthereumMainnet = [
  "https://eth.llamarpc.com	",
  "https://rpc.ankr.com/eth",
  "https://go.getblock.io/aefd01aa907c4805ba3c00a9e5b48c6b",
  "https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7",
  "https://ethereum-rpc.publicnode.com",
  "wss://ethereum-rpc.publicnode.com",
  "https://1rpc.io/eth",
  "https://rpc.builder0x69.io/",
  "https://rpc.mevblocker.io",
  "https://rpc.flashbots.net/",
  "https://virginia.rpc.blxrbdn.com/",
  "https://uk.rpc.blxrbdn.com/",
  "https://singapore.rpc.blxrbdn.com/",
  "https://eth.rpc.blxrbdn.com/",
  "https://cloudflare-eth.com/",
  "https://eth-mainnet.public.blastapi.io",
  "https://api.securerpc.com/v1",
  "https://eth-pokt.nodies.app",
  "https://eth-mainnet-public.unifra.io",
  "https://ethereum.blockpi.network/v1/rpc/public",
  "https://rpc.payload.de",
  "https://api.zmok.io/mainnet/oaen6dy8ff6hju9k",
  "https://eth.api.onfinality.io/public",
];

export const ethNetwork = new ethers.Network("mainnet", 1n);

export class RotatingRpcProvider extends ethers.AbstractProvider {
  rpcUrls: string[];
  providers: ethers.JsonRpcProvider[];
  network: ethers.Network;

  constructor(rpcUrls: string[], network: ethers.Network) {
    super();
    this.rpcUrls = rpcUrls;
    this.network = network;
    this.providers = rpcUrls.map((url) => {
      const options: ethers.JsonRpcApiProviderOptions & { url: string } = {
        staticNetwork: true,
        url,
      };
      return new ethers.JsonRpcProvider(url, network, options);
    });
  }

  override async _detectNetwork(): Promise<ethers.Network> {
    return this.network;
  }

  override async _perform(req: ethers.PerformActionRequest): Promise<any> {
    const attempts = this.providers.length;
    let lastError = null;

    for (let i = 0; i < attempts; i++) {
      const randomIndex = Math.floor(Math.random() * this.providers.length);
      const selectedProvider = this.providers[randomIndex];
      if (!selectedProvider) {
        continue;
      }

      try {
        // Try performing the request with the selected provider
        return await performWithTimeout(selectedProvider, req);
      } catch (error: any) {
        // Log the error and continue to the next provider
        console.error(
          `Error with ${selectedProvider._getOption("url" as any)}:`,
          error.message
        );
        lastError = error;

        // Remove the failed provider to avoid selecting it again in this cycle
        this.providers.splice(randomIndex, 1);
      }
    }

    // If all providers fail, throw the last encountered error
    throw new Error(`All providers failed. Last error: ${lastError.message}`);
  }
}

async function performWithTimeout(provider: ethers.AbstractProvider, req: ethers.PerformActionRequest, timeout = 3000) {
  const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeout);
  });

  return await Promise.race([
      provider._perform(req),
      timeoutPromise,
  ]);
}
