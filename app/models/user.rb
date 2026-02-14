class User < ApplicationRecord
  enum :department, { computer_science: 0, physics: 1, math: 2, chemistry: 3 }
  has_many :assignment, dependent: :destroy
  has_many :contact, dependent: :destroy
  has_and_belongs_to_many :team, join_table: "team_members"
end
