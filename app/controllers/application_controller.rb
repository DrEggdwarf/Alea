class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  before_action :set_locale

  inertia_share do
    {
      locale: I18n.locale.to_s,
      available_locales: I18n.available_locales.map(&:to_s),
      translations: app_translations
    }
  end

  private

  def set_locale
    locale = params[:locale] || session[:locale] || browser_locale
    I18n.locale = I18n.available_locales.map(&:to_s).include?(locale.to_s) ? locale : I18n.default_locale
    session[:locale] = I18n.locale
  end

  def browser_locale
    request.env["HTTP_ACCEPT_LANGUAGE"]&.scan(/[a-z]{2}/)&.first
  end

  APP_LOCALE_KEYS = %w[app coach board common byok].freeze

  def app_translations
    APP_LOCALE_KEYS.each_with_object({}) do |key, hash|
      result = I18n.t(key, locale: I18n.locale, default: nil)
      hash[key] = result if result
    end
  end
end
