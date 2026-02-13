class User < ApplicationRecord
  enum :department, { computer_science: 0, physics: 1, math: 2, chemistry: 3 }
  has_many :assignment, dependent: :destroy
  has_many: :contact, dependent: :destroy
end
