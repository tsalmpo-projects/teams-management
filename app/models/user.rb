class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  enum :department, { computer_science: 0, physics: 1, math: 2, chemistry: 3 }
  has_many :assignment, dependent: :destroy
  has_many :contact, dependent: :destroy
  has_and_belongs_to_many :team, join_table: "team_members"
end
