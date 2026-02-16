class Assignment < ApplicationRecord
  belongs_to :user
  has_one :team, dependent: :destroy

  enum :subject, { computer_science: 0, physics: 1, math: 2, chemistry: 3 }
  enum :status, { published: 0, in_process: 1, completed: 2 }

  validates :title, :body, :subject, presence: true
end
