module RailsDbAdmin
  module ErpApp
    module Desktop
      class ReportsController < QueriesController

        before_filter :set_file_support

        def index
          if params[:node] == 'root_node'
            setup_tree
          else
            node = File.join(@file_support.root, params[:node])
            report = get_report(params[:node])
            unless report.nil?
              render :json => @file_support.build_tree(node, :file_asset_holder => report, :preload => true)
            else
              render :json => {:success => false, :message => 'Could not find report'}
            end
          end
        end

        def create
          name = params[:name]
          internal_identifier = params[:internal_identifier]

          report = Report.new(:name => name, :internal_identifier => internal_identifier)
          if report.save
            render :json => {:success => true}
          else
            render :json => {:success => false, :msg => 'Error creating report'}
          end
        end

        def edit
          id  = params[:id]

          report = Report.find(id)

          if report
            render :json => {:success => true, :report =>
                {:title => report.name, :id => report.id, :query => report.query,
                 :internalIdentifier => report.internal_identifier, :template => report.template}
            }
          else
            render :json => {:success => false}
          end
        end

        def save
          id  = params[:id]
          query = params[:query]
          template = params[:template]

          report = Report.find(id)

          report.query = query
          report.template = template

          if report.save
            render :json => {:success => true}
          else
            render :json => {:success => false}
          end
        end

        def save_query
          id  = params[:id]
          query = params[:query]

          report = Report.find(id)

          report.query = query

          if report.save
            render :json => {:success => true}
          else
            render :json => {:success => false}
          end
        end

        def delete
          report = Report.find(params[:id])
          if report.destroy
            render :json => {:success => true}
          else
            render :json => {:success => false}
          end
        end

        def create_file
          begin
            path = File.join(@file_support.root, params[:path])
            name = params[:name]

            report = get_report(path)
            report.add_file('#Empty File', File.join(path, name))

            render :json => {:success => true, :node => @file_support.find_node(File.join(path, name), {:file_asset_holder => report})}
          rescue ErpTechSvcs::Utils::CompassAccessNegotiator::Errors::UserDoesNotHaveCapability => ex
            render :json => {:success => false, :message => ex.message}
          end
        end

        def create_folder
          begin
            path = File.join(@file_support.root, params[:path])
            name = params[:name]
            @file_support.create_folder(path, name)
            render :json => {:success => true, :node => @file_support.find_node(File.join(path, name), {keep_full_path: false})}
          rescue ErpTechSvcs::Utils::CompassAccessNegotiator::Errors::UserDoesNotHaveCapability => ex
            render :json => {:success => false, :message => ex.message}
          end
        end


        def update_file
          begin
            path = File.join(@file_support.root, params[:node])
            content = params[:content]
            @file_support.update_file(path, content)
            nodes =  params[:node].split('/')
            if nodes.last == 'base.html.erb'
              report = Report.iid(nodes[nodes.index("compass_ae_reports") + 1])
              report.template = content
              report.save
            end
            render :json => {:success => true}
          rescue ErpTechSvcs::Utils::CompassAccessNegotiator::Errors::UserDoesNotHaveCapability => ex
            render :json => {:success => false, :message => ex.message}
          end
        end

        def save_move
          result = {}
          nodes_to_move = (params[:selected_nodes] ? JSON(params[:selected_nodes]) : [params[:node]])
          begin
            nodes_to_move.each do |node|
              path = File.join(@file_support.root, node)
              new_parent_path = File.join(@file_support.root, params[:parent_node])

              unless @file_support.exists? path
                result = {:success => false, :msg => 'File does not exist.'}
              else
                report_file = get_report_file(path)
                report_file.move(params[:parent_node])
                result = {:success => true, :msg => "#{File.basename(path)} was moved to #{new_parent_path} successfully"}
              end
            end
            render :json => result
          rescue ErpTechSvcs::Utils::CompassAccessNegotiator::Errors::UserDoesNotHaveCapability => ex
            render :json => {:success => false, :message => ex.message}
          end
        end

        def get_contents
          path = File.join(@file_support.root, params[:node])
          contents, message = @file_support.get_contents(path)

          if contents.nil?
            render :text => message
          else
            render :text => contents
          end
        end

        def download_file
          begin
            path = File.join(@file_support.root, params[:path])
            contents, message = @file_support.get_contents(path)

            send_data contents, :filename => File.basename(path)
          rescue ErpTechSvcs::Utils::CompassAccessNegotiator::Errors::UserDoesNotHaveCapability => ex
            render :json => {:success => false, :message => ex.message}
          end
        end

        def upload_file
          begin
            result = {}
            upload_path = params[:directory]
            name = params[:name]
            data = request.raw_post

            report = get_report(upload_path)
            name = File.join(@file_support.root, upload_path, name)

            begin
              report.add_file(data, name)
              result = {:success => true, :node => @file_support.find_node(name, {:file_asset_holder => report})}
            rescue => ex
              logger.error ex.message
              logger.error ex.backtrace.join("\n")
              result = {:success => false, :error => "Error uploading #{name}"}
            end

            render :inline => result.to_json
          rescue ErpTechSvcs::Utils::CompassAccessNegotiator::Errors::UserDoesNotHaveCapability => ex
            render :json => {:success => false, :message => ex.message}
          end
        end

        def delete_file
          messages = []
          nodes_to_delete = (params[:selected_nodes] ? JSON(params[:selected_nodes]) : [params[:node]])
          begin
            result = false
            nodes_to_delete.each do |path|
              begin
                name = File.basename(path)
                result, message, is_folder = @file_support.delete_file(File.join(@file_support.root, path), {force: true})
                if result && !is_folder
                  report_file = get_report_file(path)
                  report_file.destroy
                end
                messages << message
              rescue StandardError => ex
                Rails.logger.error ex.message
                Rails.logger.error ex.backtrace.join("\n")

                ExceptionNotifier.notify_exception(ex) if defined? ExceptionNotifier

                render :json => {:success => false, :error => "Error deleting #{name}"} and return
              end
            end # end nodes_to_delete.each
            if result
              render :json => {:success => true, :message => messages.join(',')}
            else
              render :json => {:success => false, :error => messages.join(',')}
            end
          rescue ErpTechSvcs::Utils::CompassAccessNegotiator::Errors::UserDoesNotHaveCapability => ex
            render :json => {:success => false, :message => ex.message}
          end
        end

        def rename_file
          begin
            result = {:success => true, :data => {:success => true}}
            path = params[:node]
            name = params[:file_name]

            result, message = @file_support.rename_file(File.join(@file_support.root, path), name)
            if result
              report_file = get_report_file(path)
              report_file.name = name
              report_file.save
            end

            render :json => {:success => true, :message => message}
          rescue ErpTechSvcs::Utils::CompassAccessNegotiator::Errors::UserDoesNotHaveCapability => ex
            render :json => {:success => false, :message => ex.message}
          end
        end

        def open_query
          query_name = params[:query_name]
          query = @query_support.get_query(query_name)

          render :json => {:success => true, :query => query}
        end

        def setup_tree
          tree = []
          Report.all.collect do |report|
            report_hash = {
              :text => report.name,
              :reportName => report.name,
              :id => report.id,
              :uniqueName => report.internal_identifier,
              :iconCls => 'icon-content',
              :isReport => true,
              :handleContextMenu => true,
              :children => []
            }

            ['stylesheets', 'images', 'templates', 'query', 'preview_report'].each do |resource_folder|
              report_hash[:children] << {
                  :reportId => report.id,
                  :reportName => report.name,
                  :reportIid => report.internal_identifier,
                  :text => resource_folder.titleize,
                  :iconCls => case resource_folder
                              when 'query'
                                'icon-query'
                              when 'preview_report'
                                'icon-pdf'
                              else
                                'icon-content'
                              end,
                  :id => "#{report.url}/#{resource_folder}",
                  :leaf => (resource_folder == 'query') || (resource_folder == 'preview_report'),
                  :handleContextMenu => (resource_folder == 'query') || (resource_folder == 'preview_report')
              }
              tree << report_hash
            end
          end
          render :json => tree
        end

        def get_report(path)
          reports_index = path.index('reports')
          path = path[reports_index..path.length]
          report_name = path.split('/')[1]
          @report = Report.iid(report_name)
          @report
        end

        def get_report_file(path)
          report = get_report(path)
          file_dir = ::File.dirname(path).gsub(Regexp.new(Rails.root.to_s), '')
          report.files.where('name = ? and directory = ?', ::File.basename(path), file_dir).first
        end

        def set_file_support
          @file_support = ErpTechSvcs::FileSupport::Base.new(:storage => ErpTechSvcs::Config.file_storage)
        end

      end #QueriesController
    end #Desktop
  end #ErpApp
end #RailsDbAdmin
