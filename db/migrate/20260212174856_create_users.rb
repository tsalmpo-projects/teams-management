class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.text :firstname
      t.text :lastname

      t.timestamps
    end
  end
end
