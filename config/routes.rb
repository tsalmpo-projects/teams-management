Rails.application.routes.draw do
  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks", registrations: "users/registrations" }
  get "home/index"

  resources :assignments do
    post :join_request, on: :member
    patch :handle_join_request, on: :member
  end

  get "contacts/search", to: "contacts#search", as: :search_contacts
  resources :contacts, only: [:index, :create, :destroy]

  get "teams", to: "teams#index", as: :teams
  get "teams/:team_id/messages", to: "messages#team_show", as: :team_conversation
  post "teams/:team_id/messages", to: "messages#team_create", as: :send_team_message
  get "messages", to: "messages#index", as: :messages
  get "messages/:user_id", to: "messages#show", as: :conversation
  post "messages/:user_id", to: "messages#create", as: :send_message
  patch "messages/:id/read", to: "messages#mark_read", as: :read_message
  get "profiles/:id", to: "profiles#show", as: :profile
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "home#index"
end
