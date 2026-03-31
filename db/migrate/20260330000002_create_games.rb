class CreateGames < ActiveRecord::Migration[8.1]
  def change
    create_table :games do |t|
      t.references :user, null: false, foreign_key: true

      t.text    :pgn
      t.string  :fen,             default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      t.string  :status,          default: "active"
      t.jsonb   :conversation,    default: []
      t.jsonb   :annotations,     default: []
      t.integer :stockfish_depth, default: 15
      t.string  :opponent_type,   default: "random"

      t.datetime :started_at
      t.datetime :completed_at

      t.timestamps
    end

    add_index :games, :status
    add_index :games, [:user_id, :status]
  end
end
