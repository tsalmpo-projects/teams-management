class Team < ApplicationRecord
  belongs_to :assignment, dependent: :destroy
  belongs_to :user, dependent: :destroy
  has_and_belongs_to_many :members, class_name: "User", join_table: "team_members"
end
