class Contact < ApplicationRecord
  belongs_to :user, foreign_key: 'user_id'
  belongs_to :user, foreign_key: 'contact_id'
end
