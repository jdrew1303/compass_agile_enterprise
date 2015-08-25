module RailsDbAdmin
  module Extensions
    module Railties
      module ActionView
        module Helpers
          module ReportHelper

            def report_download_url(report_iid, format)
              raw "/reports/display/#{report_iid}.#{format}"
            end

            def report_download_link(report_iid, format, display=nil)
              display = display || "Download #{format.to_s.humanize}"
              raw "<a target='_blank' href='#{report_download_url(report_iid, format)}'>#{display}</a>"
            end

            def render_template(template, locals=nil)
              render :partial => "/#{template}" , :locals => locals
            end

            def report_stylesheet_link_tag(report_id, *sources)
              report = Report.iid(report_id)
              return("could not find report with the id #{report_id}") unless report

              options = sources.extract_options!.stringify_keys
              cache = options.delete("cache")
              recursive = options.delete("recursive")
              sources = report_expand_stylesheet_sources(report, sources, recursive).collect do |source|
                report_stylesheet_tag(report, source, options)
              end.join("\n")
              raw sources
              #end
            end

            def report_stylesheet_path(report, source)
              report = Report.iid(report) unless report.is_a?(Report)

              name, directory = name_and_path_from_source(source, "#{report.url}/stylesheets")

              file = report.files.where('name = ? and directory = ?', name, directory).first

              file.nil? ? '' : file.data.url
            end

            def name_and_path_from_source(source, base_directory)
              path = source.split('/')
              name = path.last

              directory = if path.length > 1
                            #remove last element
                            path.pop

                            "#{base_directory}/#{path.join('/')}"
                          else
                            base_directory
                          end

              return name, directory
            end

            def report_expand_stylesheet_sources(report, sources, recursive = false)
              if sources.include?(:all)
                all_stylesheet_files = collect_asset_files(report.base_dir + '/stylesheets', ('**' if recursive), '*.css').uniq
              else
                sources.flatten
              end
            end

            def report_stylesheet_tag(report, source, options)
              options = {"rel" => "stylesheet", "type" => Mime::CSS, "media" => "screen",
                         "href" => html_escape(report_stylesheet_path(report, source))}.merge(options)
              tag("link", options, false, false)
            end

            def report_image_tag(report_id, source, options = {})
              report = Report.iid(report_id)
              return("could not find report with the id #{report_id}") unless report

              options.symbolize_keys!
              options[:src] = report_image_path(report, source)
              options[:alt] ||= File.basename(options[:src], '.*').split('.').first.to_s.capitalize

              if size = options.delete(:size)
                options[:width], options[:height] = size.split("x") if size =~ %r{^\d+x\d+$}
              end

              if mouseover = options.delete(:mouseover)
                options[:onmouseover] = "this.src='#{report_image_path(report, mouseover)}'"
                options[:onmouseout] = "this.src='#{report_image_path(report, options[:src])}'"
              end

              tag("img", options)
            end

            def report_image_path(report, source)
              report = Report.iid(report) unless report.is_a?(Report)

              name, directory = name_and_path_from_source(source, "#{report.url}/images")

              file = report.files.where('name = ? and directory = ?', name, directory).first

              file.nil? ? '' : file.data.url
            end

          end #ReportHelper
        end #Helpers
      end #ActionView
    end #Railties
  end #Extensions
end #RailsDbAdmin