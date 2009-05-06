Ext.ux.EnhancedGridPanel = Ext.extend(Ext.grid.GridPanel,
				      {

					initComponent: function() {

					  this.store.on('datachanged', function() {
							  this.refreshItemCount.call(this);
							}, this);


					  Ext.apply(this, {
						      stripeRows: true,
						      stripeRows: true,
						      frame: false,
						      viewConfig: {
							forceFit: true
						      },
						      loadMask: true,
						      tbar: this.tbar ? this.tbar : [{xtype: 'tbtext', text: ' '}], // place holder to ensure it gets rendered
						      bbar: this.bbar ? this.bbar : [{xtype: 'tbtext', text: ' '}]  // place holder to ensure it gets rendered
						    });

					  Ext.ux.EnhancedGridPanel.superclass.initComponent.call(this);
					},

					onRender: function(ct, position) {
					  Ext.ux.EnhancedGridPanel.superclass.onRender.call(this, ct, position);

					  // add search text box
					  this.addSearch();

					  // map shortcut keys
					  this.addKeyMappings();

					  // update the item count
					  this.refreshItemCount();

					  // set focus to the search box and clear it
					  this.focusSearch();
					},

					searchTextFieldKeyPressHandler: function(textfield, e){
					  if (e.getKey() == Ext.EventObject.TAB) {
					    this.getSelectionModel().selectFirstRow();
					  } else {
					    // singleton instance of DelayedTask
					    this._delayedTask = this._delayedTask ? this._delayedTask : new Ext.util.DelayedTask();
					    this._delayedTask.cancel();
    					    this._delayedTask.delay(250, function(that){
    								      that.store.clearFilter();
    								      q = textfield.getValue();

    								      // handle special case for performance improvement
    								      if (q.trim() == '') {
    									return;
    								      }

    								      var searches = [];

    								      // specific field search. e.g. title:ruby
    								      if (q.match(/:/)) {
									queries = q.split('|');
									for (i = 0; i < queries.length; i++) {
									  if (queries[i].trim() != '') {
									    parts = queries[i].trim().split(':');
									    searches.push({name: parts[0], regexp: new RegExp(parts[1], 'gim')});
									  }
									}
    								      }

    								      that.store.filterBy(function(record, id) {
    											    if (searches.length == 0) { // search all fields for a match
											      var re = new RegExp( (q == "") ? '.*' : q, 'gim');
         										      var match = false;

         										      var key_names = [];
         										      for (var key in record.data) {
         											if (record.data.hasOwnProperty(key)) {
         											  key_names.push(key);
         											}
         										      }

     											      Ext.each(key_names, function(key, index, allItems) {
     													 match = match || record.data[key].match(re);
     												       });

     											      return match;
    											    } else { // search specified fields for a match
    											      result = false;
    											      Ext.each(searches, function(search, index, allItems){
    													 result = result || record.data[search.name].match(search.regexp);
    												       });
    											      return result;
    											    }
    											  });
    								    }, this, [this]);
					  }
					},

					addSearch: function() {
					  var tbar = this.getTopToolbar();
					  tbar.add({xtype: 'tbfill'});
					  tbar.addText('search:');

					  var s = new Ext.form.TextField({});
					  s.enableKeyEvents = true;

					  s.on('keydown', this.searchTextFieldKeyPressHandler, this);

					  tbar.add(s);

					  // add to object
					  this.searchTextField = s;
					},

					focusSearch: function() {
					  this.searchTextField.focus();
					  this.searchTextField.setValue('');
					},

					addKeyMappings: function() {

    					  var km = new Ext.KeyMap(this.getGridEl(), [
    								    {
								      key: "sS",
								      ctrl: true,
								      fn: this.focusSearch,
								      scope: this
								    }
								  ]);

					  // ensure the key does not propagate up (e.g. it was getting put in a text field etc.)
					  km.stopEvent = true;

	  				  this.getGridEl().on('keypress', function(e) {
								if (e.getKey() == Ext.EventObject.ENTER) {
								  e.stopEvent();
								}
							      });

					  this.keyMap = km;

					},

					refreshItemCount: function() {
					  this.getBottomToolbar().items.first().getEl().innerHTML = this.store.getCount() + ' item(s)';
					}

				      });
Ext.reg('enhancedgridpanel', Ext.ux.EnhancedGridPanel);
