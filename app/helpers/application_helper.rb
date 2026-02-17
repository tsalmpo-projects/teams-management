module ApplicationHelper
  SUBJECT_CLASSES = {
    "computer_science" => { border: "border-l-blue-600", bg: "bg-blue-100", text: "text-blue-700", accent: "text-blue-600", from: "from-blue-500", to: "to-blue-600" },
    "physics"          => { border: "border-l-green-600", bg: "bg-green-100", text: "text-green-700", accent: "text-green-600", from: "from-green-500", to: "to-green-600" },
    "math"             => { border: "border-l-purple-600", bg: "bg-purple-100", text: "text-purple-700", accent: "text-purple-600", from: "from-purple-500", to: "to-purple-600" },
    "chemistry"        => { border: "border-l-yellow-600", bg: "bg-yellow-100", text: "text-yellow-700", accent: "text-yellow-600", from: "from-yellow-500", to: "to-yellow-600" }
  }.freeze

  DEFAULT_SUBJECT = { border: "border-l-blue-600", bg: "bg-blue-100", text: "text-blue-700", accent: "text-blue-600", from: "from-blue-500", to: "to-blue-600" }.freeze

  STATUS_CLASSES = {
    "published"  => { bg: "bg-gray-100", text: "text-gray-700" },
    "in_process" => { bg: "bg-blue-100", text: "text-blue-700" },
    "completed"  => { bg: "bg-green-100", text: "text-green-700" }
  }.freeze

  DEFAULT_STATUS = { bg: "bg-gray-100", text: "text-gray-700" }.freeze

  AVATAR_CLASSES = [
    { bg: "bg-blue-100", text: "text-blue-700", ring: "hover:ring-blue-300" },
    { bg: "bg-green-100", text: "text-green-700", ring: "hover:ring-green-300" },
    { bg: "bg-purple-100", text: "text-purple-700", ring: "hover:ring-purple-300" },
    { bg: "bg-yellow-100", text: "text-yellow-700", ring: "hover:ring-yellow-300" },
    { bg: "bg-red-100", text: "text-red-700", ring: "hover:ring-red-300" },
    { bg: "bg-indigo-100", text: "text-indigo-700", ring: "hover:ring-indigo-300" },
    { bg: "bg-pink-100", text: "text-pink-700", ring: "hover:ring-pink-300" }
  ].freeze

  def subject_classes(subject)
    SUBJECT_CLASSES[subject] || DEFAULT_SUBJECT
  end

  def status_classes(status)
    STATUS_CLASSES[status] || DEFAULT_STATUS
  end

  def avatar_classes(index)
    AVATAR_CLASSES[index % AVATAR_CLASSES.size]
  end

  def display_name(user)
    return "Deleted User" if user.nil?
    name = [user.firstname, user.lastname].compact.join(" ")
    name.blank? ? user.email.split("@").first : name
  end

  def display_initials(user)
    return "?" if user.nil?
    initials = [user.firstname, user.lastname].compact.map { |n| n[0] }.join.upcase
    initials.blank? ? user.email[0..1].upcase : initials
  end
end
