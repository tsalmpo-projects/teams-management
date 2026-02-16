class ChangeDeclinedDefaultInMessages < ActiveRecord::Migration[8.1]
  def change
    change_column_null :messages, :declined, true
    change_column_default :messages, :declined, from: false, to: nil
  end
end
