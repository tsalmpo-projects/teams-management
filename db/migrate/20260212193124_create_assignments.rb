class CreateAssignments < ActiveRecord::Migration[8.1]
  def change
    create_table :assignments do |t|
      t.text :title
      t.text :body
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
