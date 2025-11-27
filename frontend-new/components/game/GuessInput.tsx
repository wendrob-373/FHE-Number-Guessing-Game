'use client'

import { useState } from 'react'
import { Dice1, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GuessInputProps {
  numberRange: number
  selectedNumber: number | null
  onNumberSelect: (number: number) => void
  onGuess: () => void
  isLoading: boolean
  disabled?: boolean
  sdkReady?: boolean
  guessCost?: string
  attemptsUsed?: number
}

export default function GuessInput({
  numberRange,
  selectedNumber,
  onNumberSelect,
  onGuess,
  isLoading,
  disabled = false,
  sdkReady = true,
  guessCost = '0',
  attemptsUsed = 0
}: GuessInputProps) {
  const numbers = Array.from({ length: numberRange }, (_, i) => i)
  const needsPayment = attemptsUsed >= 3

  const handleNumberClick = (num: number) => {
    if (!disabled && !isLoading) {
      onNumberSelect(num)
    }
  }

  return (
    <div className="space-y-6">
      {/* Number Grid */}
      <div>
        <div className="text-center mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <span className="flex items-center gap-2">
              <Dice1 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Select a number</span>
            </span>
            <span className="text-base sm:text-xl text-white/80">
              between 0-{numberRange - 1}
            </span>
          </h3>
        </div>
        
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20">
          <div className="number-grid">
            {numbers.map((num) => {
              const isSelected = selectedNumber === num
              
              return (
                <motion.button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  disabled={disabled || isLoading}
                  className={cn(
                    "number-button",
                    isSelected && "selected"
                  )}
                  whileHover={!disabled && !isLoading ? { 
                    scale: 1.1,
                    y: -4
                  } : {}}
                  whileTap={!disabled && !isLoading ? { 
                    scale: 0.95 
                  } : {}}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: num * 0.01
                  }}
                >
                  {num}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Number Display */}
      {selectedNumber !== null && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 inline-block border-2 border-white/30 glow-blue">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Dice1 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              <span className="text-lg sm:text-xl text-white/90 font-semibold">
                Selected:
              </span>
              <motion.span
                className="text-2xl sm:text-3xl font-black text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-5 sm:px-6 py-2 sm:py-3 rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              >
                {selectedNumber}
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <motion.div
          whileHover={!disabled && !isLoading && sdkReady ? { 
            scale: 1.05,
            y: -2
          } : {}}
          whileTap={!disabled && !isLoading && sdkReady ? { 
            scale: 0.95 
          } : {}}
        >
          <Button
            onClick={onGuess}
            disabled={selectedNumber === null || isLoading || !sdkReady || disabled}
            size="lg"
            variant="game"
            className="glass-button-gradient text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 h-auto min-w-[200px]"
          >
            {!sdkReady ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                SDK Initializing...
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Encrypting...
              </>
            ) : needsPayment ? (
              <>
                <Dice1 className="w-5 h-5 mr-2" />
                Guess ({guessCost} ETH)
              </>
            ) : (
              <>
                <Dice1 className="w-5 h-5 mr-2" />
                Make Guess (FREE)
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
