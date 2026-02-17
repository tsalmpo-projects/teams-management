class NullifyUserForeignKeysOnDelete < ActiveRecord::Migration[8.1]
  def change
    # Assignments: keep record, nullify author
    change_column_null :assignments, :user_id, true
    remove_foreign_key :assignments, :users
    add_foreign_key :assignments, :users, on_delete: :nullify

    # Teams: keep record, nullify owner
    change_column_null :teams, :user_id, true
    remove_foreign_key :teams, :users
    add_foreign_key :teams, :users, on_delete: :nullify

    # Team members: keep row, nullify user_id so the row persists
    change_column_null :team_members, :user_id, true
    # No FK exists on team_members for user_id, but add one with nullify
    add_foreign_key :team_members, :users, on_delete: :nullify

    # Messages sender: keep message, nullify sender
    change_column_null :messages, :sender_id, true
    remove_foreign_key :messages, :users, column: :sender_id
    add_foreign_key :messages, :users, column: :sender_id, on_delete: :nullify

    # Messages recipient: already nullable, just fix FK
    remove_foreign_key :messages, :users, column: :recipient_id
    add_foreign_key :messages, :users, column: :recipient_id, on_delete: :nullify

    # Contacts: delete rows when either user is deleted
    remove_foreign_key :contacts, :users, column: :user_id
    remove_foreign_key :contacts, :users, column: :contact_id
    add_foreign_key :contacts, :users, column: :user_id, on_delete: :cascade
    add_foreign_key :contacts, :users, column: :contact_id, on_delete: :cascade
  end
end
