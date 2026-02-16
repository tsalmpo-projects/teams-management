class HomeController < ApplicationController
  def index
    return unless user_signed_in?
    @assignments = Assignment.published.includes(:user).order(created_at: :desc)
    @assignments = @assignments.where(subject: params[:subject]) if params[:subject].present?
  end
end
