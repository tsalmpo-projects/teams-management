class User < ApplicationRecord
  enum :department, { computer_science: 0, physics: 1, math: 2, chemistry: 3 }
end
