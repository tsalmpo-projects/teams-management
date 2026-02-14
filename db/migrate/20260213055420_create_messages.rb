class CreateMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|
      t.references :sender, null: false, foreign_key: {to_table: :users}
      t.references :recipient, null: true,  foreign_key: {to_table: :users}
      t.references :assignment, null: true, foreign_key: true
      t.references :team, null: true, foreign_key: true

      t.timestamps
    end
  end
end
