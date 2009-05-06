// ************************************************************************  
// define item data source and it's structure
ws.ItemStore = new Ext.data.JsonStore({
  url: '/items.json',
  root: '',
  fields: ['id', 'title', 'body', 'tags']
});

// define the schema of our item records
ws.ItemRecord = Ext.data.Record.create([
  {name: 'id', type: 'int'},
  {name: 'title', type: 'string'},
  {name: 'body', type: 'string'},
  {name: 'tags', type: 'string'}
]);

// load item data
ws.ItemStore.load();