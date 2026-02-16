class AddDeclinedToMessage < ActiveRecord::Migration[8.1]
  def change
    add_column :messages, :declined, :boolean, default: false, null: false
  end
end
