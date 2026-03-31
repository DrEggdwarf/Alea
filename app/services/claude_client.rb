class ClaudeClient
  API_URL = "https://api.anthropic.com/v1/messages".freeze
  MODEL = "claude-sonnet-4-20250514".freeze
  MAX_TOKENS = 2048

  def initialize(api_key:)
    @api_key = api_key
    @conn = Faraday.new(url: API_URL) do |f|
      f.request :json
      f.response :json
      f.adapter Faraday.default_adapter
      f.options.timeout = 60
      f.options.open_timeout = 10
    end
  end

  def chat(messages:, system: nil)
    body = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: messages
    }
    body[:system] = system if system

    response = @conn.post do |req|
      req.headers["x-api-key"] = @api_key
      req.headers["anthropic-version"] = "2023-06-01"
      req.headers["content-type"] = "application/json"
      req.body = body.to_json
    end

    unless response.success?
      raise "Claude API error (#{response.status}): #{response.body}"
    end

    response.body
  end
end
