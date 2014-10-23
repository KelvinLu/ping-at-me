from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'ping_at_me.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^', include('pingapp.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
