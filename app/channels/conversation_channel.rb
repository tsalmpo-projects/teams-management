class ConversationChannel < ApplicationCable::Channel
  def subscribed
    stream_from "conversation_#{params[:conversation_id]}"
  end

  def typing(data)
    ActionCable.server.broadcast("conversation_#{params[:conversation_id]}", {
      type: "typing",
      user_id: current_user.id,
      user_name: display_name(current_user),
      typing: data["typing"]
    })
  end

  private

  def display_name(user)
    name = [user.firstname, user.lastname].compact.join(" ")
    name.blank? ? user.email.split("@").first : name
  end
end
