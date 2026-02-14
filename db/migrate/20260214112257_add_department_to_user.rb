class AddDepartmentToUser < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :department, :integer
  end
end
