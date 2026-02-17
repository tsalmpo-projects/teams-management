class ContactsController < ApplicationController
  include ApplicationHelper

  def search
    query = params[:q].to_s.strip
    return render json: [] if query.length < 2

    users = User.where.not(id: current_user.id)
    users = users.where(department: params[:department]) if params[:department].present?
    users = users.where(
      "LOWER(firstname) LIKE :q OR LOWER(lastname) LIKE :q OR LOWER(email) LIKE :q",
      q: "%#{query.downcase}%"
    ).limit(10)

    contact_ids = current_user.contact.pluck(:contact_id)

    render json: users.map { |u|
      {
        id: u.id,
        name: display_name(u),
        initials: display_initials(u),
        email: u.email,
        department: u.department&.titleize || "Not set",
        is_contact: contact_ids.include?(u.id)
      }
    }
  end

  def index
    contacts = current_user.contact.includes(:contact_user)

    render json: contacts.filter_map { |c|
      u = c.contact_user
      next unless u

      {
        id: c.id,
        user_id: u.id,
        name: display_name(u),
        initials: display_initials(u),
        email: u.email,
        department: u.department&.titleize || "Not set",
        conversation_url: conversation_path(u)
      }
    }
  end

  def create
    contact = current_user.contact.build(contact_id: params[:contact_id])

    if contact.save
      render json: { id: contact.id }, status: :created
    else
      render json: { error: "Could not add contact" }, status: :unprocessable_entity
    end
  end

  def destroy
    contact = current_user.contact.find(params[:id])
    contact.destroy
    head :no_content
  end
end
