class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  before_action :require_login, unless: :devise_controller?

  private
   def require_login
    unless user_signed_in?
      flash[:error] = "You are not logged in"
      redirect_to new_user_session_url
    end
   end
end
