module Api
  class CoachController < ApplicationController
    skip_before_action :verify_authenticity_token

    def analyze
      api_key = request.headers["X-API-Key"]
      unless api_key.present? && api_key.start_with?("sk-ant-")
        return render json: { error: "API key required" }, status: :unauthorized
      end

      fen = params[:fen]
      conversation = params[:conversation] || []
      evaluation = params[:evaluation]
      top_moves = params[:top_moves] || []
      legal_moves = params[:legal_moves] || []
      context = params[:context]

      response = CoachService.analyze(
        fen: fen,
        conversation: conversation,
        evaluation: evaluation,
        top_moves: top_moves,
        legal_moves: legal_moves,
        context: context,
        api_key: api_key
      )

      render json: response
    rescue => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end
end
