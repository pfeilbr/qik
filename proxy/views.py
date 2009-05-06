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

def index(request, url):
  user = users.get_current_user()
  result = urlfetch.fetch(url)
  return HttpResponse(result.content)
    


