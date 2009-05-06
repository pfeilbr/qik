# Copyright 2008 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from django.conf.urls.defaults import *

urlpatterns = patterns('items.views',
  (r'^$', 'index'),
 	(r'^items\.schema\.extjs\.js$', 'extjs_schema'),
	(r'^items\.json$', 'index_or_create'),
	(r'^items/(?P<pk>.*)\.json', 'show_or_update_or_delete'),
	(r'^jot\.json$', 'jot'),
	(r'^jot/$', 'jot_index')
)

urlpatterns += patterns('vfs.views',
  (r'^vfs/(?P<path>.*)$', 'index')
)

urlpatterns += patterns('proxy.views',
  (r'^proxy/(?P<url>.*)$', 'index')
)
