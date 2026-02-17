class Team < ApplicationRecord
  belongs_to :assignment
  belongs_to :user, optional: true
  has_and_belongs_to_many :members, class_name: "User", join_table: "team_members"
end
