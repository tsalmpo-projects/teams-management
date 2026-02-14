class AddContentToMessages < ActiveRecord::Migration[8.1]
  def change
    add_column :messages, :content, :text
  end
end
