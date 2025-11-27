'use client'

import { Wallet, Shield, Dice1, Lock, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LandingPageProps {
  onConnectWallet: () => void
  isConnected: boolean
  isLoading?: boolean
}

export default function LandingPage({
  onConnectWallet,
  isConnected,
  isLoading = false
}: LandingPageProps) {
  const features = [
    {
      icon: Shield,
      title: 'Privacy Protection',
      description: 'Your guesses are encrypted on-chain using FHEVM technology, ensuring complete privacy.'
    },
    {
      icon: Lock,
      title: 'Homomorphic Encryption',
      description: 'The game compares encrypted numbers without ever decrypting them, maintaining security.'
    },
    {
      icon: Dice1,
      title: 'On-Chain Randomness',
      description: 'Secret numbers are generated securely on the blockchain, ensuring fairness.'
    }
  ]

  const timelineSteps = [
    {
      step: 1,
      title: 'Connect Wallet',
      description: 'Connect your MetaMask wallet to the Sepolia testnet',
      icon: Wallet
    },
    {
      step: 2,
      title: 'Encrypt Guess',
      description: 'Your number is encrypted using FHEVM SDK before submission',
      icon: Lock
    },
    {
      step: 3,
      title: 'On-Chain Comparison',
      description: 'Smart contract compares encrypted values without decryption',
      icon: Shield
    },
    {
      step: 4,
      title: 'Decrypt Hint',
      description: 'Receive encrypted hints that are decrypted via Zama Relayer',
      icon: Zap
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Hero Section */}
        <motion.section
          className="text-center mb-16 sm:mb-20 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-75 animate-pulse" />
              <Dice1 className="relative w-12 h-12 sm:w-16 sm:h-16 text-white animate-bounce" />
            </motion.div>
            
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-2xl leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              FHE Number Guessing
            </motion.h1>
            
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur-xl opacity-75 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <Dice1 className="relative w-12 h-12 sm:w-16 sm:h-16 text-white animate-bounce" style={{ animationDelay: '0.2s' }} />
            </motion.div>
          </div>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium mb-8 sm:mb-10 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            A completely private on-chain number guessing game powered by{' '}
            <span className="text-yellow-300 font-semibold">FHEVM</span> technology.
            <br className="hidden sm:block" />
            Your guesses remain encrypted throughout the entire process.
          </motion.p>

          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button
                onClick={onConnectWallet}
                disabled={isLoading}
                size="lg"
                variant="game"
                className="glass-button-gradient text-lg sm:text-xl px-10 sm:px-12 py-6 sm:py-7 h-auto"
              >
                {isLoading ? (
                  <>
                    <Wallet className="w-6 h-6 mr-3 animate-pulse" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-6 h-6 mr-3" />
                    Connect Your Wallet
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="mb-16 sm:mb-20 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-10 sm:mb-12">
            Why Choose FHE?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Card className="glass-card border-white/20 h-full">
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl text-white text-center">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/80 text-center text-base sm:text-lg">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Timeline Section */}
        <motion.section
          className="mb-16 sm:mb-20 lg:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-10 sm:mb-12">
            How It Works
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    {/* Connector Line (hidden on mobile, shown on desktop) */}
                    {index < timelineSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-pink-500/50 z-0" style={{ width: 'calc(100% - 4rem)' }} />
                    )}
                    
                    <Card className="glass-card border-white/20 text-center relative z-10">
                      <CardHeader>
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50" />
                            <div className="relative p-3 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-full">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-white mb-2 text-center">
                          {step.step}
                        </div>
                        <CardTitle className="text-lg sm:text-xl text-white text-center">
                          {step.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-white/70 text-sm sm:text-base text-center">
                          {step.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        {!isConnected && (
          <motion.section
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="glass-card rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-12 max-w-2xl mx-auto border border-white/30">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                Ready to Play?
              </h2>
              <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8">
                Connect your wallet and start guessing encrypted numbers on the blockchain!
              </p>
              <Button
                onClick={onConnectWallet}
                disabled={isLoading}
                size="lg"
                variant="game"
                className="glass-button-gradient text-lg sm:text-xl px-10 sm:px-12 py-6 sm:py-7 h-auto"
              >
                {isLoading ? (
                  <>
                    <Wallet className="w-6 h-6 mr-3 animate-pulse" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-6 h-6 mr-3" />
                    Connect MetaMask
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </>
                )}
              </Button>
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <motion.footer
          className="mt-16 sm:mt-20 lg:mt-24 text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
            <p className="text-base sm:text-lg text-white/90 font-semibold">
              Powered by FHEVM
            </p>
          </div>
          <p className="text-sm sm:text-base text-white/60">
            Built with Next.js 14, React 18, and Zama FHEVM SDK
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
