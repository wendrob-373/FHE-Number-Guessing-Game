'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { 
  Dice1, Wallet, Lock, CheckCircle2, XCircle, 
  Trophy, Coins, Zap, Loader2, Shield, Gamepad2,
  AlertCircle, X, ArrowUp, ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

// Import new components
import GuessInput from '@/components/game/GuessInput'
import GameStatusPanel from '@/components/game/GameStatusPanel'
import StartGameButton from '@/components/game/StartGameButton'
import WinModal from '@/components/game/WinModal'
import LandingPage from '@/components/landing/LandingPage'

// Extend Window type to include relayerSDK and ethereum
declare global {
  interface Window {
    relayerSDK?: any
    ethereum?: any
  }
}

// Contract configuration
const CONTRACT_CONFIG = {
  address: '0x17A815d8C04471E253df9F31EeA6F6bed9240451',
  abi: [
    "function startNewGame() external",
    "function makeGuess(bytes32 guess, bytes calldata inputProof) external payable returns (bytes32 isCorrect, bytes32 isTooBig, bytes32 isTooSmall)",
    "function claimVictory() external",
    "function abandonGame() external",
    "function getGameStatus(address player) external view returns (bool isActive, uint8 attemptsUsed, uint8 attemptsRemaining, bool hasWon)",
    "function getSecretNumber() external view returns (bytes32)",
    "function GUESS_COST() external view returns (uint256)",
    "function REWARD_AMOUNT() external view returns (uint256)",
    "function FREE_ATTEMPTS() external view returns (uint8)",
    "function NUMBER_RANGE() external view returns (uint8)",
    "event GameStarted(address indexed player, uint256 timestamp)",
    "event GuessResult(address indexed player, uint8 attempt, bool isCorrect, uint256 timestamp)",
    "event GameWon(address indexed player, uint8 attempts, uint256 reward, uint256 timestamp)"
  ]
}

type GameStatus = {
  isActive: boolean;
  attemptsUsed: number;
  attemptsRemaining: number;
  hasWon: boolean;
}

type GuessResult = {
  isCorrect: boolean;
  isTooBig: boolean;
  isTooSmall: boolean;
}

export default function GamePage() {
  const [account, setAccount] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [contract, setContract] = useState<any>(null)
  const [signer, setSigner] = useState<any>(null)

  const [gameStatus, setGameStatus] = useState<GameStatus>({
    isActive: false,
    attemptsUsed: 0,
    attemptsRemaining: 3,
    hasWon: false
  })

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [guessHistory, setGuessHistory] = useState<Array<{number: number, hint: string, icon: any}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'default' | 'success' | 'destructive' | 'warning'>('default')
  const [gameConfig, setGameConfig] = useState({
    guessCost: '0',
    rewardAmount: '0',
    numberRange: 32
  })
  const [showWinModal, setShowWinModal] = useState(false)
  const [secretNumber, setSecretNumber] = useState<number | null>(null)

  const [fhevmInstance, setFhevmInstance] = useState<any>(null)
  const [sdkReady, setSdkReady] = useState(false)

  // Initialize FHEVM SDK
  useEffect(() => {
    const initFHEVM = async () => {
      if (!isConnected || !account) return

      try {
        if (!window.relayerSDK) {
          console.warn('FHEVM SDK not loaded from CDN, waiting...')
          setTimeout(initFHEVM, 1000)
          return
        }

        const SDK = window.relayerSDK
        console.log('Found FHEVM SDK')

        await SDK.initSDK()
        console.log('SDK.initSDK() completed')

        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        
        let networkConfig
        if (network.chainId === BigInt(11155111)) {
          const rpcUrl = process.env.NEXT_PUBLIC_INFURA_KEY 
            ? `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
            : undefined
          
          networkConfig = {
            ...SDK.SepoliaConfig,
            ...(rpcUrl && { network: rpcUrl }),
            relayerUrl: 'https://relayer.testnet.zama.org',
          }
        } else {
          throw new Error('Please switch to Sepolia testnet (Chain ID: 11155111)')
        }

        const instance = await SDK.createInstance(networkConfig)
        setFhevmInstance(instance)
        setSdkReady(true)
        console.log('FHEVM SDK initialization completed')

      } catch (error: any) {
        console.error('FHEVM SDK initialization failed:', error)
        setMessage(`SDK initialization failed: ${error.message}`)
        setMessageType('destructive')
      }
    }

    const timer = setTimeout(initFHEVM, 500)
    return () => clearTimeout(timer)
  }, [isConnected, account])

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true)
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_requestAccounts', [])
        const signerInstance = await provider.getSigner()

        setAccount(accounts[0])
        setIsConnected(true)
        setSigner(signerInstance)

        const contractInstance = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, signerInstance)
        setContract(contractInstance)

        await loadGameConfig(contractInstance)
        await loadGameStatus(contractInstance, accounts[0])

        setMessage('Wallet connected successfully!')
        setMessageType('success')

      } catch (error: any) {
        console.error('Error connecting wallet:', error)
        setMessage(`Error: ${error.message}`)
        setMessageType('destructive')
      } finally {
        setIsLoading(false)
      }
    } else {
      setMessage('Please install MetaMask!')
      setMessageType('destructive')
    }
  }

  const loadGameConfig = async (contractInstance: any) => {
    try {
      const [guessCost, rewardAmount, numberRange] = await Promise.all([
        contractInstance.GUESS_COST(),
        contractInstance.REWARD_AMOUNT(),
        contractInstance.NUMBER_RANGE()
      ])

      setGameConfig({
        guessCost: ethers.formatEther(guessCost),
        rewardAmount: ethers.formatEther(rewardAmount),
        numberRange: Number(numberRange)
      })
    } catch (error: any) {
      console.error('Error loading config:', error)
    }
  }

  const loadGameStatus = async (contractInstance: any, userAddress: string) => {
    try {
      const status = await contractInstance.getGameStatus(userAddress)

      setGameStatus({
        isActive: status[0],
        attemptsUsed: Number(status[1]),
        attemptsRemaining: Number(status[2]),
        hasWon: status[3]
      })
    } catch (error: any) {
      console.error('Error loading game status:', error)
    }
  }

  const startNewGame = async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setMessage('Starting new game...')
      setMessageType('default')

      const tx = await contract.startNewGame()
      await tx.wait()

      setGuessHistory([])
      setSelectedNumber(null)
      setSecretNumber(null)
      setShowWinModal(false)

      await loadGameStatus(contract, account)

      setMessage('New game started! Pick a number between 0-31')
      setMessageType('success')

    } catch (error: any) {
      console.error('Error starting game:', error)
      setMessage(`Failed to start game: ${error.reason || error.message}`)
      setMessageType('destructive')
    } finally {
      setIsLoading(false)
    }
  }

  const decryptGuessResults = async (handles: string[]) => {
    if (!fhevmInstance || !signer) {
      throw new Error('FHEVM instance or signer not available')
    }

    if (!Array.isArray(handles) || handles.length === 0) {
      throw new Error('Invalid handles: must be a non-empty array')
    }

    const validHandles = handles.filter(h => h != null && h !== '')
    if (validHandles.length !== handles.length) {
      throw new Error('Some handles are missing or invalid')
    }

    const userAddress = await signer.getAddress()
    const contractAddress = CONTRACT_CONFIG.address

    const normalizedHandles = validHandles.map(handle => {
      try {
        if (typeof handle !== 'string') {
          throw new Error(`Handle must be a string, got ${typeof handle}: ${handle}`)
        }
        
        if (!handle.startsWith('0x')) {
          throw new Error(`Handle must start with 0x: ${handle}`)
        }
        
        return ethers.zeroPadValue(ethers.hexlify(handle), 32)
      } catch (error) {
        console.error('Error normalizing handle:', handle, error)
        throw new Error(`Invalid handle format: ${handle} - ${error instanceof Error ? error.message : String(error)}`)
      }
    })

    console.log('Normalized handles:', normalizedHandles)

    const keypair = fhevmInstance.generateKeypair()
    
    if (!keypair || !keypair.privateKey || !keypair.publicKey) {
      throw new Error('Failed to generate keypair')
    }

    const handleContractPairs = normalizedHandles.map(handle => ({
      handle: handle,
      contractAddress: contractAddress
    }))

    console.log('Handle-contract pairs:', handleContractPairs)

    const startTimeStamp = Math.floor(Date.now() / 1000).toString()
    const durationDays = '10'
    const contractAddresses = [contractAddress]

    if (!Array.isArray(contractAddresses) || contractAddresses.length === 0) {
      throw new Error('contractAddresses must be a non-empty array')
    }

    const eip712 = fhevmInstance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    )

    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    )

    const signatureWithoutPrefix = signature.replace('0x', '')

    console.log('Decryption parameters:', {
      handleContractPairsCount: handleContractPairs.length,
      hasPrivateKey: !!keypair.privateKey,
      hasPublicKey: !!keypair.publicKey,
      signatureLength: signatureWithoutPrefix.length,
      contractAddresses: contractAddresses,
      userAddress: userAddress,
      startTimeStamp: startTimeStamp,
      durationDays: durationDays
    })

    try {
      const result = await fhevmInstance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signatureWithoutPrefix,
        contractAddresses,
        userAddress,
        startTimeStamp,
        durationDays
      )

      console.log('Decryption result:', result)

      const getDecryptedValue = (handle: string) => {
        const normalized = ethers.zeroPadValue(ethers.hexlify(handle), 32)
        if (result[normalized] !== undefined) {
          return result[normalized]
        }
        if (result[normalized.toLowerCase()] !== undefined) {
          return result[normalized.toLowerCase()]
        }
        if (result[handle] !== undefined) {
          return result[handle]
        }
        return undefined
      }

      return {
        isCorrect: Boolean(getDecryptedValue(normalizedHandles[0])),
        isTooBig: Boolean(getDecryptedValue(normalizedHandles[1])),
        isTooSmall: Boolean(getDecryptedValue(normalizedHandles[2]))
      }
    } catch (error: any) {
      console.error('userDecrypt error:', error)
      if (error.message?.includes('reduce')) {
        throw new Error('Invalid parameter format: ensure all handles are valid 32-byte hex strings')
      }
      throw error
    }
  }

  const makeGuess = async () => {
    if (!contract || selectedNumber === null) return
    if (!fhevmInstance || !sdkReady) {
      setMessage('FHEVM SDK is initializing, please wait...')
      setMessageType('warning')
      return
    }

    try {
      setIsLoading(true)
      setMessage('Encrypting your guess...')
      setMessageType('default')

      const needsPayment = gameStatus.attemptsUsed >= 3
      const paymentValue = needsPayment ? ethers.parseEther(gameConfig.guessCost) : 0

      const userAddress = await signer.getAddress()
      const encryptedInput = fhevmInstance.createEncryptedInput(
        CONTRACT_CONFIG.address,
        userAddress
      )

      encryptedInput.add8(selectedNumber)

      const { handles, inputProof } = await encryptedInput.encrypt()
      const encryptedGuess = handles[0]

      console.log('Encryption completed:', {
        guess: selectedNumber,
        encryptedHandle: encryptedGuess,
        proofLength: inputProof.length
      })

      setMessage('Submitting guess to blockchain...')
      setMessageType('default')

      console.log('Getting return values (ebool handles) using staticCall...')
      const result = await contract.makeGuess.staticCall(encryptedGuess, inputProof, {
        value: paymentValue
      })

      let isCorrectHandle: string
      let isTooBigHandle: string
      let isTooSmallHandle: string

      if (Array.isArray(result) && result.length === 3) {
        isCorrectHandle = typeof result[0] === 'string' ? result[0] : ethers.hexlify(result[0])
        isTooBigHandle = typeof result[1] === 'string' ? result[1] : ethers.hexlify(result[1])
        isTooSmallHandle = typeof result[2] === 'string' ? result[2] : ethers.hexlify(result[2])
      } else if (result && typeof result === 'object') {
        const getHandle = (value: any): string => {
          if (typeof value === 'string') return value
          if (value && typeof value === 'object') return ethers.hexlify(value)
          throw new Error(`Invalid handle value: ${value}`)
        }
        isCorrectHandle = getHandle(result.isCorrect ?? result[0])
        isTooBigHandle = getHandle(result.isTooBig ?? result[1])
        isTooSmallHandle = getHandle(result.isTooSmall ?? result[2])
      } else {
        throw new Error(`Unexpected result format from makeGuess staticCall: ${typeof result}`)
      }

      isCorrectHandle = ethers.zeroPadValue(ethers.hexlify(isCorrectHandle), 32)
      isTooBigHandle = ethers.zeroPadValue(ethers.hexlify(isTooBigHandle), 32)
      isTooSmallHandle = ethers.zeroPadValue(ethers.hexlify(isTooSmallHandle), 32)

      console.log('Retrieved ebool handles:', {
        isCorrect: isCorrectHandle,
        isTooBig: isTooBigHandle,
        isTooSmall: isTooSmallHandle
      })

      const tx = await contract.makeGuess(encryptedGuess, inputProof, {
        value: paymentValue
      })

      setMessage('Transaction submitted, waiting for confirmation...')
      setMessageType('default')
      const receipt = await tx.wait()

      console.log('Transaction confirmed:', receipt.hash)

      setMessage('Decrypting comparison results...')
      setMessageType('default')

      try {
        const decryptedResults = await decryptGuessResults([
          isCorrectHandle,
          isTooBigHandle,
          isTooSmallHandle
        ])

        console.log('Decrypted results:', decryptedResults)

        let hint = ''
        let icon: any = null
        if (decryptedResults.isCorrect) {
          hint = 'CORRECT! You won!'
          icon = Trophy
          setShowWinModal(true)
          setSecretNumber(selectedNumber)
        } else if (decryptedResults.isTooBig) {
          hint = 'Too Big'
          icon = ArrowDown
        } else if (decryptedResults.isTooSmall) {
          hint = 'Too Small'
          icon = ArrowUp
        } else {
          hint = 'Unknown result'
          icon = AlertCircle
        }

        setGuessHistory(prev => [...prev, { 
          number: selectedNumber, 
          hint: hint,
          icon: icon
        }])

        setMessage(hint)
        setMessageType(decryptedResults.isCorrect ? 'success' : 'default')

      } catch (decryptError: any) {
        console.error('Failed to decrypt results:', decryptError)
        setGuessHistory(prev => [...prev, { 
          number: selectedNumber, 
          hint: 'Processing...',
          icon: Loader2
        }])
        setMessage('Guess submitted! (Decryption failed, please check game status)')
        setMessageType('warning')
      }

      await loadGameStatus(contract, account)
      setSelectedNumber(null)

    } catch (error: any) {
      console.error('Guess failed:', error)
      setMessage(`Error: ${error.reason || error.message}`)
      setMessageType('destructive')
    } finally {
      setIsLoading(false)
    }
  }

  const claimVictory = async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setMessage('Claiming victory...')
      setMessageType('default')

      const tx = await contract.claimVictory()
      await tx.wait()

      setMessage(`Victory claimed! You earned ${gameConfig.rewardAmount} ETH!`)
      setMessageType('success')
      setShowWinModal(false)

      await loadGameStatus(contract, account)

    } catch (error: any) {
      console.error('Error claiming victory:', error)
      setMessage(`Failed to claim victory: ${error.reason || error.message}`)
      setMessageType('destructive')
    } finally {
      setIsLoading(false)
    }
  }

  const abandonGame = async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setMessage('Abandoning game...')
      setMessageType('default')

      const tx = await contract.abandonGame()
      await tx.wait()

      setGuessHistory([])
      setSelectedNumber(null)
      setSecretNumber(null)
      setShowWinModal(false)

      await loadGameStatus(contract, account)

      setMessage('Game abandoned. You can start a new game!')
      setMessageType('default')

    } catch (error: any) {
      console.error('Error abandoning game:', error)
      setMessage(`Failed to abandon game: ${error.reason || error.message}`)
      setMessageType('destructive')
    } finally {
      setIsLoading(false)
    }
  }


  // Show landing page if not connected
  if (!isConnected) {
    return (
      <LandingPage
        onConnectWallet={connectWallet}
        isConnected={isConnected}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated background overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-6xl">
        {/* Modern Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 card-enter">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
              <Dice1 className="relative w-12 h-12 sm:w-16 sm:h-16 text-white animate-bounce" style={{ animationDelay: '0s' }} />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              FHE Number Guessing
            </h1>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur-xl opacity-75 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <Dice1 className="relative w-12 h-12 sm:w-16 sm:h-16 text-white animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-medium flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
              <span>Guess the encrypted number</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Range: 0-{gameConfig.numberRange - 1}</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-yellow-300 font-semibold">First 3 guesses FREE!</span>
          </p>
        </div>

        {/* Main Game Area - Glass Card */}
        <div className="glass-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 mb-6 sm:mb-8 card-enter shadow-2xl">
          {(
            /* Modern Game Interface */
            <div className="space-y-6 sm:space-y-8">
              {/* SDK Status - Modern Badge */}
              <div className="flex items-center justify-center mb-4">
                <div className={cn(
                  "glass rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto",
                  sdkReady ? "border-green-400/50 glow-green" : "border-yellow-400/50 glow-yellow"
                )}>
                  <Zap className={cn(
                    "w-5 h-5",
                    sdkReady ? "text-green-300" : "text-yellow-300"
                  )} />
                  <span className="text-white font-semibold text-sm sm:text-base">FHEVM SDK Status:</span>
                  <Badge variant={sdkReady ? 'success' : 'warning'} className="ml-0 sm:ml-2">
                    {sdkReady ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Ready
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Initializing...
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Game Status Panel */}
              <GameStatusPanel
                guessHistory={guessHistory}
                attemptsRemaining={gameStatus.attemptsRemaining}
                attemptsUsed={gameStatus.attemptsUsed}
                rewardAmount={gameConfig.rewardAmount}
              />

              {/* Game Controls */}
              {!gameStatus.isActive ? (
                <StartGameButton
                  onClick={startNewGame}
                  isLoading={isLoading}
                  disabled={false}
                />
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {/* Guess Input Component */}
                  <GuessInput
                    numberRange={gameConfig.numberRange}
                    selectedNumber={selectedNumber}
                    onNumberSelect={setSelectedNumber}
                    onGuess={makeGuess}
                    isLoading={isLoading}
                    disabled={false}
                    sdkReady={sdkReady}
                    guessCost={gameConfig.guessCost}
                    attemptsUsed={gameStatus.attemptsUsed}
                  />

                  {/* Abandon Game Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={abandonGame}
                      disabled={isLoading}
                      size="lg"
                      variant="destructive"
                      className="text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 h-auto glass-button"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Abandon Game
                    </Button>
                  </div>
                </div>
              )}

              {/* Modern Message Display */}
              {message && (
                <Alert variant={messageType} className="glass border-white/20 rounded-xl sm:rounded-2xl">
                  {messageType === 'success' && <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-300 flex-shrink-0" />}
                  {messageType === 'destructive' && <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-300 flex-shrink-0" />}
                  {messageType === 'warning' && <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 flex-shrink-0" />}
                  {messageType === 'default' && <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 flex-shrink-0" />}
                  <AlertDescription className="text-center font-semibold text-white text-base sm:text-lg px-2">
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Win Modal Component */}
        <WinModal
          open={showWinModal}
          onOpenChange={setShowWinModal}
          secretNumber={secretNumber}
          rewardAmount={gameConfig.rewardAmount}
          onClaim={claimVictory}
          isLoading={isLoading}
        />

        {/* Modern Footer */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
            <p className="text-base sm:text-lg text-white/90 font-semibold">Powered by FHEVM</p>
          </div>
          {isConnected && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/70 flex-wrap px-4">
              <span className="glass px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/20">
                Contract: {CONTRACT_CONFIG.address.slice(0, 10)}...
              </span>
              <span className="glass px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/20">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
