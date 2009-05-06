from appengine_django.models import BaseModel
from google.appengine.ext import db

class Item(BaseModel):
    author = db.UserProperty()
    title = db.StringProperty()
    encoding = db.StringProperty()
    body = db.TextProperty()
    tags = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    modified = db.DateTimeProperty(auto_now=True, auto_now_add=True)
    
    
