class GamesController < ApplicationController
  def index
    render inertia: "Home"
  end

  def play
    render inertia: "Play", props: {
      stockfish_depth: 15
    }
  end
end
