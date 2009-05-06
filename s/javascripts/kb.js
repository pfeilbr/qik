//
// Uses Managed IFrame[Panel] extjs extension
// http://extjs.com/learn/Extension:ManagedIframe
//

Ext.onReady(
  function() {
    Ext.QuickTips.init();

    // ************************************************************************
    // build out namespace
    var ws = {}; // Workspace
    ws.ItemList = {};
    ws.ItemView = {};
    ws.ItemEdit = {};
    ws.ItemSearch = {};

    ws.ItemListKeyMap = null;
    ws.ItemViewKeyMap = null;
    ws.ItemEditKeyMap = null;

    ws.viewHeight = 600;

    // ************************************************************************
    // view navigation convienence functions
    ws.hideAll = function() {
      ws.ItemList.hide();
      ws.ItemView.hide();
      ws.ItemEdit.hide();
    };

    ws.showItemList = function() {
      ws.hideAll();
      ws.ItemList.show();
      ws.ItemList.getGridEl().focus(); // set focus to the grid so navigation and shortcut keys work
      ws.Viewport.doLayout();
    };

    ws.showItemView = function() {
      ws.hideAll();
      ws.ItemView.show();
      ws.Viewport.doLayout();
    };

    ws.showItemEdit = function() {
      ws.hideAll();
      ws.ItemEdit.show();
      form = ws.ItemEdit.getForm();

      // set focus to the field most likely to be edited
      if (form.newItem) { // new item, so add title 1st
 	form.findField('title').focus();
      } else { // existing item, so edit body
 	form.findField('body').enable();
 	form.findField('body').focus();
      }
      ws.Viewport.doLayout();
    };

    ws.focusItemSearch = function() {
      ws.ItemSearch.focus();
      ws.ItemSearch.setValue(''); //clear search
    };

    ws.focusItemViewSearch = function() {
      ws.ItemViewSearch.focus();
      ws.ItemViewSearch.setValue(''); //clear search
    };

    ws.bodyRenderer = function(value, metadata, record, rowIndex, colIndex, store) {
      return value ? InstaView.convert(value) : '';
    };

    // ************************************************************************
    // item actions
    ws.viewItem = function () {
      var data = ws.ItemList.getSelectionModel().getSelected().data;
      ws.showItemView();
      ws.ItemView.setTitle(data.title);
      /*
       contentEl = ws.ItemView.body.first();
       if (contentEl) {
       contentEl.remove();
       }
       ws.ItemView.body.createChild('<div>' + textilize(data.body) + '</div>');
       */

      ws.ItemView.getFrame().update('<div>' + InstaView.convert(data.body) + '</div>');
      toolbar = ws.ItemView.getTopToolbar();

      // remove any previous items from the toolbar
      toolbar.items.each(function(o) {
			   o.destroy();
			 })
      //toolbar.add({xtype: 'tbfill'});

      // add action buttons
      toolbar.add({xtype: 'tbbutton', text: 'Edit', handler: ws.editItem});
      toolbar.add({xtype: 'tbbutton', text: 'Close', handler: ws.showItemList})

      // add separator
      toolbar.add({xtype:'tbseparator'});

      // show items tags
      toolbar.addText('tags: ' + data.tags);

      toolbar.add({xtype: 'tbfill'}); // forces search to be right aligned (ref Ext.Toolbar.Fill)
      toolbar.addText('search:');
      ws.ItemViewSearch = new Ext.form.TextField({});
      ws.ItemViewSearch.enableKeyEvents = true;
      ws.ItemViewSearch.on('keypress', function(textField, e) {
			     // TODO: add search functionality
			     ws.ItemViewSearch.getValue()
    			     if (e.getKey() == Ext.EventObject.TAB) {
  			       ws.ItemList.getSelectionModel().selectFirstRow();
  			       //e.stopEvent();
  			     }
			   });

      toolbar.addField( ws.ItemViewSearch );

      // set focus to search field since this will be the most likely operation the user will want
      ws.focusItemViewSearch()
    };

    ws.addItem = function(){
      form = ws.ItemEdit.getForm();
      form.newItem = true;
      form.setValues({
  		       title: '',
  		       body: '',
  		       tags: ''
  		     });
      ws.showItemEdit();
    };

    ws.editItem = function(){
      data = ws.ItemList.getSelectionModel().getSelected().data;
      form = ws.ItemEdit.getForm();
      form.newItem = false;
      form.setValues({
  		       title: data.title,
  		       body: data.body,
  		       tags: data.tags
  		     });
      ws.showItemEdit();
    };

    ws.saveItem = function () {
      var form = ws.ItemEdit.getForm();
      var item = form.getValues();

      if (form.newItem) {
	Ext.Ajax.request({
			   url: '/items.json',
			   method: 'POST',
			   jsonData: item,
			   success: function(response,config) {
			     var o = Ext.util.JSON.decode(response.responseText);
			     var i = new ws.ItemRecord({
							 pk: o.pk,
							 title: o.title,
							 body: o.body,
							 tags: o.tags,
							 modified: o.modified,
							 encoding: o.encoding
						       });
			     ws.ItemStore.insert(0, i);
			     ws.showItemList();
			   }
			 });
      }
      else {
	var record = ws.ItemList.getSelectionModel().getSelected();
	Ext.Ajax.request({
			   url: '/items/' + record.data.pk + '.json',
			   method: 'PUT',
			   jsonData: item,
			   success: function(response, config) {
			     var o = Ext.util.JSON.decode(response.responseText);
			     record.set('title', o.title);
			     record.set('body', o.body);
			     record.set('tags', o.tags);
			     record.commit();
			     ws.showItemList();
			   }
			 });

      }
    };

    ws.deleteItem = function(){
      record = ws.ItemList.getSelectionModel().getSelected();

      Ext.Msg.show({
  		     title: 'Delete item?',
  		     msg: 'Are you sure you wish to delete "' + record.data.title + '"',
  		     buttons: Ext.Msg.YESNOCANCEL,
  		     fn: function(buttonId){
  		       if (buttonId == 'ok' || buttonId == 'yes') {
  			 Ext.Ajax.request({
  					    url: '/items/' + record.data.pk + '.json',
  					    method: 'DELETE',
  					    success: function(response, options) {
  				              ws.ItemStore.remove(record);
					    }
					  });
  		       }
  		     },
  		     icon: Ext.MessageBox.QUESTION
  		   });
    };
    // ************************************************************************

    //ws.ItemView = new Ext.Panel({
    ws.ItemView = new Ext.ux.ManagedIframePanel({
  						  layout:'fit',
  						  fitToParent: true,
						  height: ws.viewHeight,
						  autoScroll: true,
						  header: true,
						  footer: true,
						  tbar: new Ext.Toolbar({})
						 });

    ws.ItemView.on('documentloaded', function() {
		     ws.ItemViewKeyMap = ws.ItemViewKeyMap || new Ext.KeyMap(ws.ItemView.getEl(), [
							  {
							    key: 'e',
							    ctrl: true,
							    fn: ws.editItem
							  },
							{
							    key: 'c',
							    ctrl: true,
							    fn: ws.showItemList
							  }
							]);
		     ws.ItemViewKeyMap.stopEvent = true;
		   });


    // ************************************************************************
    // define item data source and it's structure
    ws.ItemStore = new Ext.data.JsonStore({
					    url: '/items.json',
					    root: '',
					    fields: ['pk', 'title', 'encoding', 'body', 'tags', 'modified'],
					    sortInfo: {field: 'modified', direction: 'DESC'} // show recently modified items 1st
					  });

    // define the schema of our item records
    ws.ItemRecord = Ext.data.Record.create([
					     {name: 'pk', type: 'string'},
					     {name: 'title', type: 'string'},
					     {name: 'encoding', type: 'string'},
					     {name: 'body', type: 'string'},
					     {name: 'tags', type: 'string'},
					     {name: 'modified', type: 'string'}
					   ]);

    ws.ItemStore.on('datachanged', function() {
		      updateStatusbarItemCount();
		    });

    ws.ItemColumnModel = new Ext.grid.ColumnModel([
						    {id:'pk', hidden: true, header: "PK", width: 160, sortable: true, dataIndex: 'pk'},
						    {header: 'Title', width: 75, sortable: true, dataIndex: 'title'},
						    //{header: "Body", width: 75, sortable: true, dataIndex: 'body', renderer: ws.bodyRenderer},
						    {header: 'Tags', width: 75, sortable: true, dataIndex: 'tags'},
						    {header: 'Modified', width: 75, sortable: true, dataIndex: 'modified'}
						  ]);

    function updateStatusbarItemCount() {
      ws.ItemListStatusBarTextItem.getEl().innerHTML = ws.ItemStore.getCount() + ' item(s)';
    }

    ws.ItemListStatusBarTextItem = new Ext.Toolbar.TextItem('');

    // create the Grid
    ws.ItemList = new Ext.ux.EnhancedGridPanel({
						 store: ws.ItemStore,
						 cm: ws.ItemColumnModel,
						 sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
						 stripeRows: true,
						 loadMask: true,
						 stripeRows: true,
						 autoExpandColumn: 'title',
						 width: 800,
						 height: ws.viewHeight,
						 title:'Personal Knowledge Base',
						 frame: false,
						 viewConfig: {
						   forceFit: true
						 },
						 tbar: [
						   {
						     text: 'View',
						     handler: ws.viewItem
						   },
						   {
						     text: 'Add',
						     handler: ws.addItem
						   },
						   /*
						    {
	  					    text: 'show',
						    handler: function() {
						    data = ws.ItemList.getSelectionModel().getSelected().data;
						    alert( Ext.encode(data) );
						    ws.showItemView();
	  					    }
						    },
						    {
						    text: 'Collapse',
						    handler: function() {
						    ws.ItemList.collapse(true);
						    }
						    },
						    {
						    text: 'append rows',
						    handler: function() {
						    ws.ItemStore.loadData({
						    items: [
						    {id: '33', title: 'hey', body: 'qwerty', tags: 'we we'},
						    {id: '34', title: 'school', body: 'saint stans', tags: 'one two three'}
						    ]
						    }, true);
						    }
						    },
						    */
						   {
						     text: 'Edit',
						     handler: ws.editItem
						   },
						   {
	  					     text: 'Delete',
						     handler: ws.deleteItem
						   }
						 ],
						 bbar: [ws.ItemListStatusBarTextItem]
					       });

    // load item data
    ws.ItemStore.load();


    // TODO: put item show logic here
    ws.ItemList.on('rowdblclick', function(grid, index, e){
		     ws.viewItem();
		   });

    // **** This is a HACK - figure out how to do this right
    // Keyboard shortcuts for ItemList
    ws.ItemList.getSelectionModel().on('rowselect', function(sm, rowIdx, r) {
					 ws.ItemListKeyMap = ws.ItemListKeyMap || new Ext.KeyMap(ws.ItemList.getGridEl(), [
									      {
										key: "vV",
										ctrl: true,
										fn: ws.viewItem
									      },
									      {
										key: "aA",
										ctrl: true,
										fn: ws.addItem
									      },
									      {
	 									key: "eE",
										ctrl: true,
										fn: ws.editItem,
									      },
									      {
										key: "dD",
										ctrl: true,
										fn: ws.deleteItem
									      },
									      {
										key: "sS",
										ctrl: true,
										fn: ws.focusItemSearch
									      }
									    ]);

					 // ensure the key doesn't propagate up (e.g. it was getting put in a text field etc.)
					 ws.ItemListKeyMap.stopEvent = true;

	  				 ws.ItemList.getGridEl().on('keypress', function(e){
								      if (e.getKey() == Ext.EventObject.ENTER) {
									ws.viewItem();
									e.stopEvent();
								      }
								    });

				       });


    ws.ItemList.render(Ext.getBody());
    ws.ItemList.getSelectionModel().selectFirstRow();
    ws.ItemSearch = ws.ItemList.searchTextField;

    ws.ItemEdit = new Ext.FormPanel({
				      labelAlign: 'top',
				      frame:true,
				      title: 'Edit Item',
				      bodyStyle:'padding:5px 5px 0',
				      //width: 800,
				      height: ws.viewHeight,
				      items: [
					{
					  xtype:'textfield',
					  fieldLabel: 'Title',
					  name: 'title',
					  anchor:'100%'
					},
					{
					  xtype:'textarea',
					  id:'body',
					  name: 'body',
					  fieldLabel:'Body',
					  height:400,
					  anchor:'100%'
					},
					{
					  xtype:'textfield',
					  fieldLabel: 'Tags',
					  name: 'tags',
					  anchor:'100%'
					},
					{
					  xtype:'hidden',
					  fieldLabel: 'Encoding',
					  name: 'encoding',
					  value: 'wikitext',
					  anchor:'100%'
					}
				      ],

				      tbar: [{
						  text: 'Save',
						  handler: ws.saveItem
						},{
						  text: 'Cancel',
						  handler: ws.showItemList
						}]
				    });

     ws.ItemEdit.on('show', function() {
		     ws.ItemEditKeyMap = ws.ItemEditKeyMap || new Ext.KeyMap(ws.ItemEdit.getEl(), [
							  {
							    key: 's',
							    ctrl: true,
							    fn: ws.saveItem
							    },
							    {
							      key: 'c',
							      ctrl: true,
							      fn: ws.showItemList
							    }
							]);
		     ws.ItemEditKeyMap.stopEvent = true;
		   });

    // use viewport to fill screen with current view (component)
    ws.Viewport = new Ext.Viewport({
				     layout: 'border',
				     items: [{
					       region: 'center',
					       id: 'center-panel',
					       useShim:true,
					       layout: 'fit',
					       split: false,
					       border:false,
					       items: [ ws.ItemList, ws.ItemView, ws.ItemEdit ]
					     }]
				   });

    // set focus to search since that will most likely be used 1st
    ws.focusItemSearch();

  });