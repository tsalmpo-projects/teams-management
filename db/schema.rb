# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_16_205545) do
  create_table "assignments", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.date "due_date"
    t.integer "status", default: 0, null: false
    t.integer "subject", null: false
    t.text "title"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_assignments_on_user_id"
  end

  create_table "contacts", force: :cascade do |t|
    t.integer "contact_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["contact_id"], name: "index_contacts_on_contact_id"
    t.index ["user_id"], name: "index_contacts_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.integer "assignment_id"
    t.text "content"
    t.datetime "created_at", null: false
    t.boolean "declined"
    t.boolean "read", default: false, null: false
    t.integer "recipient_id"
    t.integer "sender_id", null: false
    t.integer "team_id"
    t.datetime "updated_at", null: false
    t.index ["assignment_id"], name: "index_messages_on_assignment_id"
    t.index ["recipient_id"], name: "index_messages_on_recipient_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
    t.index ["team_id"], name: "index_messages_on_team_id"
  end

  create_table "team_members", id: false, force: :cascade do |t|
    t.integer "team_id", null: false
    t.integer "user_id", null: false
    t.index ["team_id", "user_id"], name: "index_team_members_on_team_id_and_user_id", unique: true
  end

  create_table "teams", force: :cascade do |t|
    t.integer "assignment_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["assignment_id"], name: "index_teams_on_assignment_id"
    t.index ["user_id"], name: "index_teams_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.text "bio"
    t.datetime "created_at", null: false
    t.integer "department"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.text "firstname"
    t.text "lastname"
    t.string "provider"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "uid"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "assignments", "users"
  add_foreign_key "contacts", "users"
  add_foreign_key "contacts", "users", column: "contact_id"
  add_foreign_key "messages", "assignments"
  add_foreign_key "messages", "teams"
  add_foreign_key "messages", "users", column: "recipient_id"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "teams", "assignments"
  add_foreign_key "teams", "users"
end
