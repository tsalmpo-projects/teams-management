class AssignmentsController < ApplicationController
  def index
    @assignments = current_user.assignment.order(created_at: :desc)
  end

  def show
    @assignment = current_user.assignment.find(params[:id])
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

  def destroy
    @assignment = current_user.assignment.find(params[:id])
    @assignment.destroy
    redirect_to assignments_path, notice: "Assignment was deleted."
  end

  private

  def assignment_params
    params.require(:assignment).permit(:title, :body)
  end
end
