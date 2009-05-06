from appengine_django.models import BaseModel
from google.appengine.ext import db

class File(BaseModel):
    path = db.StringProperty()
    contents = db.BlobProperty()
    mime_type = db.StringProperty()
    owner = db.UserProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    modified = db.DateTimeProperty(auto_now=True, auto_now_add=True)