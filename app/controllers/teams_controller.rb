class TeamsController < ApplicationController
  def index
    @teams = Team.where(id: current_user.team.select(:id))
      .or(Team.where(user_id: current_user.id))
      .includes(:assignment, :members, :user)
      .distinct
      .order(created_at: :desc)
  end
end
