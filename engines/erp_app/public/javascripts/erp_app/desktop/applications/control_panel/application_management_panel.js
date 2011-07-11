Ext.define("Compass.ErpApp.Desktop.Applications.ControlPanel.ApplicationManagementPanel",{
    extend:"Ext.Panel",
    alias:"widget.controlpanel_applicationmanagementpanel",
    setWindowStatus : function(status){
        this.findParentByType('statuswindow').setStatus(status);
    },
    
    clearWindowStatus : function(){
        this.findParentByType('statuswindow').clearStatus();
    },

    selectApplication: function(applicationId){
        this.settingsCard.removeAll(true);
        var form = new Compass.ErpApp.Shared.PreferenceForm({
            url:"./control_panel/application_management/update/" + applicationId,
            setupPreferencesUrl:"./control_panel/application_management/setup/" + applicationId,
            loadPreferencesUrl:"./control_panel/application_management/preferences/" + applicationId,
            width:350,
            defaults:{
                width:150
            },
            region:'center',
            listeners:{
                'beforeAddItemsToForm':function(form, preferenceTypes){
                    
                },
                'beforeSetPreferences':function(form,preferences){
                   
                },
                'afterUpdate':function(form,preferences, response){
                    var responseObj = Ext.decode(response.responseText);
                    if(responseObj.success){
                        if(responseObj.shortcut == 'yes')
                        {
                            Ext.get(responseObj.shortcutId + '-shortcut').applyStyles('display:block');
                        }
                        else
                        {
                            Ext.get(responseObj.shortcutId + '-shortcut').applyStyles('display:none');
                        }
                    }
                    else{
                        Ext.Msg.alert('Status', 'Error updating application settings.');
                    }
                }
            }
        });

        this.settingsCard.add(form);
        this.settingsCard.getLayout().setActiveItem(0);
        form.setup();
    },

    initComponent: function() {
        Compass.ErpApp.Desktop.Applications.ControlPanel.ApplicationManagementPanel.superclass.initComponent.call(this, arguments);
    },

    constructor : function(config) {

        var store = Ext.create('Ext.data.TreeStore', {
            proxy: {
                type: 'ajax',
                url: './control_panel/application_management/current_user_applcations'
            },
            root: {
                text: 'Applications',
                expanded: true
            }
        });

        this.applicationsTree = Ext.create('Ext.tree.Panel', {
            store: store,
            width:200,
            height:200,
            region:'west',
            useArrows: true,
            border: false,
            listeners:{
                scope:this,
                'itemclick':function(view, record){
                    if(record.get('leaf'))
                    {
                        this.selectApplication(record.get('id'));
                    }
                }
            }

        });

        this.settingsCard = new Ext.Panel({
            layout:'card',
            region:'center',
            autoDestroy:true
        });

        config = Ext.apply({
            title:'Applications',
            layout:'border',
            items:[this.applicationsTree, this.settingsCard]
        }, config);

        Compass.ErpApp.Desktop.Applications.ControlPanel.ApplicationManagementPanel.superclass.constructor.call(this, config);
    }
});



