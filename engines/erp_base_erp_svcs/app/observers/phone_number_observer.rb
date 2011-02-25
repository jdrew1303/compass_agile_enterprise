class PhoneNumberObserver < ActiveRecord::Observer
  def after_save(phone_number)
    begin
      #Rescued because callbacks on postal address create has a contact but
      #may not have a party yet
      #PartySearchFact.update_search_fact(phone_number.contact.party) #Commented out due to custom OlPartySearchFact
      OlPartySearchFact.update_search_fact(phone_number.contact.party)
    rescue
    end
  end

  def after_destroy(phone_number)
    begin
      party = Party.find(phone_number.contact.party.id)
      #Rescued because callbacks on postal address create has a contact but
      #may not have a party yet
      #PartySearchFact.update_search_fact(party) #Commented out due to custom OlPartySearchFact
      OlPartySearchFact.update_search_fact(party)
    rescue
    end
  end
end