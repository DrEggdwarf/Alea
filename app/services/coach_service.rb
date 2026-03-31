class CoachService
  SYSTEM_PROMPT = File.read(Rails.root.join("app/services/prompts/coach_system.txt")).freeze

  def self.analyze(fen:, conversation:, evaluation: nil, top_moves: [], legal_moves: [], context: nil, api_key:)
    new(fen:, conversation:, evaluation:, top_moves:, legal_moves:, context:, api_key:).analyze
  end

  def initialize(fen:, conversation:, evaluation: nil, top_moves: [], legal_moves: [], context: nil, api_key:)
    @fen = fen
    @conversation = conversation
    @evaluation = evaluation
    @top_moves = top_moves
    @legal_moves = legal_moves
    @context = context
    @api_key = api_key
  end

  def analyze
    messages = build_messages
    response = claude_client.chat(messages:, system: build_system_prompt)
    parse_response(response)
  rescue => e
    Rails.logger.error("CoachService error: #{e.class}: #{e.message}")
    Rails.logger.error(e.backtrace&.first(5)&.join("\n"))
    fallback_response
  end

  private

  def build_system_prompt
    SYSTEM_PROMPT
  end

  def build_messages
    context_message = build_context
    messages = @conversation.map do |msg|
      { role: msg["role"], content: msg["content"] }
    end
    messages << { role: "user", content: context_message }
    messages
  end

  def build_context
    parts = []

    # Factual report from Stockfish analysis (preferred, pre-built by frontend)
    if @context.present?
      parts << @context
      parts << ""
    end

    parts << "Position FEN: #{@fen}"
    parts << fen_to_description(@fen)
    parts << ""
    parts << pawn_structure_analysis(@fen)
    parts << ""
    parts << "Top coups Stockfish: #{@top_moves.join(', ')}" if @top_moves.any?
    parts << "Coups legaux: #{@legal_moves.join(', ')}" if @legal_moves.any?
    parts.join("\n")
  end

  def claude_client
    @claude_client ||= ClaudeClient.new(api_key: @api_key)
  end

  def parse_response(response)
    content = response.dig("content", 0, "text") || response.to_s

    # Strip markdown code blocks if Claude wraps the JSON
    cleaned = content.gsub(/```(?:json)?\s*/i, "").gsub(/```/, "").strip

    # Strategy 1: Try parsing the whole thing as JSON
    parsed = try_parse_json(cleaned)

    # Strategy 2: Extract the largest top-level JSON object using brace matching
    parsed ||= extract_largest_json(cleaned)

    # Strategy 3: Reassemble from fragmented markdown sections
    # Claude sometimes returns: text... **annotations:** [...] **question:** {...}
    parsed ||= reassemble_fragmented(cleaned)

    if parsed
      Rails.logger.info("CoachService raw question: #{parsed['question'].to_json}") if parsed["question"]
      result = normalize_response(parsed)
      validate_moves!(result)
      result
    else
      # Final fallback: strip markdown artifacts and use as plain text
      plain = cleaned.gsub(/\*\*\w+:\*\*\s*/i, "").gsub(/\[.*?\]/m, "").gsub(/\{.*?\}/m, "").strip
      # Take only the first paragraph as coach message
      text = plain.split(/\n\n/).first || plain
      { "text" => text, "annotations" => [], "question" => nil, "terms" => [], "is_key_moment" => false }
    end
  end

  def try_parse_json(str)
    JSON.parse(str)
  rescue JSON::ParserError
    nil
  end

  # Find the largest balanced {…} block in the string
  def extract_largest_json(str)
    best = nil
    str.enum_for(:scan, /\{/).map { Regexp.last_match.begin(0) }.each do |start|
      depth = 0
      in_string = false
      escape_next = false
      pos = start
      while pos < str.length
        ch = str[pos]
        if escape_next
          escape_next = false
        elsif ch == '\\'
          escape_next = true if in_string
        elsif ch == '"'
          in_string = !in_string
        elsif !in_string
          depth += 1 if ch == '{'
          depth -= 1 if ch == '}'
          if depth == 0
            candidate = str[start..pos]
            if best.nil? || candidate.length > best.length
              parsed = try_parse_json(candidate)
              best = parsed if parsed
            end
            break
          end
        end
        pos += 1
      end
    end
    best
  end

  # Reassemble from: text... **annotations:** [...] **terms:** [...] **question:** {...}
  def reassemble_fragmented(str)
    result = {}

    # Extract text (everything before the first **key:** section)
    text_match = str.match(/\A(.*?)(?:\*\*\w+:\*\*|\z)/m)
    result["text"] = text_match[1].strip if text_match && text_match[1].strip.present?

    # Extract each **key:** section
    { "annotations" => :array, "terms" => :array, "question" => :object }.each do |key, type|
      pattern = /\*\*#{key}:\*\*\s*/i
      if str =~ pattern
        after = str.split(pattern, 2).last
        bracket = type == :array ? "[" : "{"
        close = type == :array ? "]" : "}"
        if after&.lstrip&.start_with?(bracket)
          extracted = extract_balanced(after.lstrip, bracket, close)
          parsed = try_parse_json(extracted) if extracted
          result[key] = parsed if parsed
        end
      end
    end

    result["text"].present? ? result : nil
  end

  # Extract a balanced bracket/brace block from the start of a string
  def extract_balanced(str, open_ch, close_ch)
    return nil unless str.start_with?(open_ch)
    depth = 0
    in_string = false
    escape_next = false
    str.each_char.with_index do |ch, i|
      if escape_next
        escape_next = false
      elsif ch == '\\'
        escape_next = true if in_string
      elsif ch == '"'
        in_string = !in_string
      elsif !in_string
        depth += 1 if ch == open_ch
        depth -= 1 if ch == close_ch
        return str[0..i] if depth == 0
      end
    end
    nil
  end

  def normalize_response(parsed)
    result = parsed.slice("text", "annotations", "terms", "is_key_moment")
    result["annotations"] ||= []
    result["terms"] ||= []
    result["is_key_moment"] ||= false

    # Normalize question — Claude sometimes uses variant field names
    q = parsed["question"]
    if q.is_a?(Hash)
      q["title"] ||= q.delete("text") || ""
      opts = q["opts"] || q.delete("options") || []
      q["opts"] = opts.map { |o| normalize_option(o) }
      q.delete("options")
      result["question"] = q.slice("type", "title", "opts")
    else
      result["question"] = nil
    end

    # Auto-wrap chess terms that Claude forgot to bracket
    if result["text"].present?
      result["text"] = auto_wrap_terms(result["text"], result["terms"])
    end

    result
  end

  # Chess terms that should always be [term|color] wrapped
  OPENING_PATTERNS = [
    # French opening names
    /d[ée]fense\s+(?:de\s+)?(?:philidor|sicilienne|fran[çc]aise|caro[- ]kann|pirc|alekhine|scandinave|hollandaise|slave|nimzo[- ]indienne|est[- ]indienne|benoni|gr[üu]nfeld|petrov|russe)/i,
    /gambit\s+(?:de\s+)?(?:dame|roi|budapest|evans|smith[- ]morra|b[eê]nko|letton|marshall|volga|danois)/i,
    /(?:partie|ouverture)\s+(?:de\s+)?(?:italienne|espagnole|[ée]cossaise|anglaise|viennoise|catalane|london|r[ée]ti)/i,
    # English opening names
    /(?:italian|ruy\s*lopez|sicilian|french|caro[- ]kann|queen'?s?\s+gambit|king'?s?\s+(?:indian|gambit)|nimzo[- ]indian|english|london|catalan|scotch|vienna|petrov|pirc|alekhine|scandinavian|dutch|slav|benoni|gr[üu]nfeld|philidor)\s*(?:defense|defence|opening|game|attack|system|variation)?/i,
    # Standalone well-known names
    /\b(?:Sicilienne|Philidor|Caro[- ]Kann|Gr[üu]nfeld)\b/,
  ].freeze

  TACTIC_PATTERNS = [
    /\b(?:clouage|fourchette|enfilade|brochette|sacrifice|zugzwang|pat|echec\s+[àa]\s+la\s+d[ée]couverte|double\s+attaque|attaque\s+[àa]\s+la\s+d[ée]couverte|surcharge|d[ée]viation|attraction|interception|coup\s+interm[ée]diaire|rayons[- ]x)\b/i,
  ].freeze

  def auto_wrap_terms(text, terms)
    result = text.dup

    # Wrap opening names not already in [brackets|color]
    OPENING_PATTERNS.each do |pattern|
      result = result.gsub(/(?<!\[)(#{pattern.source})(?!\|)/i) do |match|
        ensure_term(terms, match, "")
        "[#{match}|vio]"
      end
    end

    # Wrap tactic names not already in [brackets|color]
    TACTIC_PATTERNS.each do |pattern|
      result = result.gsub(/(?<!\[)(#{pattern.source})(?!\|)/i) do |match|
        ensure_term(terms, match, "")
        "[#{match}|pink]"
      end
    end

    result
  end

  def ensure_term(terms, label, description)
    return if terms.any? { |t| t["label"]&.downcase == label.downcase || t["title"]&.downcase == label.downcase }
    terms << { "label" => label, "title" => label, "description" => description, "tips" => "" }
  end

  FORBIDDEN_BADGES = %w[meilleur best optimal top premier principale ideal parfait correct winning gagnant].freeze

  def normalize_option(opt)
    label = opt["label"] || opt["move"] || opt["text"] || opt["name"] || opt["title"] || opt["description"] || opt["content"] || ""
    icon = opt["icon"] || opt["piece"] || opt["symbol"] || ""
    sub = opt["sub"] || opt["subtitle"] || opt["detail"] || opt["details"] || ""

    # If label is still empty but we have onhover arrows, derive from arrow
    if label.empty? && opt.dig("onhover", "arrows")&.any?
      arrow = opt["onhover"]["arrows"].first
      label = "#{arrow['from']} -> #{arrow['to']}" if arrow
    end

    # Strip badges that reveal the best move (anti-pedagogical)
    badge = opt["badge"] || opt["badgeLabel"]
    if badge && FORBIDDEN_BADGES.any? { |b| badge.downcase.include?(b) }
      badge = nil
    end

    {
      "icon"      => icon,
      "label"     => label,
      "sub"       => sub,
      "badge"     => badge,
      "badgeColor" => opt["badgeColor"] || opt["badge_color"],
      "reply"     => opt["reply"] || opt["response"] || "Je choisis #{label}",
      "onhover"   => opt["onhover"] || opt["hover"] || { "squares" => [], "arrows" => [] },
      "move"      => opt["move"]
    }.compact
  end

  # ── Server-side move validation ──────────────────────────────────────
  # Filters out any question option whose move is not in the legal moves list.
  # This is the definitive guard — no matter what Claude invents, illegal moves
  # never reach the frontend.
  def validate_moves!(result)
    return if @legal_moves.empty?
    return unless result["question"].is_a?(Hash) && result.dig("question", "opts").is_a?(Array)

    # Build a lookup set with multiple representations of each legal move
    legal_set = build_legal_set(@legal_moves)

    original_count = result["question"]["opts"].size
    result["question"]["opts"].reject! do |opt|
      move_str = opt["move"] || opt["label"] || ""
      # Skip non-move options (conceptual answers, plans, etc.)
      next false unless looks_like_move?(move_str)
      # Check if the move is legal
      !legal_move?(move_str, legal_set)
    end

    filtered_count = original_count - result["question"]["opts"].size
    Rails.logger.info("CoachService: filtered #{filtered_count} illegal moves") if filtered_count > 0

    # If all options were filtered, drop the question entirely
    if result["question"]["opts"].empty?
      result["question"] = nil
    end
  end

  def build_legal_set(legal_moves)
    set = Set.new
    # French piece letters → English
    fr_to_en = { "C" => "N", "F" => "B", "T" => "R", "D" => "Q", "R" => "K" }
    en_to_fr = fr_to_en.invert

    legal_moves.each do |m|
      clean = m.gsub(/[+#!?]/, "").strip
      set.add(clean.downcase)
      set.add(m.gsub(/[+#!?]/, "").strip) # case-sensitive too

      # Add French equivalent
      french = clean.sub(/\A([NBRQK])/) { |c| en_to_fr[c] || c }
      set.add(french.downcase)

      # Add English equivalent (if already French-looking)
      english = clean.sub(/\A([CFTDR])/) { |c| fr_to_en[c] || c }
      set.add(english.downcase)
    end
    set
  end

  def looks_like_move?(str)
    clean = str.gsub(/[+#!?]/, "").strip
    # Matches: e4, Nf3, Cf3, O-O, O-O-O, exd5, Bxe4, dxe5, Qd1, etc.
    clean.match?(/\A(?:O-O(?:-O)?|[A-Za-z]?[a-h]?x?[a-h][1-8](?:=[QRBN])?)\z/)
  end

  def legal_move?(move_str, legal_set)
    clean = move_str.gsub(/[+#!?]/, "").strip
    return true if legal_set.include?(clean.downcase)

    # Try French → English conversion
    fr_to_en = { "C" => "N", "F" => "B", "T" => "R", "D" => "Q", "R" => "K" }
    converted = clean.sub(/\A([CFTDR])/) { |c| fr_to_en[c] || c }
    return true if legal_set.include?(converted.downcase)

    # Try English → French conversion
    en_to_fr = { "N" => "C", "B" => "F", "R" => "T", "Q" => "D", "K" => "R" }
    converted2 = clean.sub(/\A([NBRQK])/) { |c| en_to_fr[c] || c }
    legal_set.include?(converted2.downcase)
  end

  # Converts FEN to a visual 8x8 board matrix.
  # Uppercase = white, lowercase = black, . = empty
  # Much more compact and unambiguous than a piece list.
  def fen_to_description(fen)
    placement = fen.split(" ").first
    rows = []
    rows << "Echiquier (majuscule=blanc, minuscule=noir, .=vide) :"
    rows << "  a b c d e f g h"

    placement.split("/").each_with_index do |rank_str, i|
      rank_num = 8 - i
      squares = []
      rank_str.each_char do |c|
        if c =~ /\d/
          c.to_i.times { squares << "." }
        else
          squares << c
        end
      end
      rows << "#{rank_num} #{squares.join(' ')}"
    end

    rows.join("\n")
  end

  # Analyze pawn structure from FEN — provides factual structural observations
  def pawn_structure_analysis(fen)
    placement = fen.split(" ").first
    files = ("a".."h").to_a

    # Collect pawn positions per color per file
    white_pawns = Hash.new { |h, k| h[k] = [] } # file => [ranks]
    black_pawns = Hash.new { |h, k| h[k] = [] }

    # Parse castling rights
    castling = fen.split(" ")[2] || "-"
    turn = fen.split(" ")[1] || "w"

    placement.split("/").each_with_index do |rank_str, rank_idx|
      chess_rank = 8 - rank_idx
      file_idx = 0
      rank_str.each_char do |c|
        if c =~ /\d/
          file_idx += c.to_i
        else
          f = files[file_idx]
          white_pawns[f] << chess_rank if c == "P"
          black_pawns[f] << chess_rank if c == "p"
          file_idx += 1
        end
      end
    end

    facts = []
    facts << "ANALYSE STRUCTURELLE (faits verifies, base ta reponse sur ces faits) :"

    # Doubled pawns
    white_doubled = white_pawns.select { |_, ranks| ranks.size > 1 }.keys
    black_doubled = black_pawns.select { |_, ranks| ranks.size > 1 }.keys
    facts << "- Pions doubles blancs: #{white_doubled.any? ? "colonnes #{white_doubled.join(', ')}" : "aucun"}"
    facts << "- Pions doubles noirs: #{black_doubled.any? ? "colonnes #{black_doubled.join(', ')}" : "aucun"}"

    # Isolated pawns (no friendly pawn on adjacent files)
    w_isolated = white_pawns.keys.select do |f|
      idx = files.index(f)
      adj = [idx - 1, idx + 1].select { |i| i.between?(0, 7) }.map { |i| files[i] }
      adj.none? { |af| white_pawns.key?(af) }
    end
    b_isolated = black_pawns.keys.select do |f|
      idx = files.index(f)
      adj = [idx - 1, idx + 1].select { |i| i.between?(0, 7) }.map { |i| files[i] }
      adj.none? { |af| black_pawns.key?(af) }
    end
    facts << "- Pions isoles blancs: #{w_isolated.any? ? w_isolated.join(', ') : "aucun"}"
    facts << "- Pions isoles noirs: #{b_isolated.any? ? b_isolated.join(', ') : "aucun"}"

    # Open files (no pawns at all)
    open_files = files.select { |f| !white_pawns.key?(f) && !black_pawns.key?(f) }
    facts << "- Colonnes ouvertes: #{open_files.any? ? open_files.join(', ') : "aucune"}"

    # Semi-open files
    w_semi = files.select { |f| !white_pawns.key?(f) && black_pawns.key?(f) }
    b_semi = files.select { |f| white_pawns.key?(f) && !black_pawns.key?(f) }
    facts << "- Colonnes semi-ouvertes pour blanc: #{w_semi.any? ? w_semi.join(', ') : "aucune"}"
    facts << "- Colonnes semi-ouvertes pour noir: #{b_semi.any? ? b_semi.join(', ') : "aucune"}"

    # Castling status — cross-reference FEN rights with actual legal moves
    w_castle_rights = []
    w_castle_rights << "petit roque" if castling.include?("K")
    w_castle_rights << "grand roque" if castling.include?("Q")
    b_castle_rights = []
    b_castle_rights << "petit roque" if castling.include?("k")
    b_castle_rights << "grand roque" if castling.include?("q")

    # Check if castling is actually playable NOW (in legal moves list)
    legal_norm = @legal_moves.map { |m| m.gsub(/[+#]/, "").strip }
    w_can_castle_k = legal_norm.include?("O-O") && turn == "w"
    w_can_castle_q = legal_norm.include?("O-O-O") && turn == "w"
    b_can_castle_k = legal_norm.include?("O-O") && turn == "b"
    b_can_castle_q = legal_norm.include?("O-O-O") && turn == "b"

    if turn == "w"
      if w_castle_rights.any?
        playable = []
        playable << "petit roque" if w_can_castle_k
        playable << "grand roque" if w_can_castle_q
        if playable.any?
          facts << "- Roque blanc: JOUABLE maintenant (#{playable.join(', ')})"
        else
          facts << "- Roque blanc: droits conserves mais BLOQUE actuellement (pieces sur le chemin ou echec)"
        end
      else
        facts << "- Roque blanc: plus disponible"
      end
      facts << "- Roque noir: #{b_castle_rights.any? ? "droits conserves (#{b_castle_rights.join(', ')})" : "plus disponible"}"
    else
      facts << "- Roque blanc: #{w_castle_rights.any? ? "droits conserves (#{w_castle_rights.join(', ')})" : "plus disponible"}"
      if b_castle_rights.any?
        playable = []
        playable << "petit roque" if b_can_castle_k
        playable << "grand roque" if b_can_castle_q
        if playable.any?
          facts << "- Roque noir: JOUABLE maintenant (#{playable.join(', ')})"
        else
          facts << "- Roque noir: droits conserves mais BLOQUE actuellement (pieces sur le chemin ou echec)"
        end
      else
        facts << "- Roque noir: plus disponible"
      end
    end

    facts << "- Trait: #{turn == 'w' ? 'blanc' : 'noir'}"

    facts.join("\n")
  end

  def fallback_response
    {
      "text" => "Intéressant. Regarde bien la position — quelles pièces sont actives et lesquelles sont passives ?",
      "annotations" => [],
      "question" => nil,
      "is_key_moment" => false
    }
  end
end
