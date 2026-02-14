class CreateJoinTableTeamMembers < ActiveRecord::Migration[8.1]
  def change
    create_join_table :teams, :users, table_name: :team_members do |t|
      t.index [:team_id, :user_id], unique: true
    end
  end
end
