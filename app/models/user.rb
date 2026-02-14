class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: [:google_oauth2]
  enum :department, { computer_science: 0, physics: 1, math: 2, chemistry: 3 }
  has_many :assignment, dependent: :destroy
  has_many :contact, dependent: :destroy
  has_and_belongs_to_many :team, join_table: "team_members"

  def self.from_omniauth(access_token)
    data = access_token.info
    user = User.where(email: data['email']).first

    unless user
      user = User.create(
        firstname: data['first_name'],
        lastname: data['last_name'],
        password: Devise.friendly_token[0, 20],
        email: data['email']
      )
    end
    user
  end
end
