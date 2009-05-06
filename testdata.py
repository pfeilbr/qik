import os
import sys
import logging

from google.appengine.ext import db
from django.core import serializers
from django.utils import simplejson

from items.models import Item

item = Item(title='favorite books', body='my favorite books are ...')
item.put()
items = Item.all()
data = serializers.serialize("json", items)
objs = simplejson.loads(data)

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
  
def flatten_to_json(objs):
  s = serializers.serialize("json", objs)
  array = simplejson.loads(s)
  flattened_objs = flatten_objs( array )
  return simplejson.dumps(flattened_objs)
  
restructured_objs_data = flatten_to_json(items)