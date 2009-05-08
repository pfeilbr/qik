import logging
from google.appengine.api import users
from django.template import Context, loader
from items.models import Item
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseForbidden
from django.utils import simplejson
from google.appengine.ext import db
from google.appengine.ext.db import Key
from django.shortcuts import get_object_or_404, render_to_response
from django.core import serializers
import random

def flatten_obj(obj):
  new_obj = obj.copy()
  new_obj.update(new_obj['fields']) # add the key/value pairs that are in the fields value
  del new_obj['fields'] # remove the embeded 'fields' values since we copied them up a level
  return new_obj
  
def flatten_objs(objs):
  new_objs = []
  for obj in objs:
    new_objs.append( flatten_obj(obj) )
  return new_objs

def flatten_obj_to_json(obj):
  s = serializers.serialize("json", [obj])
  array = simplejson.loads(s)
  flattened_objs = flatten_objs( array )
  return simplejson.dumps(flattened_objs[0])
  
def flatten_array_to_json(objs):
  s = serializers.serialize("json", objs)
  array = simplejson.loads(s)
  flattened_objs = flatten_objs( array )
  return simplejson.dumps(flattened_objs)
  
def json_response(json):
    response = HttpResponse(json)
    response['Content-Type'] = 'application/json'
    return response
    
def is_admin(request):
    return 0
    #return ("pw" in request.REQUEST) and (request.REQUEST["pw"] == "<password here>")
    
def is_authenticated(request):
    user = users.get_current_user()
    return user or is_admin(request)
    
# GET /items
def index(request):
    if is_authenticated(request):
        return render_to_response('items/index.html', {'randint': str(random.randint(1, 999))})
    else:
        return HttpResponseRedirect( users.create_login_url(request.path) )
        
def extjs_schema(request):
    return render_to_response('items/schema.extjs.js', {})

# GET /items.json - item list
# POST /items.json - create item
# DELETE /items.json - delete all items
def index_or_create(request):
    if not is_authenticated(request):
        return HttpResponseForbidden('You are not authorized to perform this action')
    
    if request.method == 'GET':
        return HttpResponse( flatten_array_to_json( Item.all() ) )
    if request.method == 'POST':
        item = Item(None, None)
        item_dict = simplejson.loads( request.raw_post_data )
        for key in item_dict.keys():
            setattr(item, key.encode('ascii'), item_dict[key])
        item.put()
        return HttpResponse( flatten_obj_to_json(item) )
    if request.method == 'DELETE':
        request.method = 'POST'
        request.method = 'PUT'
        request.DELETE = request.POST
        del request._post
        items = Item.all()
        item_count = items.count() 
        for item in Item.all():
            item.delete()
        return HttpResponse('deleted ' + str(item_count) + ' records')
        
        

# GET /items/1.json - show/get item
# PUT /items/1.json - update item
# DELETE /items/1.json - delete item
def show_or_update_or_delete(request, pk):
    if not is_authenticated(request):
        return HttpResponseForbidden('You are not authorized to perform this action')
    
    item = db.get(pk)
    
    if request.method == 'GET':
        return HttpResponse( flatten_obj_to_json(item) )
        
    if request.method == 'PUT':
        request.method = 'POST'
        request.method = 'PUT'
        request.PUT = request.POST
        del request._post
        item_input = simplejson.loads( request.raw_post_data )
        for key in item_input.keys():
            setattr(item, key, item_input[key])
        item.put()
        return HttpResponse( flatten_obj_to_json(item) )     
    
    if request.method == 'DELETE':
        request.method = 'POST'
        request.method = 'PUT'
        request.DELETE = request.POST
        del request._post
        data = flatten_obj_to_json(item)
        item.delete()
        return HttpResponse( data )
        
# GET - view jot content
# POST - create/update (overwrite) all jot content
# PUT - prepend content
# DELETE  
def jot(request):
    item = Item.get_or_insert('jot')
    item.title = 'jot'
    
    data = {}
    if request.raw_post_data:
        data = simplejson.loads( request.raw_post_data )
    
    if request.method == 'GET':
        if item.body:
            return json_response( flatten_obj_to_json(item) )   
        else:
            return json_response( '{}' )
    
    if request.method == 'POST':
        item.body = data['body']
        item.put()
        return json_response( flatten_obj_to_json(item) )          
    
    if request.method == 'PUT':
        request.method = 'POST'
        request.method = 'PUT'
        request.PUT = request.POST
        del request._post
        if item.body:
            item.body = data['body'] + '\n' + item.body
        else:
            item.body = data['body']
        item.put()
        return json_response( flatten_obj_to_json(item) ) 
        
    if request.method == 'DELETE':
        request.method = 'POST'
        request.method = 'PUT'
        request.DELETE = request.POST
        del request._post
        if item.is_saved():
            item.delete()
        return json_response( '{}' )
        
def jot_index(request):
    item = Item.get_or_insert('jot')
    item.title = 'jot'
    if item.body:
        return HttpResponse(item.body)
    else:
        return HttpResponse('no jot content')


        #i = simplejson.loads( request.raw_post_data )
        
        # convert unicode string keys to ascii string keys.
        # this is neccessary in order to use the ** operator in the following Item constructor
        #i2 = {}
        #for k in i.keys():
        #    i2[k.encode('ascii')] = i[k]
            
        #item = Item(None, None, **i2)
        
        #item.title = i['title']
        #item.body = i['body']
        #item.tags = i['tags']

        #data = serializers.serialize("json",items)
        #return HttpResponse( data )
        #item_list = []
        #for item in items:
        #    item_list.append({'id': item.key().id(), 'title': item.title, 'body': item.body, 'tags': item.tags})
        #return HttpResponse( simplejson.dumps(item_list) )
        #item.title = item_input['title']
        #item.body = item_input['body']
        #item.encoding = item_input['encoding']
        #item.tags = item_input['tags']
        #for key in item_input.keys():
        #    item.__dict__['_' + key] = item_input[key]        
        # save new item