Ext.define("Compass.ErpApp.Desktop.Applications.RailsDbAdmin.Reports.ParamWindow", {
	extend: 'Ext.window.Window',
	alias: 'widget.railsdbadminreportsparamwindow',
	title: 'Add Param',
	modal: true,
	height: 500,
	width: 400,
	buttonAlign: 'center',

	isAdd: false,
	paramsManager: null,
	param: null,

	buttons: [{
		text: 'Add',
		itemId: 'okBtn',
		handler: function(btn) {
			var me = btn.up('window');

			var grid = me.paramsManager.down('grid');
			var form = me.down('form');

			if (form.isValid()) {
				var values = form.getValues();

				var options = {};
				for (var key in values) {
					if (key.match(/options_.+/)) {
						options[key.split('_').last()] = values[key];
					}
				}

				if (me.isAdd) {
					grid.getStore().add({
						display_name: values.display_name,
						name: values.name,
						type: values.type,
						required: (values.required == 'on'),
						options: options
					});
				} else {
					me.param.set('display_name', values.display_name);
					me.param.set('name', values.name);
					me.param.set('type', values.type);
					me.param.set('required', (values.required == 'on'));
					me.param.set('default_value', values.default_value);
					me.param.set('options', options);
					me.param.commit(false);
				}

				me.paramsManager.save();

				me.hide();
			}
		}
	}, {
		text: 'Cancel',
		handler: function(btn) {
			var window = btn.up('window');

			window.hide();
		}
	}],

	initComponent: function() {
		var me = this;

		var fieldTypeStore = Ext.create('Ext.data.Store', {
			fields: ['name', 'type'],
			data: [{
				name: 'Text',
				type: 'text'
			}, {
				name: 'Date',
				type: 'date'
			}, {
				name: 'Time',
				type: 'time'
			}, {
				name: 'Select',
				type: 'select'
			}, {
				name: 'Data Record',
				type: 'data_record'
			}, {
				name: 'Service',
				type: 'service'
			}]
		});

		me.items = [{
			xtype: 'form',
			bodyPadding: 10,
			layout: 'form',
			items: [{
				xtype: 'textfield',
				fieldLabel: 'Display Name',
				itemId: 'paramDisplayName',
				name: 'display_name',
				allowBlank: false
			}, {
				xtype: 'textfield',
				fieldLabel: 'Name',
				itemId: 'paramName',
				regex: /^(?!.*\s).*$/,
				regexText: 'Spaces not allowed',
				name: 'name',
				allowBlank: false
			}, {
				xtype: 'checkbox',
				fieldLabel: 'Required',
				name: 'required'
			}, {
				xtype: 'combobox',
				fieldLabel: 'Type',
				itemId: 'paramType',
				name: 'type',
				allowBlank: false,
				store: fieldTypeStore,
				queryMode: 'local',
				displayField: 'name',
				valueField: 'type',
				value: 'text',
				listeners: {
					select: function(combo, records, eOpts) {
						me.selectType(records[0].get('type'));
					}
				}
			}, {
				xtype: 'container',
				itemId: 'optionsContainer',
				layout: 'form'
			}]
		}];

		this.callParent(arguments);

		if (!me.isAdd) {
			me.down('form').getForm().setValues(me.param.data);
			me.down('#okBtn').setText('Save');
			me.setTitle('Edit Param');
			me.selectType(me.param.get('type'));
		}

		me.on('show', function() {
			me.down('#paramDisplayName').focus();
		});
	},

	selectType: function(type) {
		var me = this;
		var form = me.down('form');
		var defaultsContainer = form.down('#defaultsContainer');
		var optionsContainer = form.down('#optionsContainer');

		optionsContainer.removeAll();

		switch (type) {
			case 'text':
				optionsContainer.show();
				break;
			case 'date':
				optionsContainer.add(me.buildOptionsDateField(optionsContainer));
				optionsContainer.show();
				break;
			case 'time':
				optionsContainer.show();
				break;
			case 'select':
				optionsContainer.add(me.buildOptionsSelectField(optionsContainer));
				optionsContainer.show();
				break;
			case 'data_record':
				optionsContainer.add(me.buildOptionsDataRecordField(optionsContainer));
				optionsContainer.show();
				break;
			case 'service':
				optionsContainer.add(me.buildOptionsServiceUrlField(optionsContainer));
				optionsContainer.show();
				break;
		}
	},

	/**
	 * Build options for Date field
	 * @param container (Object) Container component
	 */
	buildOptionsDateField: function(container) {
		var options = {},
			me = this;

		if (me.param) {
			options = me.param.get('options');
		}

		return [{
			xtype: 'checkbox',
			fieldLabel: 'Only allow week selection',
			name: 'options_onlyWeeks',
			itemId: 'optionOnlyWeeks',
			value: options.onlyWeeks,
			listeners: {
				change: function(field, newValue) {
					if (newValue) {
						field.up('form').down('#optionOnlyMonths').setValue(false);
					}
				}
			}
		}, {
			xtype: 'checkbox',
			fieldLabel: 'Only allow month selection',
			name: 'options_onlyMonths',
			itemId: 'optionOnlyMonths',
			value: options.onlyMonths,
			listeners: {
				change: function(field, newValue) {
					if (newValue) {
						field.up('form').down('#optionOnlyWeeks').setValue(false);
					}
				}
			}
		}];
	},

	/**
	 * Builds applicationmanagementmultioptions (grid panel)
	 * @param container (Object) Container component
	 */
	buildOptionsSelectField: function(container) {
		var options = {
				values: []
			},
			me = this;

		if (me.param) {
			options = me.param.get('options');
		}

		return [{
			xtype: 'checkbox',
			fieldLabel: 'Multi-Select',
			name: 'options_multiSelect',
			value: options.multiSelect
		}, {
			xtype: 'container',
			layout: 'form',
			items: [{
				xtype: 'applicationmanagementmultioptions',
				header: false,
				name: 'options_values',
				field: {
					xtype: 'combo',
					internalIdentifier: 'select',
					store: Ext.create('Ext.data.Store', {
						fields: ['display'],
						data: Ext.Array.map(eval(options.values || '[]'), function(item) {
							return {
								display: item
							};
						})
					}),
					queryMode: 'local'
				}
			}]
		}];
	},

	/**
	 * Builds two select fields Select Application and Select Module
	 * @param container (Object) Container component
	 */
	buildOptionsDataRecordField: function(container) {
		var options = {},
			me = this;

		if (me.param) {
			options = me.param.get('options');
		}

		return [{
			xtype: 'checkbox',
			fieldLabel: 'Multi-Select',
			name: 'options_multiSelect',
			value: options.multiSelect
		}, {
			xtype: 'combo',
			name: 'options_appType',
			itemId: 'applicationSelect',
			fieldLabel: 'App',
			emptyText: 'Select Application',
			allowBlank: false,
			store: {
				autoLoad: true,
				proxy: {
					type: 'ajax',
					method: 'GET',
					url: '/api/v1/applications',
					reader: {
						type: 'json',
						root: 'applications'
					},
					extraParams: {
						types: 'app'
					},
				},
				fields: [
					'description',
					'id'
				],
				listeners: {
					load: function() {
						if (options.appType) {
							var appSelect = container.down('#applicationSelect');
							appSelect.setValue(options.appType);
						}
					}
				}
			},
			forceSelection: true,
			typeAhead: true,
			queryMode: 'remote',
			displayField: 'description',
			valueField: 'id',
			listeners: {
				select: function(combo, records, eOpts) {
					container.down('#businessModule').enable();
					container.down('#businessModule').store.load({
						params: {
							application_id: records[0].get('id')
						}
					});
				},
				change: function(combo, newValue, oldValue, eOpts) {
					container.down('#businessModule').enable();
					container.down('#businessModule').store.load({
						params: {
							application_id: newValue
						}
					});
				}
			}
		}, {
			xtype: 'combo',
			name: 'options_businessModule',
			itemId: 'businessModule',
			disabled: true,
			forceSelection: true,
			emptyText: 'Select Module',
			store: {
				autoLoad: false,
				proxy: {
					url: '/erp_app/desktop/application_management/business_modules/existing_application_modules',
					type: 'ajax',
					reader: {
						type: 'json',
						root: 'business_modules'
					}
				},
				fields: [{
					name: 'description'
				}, {
					name: 'internalIdentifier',
					mapping: 'internal_identifier'
				}],
				listeners: {
					load: function() {
						if (options.businessModule) {
							var moduleType = container.down('#businessModule');
							moduleType.setValue(options.businessModule);
						}
					}
				}
			},
			displayField: 'description',
			valueField: 'internalIdentifier',
			fieldLabel: 'Module',
			allowBlank: false,
			triggerAction: 'all',
			queryMode: 'local'
		}];
	},

	/**
	 * Build options for Service Url field
	 * @param container (Object) Container component
	 */
	buildOptionsServiceUrlField: function(container) {
		var options = {},
			me = this;

		if (me.param) {
			options = me.param.get('options');
		}

		return [{
			xtype: 'checkbox',
			fieldLabel: 'Multi-Select',
			name: 'options_multiSelect',
			value: options.multiSelect
		}, {
			xtype: 'textfield',
			fieldLabel: 'URL',
			allowBlank: false,
			name: 'options_url',
			value: options.url
		}, {
			xtype: 'textfield',
			fieldLabel: 'Root',
			allowBlank: false,
			name: 'options_root',
			value: options.root
		}, {
			xtype: 'textfield',
			fieldLabel: 'Display Field',
			allowBlank: false,
			name: 'options_displayField',
			value: options.displayField
		}, {
			xtype: 'textfield',
			fieldLabel: 'Value Field',
			allowBlank: false,
			name: 'options_valueField',
			value: options.valueField
		}];
	}
});