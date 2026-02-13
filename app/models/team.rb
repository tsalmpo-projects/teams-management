class Team < ApplicationRecord
  belongs_to :assignment, dependent: :destroy
  belongs_to :user, dependent: :destroy
end
