Rails.application.routes.draw do
  root "games#index"
  get "play", to: "games#play"

  namespace :api do
    post "coach", to: "coach#analyze"
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
