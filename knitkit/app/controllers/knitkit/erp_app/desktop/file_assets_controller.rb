module Knitkit
  module ErpApp
    module Desktop
      class FileAssetsController < ::ErpApp::Desktop::FileManager::BaseController
        before_filter :set_asset_model
        
        def base_path
          @base_path = nil
          if @context == :website
            @base_path = File.join(Rails.root, "/public", "/sites/site-#{@assets_model.id}", "files") unless @assets_model.nil?
          else
            @base_path = File.join(Rails.root, "/public", "files") unless @assets_model.nil?
          end
        end

        def expand_directory
          @assets_model.nil? ? (render :json => []) : expand_file_directory(params[:node], :folders_only => false)
        end
        
        def create_file
          path = params[:path] == 'root_node' ? base_path : params[:path]
          name = params[:name]

          @assets_model.add_file('#Empty File', File.join(path,name))

          render :json => {:success => true}
        end

        def upload_file
          result = {}
          upload_path = request.env['HTTP_EXTRAPOSTDATA_DIRECTORY'].blank? ? params[:directory] : request.env['HTTP_EXTRAPOSTDATA_DIRECTORY']
          name = request.env['HTTP_X_FILE_NAME'].blank? ? params[:file_data].original_filename : request.env['HTTP_X_FILE_NAME']          
          data = request.env['HTTP_X_FILE_NAME'].blank? ? params[:file_data] : request.raw_post
          
          begin
            upload_path == 'root_node' ? @assets_model.add_file(data, File.join(base_path,name)) : @assets_model.add_file(data, upload_path)
            result = {:success => true}
          rescue Exception=>ex
            logger.error ex.message
            logger.error ex.backtrace.join("\n")
            result = {:success => false, :error => "Error uploading file."}
          end
          
          #the awesome uploader widget whats this to mime type text, leave it render :inline
          render :inline => result.to_json
        end
        
        def save_move
          result          = {}
          path            = params[:node]
          new_parent_path = params[:parent_node]
          new_parent_path = base_path if new_parent_path == ROOT_NODE

          unless File.exists? path
            result = {:success => false, :msg => 'File does not exists'}
          else
            file_asset_path = path.gsub!(Rails.root.to_s,'')
            file = @assets_model.files.where('name = ? and directory = ?', ::File.basename(file_asset_path), ::File.dirname(file_asset_path)).first
            file.move(new_parent_path.gsub(Rails.root.to_s,''))
            result = {:success => true, :msg => "#{File.basename(path)} was moved to #{new_parent_path} successfully"}
          end

          render :json => result
			  end

        def delete_file
          path = params[:node]
          result = {}
          begin
            if File.directory? path
              result = Dir.entries(path) == [".", ".."] ? (FileUtils.rm_rf(path);{:success => true, :error => "Directory deleted."}) : {:success => false, :error => "Directory is not empty."}
            else
              unless File.exists? path
                result = {:success => false, :error => "File does not exists"}
              else
                name = File.basename(path)
                path = path.gsub!(Rails.root.to_s,'')
                file = @assets_model.files.where('name = ? and directory = ?', ::File.basename(path), ::File.dirname(path)).first
                file.destroy
                result = {:success => true, :error => "#{name} was deleted successfully"}
              end
            end
          rescue Exception=>ex
            logger.error ex.message
            logger.error ex.backtrace.join("\n")
            result = {:success => false, :error => "Error deleting #{name}"}
          end
          render :json => result
        end

        def rename_file
          result = {:success => true, :data => {:success => true}}
          path = params[:node]
          name = params[:file_name]

          unless File.exists? path
            result = {:success => false, :data => {:success => false, :error => 'File does not exists'}}
          else
            path = path.gsub!(Rails.root.to_s,'')
            file = @assets_model.files.where('name = ? and directory = ?', ::File.basename(path), ::File.dirname(path)).first
            file.rename(name)
          end

          render :json => result
        end
        
        protected

        def set_asset_model
          @context = params[:context].to_sym
          @context == :website ? (@assets_model = params[:website_id].blank? ? nil : Website.find(params[:website_id])) : (@assets_model = CompassAeInstance.first)
          ((render :inline => {:success => false, :error => "No Website Selected"}.to_json) if (@assets_model.nil?)) if (params[:action] != "base_path" and @context == :website)
        end
  
      end
    end
  end
end
