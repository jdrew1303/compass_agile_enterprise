module ErpTechSvcs
  module Extensions
    module ActiveRecord
      module IsJson

        module Errors

        end

        def self.included(base)
          base.extend(ClassMethods)
        end

        module ClassMethods

          def is_json(attr_name, class_name=nil)
            class_name = if class_name
                           class_name
                         else
                           case ::ActiveRecord::Base.connection.instance_values["config"][:adapter]
                             when 'postgresql'
                             ::ActiveRecord::Coders::NestedHstore
                             else
                               JSON
                           end
                         end


            serialize attr_name, class_name

            extend SingletonMethods
            include InstanceMethods

            # create method to initialize the json field with an empty hash
            define_method("initialize_#{attr_name}_json") do
              if self.new_record?
                send("#{attr_name}=", {})
              end
            end
            after_initialize "initialize_#{attr_name}_json"

            define_method("stringify_keys_for_#{attr_name}_json") do
              send("#{attr_name}=", send(attr_name).stringify_keys)
            end
            before_save "stringify_keys_for_#{attr_name}_json".to_sym
          end

        end

        module SingletonMethods
        end

        module InstanceMethods
        end

      end # IsJson
    end # ActiveRecord
  end # Extensions
end # ErpTechSvcs

