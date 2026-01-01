import type { PlayerBalance, SettlementTransfer, Transaction, Player } from '@/types'

/**
 * Calculate player balances from transactions
 * balance > 0: player is owed money (winning)
 * balance < 0: player owes money (losing)
 */
export function calculateBalances(
  players: Player[],
  transactions: Transaction[]
): PlayerBalance[] {
  const balanceMap = new Map<string, number>()

  // Initialize all players with 0 balance
  players.forEach(p => balanceMap.set(p.id, 0))

  // Process transactions
  // If A pays B $10, A loses $10 (negative) and B gains $10 (positive)
  transactions.forEach(t => {
    const fromBalance = balanceMap.get(t.from_player_id) || 0
    const toBalance = balanceMap.get(t.to_player_id) || 0

    balanceMap.set(t.from_player_id, fromBalance - t.amount)
    balanceMap.set(t.to_player_id, toBalance + t.amount)
  })

  return players.map(p => ({
    playerId: p.id,
    playerName: p.name,
    balance: balanceMap.get(p.id) || 0,
  }))
}

/**
 * Calculate minimum transfers to settle all debts
 * Uses a greedy algorithm: match largest creditor with largest debtor
 */
export function calculateSettlement(balances: PlayerBalance[]): SettlementTransfer[] {
  const transfers: SettlementTransfer[] = []

  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors = balances
    .filter(b => b.balance > 0)
    .map(b => ({ ...b, remaining: b.balance }))
    .sort((a, b) => b.remaining - a.remaining) // Largest first

  const debtors = balances
    .filter(b => b.balance < 0)
    .map(b => ({ ...b, remaining: -b.balance })) // Make positive for easier calculation
    .sort((a, b) => b.remaining - a.remaining)

  let creditorIdx = 0
  let debtorIdx = 0

  while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
    const creditor = creditors[creditorIdx]
    const debtor = debtors[debtorIdx]

    // Transfer the minimum of what debtor owes and creditor is owed
    const amount = Math.min(creditor.remaining, debtor.remaining)

    if (amount > 0) {
      transfers.push({
        from: { id: debtor.playerId, name: debtor.playerName },
        to: { id: creditor.playerId, name: creditor.playerName },
        amount,
      })
    }

    creditor.remaining -= amount
    debtor.remaining -= amount

    // Move to next if settled
    if (creditor.remaining === 0) creditorIdx++
    if (debtor.remaining === 0) debtorIdx++
  }

  return transfers
}

/**
 * Format amount from cents to display string (no currency symbol)
 */
export function formatAmount(cents: number): string {
  const value = cents / 100
  // Use Chinese number formatting
  if (value % 1 === 0) {
    return value.toLocaleString('zh-CN')
  }
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format amount with sign for balance display
 */
export function formatBalance(cents: number): string {
  const formatted = formatAmount(Math.abs(cents))
  if (cents > 0) {
    return `+${formatted}`
  } else if (cents < 0) {
    return `-${formatted}`
  }
  return formatted
}

/**
 * Parse user input to cents
 */
export function parseToCents(input: string): number | null {
  const cleaned = input.replace(/[^\d.]/g, '')
  const value = parseFloat(cleaned)

  if (isNaN(value) || value <= 0) return null

  // Convert to cents and round to avoid floating point issues
  return Math.round(value * 100)
}

/**
 * Generate a random 6-character room code
 * Excludes confusing characters: 0/O, 1/I/l
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
