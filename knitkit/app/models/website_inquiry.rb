class WebsiteInquiry < ActiveRecord::Base
  belongs_to :website
  belongs_to :user

  has_dynamic_forms
	has_dynamic_data

  def send_email(subject='')
    WebsiteInquiryMailer.inquiry(self, subject).deliver
  end
end
