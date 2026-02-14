class Message < ApplicationRecord
  belongs_to :sender
  belongs_to :recipient
  belongs_to :assignment
  belongs_to :team
end
