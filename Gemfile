source "https://rubygems.org"

gem "rails", "~> 8.1.2"
gem "pg", "~> 1.5"
gem "puma", ">= 5.0"
gem "jbuilder"

# Redis
gem "redis", "~> 5.0"

# CORS
gem "rack-cors"

# Windows timezone data
gem "tzinfo-data", platforms: %i[windows jruby]

# Rails 8 database-backed adapters
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"

# Boot performance
gem "bootsnap", require: false

# Inertia.js adapter for Rails
gem "inertia_rails"

# Vite integration for Rails
gem "vite_rails"

# HTTP client for Claude API proxy
gem "faraday", "~> 2.0"

# Deploy as Docker container
gem "kamal", require: false
gem "thruster", require: false

# Active Storage image processing
gem "image_processing", "~> 1.2"

group :development, :test do
  gem "debug", platforms: %i[mri windows], require: "debug/prelude"
  gem "bundler-audit", require: false
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
end

group :development do
  gem "web-console"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
end
