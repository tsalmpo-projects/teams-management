class Message < ApplicationRecord
  belongs_to :sender, class_name: "User"
  belongs_to :recipient, class_name: "User", optional: true
  belongs_to :assignment, optional: true
  belongs_to :team, optional: true
end
