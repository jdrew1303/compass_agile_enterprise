Ext.ns("Compass.ErpApp.Organizer.Applications.Crm");

Compass.ErpApp.Organizer.Applications.Crm.Layout = Ext.extend(Ext.Panel, (function() {
    //private member partyId
    var partyId = null;

    return{
        constructor : function(config) {
            var southPanel = new Ext.Panel({
                layout:'fit',
                region:'south',
                autoScroll:true,
                height:300,
                collapsible:true,
                border:false,
                items:[config['southComponent']]
            });

            var centerPanel = new Ext.Panel({
                layout:'fit',
                region:'center',
                autoScroll:true,
                items:[config['centerComponent']]
            })

            config = Ext.apply({
                layout:'border',
                frame: false,
                autoScroll:true,
                region:'center',
                items:[
                centerPanel,
                southPanel
                ]

            }, config);
            Compass.ErpApp.Organizer.Applications.Crm.Layout.superclass.constructor.call(this, config);
        },

        /**
         * set the private member partyId
         * @param {Integer} partyId id to set member partyId to
        */
        setPartyId : function(partyId){
            this.partyId = partyId;
        },

        /**
         * load emails for member partyId
        */
        loadContactMechanisms : function(){
            if(this.partyId == null){
                Ext.Msg.alert('Error', 'Member partyId not set');
            }
            else{
                var contactMechanismGrids = this.findByType('tabpanel')[0].findByType('contactmechanismgrid');
                var numGrids = contactMechanismGrids.length;
                for(var i=0;i<numGrids;i++){
                    var store = contactMechanismGrids[i].getStore();
                    store.setBaseParam('party_id', this.partyId);
                    store.load();
                }
                this.findByType('tabpanel')[0].setActiveTab(0);
            }
        }
    };
}())
    );


Ext.reg('contactslayout', Compass.ErpApp.Organizer.Applications.Crm.Layout);


Compass.ErpApp.Organizer.Applications.Crm.Base = function(config){
    
    var addIndividualWindow = new Ext.Window({
        layout:'fit',
        width:375,
        title:'New Individual',
        height:500,
        closeAction:'hide',
        plain: true,
        items: new Ext.FormPanel({
            labelWidth: 110,
            frame:false,
            bodyStyle:'padding:5px 5px 0',
            width: 425,
            url:'./crm/create_party',
            defaults: {
                width: 225
            },
            items: [
            {
                xtype:'textfield',
                fieldLabel:'Enterprise Identifier',
                allowBlank:true,
                name:'enterprise_identifier'
            },
            {
                xtype:'textfield',
                fieldLabel:'Suffix',
                allowBlank:true,
                name:'current_suffix'
            },
            {
                xtype:'textfield',
                fieldLabel:'Title',
                allowBlank:true,
                name:'current_personal_title'
            },
            {
                xtype:'textfield',
                fieldLabel:'First Name',
                allowBlank:false,
                name:'current_first_name'
            },
            {
                xtype:'textfield',
                fieldLabel:'Middle Name',
                allowBlank:true,
                name:'current_middle_name'
            },
            {
                xtype:'textfield',
                fieldLabel:'Last Name',
                allowBlank:false,
                name:'current_last_name'
            },
            {
                xtype:'textfield',
                fieldLabel:'Nickname',
                allowBlank:true,
                name:'current_nickname'
            },
            {
                xtype:'textfield',
                fieldLabel:'Passport Number',
                allowBlank:true,
                name:'current_passport_number'
            },
            {
                xtype:'datefield',
                fieldLabel:'Passport Expiration Date',
                allowBlank:true,
                name:'current_passport_expire_date'
            },
            {
                xtype:'datefield',
                fieldLabel:'DOB',
                allowBlank:false,
                name:'birth_date'
            },
            {
                xtype:'textfield',
                fieldLabel:'Gender',
                allowBlank:false,
                name:'gender'
            },
            {
                xtype:'textfield',
                fieldLabel:'Total Yrs Work Exp',
                allowBlank:true,
                name:'total_years_work_experience'
            },
            {
                xtype:'textfield',
                fieldLabel:'Marital Status',
                allowBlank:true,
                name:'marital_status'
            },
            {
                xtype:'textfield',
                fieldLabel:'Social Security Number',
                allowBlank:true,
                name:'social_security_number'
            }
            ]
        }),
        buttons: [{
            text:'Submit',
            listeners:{
                'click':function(button){
                    var window = button.findParentByType('window');
                    var formPanel = window.findByType('form')[0];
                    formPanel.getForm().submit({
                        reset:true,
                        params:{
                            party_type:'Individual'
                        },
                        waitMsg:'Creating Individual',
                        success:function(form, action){
                            var response =  Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert("Status", response.message);
                            if(response.success){
                                var individualName = response.individualName;
                                addIndividualWindow.hide();
                                var individualsSearchGrid = Ext.ComponentMgr.get('individualSearchGrid');
                                var store = individualsSearchGrid.getStore();
                                store.setBaseParam("party_name", individualName);
                                store.load();
                            }
                        },
                        failure:function(form, action){
                            var message = 'Error adding individual'
                            if(action.response != null){
                                var response =  Ext.util.JSON.decode(action.response.responseText);
                                message = response.message;
                            }
                            Ext.Msg.alert("Status", message);
                        }
                    });
                }
            }
        },{
            text: 'Close',
            handler: function(){
                addIndividualWindow.hide();
            }
        }]
    });

    var addOrganizationWindow = new Ext.Window({
        layout:'fit',
        width:375,
        title:'New Organization',
        height:160,
        closeAction:'hide',
        plain: true,
        items: new Ext.FormPanel({
            labelWidth: 110,
            frame:false,
            bodyStyle:'padding:5px 5px 0',
            width: 425,
            url:'./crm/create_party',
            defaults: {
                width: 225
            },
            items: [
            {
                xtype:'textfield',
                fieldLabel:'Enterprise Identifier',
                allowBlank:true,
                name:'enterprise_identifier'
            },
            {
                xtype:'textfield',
                fieldLabel:'Tax ID',
                allowBlank:true,
                name:'tax_id_number'
            },
            {
                xtype:'textfield',
                fieldLabel:'Description',
                allowBlank:true,
                name:'description'
            }
            ]
        }),
        buttons: [{
            text:'Submit',
            listeners:{
                'click':function(button){
                    var window = button.findParentByType('window');
                    var formPanel = window.findByType('form')[0];
                    formPanel.getForm().submit({
                        reset:true,
                        waitMsg:'Creating Organization',
                        params:{
                            party_type:'Organization'
                        },
                        success:function(form, action){
                            var response =  Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert("Status", response.message);
                            if(response.success){
                                var organizationName = response.organizationName;
                                addOrganizationWindow.hide();
                                var organizationSearchGrid = Ext.ComponentMgr.get('organizationSearchGrid');
                                var store = organizationSearchGrid.getStore();
                                store.setBaseParam("party_name", organizationName);
                                store.load();
                            }
                        },
                        failure:function(form, action){
                            var message = "Error adding organization"
                            if(action.response != null){
                                var response =  Ext.util.JSON.decode(action.response.responseText);
                                message = response.message;
                            }
                            Ext.Msg.alert("Status", message);
                        }
                    });
                }
            }
        },{
            text: 'Close',
            handler: function(){
                addOrganizationWindow.hide();
            }
        }]
    });

    var menuTreePanel = {
        xtype:'defaultmenutree',
        title:'CRM',
        menuRootIconCls:'icon-content',
        rootNodeTitle:'Contacts',
        treeConfig:{
            loader:{dataUrl:'./crm/menu'},
			listeners:{
                scope:this,
                'contextmenu':function(node, e){
                    if(node.isLeaf()){
                        var contextMenu = null;
                        if(node.id == "individualsNode"){
                            contextMenu = new Ext.menu.Menu({
                                items:[
                                {
                                    text:"Add Individual",
                                    iconCls:'icon-add',
                                    listeners:{
                                        'click':function(){
                                            addIndividualWindow.show();
                                        }
                                    }
                                }
                                ]
                            });
                        }
                        else 
                        if(node.id == "organizationNode"){
                            contextMenu = new Ext.menu.Menu({
                                items:[
                                {
                                    text:"Add Organization",
                                    iconCls:'icon-add',
                                    listeners:{
                                        'click':function(){
                                            addOrganizationWindow.show();
                                        }
                                    }
                                }
                                ]
                            });
                        }
                        contextMenu.showAt(e.xy);
                    }
                }
            }
        }
    };

    var individualsGrid = {
        id:'individualSearchGrid',
        xtype:'partygrid',
        partyType:'Individual',
        listeners:{
            'rowclick':function(grid, rowIndex, e){
                var store = grid.getStore();
                var record = store.getAt(rowIndex);
                var id = record.get("id");
                var contactsLayoutPanel = grid.findParentByType('contactslayout');
                contactsLayoutPanel.setPartyId(id);
                contactsLayoutPanel.loadContactMechanisms();

            },
            'addpartybtnclick':function(btn, grid){
                addIndividualWindow.show();
            }
        }
    };

    var organizationsGrid = {
        id:'organizationSearchGrid',
        xtype:'partygrid',
        partyType:'Organization',
        listeners:{
            'rowclick':function(grid, rowIndex, e){
                var store = grid.getStore();
                var record = store.getAt(rowIndex);
                var id = record.get("id");
                var contactsLayoutPanel = grid.findParentByType('contactslayout');
                contactsLayoutPanel.setPartyId(id);
                contactsLayoutPanel.loadContactMechanisms();
            },
            'addpartybtnclick':function(btn, grid){
                addOrganizationWindow.show();
            }
        }
    };

    var contactPurposeStore = new Compass.ErpApp.Utility.Data.TypeJsonStore({
        url: './crm/contact_purposes',
        xtype:'combobox'
    });

    var individualsPanel = {
        xtype:'contactslayout',
        id:'individuals_search_grid',
        southComponent:{
            xtype:'tabpanel',
            items:[
            {
                xtype:'contactmechanismgrid',
                'title':'Email Addresses',
                contactMechanism:'EmailAddress',
                columns:[
                {
                    header: 'Email Address',
                    dataIndex: 'email_address',
                    editor: {xtype:'textfield'},
                    width:200
                }
                ],
                fields:[
                {
                    name:'email_address',
                    allowBlank: false
                }
                ],
                contactPurposeStore:contactPurposeStore
            },
            {
                xtype:'contactmechanismgrid',
                'title':'Phone Numbers',
                contactMechanism:'PhoneNumber',
                columns:[
                {
                    header: 'Phone Number',
                    dataIndex: 'phone_number',
                    width:200,
                    editor: {xtype:'textfield'}
                }
                ],
                fields:[
                {
                    name:'phone_number',
                    allowBlank: false
                }
                ],
                contactPurposeStore:contactPurposeStore
            },
            {
                xtype:'contactmechanismgrid',
                'title':'Postal Addresses',
                contactMechanism:'PostalAddress',
                columns:[
                {
                    header: 'Address Line 1',
                    dataIndex: 'address_line_1',
                    editor: {xtype:'textfield'},
                    width:200
                },
                {
                    header: 'Address Line 2',
                    dataIndex: 'address_line_2',
                    editor: {xtype:'textfield'},
                    width:200
                },
                {
                    header: 'City',
                    dataIndex: 'city',
                    editor: {xtype:'textfield'},
                    width:200
                },
                {
                    header: 'State',
                    dataIndex: 'state',
                    editor: {xtype:'textfield'},
                    width:200
                }
                ,
                {
                    header: 'Zip',
                    dataIndex: 'zip',
                    editor: {xtype:'textfield'},
                    width:200
                }
                ,
                {
                    header: 'Country',
                    dataIndex: 'country',
                    editor: {xtype:'textfield'},
                    width:200
                }
                ],
                fields:[
                {
                    name: 'address_line_1',
                    allowBlank: false
                },
                {
                    name: 'address_line_2',
                    allowBlank: true
                },
                {
                    dataIndex: 'city',
                    allowBlank: false
                },
                {
                    name: 'state',
                    allowBlank: false
                },
                {
                    name: 'zip',
                    allowBlank: false
                },
                {
                    name: 'country',
                    allowBlank: false
                }
                ],
                contactPurposeStore:contactPurposeStore
            }
            ]
        },
        centerComponent:individualsGrid
    };

    var organizationsPanel = {
        xtype:'contactslayout',
        id:'organizations_search_grid',
        southComponent:{
            xtype:'tabpanel',
            items:[
            {
                xtype:'contactmechanismgrid',
                'title':'Email Addresses',
                contactMechanism:'EmailAddress',
                columns:[
                {
                    header: 'Email Address',
                    dataIndex: 'email_address',
                    editor: {xtype:'textfield'},
                    width:200
                }
                ],
                fields:[
                {
                    name:'email_address',
                    allowBlank: false
                }
                ],
                contactPurposeStore:contactPurposeStore
            },
            {
                xtype:'contactmechanismgrid',
                'title':'Phone Numbers',
                contactMechanism:'PhoneNumber',
                columns:[
                {
                    header: 'Phone Number',
                    dataIndex: 'phone_number',
                    editor: {xtype:'textfield'},
                    width:200
                }
                ],
                fields:[
                {
                    name:'phone_number',
                    allowBlank: false
                }
                ],
                contactPurposeStore:contactPurposeStore
            },
            {
                xtype:'contactmechanismgrid',
                'title':'Postal Addresses',
                contactMechanism:'PostalAddress',
                columns:[
                {
                    header: 'Address Line 1',
                    dataIndex: 'address_line_1',
                    editor: {xtype:'textfield'},
                    width:200
                },
                {
                    header: 'Address Line 2',
                    dataIndex: 'address_line_2',
                    editor: {xtype:'textfield'},
                    width:200
                },
                {
                    header: 'City',
                    dataIndex: 'city',
                    editor: {xtype:'textfield'},
                    width:200
                },
                {
                    header: 'State',
                    dataIndex: 'state',
                    editor: {xtype:'textfield'},
                    width:200
                }
                ,
                {
                    header: 'Zip',
                    dataIndex: 'zip',
                    editor: {xtype:'textfield'},
                    width:200
                }
                ,
                {
                    header: 'Country',
                    dataIndex: 'country',
                    editor: {xtype:'textfield'},
                    width:200
                }
                ],
                fields:[
                {
                    name: 'address_line_1',
                    allowBlank: false
                },
                {
                    name: 'address_line_2',
                    allowBlank: true
                },
                {
                    dataIndex: 'city',
                    allowBlank: false
                },
                {
                    name: 'state',
                    allowBlank: false
                }
                ,
                {
                    name: 'zip',
                    allowBlank: false
                }
                ,
                {
                    name: 'country',
                    allowBlank: false
                }
                ],
                contactPurposeStore:contactPurposeStore
            }
            ]
        },
        centerComponent:organizationsGrid
    };

    contactPurposeStore.load();

    this.setup = function(){
        config['organizerLayout'].addApplication(menuTreePanel, [individualsPanel, organizationsPanel]);
    };
    
};
