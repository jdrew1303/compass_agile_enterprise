Ext.define("Compass.ErpApp.Shared.ReportsParams", {
    extend: "Ext.panel.Panel",
    alias: 'widget.reportparamspanel',
    params: [],
    bodyPadding: '0 0 0 10',
    layout: {
        type: 'vbox'
    },
    items: [],
    slice: 3,
    initComponent: function(){
        var me = this;
        me.items = [];
        me.params.eachSlice(me.slice, function(slice){
            var container = {
                xtype: 'container',
                layout: 'hbox',
                style: {
                    marginBottom: '5px'
                },
                items: []
            };
            Ext.each(slice, function(param){
                switch(param.type){
                case 'text':
                    container.items.push({
                        xtype: 'textfield',
                        labelWidth: 80,
                        fieldLabel: param.display_name,
                        style: {
                            marginRight: '20px'
                        },
                        name: param.name
                    });
                    break;
                case 'date':
                    container.items.push({
                        xtype: 'datefield',
                        labelWidth: 80,
                        style: {
                            marginRight: '20px'
                        },
                        format: 'm/d/Y',
                        fieldLabel: param.display_name,
                        name: param.name
                    });
                    break;
                case 'select':
                    container.items.push({
                        xtype: 'combo',
                        labelWidth: 80,
                        queryMode: 'local',
                        style: {
                            marginRight: '20px'
                        },
                        fieldLabel: param.display_name,
                        name: param.name,
                        store: (param.select_values == "") ? [] : eval(param.select_values)
                    });
                    break;
                }
            });
            me.items.push(container);
        });


        me.callParent();

    },

    getReportParams: function(){
        var me = this,
            paramsObj = {};
        Ext.Array.each(me.query('field'), function(field){
            // if field has no value set it to empty string to make the erb parser happy
            if(field.value != undefined && Ext.String.trim(field.value.toString()) != ''){
                if(field.xtype == 'textfield' || field.xtype == 'combo'){
                    paramsObj[field.name] = Ext.String.trim(field.value);
                }else{
                    var date = new Date(field.value);
                    date.setHours(23, 59, 59);
                    paramsObj[field.name] = date.toPgDateString();
                }
            }
            else{
                paramsObj[field.name] = '';
            }
        });
        return paramsObj;
    },

    clearReportParams: function(){
        var me = this;
        Ext.each(me.query('field'),function(field){
            field.setValue('');
        });
    }

});
