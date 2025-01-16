# User Instructions for Avinoc DeFi WebOn

## Features Implemented

### 1. Welcome Page
- **Description**: This is the first page you see when you open the application. It gives you an introduction to the Avinoc DeFi platform and explains what you can do with it.
- **Unclaimed Rewards**: Displays the total amount of unclaimed rewards in AVINOC and its dollar equivalent.
- **Claim All Rewards**: Clicking this button will claim all available rewards for all staking NFTs.
- **Stake AVINOC**: Navigate to the minting page to stake AVINOC tokens and earn rewards.

### 2. Claim Rewards Page
- **Description**: This page allows you to collect the rewards you have earned. You can see the rewards available and claim them easily.
- **Staking NFTs**: Lists all staking NFTs with their details.
- **Unclaimed Rewards**: Shows the unclaimed rewards for each NFT.
- **Claim Rewards**: Click the "Claim" button next to each NFT to claim its rewards.

### 3. Minting Page
- **Description**: This page allows you to create new tokens or NFTs. You can confirm your actions, see congratulatory messages, and estimate the rewards you might earn.
- **Stake AVINOC**: Enter the amount of AVINOC tokens you want to stake.
- **Staking Period**: Select the staking period (1, 3, 5, or 10 years).
- **Predicted Rewards**: Displays the predicted rewards based on the selected staking period.
- **Stake Button**: Click this button to submit the staking transaction.

### 4. Asset Paths
- **Description**: This part of the application manages the paths to all the images and icons used in the app, ensuring they are displayed correctly.

### 5. Common Components
- **Description**: These are reusable parts of the app that appear in multiple places, such as buttons and error messages. They help keep the app consistent and easy to use.

### 6. Contracts
- **Description**: These are the smart contracts that the app interacts with. They define the rules for creating and managing tokens and NFTs.

### 7. Lottie Animations
- **Description**: These are smooth and engaging animations used throughout the app to enhance the user experience. They provide visual feedback and make the app more interactive.

### 8. Utilities
- **Description**: These are helper functions and tools that make the app work smoothly. They handle tasks like translating text for different languages and ensuring data is handled correctly.

### 9. Web3 Integration
- **Description**: This part of the app connects to the blockchain network. It helps the app fetch NFTs, navigate between different parts of the app, and perform other blockchain-related tasks.

## Mathematical Formula for Staking Rewards

The formula for calculating unclaimed rewards is as follows:
\[ \text{unclaimedRewards} = \left( \frac{\text{stakingNft.amount} \times \text{stakingNft.payoutFactor} \times \text{getClaimFraction(stakingNft)}}{10^{18} \times 10^{18}} \right) \]

Where:
- `stakingNft.amount` is the amount of AVINOC tokens staked.
- `stakingNft.payoutFactor` is the payout factor for the staking period.
- `getClaimFraction(stakingNft)` is the fraction of the staking period that has passed since the last claim.

This formula calculates the rewards you can claim based on the amount staked, the payout factor, and the time elapsed since the last claim.
