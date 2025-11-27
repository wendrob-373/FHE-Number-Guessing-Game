// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, ebool, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title NumberGuessingGame
 * @dev A PvE number guessing game with encrypted comparisons using FHEVM
 * @notice Players guess numbers from 0-31, first 3 attempts are free, then 0.0001 ETH per guess
 */
contract NumberGuessingGame is ZamaEthereumConfig {

    // Game configuration constants
    uint256 public constant GUESS_COST = 0.0001 ether;  // Cost per paid guess
    uint256 public constant REWARD_AMOUNT = 0.0001 ether; // Reward for correct guess
    uint8 public constant FREE_ATTEMPTS = 3;  // Free attempts per game
    uint8 public constant NUMBER_RANGE = 32;  // 0-31 (must be power of 2)

    // Game state for each player
    struct Game {
        euint8 secretNumber;    // Encrypted secret number (0-31)
        uint8 attemptsUsed;     // Number of attempts used
        bool isActive;          // Whether game is active
        bool hasWon;            // Whether player has won current game
    }

    // Player games mapping
    mapping(address => Game) public games;

    // Contract owner and treasury
    address public owner;
    uint256 public treasury;  // Contract balance for rewards

    // Events
    event GameStarted(address indexed player, uint256 timestamp);
    event GuessResult(address indexed player, uint8 attempt, bool isCorrect, uint256 timestamp);
    event GameWon(address indexed player, uint8 attempts, uint256 reward, uint256 timestamp);
    event GameAbandoned(address indexed player, uint8 attempts, uint256 timestamp);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier gameActive() {
        require(games[msg.sender].isActive, "No active game");
        _;
    }

    modifier gameNotActive() {
        require(!games[msg.sender].isActive, "Game already active");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Start a new guessing game
     * @notice Generates a new encrypted random number between 0-31
     */
    function startNewGame() external gameNotActive {
        // Generate encrypted random number (0-31)
        euint8 secretNumber = FHE.randEuint8(NUMBER_RANGE);

        // Initialize new game
        games[msg.sender] = Game({
            secretNumber: secretNumber,
            attemptsUsed: 0,
            isActive: true,
            hasWon: false
        });

        // Allow this contract to access the secret number
        FHE.allowThis(secretNumber);

        emit GameStarted(msg.sender, block.timestamp);
    }

    /**
     * @dev Make a guess with encrypted comparison
     * @param guess The player's guess (0-31)
     * @param inputProof Proof for the encrypted input
     * @return isCorrect Encrypted boolean: true if guess is correct
     * @return isTooBig Encrypted boolean: true if guess > secret
     * @return isTooSmall Encrypted boolean: true if guess < secret
     */
    function makeGuess(
        externalEuint8 guess,
        bytes calldata inputProof
    ) external payable gameActive returns (
        ebool isCorrect,
        ebool isTooBig,
        ebool isTooSmall
    ) {
        Game storage game = games[msg.sender];

        // Check payment requirement (after free attempts)
        if (game.attemptsUsed >= FREE_ATTEMPTS) {
            require(msg.value >= GUESS_COST, "Insufficient payment for guess");
            treasury += msg.value;
        } else {
            require(msg.value == 0, "Free attempts should not include payment");
        }

        // Convert external encrypted input to internal
        euint8 encryptedGuess = FHE.fromExternal(guess, inputProof);

        // Perform encrypted comparisons
        isCorrect = FHE.eq(game.secretNumber, encryptedGuess);
        isTooBig = FHE.gt(encryptedGuess, game.secretNumber);
        isTooSmall = FHE.lt(encryptedGuess, game.secretNumber);

        // Allow player to decrypt the comparison results
        FHE.allowThis(isCorrect);
        FHE.allowThis(isTooBig);
        FHE.allowThis(isTooSmall);
        FHE.allow(isCorrect, msg.sender);
        FHE.allow(isTooBig, msg.sender);
        FHE.allow(isTooSmall, msg.sender);

        // Update game state
        game.attemptsUsed++;

        emit GuessResult(msg.sender, game.attemptsUsed, false, block.timestamp);

        return (isCorrect, isTooBig, isTooSmall);
    }

    /**
     * @dev Claim victory and receive reward
     * @notice Called after player decrypts and confirms they won
     */
    function claimVictory() external gameActive {
        Game storage game = games[msg.sender];

        require(!game.hasWon, "Already claimed victory");

        // Mark as won and end game
        game.hasWon = true;
        game.isActive = false;

        // Pay reward if treasury has sufficient balance
        uint256 reward = REWARD_AMOUNT;
        if (treasury >= reward) {
            treasury -= reward;
            payable(msg.sender).transfer(reward);
        }

        emit GameWon(msg.sender, game.attemptsUsed, reward, block.timestamp);
    }

    /**
     * @dev Abandon current game and start fresh
     * @notice Player can abandon game and restart with 3 free attempts
     */
    function abandonGame() external gameActive {
        Game storage game = games[msg.sender];

        emit GameAbandoned(msg.sender, game.attemptsUsed, block.timestamp);

        // Reset game state
        game.isActive = false;
    }

    /**
     * @dev Get player's current game status
     * @param player Player address
     * @return isActive Whether game is active
     * @return attemptsUsed Number of attempts used
     * @return attemptsRemaining Free attempts remaining
     * @return hasWon Whether player has won
     */
    function getGameStatus(address player) external view returns (
        bool isActive,
        uint8 attemptsUsed,
        uint8 attemptsRemaining,
        bool hasWon
    ) {
        Game storage game = games[player];

        uint8 remaining = game.attemptsUsed < FREE_ATTEMPTS
            ? FREE_ATTEMPTS - game.attemptsUsed
            : 0;

        return (
            game.isActive,
            game.attemptsUsed,
            remaining,
            game.hasWon
        );
    }

    /**
     * @dev Get encrypted secret number for winner to decrypt
     * @notice Only works if player has won the current game
     * @return secretNumber Encrypted secret number
     */
    function getSecretNumber() external view returns (euint8 secretNumber) {
        Game storage game = games[msg.sender];
        require(game.hasWon, "Can only decrypt secret after winning");

        return game.secretNumber;
    }

    /**
     * @dev Owner function to fund the contract treasury
     */
    function fundTreasury() external payable onlyOwner {
        treasury += msg.value;
    }

    /**
     * @dev Owner function to withdraw excess treasury funds
     * @param amount Amount to withdraw
     */
    function withdrawTreasury(uint256 amount) external onlyOwner {
        require(amount <= treasury, "Insufficient treasury balance");
        treasury -= amount;
        payable(owner).transfer(amount);
    }

    /**
     * @dev Get contract treasury balance
     */
    function getTreasuryBalance() external view returns (uint256) {
        return treasury;
    }

    /**
     * @dev Emergency function to transfer ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}