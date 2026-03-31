class Game < ApplicationRecord
  validates :fen, presence: true
  validates :status, inclusion: { in: %w[active completed abandoned] }
  validates :stockfish_depth, numericality: { in: 1..25 }

  scope :active, -> { where(status: "active") }
  scope :recent, -> { order(updated_at: :desc) }
end
