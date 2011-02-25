module ErpServices
	module IsDescribable

		def self.included(base)
      base.extend(ClassMethods)  	        	      	
    end

		module ClassMethods
      
  		def is_describable
        
        has_many :descriptions, :class_name => 'DescriptiveAsset', :as => :described_record, :dependent => :destroy
        
        extend ErpServices::IsDescribable::SingletonMethods
			  include ErpServices::IsDescribable::InstanceMethods
											     			
		  end

		end
  		
		module SingletonMethods			
		end
				
		module InstanceMethods
      def find_descriptions_by_view_type(view_iid)
        self.descriptions.find(:all, :conditions => ['view_type_id = ?', ViewType.find_by_internal_identifier(view_iid).id])
      end
	  end
					
  end
  		
end

ActiveRecord::Base.send(:include, ErpServices::IsDescribable)