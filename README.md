# 🎲 FHE Number Guessing Game

A blockchain-based number guessing game using **FHEVM (Fully Homomorphic Encryption)** for secure, private comparisons.

## 🎯 Game Rules

- **Number Range**: 0-31 (32 possible numbers)
- **First 3 attempts**: FREE 🆓
- **4th attempt onwards**: 0.0001 ETH per guess 💰
- **Correct guess reward**: 0.0001 ETH 🎁
- **Privacy**: All comparisons are encrypted - no one can see the secret number!

## 🔐 How It Works

### The Magic of Encrypted Comparisons

1. **Game Start**: Contract generates encrypted random number (0-31)
2. **Player Guess**: Frontend encrypts the guess using FHEVM
3. **Encrypted Comparison**: Smart contract compares encrypted guess vs encrypted answer
4. **Hints**: Returns encrypted comparison results (equal, too big, too small)
5. **Decryption**: Player decrypts hints to get feedback
6. **Victory**: If correct, player claims reward and can decrypt the actual answer

### Technical Flow

```
User Input → FHE Encryption → Smart Contract → Encrypted Comparison → Encrypted Results → User Decryption → Feedback
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- MetaMask wallet
- Sepolia testnet ETH

### Installation

```bash
# Clone and setup
git clone <repo>
cd game
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia
```

### Environment Setup

```bash
# Infura RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY

# Deployer private key
PRIVATE_KEY=0x...

# Game config (optional)
GUESS_REWARD=100000000000000  # 0.0001 ETH
GUESS_COST=100000000000000    # 0.0001 ETH
FREE_ATTEMPTS=3
```

## 🎮 Game Functions

### Smart Contract Functions

#### Player Functions

```solidity
// Start a new game
function startNewGame() external

// Make an encrypted guess
function makeGuess(externalEuint8 guess, bytes calldata inputProof)
    external payable returns (ebool isCorrect, ebool isTooBig, ebool isTooSmall)

// Claim victory after winning
function claimVictory() external

// Abandon current game
function abandonGame() external

// Get game status
function getGameStatus(address player) external view returns (...)

// Get secret number (only after winning)
function getSecretNumber() external view returns (euint8)
```

#### Owner Functions

```solidity
// Fund contract treasury
function fundTreasury() external payable onlyOwner

// Withdraw excess funds
function withdrawTreasury(uint256 amount) external onlyOwner
```

### Frontend Integration

```typescript
// Start new game
await contract.startNewGame();

// Make encrypted guess
const input = fhevmInstance.createEncryptedInput(contractAddress, userAddress);
input.add8(25); // Guess number 25
const encrypted = await input.encrypt();

const result = await contract.makeGuess(
    encrypted.handles[0],
    encrypted.inputProof,
    { value: guessNumber >= 4 ? "100000000000000" : "0" }
);

// Decrypt comparison results
const isCorrect = await fhevmClient.decrypt({
    handle: result.isCorrect,
    signature: userSignature
});

const isTooBig = await fhevmClient.decrypt({
    handle: result.isTooBig,
    signature: userSignature
});

// Show feedback
if (isCorrect) {
    showWinPopup();
    await contract.claimVictory();
} else if (isTooBig) {
    showHint("Too big! Try a smaller number");
} else {
    showHint("Too small! Try a bigger number");
}
```

## 📊 Game Economics

### Revenue Model

```
Player Payment → Contract Distribution
├── 100% → Treasury (for rewards)
└── Future: Add small fee for contract maintenance
```

### Treasury Management

- **Initial Funding**: 0.01 ETH (100 games worth of rewards)
- **Auto-refill**: Owner can add funds as needed
- **Reward Pool**: Sustainable as long as <100% win rate

### Gas Costs (Estimated)

| Action | Gas Cost | ETH Cost (20 gwei) |
|--------|----------|-------------------|
| Start Game | ~150,000 | ~0.003 ETH |
| Free Guess | ~200,000 | ~0.004 ETH |
| Paid Guess | ~200,000 | ~0.004 ETH |
| Claim Victory | ~100,000 | ~0.002 ETH |

## 🔧 Technical Architecture

### Smart Contract

- **Language**: Solidity ^0.8.24
- **Framework**: Hardhat
- **Encryption**: FHEVM (Zama)
- **Network**: Sepolia Testnet

### Frontend (Coming Soon)

- **Framework**: Next.js + React
- **Web3**: Wagmi + RainbowKit
- **Styling**: TailwindCSS
- **FHE**: FHEVM SDK

### Key Libraries

```json
{
  "@fhevm/solidity": "^0.9.1",
  "@fhevm/hardhat-plugin": "^0.3.0-1",
  "@openzeppelin/contracts": "^5.0.0"
}
```

## 🛡️ Security Features

### Encryption Benefits

- **Secret Number**: Completely encrypted, no one can see it
- **Comparisons**: Performed on encrypted data
- **Player Privacy**: Guess results are encrypted until decrypted by player
- **Fair Play**: No possibility of cheating or manipulation

### Access Controls

- **Owner Functions**: Protected with onlyOwner modifier
- **Game Isolation**: Each player has independent game state
- **Payment Validation**: Proper payment checks for paid attempts

### Known Limitations

- **Gas Costs**: FHE operations are more expensive than regular computations
- **Decryption Required**: Players must sign for decryption (good for privacy)
- **Block Dependency**: Random generation depends on block properties

## 🎯 Future Enhancements

### Gameplay Features

- [ ] **Difficulty Levels**: Different number ranges (0-15, 0-63, 0-127)
- [ ] **Leaderboard**: Track fastest wins and most games played
- [ ] **Tournaments**: Scheduled competitions with bigger prizes
- [ ] **Streak Bonuses**: Extra rewards for consecutive wins

### Technical Improvements

- [ ] **Better Randomness**: Integrate Chainlink VRF
- [ ] **Gas Optimization**: Optimize FHE operations
- [ ] **Mobile Support**: Progressive Web App (PWA)
- [ ] **Multi-chain**: Deploy on other FHEVM-compatible chains

### Social Features

- [ ] **Player Profiles**: Stats, achievements, history
- [ ] **Referral System**: Invite friends for bonus attempts
- [ ] **Chat System**: Encrypted messaging between players
- [ ] **NFT Rewards**: Collectible achievements

## 🐛 Troubleshooting

### Common Issues

**"No active game"**
- Start a new game first with `startNewGame()`

**"Insufficient payment"**
- After 3 free attempts, you need to pay 0.0001 ETH per guess

**"Already claimed victory"**
- You can only claim victory once per game

**Contract deployment fails**
- Check you have enough Sepolia ETH for gas
- Verify your private key and RPC URL

### Testing Tips

1. **Start Small**: Test with free attempts first
2. **Check Balance**: Ensure you have Sepolia ETH
3. **Monitor Events**: Watch contract events for debugging
4. **Reset Games**: Use `abandonGame()` to start fresh

## 📚 Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Framework](https://hardhat.org/)
- [Infura RPC](https://infura.io/)

## 📄 License

MIT License - See LICENSE file for details.

---

**Ready to start guessing? Deploy the contract and let the games begin!** 🎲🎉