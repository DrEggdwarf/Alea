# Compte test persistant
User.find_or_create_by!(email: "test@arbiter.dev") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
  user.display_name = "TestPlayer"
  user.elo_rating = 1200
  user.play_style = "tactical"
  user.objective = "Progresser en tactique et comprendre les ouvertures"
end

puts "Seed: compte test cree (test@arbiter.dev / password123)"
