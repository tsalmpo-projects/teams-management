class AssignmentsController < ApplicationController
  def index
    @assignments = current_user.assignment.order(created_at: :desc)
    @assignments = @assignments.where(status: params[:status]) if params[:status].present?
  end

  def show
    @assignment = Assignment.find(params[:id])
    if user_signed_in?
      @join_request = Message.find_by(sender_id: current_user.id, assignment_id: @assignment.id)
    end
  end

  def new
    @assignment = Assignment.new
  end

  def create
    @assignment = current_user.assignment.build(assignment_params)
    if @assignment.save
      redirect_to @assignment
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    @assignment = current_user.assignment.find(params[:id])
    if @assignment.update(assignment_params)
      redirect_to @assignment, notice: "Assignment updated."
    else
      redirect_to @assignment, alert: "Failed to update assignment."
    end
  end

  def destroy
    @assignment = current_user.assignment.find(params[:id])
    @assignment.destroy
    redirect_to assignments_path, notice: "Assignment was deleted."
  end

  def join_request
    assignment = Assignment.find(params[:id])
    unless assignment.published?
      redirect_to assignment, alert: "This assignment is no longer accepting join requests."
      return
    end
    existing = Message.find_by(sender_id: current_user.id, assignment_id: assignment.id)
    if existing
      redirect_to assignment, alert: "You already requested to join this assignment."
      return
    end

    name = [current_user.firstname, current_user.lastname].compact.join(" ")
    name = current_user.email if name.blank?

    Message.create!(
      sender: current_user,
      recipient: assignment.user,
      assignment: assignment,
      content: "#{name} requests to join a team"
    )

    if assignment.user_id.present?
      ActionCable.server.broadcast("notifications_#{assignment.user_id}", {
        type: "join_request",
        sender_name: name,
        assignment_title: assignment.title.truncate(40),
        assignment_url: assignment_path(assignment)
      })
    end

    redirect_to assignment, notice: "Join request sent!"
  end

  def handle_join_request
    @assignment = current_user.assignment.find(params[:id])
    message = Message.find(params[:message_id])
    declined = params[:declined] == "true"
    message.update!(declined: declined)

    unless declined
      team = @assignment.team || Team.create!(assignment: @assignment, user: current_user)
      team.members << message.sender if message.sender.present? && !team.members.include?(message.sender)
    end

    redirect_to @assignment, notice: declined ? "Request declined." : "Request accepted."
  end

  private

  def assignment_params
    params.require(:assignment).permit(:title, :body, :subject, :due_date, :status)
  end
end
