class AddFieldsToAssignment < ActiveRecord::Migration[8.1]
  def change
    add_column :assignments, :subject, :integer, null: false
    add_column :assignments, :status, :integer, default: 0, null: false
    add_column :assignments, :due_date, :date
  end
end
