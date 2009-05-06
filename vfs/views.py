import logging
from google.appengine.api import users
from django.template import Context, loader
from items.models import Item
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson
from google.appengine.ext import db
from google.appengine.ext.db import Key
from django.shortcuts import get_object_or_404, render_to_response
from django.core import serializers
import random
from google.appengine.api import urlfetch

def index(request, path):
  user = users.get_current_user()
  if not user:
    return HttpResponseRedirect( users.create_login_url(request.path) )
  
  if request.method == 'GET':
    return HttpResponse( 'file requested is: ' + path )
    
  if request.method == 'POST':
    f = File(path=path)
    f.owner = users.get_current_user()
    f.put()
    
  if request.method == 'PUT':
    request.method = 'POST'
    request.method = 'PUT'
    request.PUT = request.POST
    del request._post
    
  if request.method == 'DELETE':
    request.method = 'POST'
    request.method = 'PUT'
    request.DELETE = request.POST
    del request._post

 