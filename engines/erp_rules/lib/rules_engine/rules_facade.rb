# commented out require 'rjb'
# until we are ready to make the switch over to axiom
#require 'rjb'
module RulesEngine
  
  class RulesFacade

    # get the configured rule engine and invoke
    def invoke(ruleset, context, rules_engine_klass)
      t_start= Time.new
      #get the directives
      directivesMap=context[:directives]
      # here we add in any global directives
      if(directivesMap==nil)
        directivesMap=Hash.new;
      end
      # suppress execution context return
      #(we do this for performance reasons since the execution ctx isnt altered
      directivesMap[:suppress_execution_context_return]=true

      # add the directives map to the context
      context[:directives]=directivesMap;
      ## now we invoke the rule facade
      Rails.logger.debug("Invoking RulesFacade")
      Rails.logger.debug("Ruleset:#{ruleset}")
      Rails.logger.debug("context:#{context}")
      #get the name of the rule engine
      Rails.logger.debug("RULE CLASS : #{rules_engine_klass}")

      #we will use eval instead of Kernel.const_get since the rule engines
      # should be namespaced
      if(rules_engine_klass.is_a?(String))
        klass = eval(rules_engine_klass)
      else
        klass = rules_engine_klass
      end
      # create an instance of its singleton
      rule_engine = klass
      
      #invoke the rule engine
      result=rule_engine.invoke(ruleset,context)
      Rails.logger.debug("\n------------------------------------------------------------------------------------------")
      Rails.logger.debug("RULE ENGINE   :#{rule_engine}")
      Rails.logger.debug("\n------------------------------------------------------------------------------------------")
      Rails.logger.debug("INVOKE RESULTS:"+result.to_yaml)
      Rails.logger.debug("\n------------------------------------------------------------------------------------------")
    
      Rails.logger.debug("\n------------------------------------------------------------------------------------------")
      t_end=Time.new
      Rails.logger.debug("Rule invocation time:#{(t_end.to_f-t_start.to_f)} sec")
      Rails.logger.debug("\n------------------------------------------------------------------------------------------")

      return result
      
    end

  end
 
end
