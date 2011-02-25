module ErpApp
	module ActsAsAppContainer

		def self.included(base)
      base.extend(ClassMethods)
    end

		module ClassMethods

  		def acts_as_app_container
        has_one :app_container, :as => :app_container_record

			  [
          :description,:description=,
          :internal_identifier,
          :internal_identifier=,
          :enabled_applications,
          :applications,
          :applications=,
          :preferences,
          :user_preferences,
          :user_preferences=,
          :user,
          :user=,
          :set_preference,
          :get_preference
        ].each do |m| delegate m, :to => :app_container end

        extend ErpApp::ActsAsAppContainer::SingletonMethods
			  include ErpApp::ActsAsAppContainer::InstanceMethods

		  end

		end

		module SingletonMethods
      def find_by_user_and_klass(user, klass)
        AppContainer.find(:first, :conditions => ['user_id = ? and app_container_record_type = ?', user.id, klass.to_s]).app_container_record
      end
		end

		module InstanceMethods
      def after_create
        self.app_container.save
      end

      def after_initialize
        if self.new_record? && self.app_container.nil?
          app_container = AppContainer.new
          self.app_container = app_container
          app_container.app_container_record = self
        end
      end

      def after_update
        self.app_container.save
      end

      def after_destroy
        if self.app_container && !self.app_container.frozen?
          self.app_container.destroy
        end
      end

	  end

  end

end

ActiveRecord::Base.send(:include, ErpApp::ActsAsAppContainer)