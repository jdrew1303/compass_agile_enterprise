module ErpFinancialAccounting
  class Engine < Rails::Engine
    isolate_namespace ErpFinancialAccounting

    #TODO
    #this will be removed once rails 3.2 adds the ability to set the order of engine loading
    engine = self
    config.to_prepare do
      ErpBaseErpSvcs.register_compass_ae_engine(engine)
    end
  end
end
