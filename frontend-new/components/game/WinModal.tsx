'use client'

import { Trophy, Coins, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WinModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  secretNumber: number | null
  rewardAmount: string
  onClaim: () => void
  isLoading: boolean
}

export default function WinModal({
  open,
  onOpenChange,
  secretNumber,
  rewardAmount,
  onClaim,
  isLoading
}: WinModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent 
            className="glass-strong border-white/30 rounded-2xl sm:rounded-3xl max-w-md mx-4 win-glow"
            onClose={() => onOpenChange(false)}
          >
            {/* Backdrop Blur Overlay */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <DialogHeader>
                {/* Trophy Icon with Glow */}
                <motion.div
                  className="flex justify-center mb-4 sm:mb-6"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1
                  }}
                >
                  <div className="relative">
                    {/* Outer Glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.75, 1, 0.75]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    {/* Inner Glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full blur-xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2
                      }}
                    />
                    {/* Trophy Icon */}
                    <div className="relative p-5 sm:p-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full">
                      <Trophy className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                    </div>
                  </div>
                </motion.div>

                <DialogTitle className="text-3xl sm:text-4xl text-center text-white font-black mb-2 sm:mb-3 px-4">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Congratulations! 🎉
                  </motion.span>
                </DialogTitle>
                
                <DialogDescription className="text-center text-base sm:text-lg text-white/80 px-4">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    You guessed the correct number!
                  </motion.span>
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Secret Number Display */}
                <motion.div
                  className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/30 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-xs sm:text-sm text-white/70 mb-2 sm:mb-3 uppercase tracking-wider font-semibold">
                    Secret Number
                  </div>
                  <motion.div
                    className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.6
                    }}
                  >
                    {secretNumber}
                  </motion.div>
                </motion.div>

                {/* Reward Display */}
                <motion.div
                  className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-400/50 glow-yellow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-yellow-300">
                    <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-bold text-lg sm:text-xl">
                      Reward: {rewardAmount} ETH
                    </span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={onClaim}
                    disabled={isLoading}
                    variant="success"
                    size="lg"
                    className="flex-1 text-base sm:text-lg py-5 sm:py-6 h-auto glass-button-gradient"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5 mr-2" />
                        Claim Reward
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => onOpenChange(false)}
                    variant="outline"
                    size="lg"
                    className="flex-1 text-base sm:text-lg py-5 sm:py-6 h-auto glass-button"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Close
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}








