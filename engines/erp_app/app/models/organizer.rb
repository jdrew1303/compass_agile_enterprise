class Organizer < ActiveRecord::Base
  acts_as_app_container

  def self.find_by_user(user)
    find_by_user_and_klass(user, Organizer)
  end
end