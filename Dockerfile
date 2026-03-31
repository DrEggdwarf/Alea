# syntax=docker/dockerfile:1
# Alea — Chess Coach Socratique
# Multi-stage Dockerfile: Ruby 3.3 + Node 22 + PostgreSQL

# ============================================
# BASE
# ============================================
FROM ruby:3.3-slim AS base

WORKDIR /rails

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl \
      libpq5 \
      libjemalloc2 \
      && rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV LD_PRELOAD="libjemalloc.so.2" \
    RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development:test"

# ============================================
# BUILD
# ============================================
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      git \
      libpq-dev \
      libyaml-dev \
      pkg-config \
      && rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install --no-install-recommends -y nodejs && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install Ruby gems
COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Install Node packages
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code
COPY . .

# Fix bin permissions
RUN chmod +x bin/*

# Precompile assets (Vite build + Rails assets)
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile

# ============================================
# FINAL
# ============================================
FROM base

COPY --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build /rails /rails

RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    chown -R rails:rails db log storage tmp

USER 1000:1000

ENTRYPOINT ["/rails/bin/docker-entrypoint"]

EXPOSE 3000

CMD ["./bin/rails", "server", "-b", "0.0.0.0"]
