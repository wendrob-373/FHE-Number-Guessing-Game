'use client'

import { Play, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface StartGameButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled?: boolean
}

export default function StartGameButton({
  onClick,
  isLoading,
  disabled = false
}: StartGameButtonProps) {
  return (
    <div className="text-center py-8 sm:py-10 lg:py-12">
      <motion.div
        className="flex justify-center mb-5 sm:mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="relative p-6 sm:p-8 bg-white/20 backdrop-blur-xl rounded-full border-2 border-white/30">
            <Sparkles className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
          </div>
        </div>
      </motion.div>
      
      <motion.h3
        className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Ready to Play?
      </motion.h3>
      
      <motion.p
        className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-md mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        Start a new game and test your guessing skills with encrypted numbers!
      </motion.p>
      
      <motion.div
        whileHover={!disabled && !isLoading ? {
          scale: 1.05,
          y: -4
        } : {}}
        whileTap={!disabled && !isLoading ? {
          scale: 0.95
        } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Button
          onClick={onClick}
          disabled={isLoading || disabled}
          size="lg"
          variant="game"
          className="glass-button-gradient text-base sm:text-lg px-10 sm:px-12 py-5 sm:py-6 h-auto relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="relative flex items-center">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Start New Game
              </>
            )}
          </div>
        </Button>
      </motion.div>
    </div>
  )
}








