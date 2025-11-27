'use client'

import { Shield, Loader2, ArrowUp, ArrowDown, Trophy, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface GuessHistoryItem {
  number: number
  hint: string
  icon?: any
  isDecrypting?: boolean
}

interface GameStatusPanelProps {
  guessHistory: GuessHistoryItem[]
  attemptsRemaining: number
  attemptsUsed: number
  rewardAmount: string
}

export default function GameStatusPanel({
  guessHistory,
  attemptsRemaining,
  attemptsUsed,
  rewardAmount
}: GameStatusPanelProps) {
  const getIcon = (hint: string, Icon?: any) => {
    if (Icon) return Icon
    
    if (hint.includes('CORRECT')) return Trophy
    if (hint.includes('Big')) return ArrowDown
    if (hint.includes('Small')) return ArrowUp
    if (hint.includes('Decrypting') || hint.includes('Processing')) return Loader2
    return AlertCircle
  }

  const getHintColor = (hint: string) => {
    if (hint.includes('CORRECT')) return 'text-green-300 border-green-400/50 glow-green'
    if (hint.includes('Big')) return 'text-red-300 border-red-400/50'
    if (hint.includes('Small')) return 'text-blue-300 border-blue-400/50'
    return 'text-white/80 border-white/20'
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <motion.div
          className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-white/40 transition-all text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-lg sm:rounded-xl">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-1.5 sm:mb-2">
            {attemptsRemaining}
          </div>
          <div className="text-xs sm:text-sm text-white/70 font-medium uppercase tracking-wider">
            Free Attempts Left
          </div>
        </motion.div>

        <motion.div
          className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-white/40 transition-all text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg sm:rounded-xl">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-1.5 sm:mb-2">
            {attemptsUsed}
          </div>
          <div className="text-xs sm:text-sm text-white/70 font-medium uppercase tracking-wider">
            Total Attempts
          </div>
        </motion.div>

        <motion.div
          className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-white/40 transition-all text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-lg sm:rounded-xl">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-1.5 sm:mb-2">
            {rewardAmount} ETH
          </div>
          <div className="text-xs sm:text-sm text-white/70 font-medium uppercase tracking-wider">
            Win Reward
          </div>
        </motion.div>
      </div>

      {/* Guess History */}
      {guessHistory.length > 0 && (
        <motion.div
          className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Guess History
            </h3>
          </div>
          
          {/* Desktop: Vertical List, Mobile: Horizontal Scroll */}
          <div className="hidden sm:block space-y-2.5 sm:space-y-3">
            {guessHistory.map((guess, index) => {
              const Icon = getIcon(guess.hint, guess.icon)
              const isDecrypting = guess.isDecrypting || guess.hint.includes('Decrypting') || guess.hint.includes('Processing')
              const isCorrect = guess.hint.includes('CORRECT')
              const isTooBig = guess.hint.includes('Big')
              const isTooSmall = guess.hint.includes('Small')
              
              return (
                <motion.div
                  key={index}
                  className={cn(
                    "glass-card rounded-lg sm:rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 border transition-all hover:scale-[1.02]",
                    getHintColor(guess.hint)
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center">
                    <Badge 
                      variant="secondary" 
                      className="text-sm sm:text-base px-2.5 sm:px-3 py-1 bg-white/20 text-white border-white/30"
                    >
                      #{index + 1}
                    </Badge>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-white">
                      {guess.number}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
                    <motion.div
                      animate={isDecrypting ? {
                        rotate: 360
                      } : {}}
                      transition={isDecrypting ? {
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                      } : {}}
                    >
                      <Icon className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6",
                        isCorrect ? "text-green-300" : 
                        isTooBig ? "text-red-300" :
                        isTooSmall ? "text-blue-300" :
                        "text-white/60"
                      )} />
                    </motion.div>
                    <span className={cn(
                      "font-bold text-base sm:text-lg text-center",
                      isCorrect ? "text-green-300" : 
                      isTooBig ? "text-red-300" :
                      isTooSmall ? "text-blue-300" :
                      "text-white/80"
                    )}>
                      {isDecrypting ? 'Decrypting...' : guess.hint}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="sm:hidden horizontal-scroll">
            {guessHistory.map((guess, index) => {
              const Icon = getIcon(guess.hint, guess.icon)
              const isDecrypting = guess.isDecrypting || guess.hint.includes('Decrypting') || guess.hint.includes('Processing')
              const isCorrect = guess.hint.includes('CORRECT')
              const isTooBig = guess.hint.includes('Big')
              const isTooSmall = guess.hint.includes('Small')
              
              return (
                <motion.div
                  key={index}
                  className={cn(
                    "glass-card rounded-xl p-4 min-w-[200px] flex flex-col items-center gap-3 border",
                    getHintColor(guess.hint)
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-sm px-3 py-1 bg-white/20 text-white border-white/30"
                  >
                    #{index + 1}
                  </Badge>
                  <span className="font-mono text-2xl font-bold text-white">
                    {guess.number}
                  </span>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={isDecrypting ? {
                        rotate: 360
                      } : {}}
                      transition={isDecrypting ? {
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                      } : {}}
                    >
                      <Icon className={cn(
                        "w-6 h-6",
                        isCorrect ? "text-green-300" : 
                        isTooBig ? "text-red-300" :
                        isTooSmall ? "text-blue-300" :
                        "text-white/60"
                      )} />
                    </motion.div>
                    <span className={cn(
                      "font-bold text-sm text-center",
                      isCorrect ? "text-green-300" : 
                      isTooBig ? "text-red-300" :
                      isTooSmall ? "text-blue-300" :
                      "text-white/80"
                    )}>
                      {isDecrypting ? 'Decrypting...' : guess.hint}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}








