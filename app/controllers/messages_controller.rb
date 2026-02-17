class MessagesController < ApplicationController
  def index
    @conversations = load_dm_conversations
    @team_conversations = load_team_conversations
    @selected_user = nil
    @messages = []
  end

  def show
    @selected_user = User.find(params[:user_id])

    # Mark unread messages from this user as read and broadcast
    unread = Message.where(sender_id: @selected_user.id, recipient_id: current_user.id, team_id: nil, assignment_id: nil, read: false)
    unread_ids = unread.pluck(:id)
    unread.update_all(read: true) if unread_ids.any?

    if unread_ids.any?
      conversation_id = [current_user.id, @selected_user.id].sort.join("_")
      ActionCable.server.broadcast("conversation_#{conversation_id}", {
        type: "messages_read",
        message_ids: unread_ids
      })
    end

    # Load all DM messages between current_user and selected_user
    @messages = Message.where(team_id: nil, assignment_id: nil)
      .where("(sender_id = :me AND recipient_id = :them) OR (sender_id = :them AND recipient_id = :me)",
             me: current_user.id, them: @selected_user.id)
      .order(created_at: :asc)
      .includes(:sender)

    @conversations = load_dm_conversations
    @team_conversations = load_team_conversations
  end

  def create
    recipient = User.find(params[:user_id])
    message = Message.create!(
      sender: current_user,
      recipient: recipient,
      content: params[:content]
    )

    # Broadcast to conversation channel
    conversation_id = [current_user.id, recipient.id].sort.join("_")
    ActionCable.server.broadcast("conversation_#{conversation_id}", {
      type: "message",
      id: message.id,
      content: message.content,
      sender_id: current_user.id,
      sender_name: sender_display_name(current_user),
      sender_initials: sender_initials(current_user),
      created_at: message.created_at.strftime("%-I:%M %p")
    })

    # Broadcast notification to recipient
    ActionCable.server.broadcast("notifications_#{recipient.id}", {
      type: "new_message",
      sender_name: sender_display_name(current_user),
      content: message.content.truncate(50),
      conversation_url: conversation_path(current_user)
    })

    render json: { id: message.id }
  end

  def team_show
    @team = Team.find(params[:team_id])

    unless team_member?(@team)
      redirect_to teams_path, alert: "You are not a member of this team."
      return
    end

    @messages = Message.where(team_id: @team.id)
      .order(created_at: :asc)
      .includes(:sender)

    @conversations = load_dm_conversations
    @team_conversations = load_team_conversations
  end

  def team_create
    team = Team.find(params[:team_id])

    unless team_member?(team)
      head :forbidden
      return
    end

    message = Message.create!(
      sender: current_user,
      team: team,
      content: params[:content]
    )

    # Broadcast to team conversation channel
    ActionCable.server.broadcast("conversation_team_#{team.id}", {
      type: "message",
      id: message.id,
      content: message.content,
      sender_id: current_user.id,
      sender_name: sender_display_name(current_user),
      sender_initials: sender_initials(current_user),
      created_at: message.created_at.strftime("%-I:%M %p")
    })

    # Broadcast notification to all other team members
    team.members.where.not(id: current_user.id).each do |member|
      ActionCable.server.broadcast("notifications_#{member.id}", {
        type: "new_message",
        sender_name: sender_display_name(current_user),
        content: message.content.truncate(50),
        conversation_url: team_conversation_path(team)
      })
    end

    # Also notify team creator if not current user and not already a member
    if team.user_id.present? && team.user_id != current_user.id && !team.members.exists?(id: team.user_id)
      ActionCable.server.broadcast("notifications_#{team.user_id}", {
        type: "new_message",
        sender_name: sender_display_name(current_user),
        content: message.content.truncate(50),
        conversation_url: team_conversation_path(team)
      })
    end

    render json: { id: message.id }
  end

  def mark_read
    message = Message.find(params[:id])
    if message.recipient_id == current_user.id
      message.update!(read: true)

      # Broadcast read receipt to sender
      conversation_id = [message.sender_id, message.recipient_id].sort.join("_")
      ActionCable.server.broadcast("conversation_#{conversation_id}", {
        type: "read",
        message_id: message.id
      })
    end
    head :ok
  end

  private

  def load_dm_conversations
    dm_messages = Message.where(team_id: nil, assignment_id: nil)
      .where("sender_id = :uid OR recipient_id = :uid", uid: current_user.id)
      .order(created_at: :desc)
      .includes(:sender, :recipient)

    conversations = {}
    dm_messages.each do |msg|
      other_id = msg.sender_id == current_user.id ? msg.recipient_id : msg.sender_id
      next if other_id.nil?
      conversations[other_id] ||= msg
    end
    conversations.values
  end

  def load_team_conversations
    teams = Team.where(id: current_user.team.select(:id))
      .or(Team.where(user_id: current_user.id))
      .includes(:assignment, :members)
      .distinct

    teams.map do |team|
      last_message = Message.where(team_id: team.id).order(created_at: :desc).first
      { team: team, last_message: last_message }
    end
  end

  def team_member?(team)
    team.members.exists?(id: current_user.id) || team.user_id == current_user.id
  end

  def sender_display_name(user)
    return "Deleted User" if user.nil?
    name = [user.firstname, user.lastname].compact.join(" ")
    name.blank? ? user.email.split("@").first : name
  end

  def sender_initials(user)
    return "?" if user.nil?
    initials = [user.firstname, user.lastname].compact.map { |n| n[0] }.join.upcase
    initials.blank? ? user.email[0..1].upcase : initials
  end
end
